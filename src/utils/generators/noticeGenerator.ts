import type { Guild } from "@/types/guild";
import type { Contract } from "@/types/contract";
import type { Service } from "@/types/service";
import {
  NoticeType,
  NoticeStatus,
  AlternativePayment,
  type Notice,
} from "@/types/notice";
import { SettlementType } from "@/types/guild";
import {
  INITIAL_AVAILABILITY_TABLE,
  NOTICE_TYPE_TABLE,
  getSettlementSizeModifier,
  getSettlementSizeDice,
  getGuildHQSizeModifier,
} from "@/data/tables/notice-base-tables";
import { rollDice } from "@/utils/dice";
import { executeCrossModuleIntegration } from "@/utils/integrations/notice-cross-module";
import { calculateStaffModifier } from "@/utils/generators/noticeModifiers";

export interface NoticeGenerationConfig {
  guild: Guild;
  settlementType: SettlementType;
  diceRoller?: (notation: string) => number;
  contractsStore?: {
    generateContracts: (config: Record<string, unknown>) => Promise<Contract[]>;
  };
  servicesStore?: {
    generateServices: (config: Record<string, unknown>) => Promise<Service[]>;
  };
}

/**
 * Gerador base de avisos para o mural da guilda
 */
export class NoticeGenerator {
  private diceRoller: (notation: string) => number;

  constructor(diceRoller?: (notation: string) => number) {
    // Permite injeção de dependência para testes
    this.diceRoller =
      diceRoller || ((notation: string) => rollDice({ notation }).result);
  }

  /**
   * Gera avisos iniciais para o mural seguindo todas as regras
   * REGRA: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
   */
  async generate(config: NoticeGenerationConfig): Promise<Notice[]> {
    const { guild, settlementType, contractsStore, servicesStore } = config;

    // 1. Verificar disponibilidade inicial (tabela 1d20 + modificadores)
    const hasInitialNotices = this.checkInitialAvailability(settlementType);
    if (!hasInitialNotices) {
      return [];
    }

    // 2. Calcular quantidade base usando dados por tamanho
    const noticeCount = this.calculateNoticeCount(guild, settlementType);

    // 4. Gerar avisos individuais
    const notices: Notice[] = [];
    for (let i = 0; i < noticeCount; i++) {
      const generationResult = this.generateSingleNotice();
      if (generationResult.notice) {
        const notice = generationResult.notice;
        // Definir guildId
        notice.guildId = guild.id;

        // Integração cross-module para contratos e serviços
        if (
          notice.type === NoticeType.CONTRACTS ||
          notice.type === NoticeType.SERVICES
        ) {
          // Usar o resultado original da tabela para integração
          const originalTableType =
            generationResult.originalTableType || notice.type;

          const crossModuleResult = await executeCrossModuleIntegration({
            guild,
            notice,
            originalTableType,
            contractsStore,
            servicesStore,
            diceRoller: this.diceRoller,
          });

          // Aplicar resultado da integração cross-module
          if (crossModuleResult.alternativePayment) {
            notice.alternativePayment = crossModuleResult.alternativePayment;
          }

          // Marcar aviso como originário do mural
          if (
            crossModuleResult.success &&
            crossModuleResult.modulesTriggered.length > 0
          ) {
            notice.reducedReward = true; // Sempre reduzido para 1/3
          }
        }

        notices.push(notice);
      }
    }

    return notices;
  }

  /**
   * Verifica disponibilidade inicial aplicando modificadores por assentamento
   * Tabela: 1d20 com modificadores por tamanho do assentamento
   */
  private checkInitialAvailability(settlementType: SettlementType): boolean {
    const baseRoll = this.diceRoller("1d20");
    const modifier = getSettlementSizeModifier(settlementType);
    const finalRoll = baseRoll + modifier;

    // Encontrar entrada na tabela baseada na rolagem final
    const entryFound = INITIAL_AVAILABILITY_TABLE.find(
      (entry) => finalRoll >= entry.min && finalRoll <= entry.max
    );

    if (!entryFound) {
      return false;
    }

    // Processar casos especiais ("Talvez", "Mais ou menos")
    if (entryFound.result.modifier === "-4d20") {
      // "Talvez, -4d20" - rolar 4d20 e verificar se pelo menos um resulta em disponibilidade
      const extraRolls = [
        this.diceRoller("1d20"),
        this.diceRoller("1d20"),
        this.diceRoller("1d20"),
        this.diceRoller("1d20"),
      ];
      return extraRolls.some((roll) => {
        const extraFinalRoll = roll + modifier;
        return extraFinalRoll >= 17; // Pelo menos um "Sim"
      });
    }

    if (entryFound.result.modifier === "-2d20") {
      // "Mais ou menos, -2d20" - rolar 2d20 e verificar se pelo menos um resulta em disponibilidade
      const extraRolls = [this.diceRoller("1d20"), this.diceRoller("1d20")];
      return extraRolls.some((roll) => {
        const extraFinalRoll = roll + modifier;
        return extraFinalRoll >= 17; // Pelo menos um "Sim"
      });
    }

    return entryFound.result.available;
  }

  /**
   * Calcula quantidade de avisos baseado em assentamento + sede + condição
   * Aplica todos os modificadores conforme tabelas
   */
  private calculateNoticeCount(
    guild: Guild,
    settlementType: SettlementType
  ): number {
    // Base: dados por tamanho do assentamento
    const settlementDice = getSettlementSizeDice(settlementType);
    let totalCount = this.diceRoller(settlementDice);

    // Modificador por tamanho da sede da guilda
    const hqModifier = getGuildHQSizeModifier(guild.structure.size);
    if (hqModifier) {
      if (hqModifier.startsWith("+") || hqModifier.startsWith("-")) {
        // Ex: "+1d20-15", "-1d20", "+2d20-10"
        const modifierValue = this.parseAndRollModifier(hqModifier);
        totalCount += modifierValue;
      }
    }

    // Modificador por condição dos funcionários
    const staffModifier = calculateStaffModifier(guild.staff, this.diceRoller);
    totalCount += staffModifier;

    return Math.max(0, totalCount);
  }

  /**
   * Processa modificadores complexos como "+1d20-15", "+2d20-10"
   */
  private parseAndRollModifier(modifier: string): number {
    const match = modifier.match(/([+-])(\d+d\d+)([+-]\d+)?/);
    if (!match) return 0;

    const sign = match[1] === "+" ? 1 : -1;
    const diceNotation = match[2];
    const additionalModifier = match[3] ? parseInt(match[3]) : 0;

    const diceResult = this.diceRoller(diceNotation);
    return sign * (diceResult + additionalModifier);
  }

  /**
   * Gera um único aviso usando tabela de tipos (1d20)
   * APLICAÇÃO AUTOMÁTICA DE ESPÉCIES
   */
  private generateSingleNotice(): {
    notice: Notice | null;
    originalTableType?: string;
  } {
    const noticeTypeRoll = this.diceRoller("1d20");
    const entryFound = NOTICE_TYPE_TABLE.find(
      (entry) => noticeTypeRoll >= entry.min && noticeTypeRoll <= entry.max
    );

    if (!entryFound) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[NOTICE] No entry found - returning null");
      }
      return { notice: null };
    }

    const noticeType = this.mapNoticeTypeFromResult(entryFound.result.type);

    // Casos que não geram avisos
    if (noticeType === NoticeType.NOTHING) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[NOTICE] Type is NOTHING - returning null");
      }
      return { notice: null };
    }

    // Para contratos e serviços, o pagamento alternativo será determinado pela integração cross-module
    // Para outros tipos, não há pagamento alternativo
    const alternativePayment: AlternativePayment | undefined = undefined;
    let reducedReward = false;

    if (
      noticeType === NoticeType.SERVICES ||
      noticeType === NoticeType.CONTRACTS
    ) {
      // Marcar recompensa reduzida, mas deixar pagamento alternativo para a integração cross-module
      reducedReward = true;
    }

    const notice = this.createBaseNotice(
      noticeType,
      alternativePayment,
      reducedReward
    );

    return {
      notice,
      originalTableType: entryFound.result.type, // Preservar o tipo original da tabela
    };
  }

  /**
   * Mapeia resultado da tabela para enum NoticeType
   */
  private mapNoticeTypeFromResult(resultType: string): NoticeType {
    const mapping: Record<string, NoticeType> = {
      Nada: NoticeType.NOTHING,
      "Aviso dos habitantes": NoticeType.RESIDENTS_NOTICE,
      "1d4 serviços": NoticeType.SERVICES,
      "Proposta comercial": NoticeType.COMMERCIAL_PROPOSAL,
      Divulgação: NoticeType.ANNOUNCEMENT,
      "Proposta de caçada": NoticeType.HUNT_PROPOSAL,
      "Cartaz de procurado": NoticeType.WANTED_POSTER,
      "1d4 contratos": NoticeType.CONTRACTS,
      Execução: NoticeType.EXECUTION,
      Pronunciamento: NoticeType.OFFICIAL_STATEMENT,
    };
    return mapping[resultType] || NoticeType.RESIDENTS_NOTICE;
  }

  /**
   * Cria estrutura base do aviso
   */
  private createBaseNotice(
    type: NoticeType,
    alternativePayment?: AlternativePayment,
    reducedReward?: boolean
  ): Notice {
    const now = new Date();
    const baseNotice: Notice = {
      id: this.generateId(),
      guildId: "", // Será preenchido quando integrado com o store
      type,
      status: NoticeStatus.ACTIVE,
      createdDate: now,
      // Será preenchido com conteúdo específico em Issues subsequentes
      content: null,
      alternativePayment,
      reducedReward: reducedReward || false,
      mentionedSpecies: [], // Será preenchido automaticamente nas próximas Issues
      createdAt: now,
      updatedAt: now,
    };

    // REGRA AUTOMÁTICA: Aplicar espécies para pessoas mencionadas
    // Para a Issue 7.14, criamos a estrutura base
    // O conteúdo específico com espécies será implementado nas Issues de conteúdo
    this.applySpeciesAutoAssignment(baseNotice);

    return baseNotice;
  }

  /**
   * Gera ID único para o aviso (alternativa ao UUID)
   */
  private generateId(): string {
    return `notice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * REGRA OBRIGATÓRIA: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
   * Sistema valida se é pessoa vs animal antes de aplicar espécie
   */
  private applySpeciesAutoAssignment(notice: Notice): void {
    // Para Issue 7.14, preparamos a estrutura
    // A implementação completa será feita nas Issues de conteúdo específico (7.15+)

    // Toda pessoa mencionada receberá espécie automaticamente
    // Exceção: animais domésticos (já são animais, não precisam de espécie)

    // Este método será expandido nas próximas Issues para:
    // 1. Detectar menções de pessoas no conteúdo
    // 2. Gerar espécie usando generateCompleteSpecies()
    // 3. Validar se é pessoa vs animal
    // 4. Aplicar espécie apenas para pessoas

    // Log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `[NOTICE GENERATOR] Species auto-assignment prepared for notice ${notice.id} of type ${notice.type}`
      );
    }
  }
}
