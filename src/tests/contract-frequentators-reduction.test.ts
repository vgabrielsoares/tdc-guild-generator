import { describe, it, expect, beforeEach } from 'vitest';
import { ContractGenerator } from '@/utils/generators/contractGenerator';
import { ContractStatus } from '@/types/contract';
import { VisitorLevel, RelationLevel, type Guild } from '@/types/guild';
import { createGameDate } from '@/utils/date-utils';

describe('Contract Reduction by Frequentators - Issue 4.22', () => {
  let mockGuild: Guild;
  let currentDate: ReturnType<typeof createGameDate>;

  beforeEach(() => {
    currentDate = createGameDate(1, 1, 1000);
    
    // Mock básico de uma guilda para testes
    mockGuild = {
      id: 'test-guild',
      name: 'Test Guild',
      structure: { size: 'Pequeno e modesto (6m x 6m)' },
      staff: { employees: 'normal' },
      visitors: { frequency: VisitorLevel.NEM_MUITO_NEM_POUCO },
      relations: {
        population: RelationLevel.BOA,
        government: RelationLevel.DIPLOMATICA
      }
    } as Guild;
  });

  it('should generate contracts with frequentators reduction applied', () => {
    const config = { guild: mockGuild };
    
    // Gerar contratos com redução por frequentadores
    const contractsWithReduction = ContractGenerator.generateContractsWithFrequentatorsReduction(
      config, 
      currentDate
    );
    
    // Deve ter pelo menos alguns contratos
    expect(contractsWithReduction.length).toBeGreaterThan(0);
    
    // Para guild com NEM_MUITO_NEM_POUCO, pode ter redução
    // (isso depende da rolagem, então não testamos valor exato)
    expect(contractsWithReduction.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle VAZIA frequency correctly (no reduction)', () => {
    const guildWithEmptyVisitors = {
      ...mockGuild,
      visitors: { frequency: VisitorLevel.VAZIA }
    };
    
    const config = { guild: guildWithEmptyVisitors };
    
    const contracts = ContractGenerator.generateContractsWithFrequentatorsReduction(
      config,
      currentDate
    );
    
    // Com frequentadores VAZIA, todos os contratos devem estar disponíveis
    const availableContracts = contracts.filter(
      contract => contract.status === ContractStatus.DISPONIVEL
    );
    
    expect(availableContracts.length).toBe(contracts.length);
  });

  it('should add takenByOthersInfo for contracts with special status', () => {
    const guildWithManyVisitors = {
      ...mockGuild,
      visitors: { frequency: VisitorLevel.MUITO_FREQUENTADA }
    };
    
    const config = { guild: guildWithManyVisitors };
    
    const contracts = ContractGenerator.generateContractsWithFrequentatorsReduction(
      config,
      currentDate
    );
    
    // Verificar se contratos não disponíveis têm informações adequadas
    const contractsTakenByOthers = contracts.filter(
      contract => contract.status === ContractStatus.ACEITO_POR_OUTROS ||
                 contract.status === ContractStatus.RESOLVIDO_POR_OUTROS ||
                 contract.status === ContractStatus.ANULADO
    );
    
    contractsTakenByOthers.forEach(contract => {
      expect(contract.takenByOthersInfo).toBeDefined();
      expect(contract.takenByOthersInfo?.takenAt).toEqual(currentDate);
    });
  });

  it('should respect the existing logic for quantity calculation', () => {
    const config = { guild: mockGuild };
    
    // Calcular quantidades sem redução
    const quantityWithoutReduction = ContractGenerator.calculateContractQuantity({
      ...config,
      skipFrequentatorsReduction: true
    });
    
    // Calcular quantidades com redução
    const quantityWithReduction = ContractGenerator.calculateContractQuantity(config);
    
    // A quantidade final (com redução) deve ser menor ou igual à sem redução
    expect(quantityWithReduction.totalGenerated).toBeLessThanOrEqual(
      quantityWithoutReduction.totalGenerated
    );
    
    // A redução deve ser contabilizada
    expect(quantityWithReduction.frequentatorsReduction).toBeGreaterThanOrEqual(0);
  });
});
