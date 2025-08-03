import { describe, test, expect } from "vitest";
import {
  validateAlly,
  validateAdditionalReward,
  validateSevereConsequence,
  validateThemeKeyword,
  validateUnusualContractor,
  AllyCategory,
  AllyTiming,
  RewardCategory,
  SevereConsequenceCategory,
  ThemeKeywordSet,
} from "../types/contract";
import {
  getAlliesTable,
  getAdditionalRewardsTable,
} from "../data/tables/contract-rewards-tables";
import {
  getSevereConsequencesTable,
  getSevereConsequencesTableByCategory,
} from "../data/tables/contract-consequences-tables";
import {
  getThemeKeywordsTable,
  getThemeKeywordsBySet,
  getUnusualContractorsTable,
  getUnusualContractorVariationsTable,
} from "../data/tables/contract-themes-tables";

describe("Contract Narrative Elements (Issue 4.13)", () => {
  describe("Aliados (Allies)", () => {
    test("deve validar aliados corretamente", () => {
      const ally = {
        category: AllyCategory.CIVIS_ORDINARIOS,
        specificType: "Veterano de guerra",
        name: "Marcus, o Veterano",
        description: "Um antigo soldado com cicatrizes de batalha.",
        timing: AllyTiming.MANEIRA_COMUM,
        powerLevel: 15,
        characteristics: ["Experiente em combate", "Conhece táticas militares"],
      };

      expect(() => validateAlly(ally)).not.toThrow();
      const validated = validateAlly(ally);
      expect(validated.category).toBe(AllyCategory.CIVIS_ORDINARIOS);
      expect(validated.timing).toBe(AllyTiming.MANEIRA_COMUM);
    });

    test("deve acessar tabela de aliados", () => {
      const alliesTable = getAlliesTable();
      expect(Array.isArray(alliesTable)).toBe(true);
      expect(alliesTable.length).toBeGreaterThan(0);

      // Verifica se tem pelo menos alguns tipos esperados
      const results = alliesTable.map((ally) => ally.result);
      expect(results).toContain("Civis ordinários");
      expect(results).toContain("Organização");
      expect(results).toContain("Aventureiros");
    });
  });

  describe("Recompensas Adicionais (Additional Rewards)", () => {
    test("deve validar recompensas adicionais corretamente", () => {
      const reward = {
        category: RewardCategory.RIQUEZAS,
        specificReward: "Equipamento militar de qualidade",
        description: "Armaduras e armas de excelente qualidade.",
        value: 500,
        isPositive: true,
      };

      expect(() => validateAdditionalReward(reward)).not.toThrow();
      const validated = validateAdditionalReward(reward);
      expect(validated.category).toBe(RewardCategory.RIQUEZAS);
      expect(validated.isPositive).toBe(true);
    });

    test("deve acessar tabela de recompensas adicionais", () => {
      const rewardsTable = getAdditionalRewardsTable();
      expect(Array.isArray(rewardsTable)).toBe(true);
      expect(rewardsTable.length).toBeGreaterThan(0);

      const results = rewardsTable.map((reward) => reward.result);
      expect(results).toContain("Riquezas");
      expect(results).toContain("Conhecimento");
      expect(results).toContain("Influência e renome");
    });
  });

  describe("Consequências Severas (Severe Consequences)", () => {
    test("deve validar consequências severas corretamente", () => {
      const consequence = {
        category: SevereConsequenceCategory.MORTE_IMPORTANTES,
        specificConsequence: "Um contratante morre em combate",
        description:
          "Durante uma batalha intensa, um dos contratantes não sobrevive.",
        affectsContractors: "Um contratante específico",
        additionalEffect: "Reduz moral do grupo",
      };

      expect(() => validateSevereConsequence(consequence)).not.toThrow();
      const validated = validateSevereConsequence(consequence);
      expect(validated.category).toBe(
        SevereConsequenceCategory.MORTE_IMPORTANTES
      );
      expect(validated.affectsContractors).toBe("Um contratante específico");
    });

    test("deve acessar tabelas de consequências severas", () => {
      const consequencesTable = getSevereConsequencesTable();
      expect(Array.isArray(consequencesTable)).toBe(true);
      expect(consequencesTable.length).toBeGreaterThan(0);

      // Testa acesso por categoria específica
      const deathConsequences = getSevereConsequencesTableByCategory(
        SevereConsequenceCategory.MORTE_IMPORTANTES
      );
      expect(Array.isArray(deathConsequences)).toBe(true);
      expect(deathConsequences.every((c) => c.result)).toBeTruthy();
    });
  });

  describe("Palavras-chave Temáticas (Theme Keywords)", () => {
    test("deve validar palavras-chave temáticas corretamente", () => {
      const keyword = {
        set: ThemeKeywordSet.FANTASIA,
        keyword: "Magia",
      };

      expect(() => validateThemeKeyword(keyword)).not.toThrow();
      const validated = validateThemeKeyword(keyword);
      expect(validated.set).toBe(ThemeKeywordSet.FANTASIA);
      expect(validated.keyword).toBe("Magia");
    });

    test("deve acessar tabelas de palavras-chave temáticas", () => {
      const keywordsTable = getThemeKeywordsTable();
      expect(Array.isArray(keywordsTable)).toBe(true);
      expect(keywordsTable.length).toBeGreaterThan(0);

      // Testa acesso por conjunto específico
      const fantasyKeywords = getThemeKeywordsBySet(ThemeKeywordSet.FANTASIA);
      expect(Array.isArray(fantasyKeywords)).toBe(true);
      expect(fantasyKeywords.length).toBeGreaterThan(0);
    });
  });

  describe("Contratantes Inusitados (Unusual Contractors)", () => {
    test("deve validar contratantes inusitados corretamente", () => {
      const contractor = {
        isUnusual: true,
        description: "Um fantasma que busca vingança",
        motivations: ["Buscar justiça", "Resolver assuntos pendentes"],
        quirks: ["Só aparece à noite", "Não pode tocar objetos físicos"],
        themeKeywords: [
          { set: ThemeKeywordSet.MACABRO, keyword: "Vingança" },
          { set: ThemeKeywordSet.MACABRO, keyword: "Sombra" },
        ],
      };

      expect(() => validateUnusualContractor(contractor)).not.toThrow();
      const validated = validateUnusualContractor(contractor);
      expect(validated.isUnusual).toBe(true);
      expect(validated.motivations).toHaveLength(2);
      expect(validated.themeKeywords).toHaveLength(2);
    });

    test("deve acessar tabelas de contratantes inusitados", () => {
      const contractorsTable = getUnusualContractorsTable();
      expect(Array.isArray(contractorsTable)).toBe(true);
      expect(contractorsTable.length).toBeGreaterThan(0);

      const variationsTable = getUnusualContractorVariationsTable();
      expect(Array.isArray(variationsTable)).toBe(true);
      expect(variationsTable.length).toBeGreaterThan(0);
    });
  });

  describe("Integração de Elementos Narrativos", () => {
    test("deve permitir criação de contratos com todos os elementos narrativos", () => {
      // Simula um contrato completo com todos os elementos narrativos
      const ally = validateAlly({
        category: AllyCategory.ORGANIZACAO,
        specificType: "Guia local experiente",
        name: "Elena, a Exploradora",
        description: "Uma conhecedora dos caminhos perigosos.",
        timing: AllyTiming.AINDA_ASSENTAMENTO,
        powerLevel: 12,
      });

      const reward = validateAdditionalReward({
        category: RewardCategory.CONHECIMENTO,
        specificReward: "Mapa de rotas secretas",
        description: "Informações valiosas sobre passagens ocultas.",
        value: 200,
        isPositive: true,
      });

      const consequence = validateSevereConsequence({
        category: SevereConsequenceCategory.PERSEGUICAO,
        specificConsequence: "Ferimento permanente",
        description: "Um contratante sofre uma lesão que o marca para sempre.",
        affectsContractors: "Todos os contratantes podem ser afetados",
      });

      const keyword = validateThemeKeyword({
        set: ThemeKeywordSet.MASMORRAS,
        keyword: "Ruínas antigas",
      });

      const contractor = validateUnusualContractor({
        isUnusual: true,
        description: "Uma árvore senciente",
        motivations: ["Proteger a floresta"],
        quirks: ["Fala muito devagar", "Só se comunica em metáforas"],
      });

      // Verifica se todos os elementos foram validados corretamente
      expect(ally.category).toBe(AllyCategory.ORGANIZACAO);
      expect(reward.category).toBe(RewardCategory.CONHECIMENTO);
      expect(consequence.category).toBe(SevereConsequenceCategory.PERSEGUICAO);
      expect(keyword.set).toBe(ThemeKeywordSet.MASMORRAS);
      expect(contractor.isUnusual).toBe(true);
    });
  });
});
