import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractStatus, ContractDifficulty, ContractorType, DeadlineType, PaymentType } from '@/types/contract';
import { applySignedContractResolution } from '@/utils/generators/contractLifeCycle';
import type { Contract } from '@/types/contract';

// Mock para funções de dados
vi.mock('@/utils/dice', () => ({
  rollDice: vi.fn(() => ({ result: 10 }))
}));

vi.mock('@/utils/tableRoller', () => ({
  rollOnTable: vi.fn(() => ({ result: 'RESOLVIDO' }))
}));

describe('Proteção de Contratos dos Jogadores', () => {
  let mockContracts: Contract[];
  
  beforeEach(() => {
    // Criar contratos com diferentes status
    mockContracts = [
      createMockContract({ status: ContractStatus.DISPONIVEL, id: 'available-1' }),
      createMockContract({ status: ContractStatus.ACEITO, id: 'player-accepted-1' }),
      createMockContract({ status: ContractStatus.EM_ANDAMENTO, id: 'player-progress-1' }),
      createMockContract({ status: ContractStatus.ACEITO_POR_OUTROS, id: 'npc-accepted-1' }),
      createMockContract({ status: ContractStatus.ACEITO_POR_OUTROS, id: 'npc-accepted-2' }),
      createMockContract({ status: ContractStatus.CONCLUIDO, id: 'completed-1' }),
      createMockContract({ status: ContractStatus.RESOLVIDO_POR_OUTROS, id: 'resolved-by-others-1' }),
    ];
  });

  it('deve NÃO resolver contratos ACEITO (aceitos por jogadores)', () => {
    const originalContract = mockContracts.find(c => c.status === ContractStatus.ACEITO)!;
    
    const result = applySignedContractResolution(mockContracts);
    const resultContract = result.find(c => c.id === originalContract.id)!;
    
    // Contrato aceito por jogador deve permanecer inalterado
    expect(resultContract.status).toBe(ContractStatus.ACEITO);
    expect(resultContract).toEqual(originalContract);
  });

  it('deve NÃO resolver contratos EM_ANDAMENTO (em andamento pelos jogadores)', () => {
    const originalContract = mockContracts.find(c => c.status === ContractStatus.EM_ANDAMENTO)!;
    
    const result = applySignedContractResolution(mockContracts);
    const resultContract = result.find(c => c.id === originalContract.id)!;
    
    // Contrato em andamento pelos jogadores deve permanecer inalterado
    expect(resultContract.status).toBe(ContractStatus.EM_ANDAMENTO);
    expect(resultContract).toEqual(originalContract);
  });

  it('deve APENAS resolver contratos ACEITO_POR_OUTROS (aceitos por NPCs)', () => {
    const npcContracts = mockContracts.filter(c => c.status === ContractStatus.ACEITO_POR_OUTROS);
    
    const result = applySignedContractResolution(mockContracts);
    
    // Verificar que contratos NPC foram processados (status mudou)
    const processedNpcContracts = result.filter(c => 
      npcContracts.some(npc => npc.id === c.id) && 
      c.status !== ContractStatus.ACEITO_POR_OUTROS
    );
    
    expect(processedNpcContracts.length).toBeGreaterThan(0);
    
    // Verificar que contratos dos jogadores não foram tocados
    const playerContracts = result.filter(c => 
      c.status === ContractStatus.ACEITO || c.status === ContractStatus.EM_ANDAMENTO
    );
    
    expect(playerContracts.length).toBe(2); // Um ACEITO e um EM_ANDAMENTO
  });

  it('deve preservar todos os outros status sem modificações', () => {
    const nonTargetContracts = mockContracts.filter(c => 
      c.status !== ContractStatus.ACEITO_POR_OUTROS
    );
    
    const result = applySignedContractResolution(mockContracts);
    
    // Verificar que contratos que não são ACEITO_POR_OUTROS permaneceram inalterados
    nonTargetContracts.forEach(original => {
      const resultContract = result.find(c => c.id === original.id)!;
      expect(resultContract).toEqual(original);
    });
  });

  it('deve processar múltiplos contratos ACEITO_POR_OUTROS independentemente', () => {
    const npcContracts = mockContracts.filter(c => c.status === ContractStatus.ACEITO_POR_OUTROS);
    expect(npcContracts.length).toBe(2); // Garantir que temos múltiplos contratos NPC
    
    const result = applySignedContractResolution(mockContracts);
    
    // Verificar que ambos os contratos NPC foram processados
    npcContracts.forEach(original => {
      const resultContract = result.find(c => c.id === original.id)!;
      // Status deve ter mudado (ou para RESOLVIDO_POR_OUTROS, ou DISPONIVEL, ou ANULADO)
      expect(resultContract.status).not.toBe(ContractStatus.ACEITO_POR_OUTROS);
    });
  });

  it('deve retornar array com mesmo número de contratos', () => {
    const result = applySignedContractResolution(mockContracts);
    
    expect(result.length).toBe(mockContracts.length);
  });

  it('deve preservar IDs únicos de todos os contratos', () => {
    const originalIds = mockContracts.map(c => c.id).sort();
    
    const result = applySignedContractResolution(mockContracts);
    const resultIds = result.map(c => c.id).sort();
    
    expect(resultIds).toEqual(originalIds);
  });
});

// Função auxiliar para criar contratos mock
function createMockContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: overrides.id || 'mock-contract-id',
    title: 'Contrato Mock',
    description: 'Descrição mock',
    status: overrides.status || ContractStatus.DISPONIVEL,
    difficulty: ContractDifficulty.MEDIO,
    contractorType: ContractorType.POVO,
    contractorName: 'Contratante Mock',
    value: {
      experienceValue: 1000,
      rewardValue: 100,
      finalGoldReward: 100,
      modifiers: {
        distance: 0,
        populationRelation: 0,
        governmentRelation: 0,
        staffPreparation: 0,
        difficultyMultiplier: {
          experienceMultiplier: 1,
          rewardMultiplier: 1,
        },
        requirementsAndClauses: 0,
      },
    },
    deadline: {
      type: DeadlineType.SEM_PRAZO,
      value: 'Sem prazo',
    },
    paymentType: PaymentType.TOTAL_GUILDA,
    prerequisites: [],
    clauses: [],
    antagonist: {
      category: 'Humanoide poderoso',
      specificType: 'Bandido',
      name: 'Bandido Genérico',
      description: 'Um bandido comum',
    },
    complications: [],
    twists: [],
    allies: [],
    severeConsequences: [],
    createdAt: new Date(),
    generationData: {
      baseRoll: 50,
    },
    ...overrides,
  } as Contract;
}
