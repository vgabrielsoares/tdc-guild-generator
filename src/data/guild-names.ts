export interface GuildNameConfig {
  readonly prefixes: readonly string[];
  readonly suffixes: readonly string[];
}

export const GUILD_NAME_CONFIG: GuildNameConfig = {
  prefixes: [
    'Guilda dos',
    'Irmandade dos',
    'Companhia dos',
    'Ordem dos',
    'Círculo dos',
    'Liga dos',
    'Conselho dos',
    'União dos',
    'Corporação dos',
    'Assembleia dos',
    'Sindicato dos',
    'Coalizão dos',
  ] as const,
  suffixes: [
    'Artesãos',
    'Mercadores',
    'Ferreiros',
    'Tecelões',
    'Alquimistas',
    'Escribas',
    'Construtores',
    'Aventureiros',
    'Exploradores',
    'Protetores',
    'Comerciantes',
    'Mestres',
    'Navegadores',
    'Cartógrafos',
    'Mineralogistas',
    'Engenheiros',
  ] as const,
} as const;

/**
 * Gera um nome aleatório para a guilda
 */
export function generateRandomGuildName(): string {
  const { prefixes, suffixes } = GUILD_NAME_CONFIG;
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
}
