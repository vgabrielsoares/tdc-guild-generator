import { describe, it, expect } from 'vitest';
import { SettlementType, ResourceLevel, VisitorLevel, RelationLevel } from '@/types/guild';
import { 
  StructureGenerator,
  RelationsGenerator,
  ResourcesVisitorsGenerator,
  GuildGenerator,
  ModifierCalculator
} from '@/utils/generators';

describe('Refactored Generators - Phase 3', () => {
  
  describe('StructureGenerator', () => {
    it('should generate valid structure for different settlement types', () => {
      const config = {
        settlementType: SettlementType.CIDADE_PEQUENA,
        debug: false,
      };
      
      const generator = new StructureGenerator(config);
      const result = generator.generate();
      
      expect(result.data.structure).toBeDefined();
      expect(result.data.structure.size).toBeTruthy();
      expect(result.data.structure.characteristics).toBeInstanceOf(Array);
      expect(result.data.structure.characteristics.length).toBeGreaterThan(0);
      
      expect(result.data.staff).toBeDefined();
      expect(result.data.staff.employees).toBeTruthy();
      
      expect(result.rolls.size).toBeGreaterThan(0);
      expect(result.rolls.characteristics).toBeInstanceOf(Array);
      expect(result.rolls.employees).toBeGreaterThan(0);
      
      expect(result.logs).toBeInstanceOf(Array);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should apply custom modifiers correctly', () => {
      const config = {
        settlementType: SettlementType.ALDEIA,
        customModifiers: {
          size: 5,
          employees: -2,
        },
        debug: false,
      };
      
      const generator = new StructureGenerator(config);
      const result = generator.generate();
      
      // Verificar que os modificadores foram aplicados (pelos logs)
      const sizeLog = result.logs.find(log => log.includes('size') && log.includes('+5'));
      const employeesLog = result.logs.find(log => log.includes('Employees') && log.includes('-2'));
      
      expect(sizeLog || employeesLog).toBeTruthy();
    });

    it('should generate appropriate number of characteristics based on size roll', () => {
      // Executar várias vezes para testar diferentes casos
      for (let i = 0; i < 10; i++) {
        const config = {
          settlementType: SettlementType.METROPOLE,
          debug: false,
        };
        
        const generator = new StructureGenerator(config);
        const result = generator.generate();
        
        const characteristicsCount = result.data.structure.characteristics.length;
        
        // Baseado no roll de tamanho, deve ter 1-3 características
        expect(characteristicsCount).toBeGreaterThanOrEqual(1);
        expect(characteristicsCount).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('RelationsGenerator', () => {
    it('should generate valid relations', () => {
      const config = {
        settlementType: SettlementType.CIDADE_GRANDE,
        debug: false,
      };
      
      const generator = new RelationsGenerator(config);
      const result = generator.generate();
      
      expect(result.data.relations).toBeDefined();
      expect(Object.values(RelationLevel)).toContain(result.data.relations.government);
      expect(Object.values(RelationLevel)).toContain(result.data.relations.population);
      
      expect(result.rolls.government).toBeGreaterThan(0);
      expect(result.rolls.population).toBeGreaterThan(0);
    });

    it('should apply custom modifiers to relations', () => {
      const config = {
        settlementType: SettlementType.LUGAREJO,
        customModifiers: {
          government: 10,
          population: -5,
        },
        debug: false,
      };
      
      const generator = new RelationsGenerator(config);
      const result = generator.generate();
      
      // Verificar logs para confirmar aplicação de modificadores
      const govLog = result.logs.find(log => log.includes('Government') && log.includes('+10'));
      const popLog = result.logs.find(log => log.includes('Population') && log.includes('-5'));
      
      expect(govLog || popLog).toBeTruthy();
    });
  });

  describe('ResourcesVisitorsGenerator', () => {
    it('should generate valid resources and visitors', () => {
      const config = {
        settlementType: SettlementType.ALDEIA,
        debug: false,
      };
      
      const generator = new ResourcesVisitorsGenerator(config);
      const result = generator.generate();
      
      expect(result.data.resources).toBeDefined();
      expect(Object.values(ResourceLevel)).toContain(result.data.resources.level);
      
      expect(result.data.visitors).toBeDefined();
      expect(Object.values(VisitorLevel)).toContain(result.data.visitors.frequency);
      
      expect(result.rolls.resources).toBeGreaterThan(0);
      expect(result.rolls.visitors).toBeGreaterThan(0);
    });

    it('should apply relation modifiers correctly', () => {
      const config = {
        settlementType: SettlementType.CIDADE_PEQUENA,
        relationModifiers: {
          government: RelationLevel.PESSIMA,
          population: RelationLevel.BOA,
          employees: 'qualificados para o trabalho',
          currentResources: ResourceLevel.ABUNDANTES,
        },
        debug: false,
      };
      
      const generator = new ResourcesVisitorsGenerator(config);
      const result = generator.generate();
      
      // Verificar que os modificadores foram calculados e aplicados
      const modifierLog = result.logs.find(log => 
        log.includes('modifiers') && 
        (log.includes('Resource') || log.includes('Visitor'))
      );
      
      expect(modifierLog).toBeTruthy();
    });
  });

  describe('ModifierCalculator', () => {
    it('should calculate resource modifiers correctly', () => {
      // Teste baseado nas regras dos arquivos .md
      const modifier1 = ModifierCalculator.calculateResourceModifiers(
        RelationLevel.PESSIMA, // -3
        RelationLevel.BOA       // +1
      );
      expect(modifier1).toBe(-2);

      const modifier2 = ModifierCalculator.calculateResourceModifiers(
        RelationLevel.EXCELENTE, // +3
        RelationLevel.MUITO_BOA   // +2
      );
      expect(modifier2).toBe(5);
    });

    it('should calculate visitor modifiers correctly', () => {
      const modifier1 = ModifierCalculator.calculateVisitorModifiers(
        '1 funcionário experiente', // +1
        ResourceLevel.ABUNDANTES    // +6
      );
      expect(modifier1).toBe(7);

      const modifier2 = ModifierCalculator.calculateVisitorModifiers(
        '1 funcionário despreparado', // -1
        ResourceLevel.EM_DEBITO       // -6
      );
      expect(modifier2).toBe(-7);
    });
  });

  describe('GuildGenerator - Integration', () => {
    it('should generate complete guild with all systems integrated', () => {
      const config = {
        settlementType: SettlementType.CIDADE_PEQUENA,
        name: 'Guilda de Teste',
        debug: false,
      };
      
      const generator = new GuildGenerator(config);
      const result = generator.generate();
      
      // Verificar guild completa
      expect(result.data.guild).toBeDefined();
      expect(result.data.guild.name).toBe('Guilda de Teste');
      expect(result.data.guild.settlementType).toBe(SettlementType.CIDADE_PEQUENA);
      
      // Verificar todas as seções
      expect(result.data.guild.structure).toBeDefined();
      expect(result.data.guild.relations).toBeDefined();
      expect(result.data.guild.staff).toBeDefined();
      expect(result.data.guild.visitors).toBeDefined();
      expect(result.data.guild.resources).toBeDefined();
      
      // Verificar metadados
      expect(result.data.guild.id).toBeTruthy();
      expect(result.data.guild.createdAt).toBeInstanceOf(Date);
      
      // Verificar rolls
      expect(result.rolls.structure).toBeDefined();
      expect(result.rolls.relations).toBeDefined();
      expect(typeof result.rolls.resources).toBe('number');
      expect(typeof result.rolls.visitors).toBe('number');
      
      // Verificar logs
      expect(result.logs).toBeInstanceOf(Array);
      expect(result.logs.length).toBeGreaterThan(0);
      
      // Verificar que seguiu as fases corretas
      const phaseLog1 = result.logs.find(log => log.includes('Phase 1: Generating structure'));
      const phaseLog2 = result.logs.find(log => log.includes('Phase 2: Generating relations'));
      const phaseLog3 = result.logs.find(log => log.includes('Phase 3: Generating resources'));
      const phaseLog4 = result.logs.find(log => log.includes('Phase 4: Assembling final guild'));
      
      expect(phaseLog1).toBeTruthy();
      expect(phaseLog2).toBeTruthy();
      expect(phaseLog3).toBeTruthy();
      expect(phaseLog4).toBeTruthy();
    });

    it('should apply complex modifiers correctly across all systems', () => {
      const config = {
        settlementType: SettlementType.METROPOLE,
        customModifiers: {
          structure: { size: 2, employees: -1 },
          relations: { government: 5, population: -3 },
          resources: { level: 1 },
          visitors: { frequency: -2 },
        },
        debug: true,
      };
      
      const generator = new GuildGenerator(config);
      const result = generator.generate();
      
      // Verificar que modificadores foram aplicados em todo o sistema
      const logs = result.logs.join(' ');
      
      // Deve conter logs de modificadores
      expect(logs).toContain('modifier');
      
      // Guild deve ser válida mesmo com modificadores
      expect(result.data.guild).toBeDefined();
      expect(Object.values(ResourceLevel)).toContain(result.data.guild.resources.level);
      expect(Object.values(VisitorLevel)).toContain(result.data.guild.visitors.frequency);
    });

    it('should handle error cases gracefully', () => {
      expect(() => {
        const config = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          settlementType: '' as any,
          debug: false,
        };
        
        const generator = new GuildGenerator(config);
        generator.generate();
      }).toThrow();
    });

    it('should generate unique IDs for different guilds', () => {
      const config = {
        settlementType: SettlementType.ALDEIA,
        debug: false,
      };
      
      const generator1 = new GuildGenerator(config);
      const generator2 = new GuildGenerator(config);
      
      const result1 = generator1.generate();
      const result2 = generator2.generate();
      
      expect(result1.data.guild.id).not.toBe(result2.data.guild.id);
    });
  });

  describe('Performance and Reliability', () => {
    it('should generate guilds consistently within reasonable time', () => {
      const config = {
        settlementType: SettlementType.CIDADE_GRANDE,
        debug: false,
      };
      
      const startTime = Date.now();
      
      // Gerar 10 guildas para teste de performance
      for (let i = 0; i < 10; i++) {
        const generator = new GuildGenerator(config);
        const result = generator.generate();
        
        expect(result.data.guild).toBeDefined();
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Deve levar menos de 1 segundo para gerar 10 guildas
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle all settlement types correctly', () => {
      const settlementTypes = Object.values(SettlementType);
      
      settlementTypes.forEach(settlementType => {
        const config = {
          settlementType,
          debug: false,
        };
        
        const generator = new GuildGenerator(config);
        const result = generator.generate();
        
        expect(result.data.guild.settlementType).toBe(settlementType);
        expect(result.data.guild).toBeDefined();
      });
    });
  });
});
