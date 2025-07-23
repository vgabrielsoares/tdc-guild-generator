import type { Guild } from '@/types/guild';
import { SettlementType, ResourceLevel, VisitorLevel, RelationLevel } from '@/types/guild';

/**
 * Helper para converter guilda readonly para Guild mutável
 * Usado em testes para contornar restrições de readonly
 */
export const convertToGuild = (readonlyGuild: unknown): Guild => {
  // Usar JSON para fazer deep clone e remover readonly
  const cloned = JSON.parse(JSON.stringify(readonlyGuild, (_, value) => {
    // Preservar Dates
    if (value && typeof value === 'object' && value.constructor === Date) {
      return value.toISOString();
    }
    return value;
  }));
  
  // Converter strings de volta para Dates
  if (cloned.createdAt) cloned.createdAt = new Date(cloned.createdAt);
  if (cloned.updatedAt) cloned.updatedAt = new Date(cloned.updatedAt);
  
  cloned.locked = cloned.locked || false;
  return cloned as Guild;
};

/**
 * Helper para criar uma guilda de teste com dados mínimos
 */
export const createTestGuild = (overrides: Partial<Guild> = {}): Guild => {
  const baseGuild: Guild = {
    id: `test_guild_${Date.now()}`,
    name: 'Guilda de Teste',
    structure: {
      size: 'Pequena',
      characteristics: ['Bem localizada'],
    },
    relations: {
      government: RelationLevel.DIPLOMATICA,
      population: RelationLevel.DIPLOMATICA,
    },
    staff: {
      employees: '2-8 funcionários',
    },
    visitors: {
      frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
      description: 'Visitantes regulares',
    },
    resources: {
      level: ResourceLevel.LIMITADOS,
      description: 'Recursos limitados mas suficientes',
    },
    settlementType: SettlementType.CIDADE_PEQUENA,
    createdAt: new Date(),
    locked: false,
    ...overrides,
  };
  
  return baseGuild;
};

/**
 * Helper para aguardar próximo tick
 */
export const nextTick = (): Promise<void> => {
  return Promise.resolve();
};
