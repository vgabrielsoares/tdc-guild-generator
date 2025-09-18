import type { Guild } from "@/types/guild";
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
  ALTERNATIVE_PAYMENT_TABLE,
  getSettlementSizeModifier,
  getSettlementSizeDice,
  getGuildHQSizeModifier,
  getStaffConditionModifier,
} from "@/data/tables/notice-base-tables";
import { rollDice } from "@/utils/dice";

export interface NoticeGenerationConfig {
  guild: Guild;
  settlementType: SettlementType;
  diceRoller?: (notation: string) => number;
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
  generate(config: NoticeGenerationConfig): Notice[] {
    const { guild, settlementType } = config;

    // 1. Verificar disponibilidade inicial (tabela 1d20 + modificadores)
    const hasInitialNotices = this.checkInitialAvailability(settlementType);
    if (!hasInitialNotices) {
      return [];
    }

    // 2. Calcular quantidade base usando dados por tamanho
    const noticeCount = this.calculateNoticeCount(guild, settlementType);

    // 3. Gerar avisos individuais
    const notices: Notice[] = [];
    for (let i = 0; i < noticeCount; i++) {
      const notice = this.generateSingleNotice();
      if (notice) {
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

    // Modificador por condição dos funcionários (se disponível)
    // Assumimos funcionários "normais" se não especificado
    const staffCondition =
      guild.staff?.employees === "experientes"
        ? "experientes"
        : guild.staff?.employees === "despreparados"
          ? "despreparados"
          : "normal";
    const staffModifier = getStaffConditionModifier(staffCondition);
    if (staffModifier && staffModifier !== "+0" && staffModifier !== "-0") {
      const diceNotation = staffModifier.replace(/[+-]/, ""); // Remove sinal
      const modifierValue = this.diceRoller(diceNotation);
      if (staffModifier.startsWith("-")) {
        totalCount -= modifierValue;
      } else {
        totalCount += modifierValue;
      }
    }

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
  private generateSingleNotice(): Notice | null {
    const noticeTypeRoll = this.diceRoller("1d20");
    const entryFound = NOTICE_TYPE_TABLE.find(
      (entry) => noticeTypeRoll >= entry.min && noticeTypeRoll <= entry.max
    );

    if (!entryFound) {
      return null;
    }

    const noticeType = this.mapNoticeTypeFromResult(entryFound.result.type);

    // Casos que não geram avisos
    if (noticeType === NoticeType.NOTHING) {
      return null;
    }

    // Gerar pagamento alternativo para contratos e serviços
    let alternativePayment: AlternativePayment | undefined;
    let reducedReward = false;

    if (
      noticeType === NoticeType.SERVICES ||
      noticeType === NoticeType.CONTRACTS
    ) {
      const paymentRoll = this.diceRoller("1d20");
      const paymentEntry = ALTERNATIVE_PAYMENT_TABLE.find(
        (entry) => paymentRoll >= entry.min && paymentRoll <= entry.max
      );
      if (paymentEntry) {
        alternativePayment = this.mapAlternativePaymentFromResult(
          paymentEntry.result
        );
      }
      reducedReward = true; // Sempre marcar recompensa reduzida para contratos e serviços
    }

    const notice = this.createBaseNotice(
      noticeType,
      alternativePayment,
      reducedReward
    );

    return notice;
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
   * Mapeia resultado da tabela para enum AlternativePayment
   */
  private mapAlternativePaymentFromResult(
    resultType: string
  ): AlternativePayment {
    const mapping: Record<string, AlternativePayment> = {
      "Não há pagamento": AlternativePayment.NONE,
      "Ferro ou peças de cobre": AlternativePayment.IRON_COPPER,
      "Cobre ou prata": AlternativePayment.COPPER_SILVER,
      "Equivalente em animais": AlternativePayment.ANIMALS,
      "Equivalente em terras": AlternativePayment.LAND,
      "Equivalente em colheita": AlternativePayment.HARVEST,
      Favores: AlternativePayment.FAVORS,
      "Mapa ou localização de tesouro": AlternativePayment.TREASURE_MAP,
      "Equivalente em especiarias": AlternativePayment.SPICES,
      "Objetos valiosos": AlternativePayment.VALUABLE_OBJECTS,
    };
    return mapping[resultType] || AlternativePayment.NONE;
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
