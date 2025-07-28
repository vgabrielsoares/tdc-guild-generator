/**
 * Utilitários para cores progressivas baseadas nos valores das tabelas do sistema
 */

export type RelationLevel = 
  | 'Péssima' | 'Ruim' | 'Ruim, mas tentam manter a cordialidade'
  | 'Diplomática' | 'Boa, mas o governo tenta miná-los secretamente' 
  | 'Boa' | 'Muito boa, cooperam frequentemente'
  | 'Excelente, governo e guilda são quase como um'
  | 'Péssima, puro ódio' | 'Ruim, vistos como mercenários'
  | 'Ruim, só causam problemas' | 'Opinião dividida'
  | 'Boa, ajudam com problemas' | 'Boa, "nos mantêm seguros"'
  | 'Muito boa, "sem eles estaríamos perdidos"'
  | 'Excelente, a guilda faz o assentamento funcionar';

export type ResourceLevel = 
  | 'Em débito' | 'Nenhum' | 'Escassos'
  | 'Escassos e obtidos com muito esforço e honestidade'
  | 'Limitados' | 'Suficientes' | 'Excedentes'
  | 'Excedentes mas alimenta fins malignos'
  | 'Abundantes porém quase todo vindo do governo de um assentamento próximo'
  | 'Abundantes' | 'Abundantes vindos de muitos anos de serviço';

export type VisitorFrequency = 
  | 'Vazia' | 'Quase deserta' | 'Pouco movimentada'
  | 'Nem muito nem pouco' | 'Muito frequentada' 
  | 'Abarrotada' | 'Lotada';

/**
 * Retorna classes CSS para coloração progressiva de relações
 * Sistema: vermelho (pior) → laranja → amarelo → azul → verde (melhor)
 */
export const getRelationColor = (relation: string): string => {
  const lowerRelation = relation.toLowerCase();
  
  // Péssima - Vermelho escuro
  if (lowerRelation.includes('péssima') || lowerRelation.includes('puro ódio')) {
    return 'bg-red-600 text-red-100 border border-red-500';
  }
  
  // Ruim - Vermelho/Laranja
  if (lowerRelation.includes('ruim') || lowerRelation.includes('mercenários') || lowerRelation.includes('só causam problemas')) {
    return 'bg-red-500 text-red-100 border border-red-400';
  }
  
  // Diplomática/Dividida - Amarelo
  if (lowerRelation.includes('diplomática') || lowerRelation.includes('opinião dividida') || lowerRelation.includes('cordialidade')) {
    return 'bg-yellow-500 text-yellow-900 border border-yellow-400';
  }
  
  // Boa - Azul
  if (lowerRelation.includes('boa') || lowerRelation.includes('ajudam') || lowerRelation.includes('mantêm seguros') || lowerRelation.includes('miná-los')) {
    return 'bg-blue-500 text-blue-100 border border-blue-400';
  }
  
  // Muito boa - Verde
  if (lowerRelation.includes('muito boa') || lowerRelation.includes('cooperam') || lowerRelation.includes('estaríamos perdidos')) {
    return 'bg-green-500 text-green-100 border border-green-400';
  }
  
  // Excelente - Verde escuro
  if (lowerRelation.includes('excelente') || lowerRelation.includes('assentamento funcionar') || lowerRelation.includes('quase como um')) {
    return 'bg-green-600 text-green-100 border border-green-500';
  }
  
  return 'bg-gray-400 text-gray-100 border border-gray-300'; // Fallback
};

/**
 * Retorna classes CSS para coloração progressiva de recursos
 * Sistema: vermelho (pior) → laranja → amarelo → azul → verde (melhor)
 */
export const getResourceColor = (level: string): string => {
  const lowerLevel = level.toLowerCase();
  
  // Em débito - Vermelho escuro
  if (lowerLevel.includes('em débito')) {
    return 'bg-red-700 text-red-100 border border-red-600';
  }
  
  // Nenhum - Vermelho
  if (lowerLevel.includes('nenhum')) {
    return 'bg-red-600 text-red-100 border border-red-500';
  }
  
  // Escassos - Laranja
  if (lowerLevel.includes('escassos')) {
    return 'bg-orange-500 text-orange-100 border border-orange-400';
  }
  
  // Limitados - Amarelo
  if (lowerLevel.includes('limitados')) {
    return 'bg-yellow-500 text-yellow-900 border border-yellow-400';
  }
  
  // Suficientes - Azul
  if (lowerLevel.includes('suficientes')) {
    return 'bg-blue-500 text-blue-100 border border-blue-400';
  }
  
  // Excedentes - Verde claro
  if (lowerLevel.includes('excedentes')) {
    return 'bg-green-500 text-green-100 border border-green-400';
  }
  
  // Abundantes - Verde escuro
  if (lowerLevel.includes('abundantes')) {
    return 'bg-green-600 text-green-100 border border-green-500';
  }
  
  return 'bg-gray-400 text-gray-100 border border-gray-300'; // Fallback
};

/**
 * Retorna classes CSS para coloração progressiva de frequência de visitantes
 * Sistema: vermelho (pior) → laranja → amarelo → azul → verde (melhor)
 */
export const getVisitorFrequencyColor = (frequency: string): string => {
  const lowerFrequency = frequency.toLowerCase();
  
  // Vazia - Vermelho escuro
  if (lowerFrequency.includes('vazia')) {
    return 'bg-red-600 text-red-100 border border-red-500';
  }
  
  // Quase deserta - Vermelho
  if (lowerFrequency.includes('quase deserta')) {
    return 'bg-red-500 text-red-100 border border-red-400';
  }
  
  // Pouco movimentada - Laranja
  if (lowerFrequency.includes('pouco movimentada')) {
    return 'bg-orange-500 text-orange-100 border border-orange-400';
  }
  
  // Nem muito nem pouco - Amarelo
  if (lowerFrequency.includes('nem muito nem pouco')) {
    return 'bg-yellow-500 text-yellow-900 border border-yellow-400';
  }
  
  // Muito frequentada - Azul
  if (lowerFrequency.includes('muito frequentada')) {
    return 'bg-blue-500 text-blue-100 border border-blue-400';
  }
  
  // Abarrotada - Verde
  if (lowerFrequency.includes('abarrotada')) {
    return 'bg-green-500 text-green-100 border border-green-400';
  }
  
  // Lotada - Verde escuro
  if (lowerFrequency.includes('lotada')) {
    return 'bg-green-600 text-green-100 border border-green-500';
  }
  
  return 'bg-gray-400 text-gray-100 border border-gray-300'; // Fallback
};
