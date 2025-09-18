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
} from "@/data/tables/notice-base-tables";

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
  generateNoticeContent(
    notice: Notice,
    _config?: NoticeContentGenerationConfig
  ): Notice {
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
   * Gera cartaz de procurado
   */
  private generateWantedPoster(): WantedPoster {
    const typeResult = rollOnTable(WANTED_POSTER_TYPE_TABLE);
    const isInnocent = typeResult.result === "Inocente desaparecido";

    if (isInnocent) {
      return {
        type: "missing_innocent",
        target: generateCompleteSpecies(),
        details: {
          who: "commoner" as const,
          lastSeen: "home" as const,
          characteristics1: "nobody_knows" as const,
          characteristics2: "orphan" as const,
          peculiarity: "none" as const,
          reward: "Sem recompensa estabelecida",
        },
      };
    } else {
      return {
        type: "fugitive_convict",
        target: generateCompleteSpecies(),
        details: {
          infamyReason: "crime_against_settlement" as const,
          dangerLevel: "medium" as const,
          peculiarities: "harmless_appearance" as const,
          characteristics: "cursed" as const,
          reward: "1d10 PO$",
        },
      };
    }
  }

  /**
   * Gera proposta de caçada
   */
  private generateHuntProposal(): HuntProposal {
    return {
      huntType: "gang_of" as HuntProposal["huntType"],
      creatureSpecification: "fauna" as HuntProposal["creatureSpecification"],
      location: "forest" as HuntProposal["location"],
      // Estrutura simplificada - será expandida nas próximas Issues
      rewardCalculationInfo: {
        creatureNA: "N/A",
        creatureQuantity: 1,
        rewardNote: "Use tabela de recompensas manual conforme NA da criatura",
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
   * Sistema valida se é pessoa vs animal antes de aplicar espécie
   */
  private assignSpeciesToMentionedPersons(notice: Notice): void {
    if (!notice.content) return;

    const mentionedSpecies: SpeciesWithSubrace[] = [];

    switch (notice.type) {
      case NoticeType.COMMERCIAL_PROPOSAL: {
        const commercial = notice.content as CommercialProposal;
        mentionedSpecies.push(commercial.who);
        break;
      }

      case NoticeType.ANNOUNCEMENT: {
        const announcement = notice.content as Announcement;
        mentionedSpecies.push(announcement.from);
        break;
      }

      case NoticeType.EXECUTION: {
        const execution = notice.content as Execution;
        mentionedSpecies.push(...execution.who.species);
        break;
      }

      case NoticeType.WANTED_POSTER: {
        const wanted = notice.content as WantedPoster;
        mentionedSpecies.push(wanted.target);
        break;
      }

      // Outros tipos não têm espécies estruturadas ainda
    }

    // Atualizar array de espécies mencionadas
    notice.mentionedSpecies = mentionedSpecies;
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
