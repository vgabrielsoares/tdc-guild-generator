import { describe, it, expect } from 'vitest'
import {
  // Dados baseados em valor
  PREREQUISITE_DICE_BY_VALUE,
  CLAUSE_DICE_BY_VALUE,
  PAYMENT_TYPE_DICE_BY_VALUE,
  
  // Tabelas principais
  CONTRACT_PREREQUISITES_TABLE,
  CONTRACT_CLAUSES_TABLE,
  CONTRACT_PAYMENT_TYPE_TABLE,
  SIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  SIGNED_CONTRACT_RESOLUTION_TABLE,
  UNSIGNED_CONTRACT_RESOLUTION_TABLE,
  CONTRACT_FAILURE_REASONS_TABLE,
  NEW_CONTRACTS_TIME_TABLE,
  
  // Constantes
  CONTRACT_BREACH_PENALTY_PERCENTAGE,
  UNRESOLVED_CONTRACT_BONUS,
  REQUIREMENT_CLAUSE_BONUS,
  
  // Funções utilitárias
  getPrerequisiteDice,
  getClauseDice,
  getPaymentTypeDice,
  calculateBreachPenalty,
  calculateRequirementClauseBonus,
} from '@/data/tables/contract-modifier-tables'

import { 
  ContractResolution, 
  FailureReason, 
  PaymentType 
} from '@/types/contract'

// ===== TESTES DE DADOS BASEADOS EM VALOR =====

describe('Contract Modifier Tables - Value-Based Dice Data', () => {
  describe('PREREQUISITE_DICE_BY_VALUE', () => {
    it('should have correct dice notation and modifiers for all value ranges', () => {
      expect(PREREQUISITE_DICE_BY_VALUE["1-20"]).toEqual({ diceNotation: "1d20", modifier: -10 })
      expect(PREREQUISITE_DICE_BY_VALUE["21-40"]).toEqual({ diceNotation: "1d20", modifier: -5 })
      expect(PREREQUISITE_DICE_BY_VALUE["41-60"]).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(PREREQUISITE_DICE_BY_VALUE["61-80"]).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(PREREQUISITE_DICE_BY_VALUE["81-100"]).toEqual({ diceNotation: "1d20", modifier: 10 })
      expect(PREREQUISITE_DICE_BY_VALUE["101+"]).toEqual({ diceNotation: "1d20", modifier: 15 })
    })
  })

  describe('CLAUSE_DICE_BY_VALUE', () => {
    it('should have correct dice notation and modifiers for all value ranges', () => {
      expect(CLAUSE_DICE_BY_VALUE["1-20"]).toEqual({ diceNotation: "1d20", modifier: -2 })
      expect(CLAUSE_DICE_BY_VALUE["21-40"]).toEqual({ diceNotation: "1d20", modifier: -1 })
      expect(CLAUSE_DICE_BY_VALUE["41-60"]).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(CLAUSE_DICE_BY_VALUE["61-80"]).toEqual({ diceNotation: "1d20", modifier: 2 })
      expect(CLAUSE_DICE_BY_VALUE["81-100"]).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(CLAUSE_DICE_BY_VALUE["101+"]).toEqual({ diceNotation: "1d20", modifier: 7 })
    })
  })

  describe('PAYMENT_TYPE_DICE_BY_VALUE', () => {
    it('should have correct dice notation and modifiers for all value ranges', () => {
      expect(PAYMENT_TYPE_DICE_BY_VALUE["1-20"]).toEqual({ diceNotation: "1d20", modifier: -2 })
      expect(PAYMENT_TYPE_DICE_BY_VALUE["21-40"]).toEqual({ diceNotation: "1d20", modifier: -1 })
      expect(PAYMENT_TYPE_DICE_BY_VALUE["41-60"]).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(PAYMENT_TYPE_DICE_BY_VALUE["61-80"]).toEqual({ diceNotation: "1d20", modifier: 2 })
      expect(PAYMENT_TYPE_DICE_BY_VALUE["81-100"]).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(PAYMENT_TYPE_DICE_BY_VALUE["101+"]).toEqual({ diceNotation: "1d20", modifier: 7 })
    })
  })
})

// ===== TESTES DE TABELAS PRINCIPAIS =====

describe('Contract Modifier Tables - Main Tables', () => {
  describe('CONTRACT_PREREQUISITES_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = CONTRACT_PREREQUISITES_TABLE
      
      // Verificar cobertura de 1-20
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have specific prerequisite entries from .md file', () => {
      const table = CONTRACT_PREREQUISITES_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 5)?.result).toBe("Nenhum")
      expect(table.find(e => e.min === 6 && e.max === 6)?.result).toBe("5 de renome")
      expect(table.find(e => e.min === 7 && e.max === 7)?.result).toBe("Um conjurador")
      expect(table.find(e => e.min === 20 && e.max === 20)?.result).toBe("Ter 50 de renome")
      expect(table.find(e => e.min === 21)?.result).toBe("Role duas vezes e use ambos")
    })
  })

  describe('CONTRACT_CLAUSES_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = CONTRACT_CLAUSES_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have specific clause entries from .md file', () => {
      const table = CONTRACT_CLAUSES_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 7)?.result).toBe("Nenhuma")
      expect(table.find(e => e.min === 8 && e.max === 8)?.result).toBe("Nenhum inimigo deve ser morto")
      expect(table.find(e => e.min === 20 && e.max === 20)?.result).toBe("Sigilo absoluto")
      expect(table.find(e => e.min === 21)?.result).toBe("Role duas vezes e use ambos")
    })
  })

  describe('CONTRACT_PAYMENT_TYPE_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = CONTRACT_PAYMENT_TYPE_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have correct payment type distributions', () => {
      const table = CONTRACT_PAYMENT_TYPE_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 3)?.result).toBe(PaymentType.DIRETO_CONTRATANTE)
      expect(table.find(e => e.min === 4 && e.max === 6)?.result).toBe(PaymentType.METADE_GUILDA_METADE_CONTRATANTE)
      expect(table.find(e => e.min === 13 && e.max === 20)?.result).toBe(PaymentType.TOTAL_GUILDA)
    })
  })

  describe('SIGNED_CONTRACT_RESOLUTION_TIME_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = SIGNED_CONTRACT_RESOLUTION_TIME_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have time-based resolution entries', () => {
      const table = SIGNED_CONTRACT_RESOLUTION_TIME_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 6)?.result).toBe("1d6 dias")
      expect(table.find(e => e.min === 7 && e.max === 8)?.result).toBe("1 semana")
      expect(table.find(e => e.min === 19 && e.max === 19)?.result).toBe("3 semanas")
    })
  })

  describe('UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have shorter resolution times than signed contracts', () => {
      const table = UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 4)?.result).toBe("3 dias")
      expect(table.find(e => e.min === 20 && e.max === 20)?.result).toBe("1 dia")
    })
  })

  describe('SIGNED_CONTRACT_RESOLUTION_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = SIGNED_CONTRACT_RESOLUTION_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have correct resolution distributions', () => {
      const table = SIGNED_CONTRACT_RESOLUTION_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 12)?.result).toBe(ContractResolution.RESOLVIDO)
      expect(table.find(e => e.min === 13 && e.max === 16)?.result).toBe(ContractResolution.NAO_RESOLVIDO)
      expect(table.find(e => e.min === 19 && e.max === 20)?.result).toBe(ContractResolution.AINDA_NAO_SE_SABE)
    })
  })

  describe('UNSIGNED_CONTRACT_RESOLUTION_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = UNSIGNED_CONTRACT_RESOLUTION_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have correct resolution actions', () => {
      const table = UNSIGNED_CONTRACT_RESOLUTION_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 2)?.result.action).toBe("keep_all")
      expect(table.find(e => e.min === 3 && e.max === 5)?.result.action).toBe("resolve_all")
      expect(table.find(e => e.min === 20 && e.max === 20)?.result.action).toBe("strange_reason")
    })
  })

  describe('CONTRACT_FAILURE_REASONS_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = CONTRACT_FAILURE_REASONS_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have correct failure reason distributions', () => {
      const table = CONTRACT_FAILURE_REASONS_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 6)?.result).toBe(FailureReason.DESISTENCIA)
      expect(table.find(e => e.min === 8 && e.max === 14)?.result).toBe(FailureReason.OBITO)
      expect(table.find(e => e.min === 20 && e.max === 20)?.result).toBe(FailureReason.CONTRATANTE_MORTO)
    })
  })

  describe('NEW_CONTRACTS_TIME_TABLE', () => {
    it('should cover dice range 1-20 completely', () => {
      const table = NEW_CONTRACTS_TIME_TABLE
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = table.some(entry => i >= entry.min && i <= entry.max)
        expect(hasEntry, `Value ${i} should be covered`).toBe(true)
      }
    })

    it('should have varied time ranges for new contracts', () => {
      const table = NEW_CONTRACTS_TIME_TABLE
      
      expect(table.find(e => e.min === 1 && e.max === 1)?.result).toBe("1d6 dias")
      expect(table.find(e => e.min === 18 && e.max === 18)?.result).toBe("2 meses")
      expect(table.find(e => e.min === 20 && e.max === 20)?.result).toBe("3 meses")
    })
  })
})

// ===== TESTES DE CONSTANTES =====

describe('Contract Modifier Tables - Constants', () => {
  it('should have correct constant values from .md file', () => {
    expect(CONTRACT_BREACH_PENALTY_PERCENTAGE).toBe(0.1) // 10%
    expect(UNRESOLVED_CONTRACT_BONUS).toBe(2)
    expect(REQUIREMENT_CLAUSE_BONUS).toBe(5)
  })
})

// ===== TESTES DE FUNÇÕES UTILITÁRIAS =====

describe('Contract Modifier Tables - Utility Functions', () => {
  describe('getPrerequisiteDice', () => {
    it('should return correct dice for each value range', () => {
      expect(getPrerequisiteDice(10)).toEqual({ diceNotation: "1d20", modifier: -10 })
      expect(getPrerequisiteDice(30)).toEqual({ diceNotation: "1d20", modifier: -5 })
      expect(getPrerequisiteDice(50)).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(getPrerequisiteDice(70)).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(getPrerequisiteDice(90)).toEqual({ diceNotation: "1d20", modifier: 10 })
      expect(getPrerequisiteDice(150)).toEqual({ diceNotation: "1d20", modifier: 15 })
    })

    it('should handle boundary values correctly', () => {
      expect(getPrerequisiteDice(20)).toEqual({ diceNotation: "1d20", modifier: -10 })
      expect(getPrerequisiteDice(21)).toEqual({ diceNotation: "1d20", modifier: -5 })
      expect(getPrerequisiteDice(100)).toEqual({ diceNotation: "1d20", modifier: 10 })
      expect(getPrerequisiteDice(101)).toEqual({ diceNotation: "1d20", modifier: 15 })
    })
  })

  describe('getClauseDice', () => {
    it('should return correct dice for each value range', () => {
      expect(getClauseDice(15)).toEqual({ diceNotation: "1d20", modifier: -2 })
      expect(getClauseDice(35)).toEqual({ diceNotation: "1d20", modifier: -1 })
      expect(getClauseDice(55)).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(getClauseDice(75)).toEqual({ diceNotation: "1d20", modifier: 2 })
      expect(getClauseDice(95)).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(getClauseDice(200)).toEqual({ diceNotation: "1d20", modifier: 7 })
    })
  })

  describe('getPaymentTypeDice', () => {
    it('should return correct dice for each value range', () => {
      expect(getPaymentTypeDice(5)).toEqual({ diceNotation: "1d20", modifier: -2 })
      expect(getPaymentTypeDice(25)).toEqual({ diceNotation: "1d20", modifier: -1 })
      expect(getPaymentTypeDice(45)).toEqual({ diceNotation: "1d20", modifier: 0 })
      expect(getPaymentTypeDice(65)).toEqual({ diceNotation: "1d20", modifier: 2 })
      expect(getPaymentTypeDice(85)).toEqual({ diceNotation: "1d20", modifier: 5 })
      expect(getPaymentTypeDice(120)).toEqual({ diceNotation: "1d20", modifier: 7 })
    })
  })

  describe('calculateBreachPenalty', () => {
    it('should calculate 10% penalty correctly', () => {
      expect(calculateBreachPenalty(100)).toBe(10)
      expect(calculateBreachPenalty(250)).toBe(25)
      expect(calculateBreachPenalty(33)).toBe(3) // Floor de 3.3
    })

    it('should handle zero and negative values', () => {
      expect(calculateBreachPenalty(0)).toBe(0)
      expect(calculateBreachPenalty(-50)).toBe(-5)
    })
  })

  describe('calculateRequirementClauseBonus', () => {
    it('should calculate bonus correctly for prerequisites and clauses', () => {
      expect(calculateRequirementClauseBonus(0, 0)).toBe(0)
      expect(calculateRequirementClauseBonus(1, 0)).toBe(5)
      expect(calculateRequirementClauseBonus(0, 1)).toBe(5)
      expect(calculateRequirementClauseBonus(2, 3)).toBe(25) // (2+3) * 5
    })
  })
})

// ===== TESTES DE INTEGRAÇÃO =====

describe('Contract Modifier Tables - Integration Tests', () => {
  it('should handle complex modifier scenarios', () => {
    // Cenário: Contrato de alto valor com múltiplos requisitos
    const contractValue = 85
    const rewardValue = 90
    
    const prerequisiteDice = getPrerequisiteDice(contractValue)
    const clauseDice = getClauseDice(rewardValue)
    const paymentDice = getPaymentTypeDice(contractValue)
    
    expect(prerequisiteDice.modifier).toBe(10) // Alto valor = alto modificador
    expect(clauseDice.modifier).toBe(5)       // Alta recompensa = bom modificador
    expect(paymentDice.modifier).toBe(5)      // Alto valor = melhor pagamento
    
    // Bonus por ter requisitos/cláusulas
    const bonus = calculateRequirementClauseBonus(1, 1)
    expect(bonus).toBe(10) // +5 por requisito, +5 por cláusula
  })

  it('should handle low-value contract scenarios', () => {
    // Cenário: Contrato de baixo valor
    const contractValue = 15
    const rewardValue = 18
    
    const prerequisiteDice = getPrerequisiteDice(contractValue)
    const clauseDice = getClauseDice(rewardValue)
    
    expect(prerequisiteDice.modifier).toBe(-10) // Baixo valor = penalidade
    expect(clauseDice.modifier).toBe(-2)        // Baixa recompensa = penalidade
    
    // Penalidade por quebra seria mínima
    const penalty = calculateBreachPenalty(rewardValue)
    expect(penalty).toBe(1) // 10% de 18 = 1.8, floor = 1
  })
})
