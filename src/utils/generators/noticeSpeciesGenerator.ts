import type { SpeciesWithSubrace } from "@/types/species";
import { NoticeType } from "@/types/notice";
import {
  generateCompleteSpecies,
  getSpeciesFullName,
} from "@/data/tables/species-tables";
import {
  shouldGenerateSpecies,
  isPersonMention,
  CreatureContext,
  NOTICE_TYPE_SPECIES_CONTEXT,
  HUNT_CREATURE_CONTEXTS,
  HUNT_CONTEXTUAL_WEIGHTS,
} from "@/data/tables/notice-species-mapping";

/**
 * Configuração para geração de espécies em avisos
 */
export interface NoticeSpeciesConfig {
  diceRoller?: (notation: string) => number;
  context?: string; // Contexto adicional para logs
}

/**
 * Resultado da análise de menção para geração de espécie
 */
export interface MentionAnalysis {
  shouldGenerate: boolean;
  reason: string; // Motivo da decisão (para logs/debugging)
  context: CreatureContext;
}

/**
 * Gerador de espécies para pessoas mencionadas em avisos
 * Implementa a regra: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
 */
export class NoticeSpeciesGenerator {
  private diceRoller: (notation: string) => number;

  constructor(config: NoticeSpeciesConfig = {}) {
    this.diceRoller =
      config.diceRoller ||
      ((notation: string) => {
        // Fallback para Math.random se não houver diceRoller injetado
        if (notation === "1d100") {
          return Math.floor(Math.random() * 100) + 1;
        }
        if (notation === "1d20") {
          return Math.floor(Math.random() * 20) + 1;
        }
        return Math.floor(Math.random() * 6) + 1; // 1d6 default
      });
  }

  /**
   * Analisa se uma menção específica deve gerar espécie
   * @param noticeType Tipo do aviso
   * @param mentionContext Contexto da menção (ex: "noble", "domestic_animal", "commoner")
   * @param additionalContext Contexto adicional específico do aviso
   * @returns Análise completa da menção
   */
  public analyzeMention(
    noticeType: NoticeType,
    mentionContext: string,
    additionalContext?: string
  ): MentionAnalysis {
    const baseContext = NOTICE_TYPE_SPECIES_CONTEXT[noticeType];

    // Casos especiais para proposta de caçada
    if (noticeType === NoticeType.HUNT_PROPOSAL && additionalContext) {
      return this.analyzeHuntMention(additionalContext, mentionContext);
    }

    // Análise geral baseada no tipo de aviso
    const shouldGenerate = shouldGenerateSpecies(
      noticeType,
      mentionContext,
      this.diceRoller
    );

    let reason = "";
    if (baseContext === CreatureContext.ALWAYS_PERSON) {
      reason = `Tipo ${noticeType} sempre menciona pessoas`;
    } else if (baseContext === CreatureContext.ALWAYS_ANIMAL) {
      reason = `Tipo ${noticeType} nunca menciona pessoas com espécie`;
    } else if (baseContext === CreatureContext.MIXED) {
      reason = `Tipo ${noticeType} misto - ${isPersonMention(mentionContext) ? "pessoa" : "animal"} baseado no contexto`;
    } else {
      reason = `Tipo ${noticeType} context-dependent - decisão aleatória`;
    }

    return {
      shouldGenerate,
      reason,
      context: baseContext,
    };
  }

  /**
   * Análise específica para menções em propostas de caçada
   * @param creatureType Tipo de criatura da caçada (ex: "humanoids", "fauna", "undead")
   * @param _mentionContext Contexto específico da menção (não usado nesta implementação)
   * @returns Análise da menção de caçada
   */
  private analyzeHuntMention(
    creatureType: string,
    _mentionContext: string
  ): MentionAnalysis {
    const huntContext =
      HUNT_CREATURE_CONTEXTS[creatureType] || CreatureContext.CONTEXT_DEPENDENT;
    let shouldGenerate = false;
    let reason = "";

    switch (huntContext) {
      case CreatureContext.ALWAYS_PERSON:
        shouldGenerate = true;
        reason = `Caçada de ${creatureType} - sempre são pessoas inteligentes`;
        break;

      case CreatureContext.ALWAYS_ANIMAL:
        shouldGenerate = false;
        reason = `Caçada de ${creatureType} - sempre são animais/monstros`;
        break;

      case CreatureContext.CONTEXT_DEPENDENT: {
        const weights = HUNT_CONTEXTUAL_WEIGHTS[creatureType];
        if (weights) {
          const roll = this.diceRoller("1d100");
          shouldGenerate = roll <= weights.personChance;
          reason = `Caçada de ${creatureType} - rolagem ${roll} vs ${weights.personChance}% chance de pessoa`;
        } else {
          // Default: baixa chance de ser pessoa
          const roll = this.diceRoller("1d100");
          shouldGenerate = roll <= 20;
          reason = `Caçada de ${creatureType} - rolagem padrão ${roll} vs 20% chance de pessoa`;
        }
        break;
      }
      default:
        reason = `Caçada de ${creatureType} - contexto não definido, assumindo animal/monstro`;
        break;
    }

    return {
      shouldGenerate,
      reason,
      context: huntContext,
    };
  }

  /**
   * Gera espécie para uma pessoa mencionada no aviso
   * @param noticeType Tipo do aviso
   * @param mentionContext Contexto da menção
   * @param additionalContext Contexto adicional (para caçadas)
   * @returns Espécie gerada ou null se não deve gerar
   */
  public generateSpeciesForMention(
    noticeType: NoticeType,
    mentionContext: string,
    additionalContext?: string
  ): SpeciesWithSubrace | null {
    const analysis = this.analyzeMention(
      noticeType,
      mentionContext,
      additionalContext
    );

    if (!analysis.shouldGenerate) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[NOTICE SPECIES] Não gerando espécie: ${analysis.reason}`);
      }
      return null;
    }

    // Gerar espécie usando o sistema existente
    const species = generateCompleteSpecies(
      `Notice ${noticeType} - ${mentionContext}${additionalContext ? ` (${additionalContext})` : ""}`
    );

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `[NOTICE SPECIES] Gerada espécie para ${mentionContext}: ${getSpeciesFullName(species)} - ${analysis.reason}`
      );
    }

    return species;
  }

  /**
   * Gera espécies para múltiplas menções em um aviso
   * @param noticeType Tipo do aviso
   * @param mentions Array de contextos de menções
   * @param additionalContext Contexto adicional (para caçadas)
   * @returns Array de espécies geradas (apenas para as que devem ter espécie)
   */
  public generateSpeciesForMultipleMentions(
    noticeType: NoticeType,
    mentions: string[],
    additionalContext?: string
  ): SpeciesWithSubrace[] {
    const generatedSpecies: SpeciesWithSubrace[] = [];

    for (const mention of mentions) {
      const species = this.generateSpeciesForMention(
        noticeType,
        mention,
        additionalContext
      );
      if (species) {
        generatedSpecies.push(species);
      }
    }

    return generatedSpecies;
  }

  /**
   * Gera espécies para contextos específicos comuns em avisos
   * Implementa geração para os casos mais comuns encontrados nas tabelas
   */
  public generateSpeciesForCommonContexts(noticeType: NoticeType): {
    [context: string]: SpeciesWithSubrace | null;
  } {
    const commonContexts = this.getCommonContextsForNoticeType(noticeType);
    const result: { [context: string]: SpeciesWithSubrace | null } = {};

    for (const context of commonContexts) {
      result[context] = this.generateSpeciesForMention(noticeType, context);
    }

    return result;
  }

  /**
   * Retorna contextos comuns para cada tipo de aviso
   * @param noticeType Tipo do aviso
   * @returns Array de contextos comuns para esse tipo
   */
  private getCommonContextsForNoticeType(noticeType: NoticeType): string[] {
    switch (noticeType) {
      case NoticeType.COMMERCIAL_PROPOSAL:
        return [
          "mediocre_commoner",
          "specialist",
          "experienced_commoner",
          "aristocrat",
          "merchant",
        ];

      case NoticeType.ANNOUNCEMENT:
        return [
          "nobility",
          "commoners_local",
          "specialists",
          "clergy",
          "organization",
        ];

      case NoticeType.EXECUTION:
        return [
          "bandits",
          "witch",
          "commoners",
          "public_enemies",
          "cultists",
          "adepts",
        ];

      case NoticeType.WANTED_POSTER:
        return [
          "noble",
          "child",
          "commoner",
          "merchant",
          "specialist",
          "adept",
          "adventurer",
        ];

      case NoticeType.HUNT_PROPOSAL:
        return [
          "humanoids",
          "hostile_humanoids",
          "giants",
          "undead",
          "celestials",
        ];

      case NoticeType.RESIDENTS_NOTICE:
        return ["commoner", "noble", "specialist", "merchant", "adventurer"];

      case NoticeType.OFFICIAL_STATEMENT:
        return [
          "nobility",
          "commoners_local",
          "organization",
          "government_officials",
        ];

      default:
        return ["commoner", "specialist"];
    }
  }

  /**
   * Validação de contexto para desenvolvimento/testes
   * Verifica se um contexto é válido para um tipo de aviso
   */
  public validateMentionContext(
    noticeType: NoticeType,
    mentionContext: string
  ): {
    isValid: boolean;
    suggestions: string[];
  } {
    const commonContexts = this.getCommonContextsForNoticeType(noticeType);
    const isValid =
      commonContexts.includes(mentionContext) ||
      isPersonMention(mentionContext);

    return {
      isValid,
      suggestions: isValid ? [] : commonContexts.slice(0, 3), // Top 3 sugestões
    };
  }
}

/**
 * Função utilitária para uso rápido
 * Gera espécie para uma menção específica usando configuração padrão
 */
export function generateNoticeSpecies(
  noticeType: NoticeType,
  mentionContext: string,
  additionalContext?: string,
  diceRoller?: (notation: string) => number
): SpeciesWithSubrace | null {
  const generator = new NoticeSpeciesGenerator({ diceRoller });
  return generator.generateSpeciesForMention(
    noticeType,
    mentionContext,
    additionalContext
  );
}

/**
 * Função utilitária para análise de menção
 * Verifica se uma menção deve gerar espécie sem realmente gerar
 */
export function analyzeNoticeSpecies(
  noticeType: NoticeType,
  mentionContext: string,
  additionalContext?: string,
  diceRoller?: (notation: string) => number
): MentionAnalysis {
  const generator = new NoticeSpeciesGenerator({ diceRoller });
  return generator.analyzeMention(
    noticeType,
    mentionContext,
    additionalContext
  );
}
