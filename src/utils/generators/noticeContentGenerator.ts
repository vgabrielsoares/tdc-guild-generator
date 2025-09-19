import type { Guild } from "@/types/guild";
import { SettlementType } from "@/types/guild";
import {
  NoticeType,
  type Notice,
  type CommercialProposal,
  type Announcement,
  type Execution,
  type WantedPoster,
  type HuntProposal,
  type ResidentsNotice,
  type OfficialStatement,
} from "@/types/notice";
import type { SpeciesWithSubrace } from "@/types/species";
import { rollDice } from "@/utils/dice";
import { rollOnTable } from "@/utils/tableRoller";
import { generateCompleteSpecies } from "@/data/tables/species-tables";
import {
  rollMultipleWithCombining,
  createTextBasedRollAgainChecker,
} from "@/utils/multiRollHandler";
import {
  // Tabelas principais
  COMMERCIAL_PROPOSAL_TYPE_TABLE,
  COMMERCIAL_PROPOSAL_WHAT_TABLE,
  COMMERCIAL_PROPOSAL_WHO_TABLE,
  DIVULGATION_TYPE_TABLE,
  DIVULGATION_WHO_TABLE,
  EXECUTION_WHO_TABLE,
  EXECUTION_REASON_TABLE,
  EXECUTION_METHOD_TABLE,
  WANTED_POSTER_TYPE_TABLE,
  INHABITANTS_NOTICE_TABLE,
  PRONOUNCEMENT_TYPE_TABLE,
  PRONOUNCEMENT_PECULIARITY_TABLE,
  // Tabelas de inocente desaparecido
  MISSING_INNOCENT_WHO_TABLE,
  MISSING_LAST_SEEN_TABLE,
  MISSING_CHARACTERISTICS_I_TABLE,
  MISSING_CHARACTERISTICS_II_TABLE,
  MISSING_PECULIARITY_TABLE,
  MISSING_REWARD_TABLE,
  // Tabelas de fugitivo condenado
  FUGITIVE_INFAMY_REASON_TABLE,
  FUGITIVE_DANGEROUSNESS_TABLE,
  FUGITIVE_PECULIARITIES_TABLE,
  FUGITIVE_CHARACTERISTICS_TABLE,
  FUGITIVE_NOTABLE_TRAITS_TABLE,
  FUGITIVE_REWARD_BY_DANGER,
  // Tabelas de caçada
  HUNT_PROPOSAL_TYPE_TABLE,
  HUNT_CREATURE_SPECIFICATION_TABLE,
  HUNT_LOCATION_TABLE,
  HUNT_PECULIARITY_TABLE,
  HUNT_CHARACTERISTIC_I_TABLE,
  HUNT_CHARACTERISTIC_II_TABLE,
  HUNT_TEST_ADVANTAGE_TABLE,
  HUNT_TWIST_CHECK_TABLE,
  HUNT_TWIST_TYPE_TABLE,
} from "@/data/tables/notice-base-tables";

/**
 * Checker para detectar "role duas vezes" em resultados de texto
 */
const rollAgainChecker = createTextBasedRollAgainChecker("Role duas vezes");

/**
 * Gera motivo da infâmia com suporte a multi-roll
 */
function generateInfamyReason(): string {
  return rollMultipleWithCombining(
    FUGITIVE_INFAMY_REASON_TABLE,
    rollAgainChecker,
    "Motivo da Infâmia"
  );
}

/**
 * Gera peculiaridade da caça com suporte a multi-roll
 */
function generateHuntPeculiarity(): string {
  return rollMultipleWithCombining(
    HUNT_PECULIARITY_TABLE,
    rollAgainChecker,
    "Peculiaridade da Caça"
  );
}

/**
 * Gera característica I da caça com suporte a multi-roll
 */
function generateHuntCharacteristicI(): string {
  return rollMultipleWithCombining(
    HUNT_CHARACTERISTIC_I_TABLE,
    rollAgainChecker,
    "Característica I da Caça"
  );
}

/**
 * Gera característica II da caça com suporte a multi-roll
 */
function generateHuntCharacteristicII(): string {
  return rollMultipleWithCombining(
    HUNT_CHARACTERISTIC_II_TABLE,
    rollAgainChecker,
    "Característica II da Caça"
  );
}

/**
 * Gera tipos de reviravoltas com suporte a multi-roll
 */
function generateHuntTwistType(): string {
  return rollMultipleWithCombining(
    HUNT_TWIST_TYPE_TABLE,
    rollAgainChecker,
    "Tipo de Reviravolta"
  );
}

export interface NoticeContentGenerationConfig {
  guild: Guild;
  settlementType: SettlementType;
  diceRoller?: (notation: string) => number;
}

/**
 * Gerador de conteúdo específico para cada tipo de aviso
 */
export class NoticeContentGenerator {
  private diceRoller: (notation: string) => number;

  constructor(diceRoller?: (notation: string) => number) {
    this.diceRoller =
      diceRoller || ((notation: string) => rollDice({ notation }).result);
  }

  /**
   * Gera o conteúdo específico para um aviso baseado no tipo
   * Aplica automaticamente espécies para TODA pessoa mencionada
   */
  generateNoticeContent(notice: Notice): Notice {
    // Clona o aviso para não mutar o original
    const updatedNotice = { ...notice };

    switch (notice.type) {
      case NoticeType.COMMERCIAL_PROPOSAL:
        updatedNotice.content = this.generateCommercialProposal();
        break;

      case NoticeType.ANNOUNCEMENT:
        updatedNotice.content = this.generateAnnouncement();
        break;

      case NoticeType.EXECUTION:
        updatedNotice.content = this.generateExecution();
        break;

      case NoticeType.WANTED_POSTER:
        updatedNotice.content = this.generateWantedPoster();
        break;

      case NoticeType.HUNT_PROPOSAL:
        updatedNotice.content = this.generateHuntProposal();
        break;

      case NoticeType.RESIDENTS_NOTICE:
        updatedNotice.content = this.generateResidentsNotice();
        break;

      case NoticeType.OFFICIAL_STATEMENT:
        updatedNotice.content = this.generateOfficialStatement();
        break;

      case NoticeType.SERVICES:
      case NoticeType.CONTRACTS:
        // Estes tipos são processados por outros módulos
        // A integração será feita na Issue 7.16
        updatedNotice.content = null;
        break;

      case NoticeType.NOTHING:
      default:
        updatedNotice.content = null;
        break;
    }

    // REGRA OBRIGATÓRIA: Aplicar espécies após gerar conteúdo
    this.assignSpeciesToMentionedPersons(updatedNotice);

    return updatedNotice;
  }

  /**
   * Gera proposta comercial: Tipo + O que + Quem (com espécie)
   */
  private generateCommercialProposal(): CommercialProposal {
    const typeResult = rollOnTable(COMMERCIAL_PROPOSAL_TYPE_TABLE);
    const whatResult = rollOnTable(COMMERCIAL_PROPOSAL_WHAT_TABLE);
    const whoResult = rollOnTable(COMMERCIAL_PROPOSAL_WHO_TABLE);

    return {
      type: typeResult.result as CommercialProposal["type"],
      what: whatResult.result as CommercialProposal["what"],
      who: generateCompleteSpecies(), // Sempre gera espécie para pessoa
      whoType: whoResult.result as CommercialProposal["whoType"],
    };
  }

  /**
   * Gera divulgação: Tipo + De quem (com espécie)
   */
  private generateAnnouncement(): Announcement {
    const typeResult = rollOnTable(DIVULGATION_TYPE_TABLE);
    const whoResult = rollOnTable(DIVULGATION_WHO_TABLE);

    return {
      type: typeResult.result as Announcement["type"],
      from: generateCompleteSpecies(), // Sempre gera espécie para pessoa
      fromType: whoResult.result as Announcement["fromType"],
    };
  }

  /**
   * Gera execução: Quem + Motivo + Modo (com espécies para executados)
   * SIMPLIFICADO: estrutura base para Issue 7.15
   */
  private generateExecution(): Execution {
    const whoResult = rollOnTable(EXECUTION_WHO_TABLE);
    const reasonResult = rollOnTable(EXECUTION_REASON_TABLE);
    const methodResult = rollOnTable(EXECUTION_METHOD_TABLE);

    // Processar resultado "quem" para extrair quantidade
    const quantity = this.extractQuantityFromExecutionWho(whoResult.result);
    const species: SpeciesWithSubrace[] = [];

    // Gerar espécie para cada executado
    for (let i = 0; i < quantity; i++) {
      species.push(generateCompleteSpecies());
    }

    return {
      who: {
        type: whoResult.result as Execution["who"]["type"],
        quantity,
        species,
      },
      reason: reasonResult.result as Execution["reason"],
      method: methodResult.result as Execution["method"],
    };
  }

  /**
   * Gera cartaz de procurado: inocente vs fugitivo
   */
  private generateWantedPoster(): WantedPoster {
    const typeResult = rollOnTable(WANTED_POSTER_TYPE_TABLE);
    const isInnocent = typeResult.result === "Inocente desaparecido";

    if (isInnocent) {
      return this.generateMissingInnocent();
    } else {
      return this.generateFugitive();
    }
  }

  /**
   * Gera inocente desaparecido com todas as características
   */
  private generateMissingInnocent(): WantedPoster {
    const whoResult = rollOnTable(MISSING_INNOCENT_WHO_TABLE);
    const lastSeenResult = rollOnTable(MISSING_LAST_SEEN_TABLE);
    const char1Result = rollOnTable(MISSING_CHARACTERISTICS_I_TABLE);
    const char2Result = rollOnTable(MISSING_CHARACTERISTICS_II_TABLE);
    const peculiarityResult = rollOnTable(MISSING_PECULIARITY_TABLE);
    const rewardResult = rollOnTable(MISSING_REWARD_TABLE);

    return {
      type: "missing_innocent",
      target: generateCompleteSpecies(), // REGRA CRÍTICA: sempre tem espécie
      details: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        who: whoResult.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastSeen: lastSeenResult.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        characteristics1: char1Result.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        characteristics2: char2Result.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peculiarity: peculiarityResult.result as any,
        reward: rewardResult.result,
      },
    };
  }

  /**
   * Gera fugitivo condenado com todas as características
   * Inclui lógica de rolagem dupla para resultado 20
   */
  private generateFugitive(): WantedPoster {
    const crimeReason = generateInfamyReason();
    const dangerResult = rollOnTable(FUGITIVE_DANGEROUSNESS_TABLE);
    const peculiarityResult = rollOnTable(FUGITIVE_PECULIARITIES_TABLE);
    const characteristicResult = rollOnTable(FUGITIVE_CHARACTERISTICS_TABLE);

    // REGRA ESPECIAL: "Traços notáveis" segunda rolagem
    let notableTraits = undefined;
    if (peculiarityResult.result === "Traços notáveis") {
      const traitsResult = rollOnTable(FUGITIVE_NOTABLE_TRAITS_TABLE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notableTraits = traitsResult.result as any;
    }

    // Determinar recompensa baseada na periculosidade
    const rewardMapping = FUGITIVE_REWARD_BY_DANGER as Record<string, string>;
    const reward = rewardMapping[dangerResult.result] || "1d6 PO$";

    // Usar função helper que já trata multi-roll automaticamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const infamyReason = crimeReason as any;

    return {
      type: "fugitive_convict",
      target: generateCompleteSpecies(), // REGRA CRÍTICA: sempre tem espécie
      details: {
        infamyReason,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dangerLevel: dangerResult.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peculiarities: peculiarityResult.result as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        characteristics: characteristicResult.result as any,
        notableTraits,
        reward,
      },
    };
  }

  /**
   * Gera proposta de caçada: Implementação completa
   * Inclui tipo + criatura + local + características + reviravolta opcional
   * REGRA ESPECIAL: NÃO calcular recompensa automaticamente, deixar para UI manual
   */
  private generateHuntProposal(): HuntProposal {
    const typeResult = rollOnTable(HUNT_PROPOSAL_TYPE_TABLE);
    const creatureResult = rollOnTable(HUNT_CREATURE_SPECIFICATION_TABLE);
    const locationResult = rollOnTable(HUNT_LOCATION_TABLE);
    const peculiarity = generateHuntPeculiarity();
    const char1 = generateHuntCharacteristicI();
    const char2 = generateHuntCharacteristicII();
    const advantageResult = rollOnTable(HUNT_TEST_ADVANTAGE_TABLE);

    // Verificar se há reviravolta (1d20: 19-20 = sim)
    const twistChanceResult = rollOnTable(HUNT_TWIST_CHECK_TABLE);
    let twist = null;
    if (twistChanceResult.result === true) {
      twist = generateHuntTwistType();
    }

    // Peculiaridades - função helper já trata multi-roll
    const peculiarities = [peculiarity];

    // Características - função helper já trata multi-roll
    const characteristics = [char1];

    // Característica II - só adiciona se não for "Nenhuma"
    if (char2 !== "Nenhuma") {
      characteristics.push(char2);
    }

    // REGRA ESPECIAL: NÃO calcular recompensa - deixar para UI manual
    return {
      huntType: typeResult.result as HuntProposal["huntType"],
      creatureSpecification:
        creatureResult.result as HuntProposal["creatureSpecification"],
      location: locationResult.result as HuntProposal["location"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      huntPeculiarity: peculiarities.join(", ") as any, // Array de peculiaridades como string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      characteristics1: characteristics[0] as any, // Primeira característica
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      characteristics2: characteristics[1] as any, // Segunda característica
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testAdvantage: advantageResult.result as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twist: twist as any,
      // Metadata para UI determinar quando mostrar calculadora de recompensas
      rewardCalculationInfo: {
        creatureNA: "", // Será preenchido pela UI conforme escolha do usuário
        creatureQuantity: 1, // Padrão, pode ser alterado na UI
        rewardNote:
          "Use tabela de recompensas manual conforme NA da criatura escolhida",
      },
    };
  }

  /**
   * Gera aviso dos habitantes
   */
  private generateResidentsNotice(): ResidentsNotice {
    const contentResult = rollOnTable(INHABITANTS_NOTICE_TABLE);

    return {
      type: "relevant_local_news" as ResidentsNotice["type"],
      content: contentResult.result,
    };
  }

  /**
   * Gera pronunciamento oficial
   */
  private generateOfficialStatement(): OfficialStatement {
    const typeResult = rollOnTable(PRONOUNCEMENT_TYPE_TABLE);
    const peculiarityResult = rollOnTable(PRONOUNCEMENT_PECULIARITY_TABLE);

    return {
      type: typeResult.result as OfficialStatement["type"],
      peculiarity: peculiarityResult.result as OfficialStatement["peculiarity"],
      content: `${typeResult.result}: ${peculiarityResult.result}`,
    };
  }

  /**
   * REGRA OBRIGATÓRIA: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
   * Sistema distingue corretamente pessoas de animais domésticos
   */
  private assignSpeciesToMentionedPersons(notice: Notice): void {
    if (!notice.content) return;

    const mentionedSpecies: SpeciesWithSubrace[] = [];

    switch (notice.type) {
      case NoticeType.COMMERCIAL_PROPOSAL: {
        const commercial = notice.content as CommercialProposal;
        // Verificar se "who" se refere a pessoa ou animal doméstico
        if (this.isPerson(commercial.whoType)) {
          mentionedSpecies.push(commercial.who);
        }
        // Se for animal doméstico, o "who" já foi gerado corretamente como espécie
        break;
      }

      case NoticeType.ANNOUNCEMENT: {
        const announcement = notice.content as Announcement;
        // Divulgações sempre são de pessoas (não animais)
        if (this.isPerson(announcement.fromType)) {
          mentionedSpecies.push(announcement.from);
        }
        break;
      }

      case NoticeType.EXECUTION: {
        const execution = notice.content as Execution;
        // Execuções são sempre de pessoas (não animais domésticos)
        mentionedSpecies.push(...execution.who.species);
        break;
      }

      case NoticeType.WANTED_POSTER: {
        const wanted = notice.content as WantedPoster;
        // Procurados podem ser pessoas ou animais domésticos
        // Para inocentes desaparecidos, verificar o campo "who"
        if (wanted.type === "missing_innocent") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const details = wanted.details as any;
          if (this.isPerson(details.who)) {
            mentionedSpecies.push(wanted.target);
          }
        } else {
          // Fugitivos são sempre pessoas
          mentionedSpecies.push(wanted.target);
        }
        break;
      }

      // Avisos dos habitantes e pronunciamentos podem mencionar pessoas indiretamente
      // mas não de forma estruturada que permita atribuição automática
    }

    // Atualizar array de espécies mencionadas
    notice.mentionedSpecies = mentionedSpecies;
  }

  /**
   * Determina se uma entrada se refere a pessoa (humanóide) ou animal
   * REGRA CRÍTICA: Apenas pessoas recebem espécie, animais domésticos não
   *
   * Baseado nas tabelas do arquivo .md:
   * - "Animal doméstico" nas tabelas = NÃO é pessoa
   * - Todos os outros tipos (Nobre, Plebeu, Especialista, etc.) = SÃO pessoas
   */
  private isPerson(whoType: string): boolean {
    const animalIndicators = [
      "animal doméstico",
      "Animal doméstico",
      "animal",
      "besta",
      "fera",
    ];

    const lowerWhoType = whoType.toLowerCase();
    return !animalIndicators.some((indicator) =>
      lowerWhoType.includes(indicator.toLowerCase())
    );
  }

  /**
   * Extrai quantidade de pessoas das execuções
   * Exemplo: "1d4 bandidos" = gera quantidade usando dado
   */
  private extractQuantityFromExecutionWho(who: string): number {
    // Casos com dados (1d4, 2d6, etc.)
    const diceMatch = who.match(/(\d+)d(\d+)/);
    if (diceMatch) {
      return this.diceRoller(`${diceMatch[1]}d${diceMatch[2]}`);
    }

    // Casos com número fixo
    const numberMatch = who.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }

    // Caso singular (Uma bruxa, Inocente, etc.)
    return 1;
  }
}
