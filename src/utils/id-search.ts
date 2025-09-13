/**
 * Utilitários para busca por códigos de identificação em contratos e serviços
 *
 * Permite buscar por IDs no formato:
 * - Contratos: #XXXX ou XXXX (últimos 4 dígitos)
 * - Serviços: #XXXXXXXX ou XXXXXXXX (últimos 8 dígitos)
 */

/**
 * Extrai o código de identificação de um ID completo
 * @param fullId - ID completo do item
 * @param codeLength - Quantidade de caracteres para o código (4 para contratos, 8 para serviços)
 * @returns Código de identificação em maiúsculas
 */
export function extractIdCode(fullId: string, codeLength: number): string {
  return fullId.slice(-codeLength).toUpperCase();
}

/**
 * Normaliza uma busca de código removendo caracteres especiais e convertendo para maiúsculas
 * @param searchText - Texto de busca do usuário
 * @returns Texto normalizado para comparação
 */
export function normalizeCodeSearch(searchText: string): string {
  return searchText.replace(/[#\s-]/g, "").toUpperCase();
}

/**
 * Verifica se um texto de busca corresponde a um código de ID
 * @param searchText - Texto digitado pelo usuário
 * @param fullId - ID completo do item
 * @param codeLength - Tamanho do código (4 para contratos, 8 para serviços)
 * @returns true se o código corresponde à busca
 */
export function matchesIdCode(
  searchText: string,
  fullId: string,
  codeLength: number
): boolean {
  if (!searchText || !fullId) return false;

  const normalizedSearch = normalizeCodeSearch(searchText);
  const idCode = extractIdCode(fullId, codeLength);

  // Se a busca normalizada estiver vazia (ex: só "#"), retorna true (todos os itens têm códigos)
  if (normalizedSearch.length === 0) return true;

  // Busca exata pelo código completo
  if (normalizedSearch === idCode) return true;

  // Busca parcial, permite buscar qualquer parte do código (mínimo 1 caractere)
  // Mas para 1 caractere, só funciona se for o primeiro caractere (para evitar muitos falsos positivos)
  if (normalizedSearch.length === 1) {
    return idCode.startsWith(normalizedSearch);
  }

  // Para 2+ caracteres, permite busca em qualquer parte do código
  if (normalizedSearch.length >= 2 && idCode.includes(normalizedSearch)) {
    return true;
  }

  return false;
}

/**
 * Verifica se um texto de busca corresponde ao código de um contrato
 * Contratos usam os últimos 4 caracteres do ID
 * @param searchText - Texto digitado pelo usuário
 * @param contractId - ID completo do contrato
 * @returns true se o código do contrato corresponde à busca
 */
export function matchesContractCode(
  searchText: string,
  contractId: string
): boolean {
  return matchesIdCode(searchText, contractId, 4);
}

/**
 * Verifica se um texto de busca corresponde ao código de um serviço
 * Serviços usam os últimos 8 caracteres do ID
 * @param searchText - Texto digitado pelo usuário
 * @param serviceId - ID completo do serviço
 * @returns true se o código do serviço corresponde à busca
 */
export function matchesServiceCode(
  searchText: string,
  serviceId: string
): boolean {
  return matchesIdCode(searchText, serviceId, 8);
}

/**
 * Extrai código de contrato no formato exibido (últimos 4 caracteres)
 * @param contractId - ID completo do contrato
 * @returns Código do contrato em maiúsculas
 */
export function getContractDisplayCode(contractId: string): string {
  return extractIdCode(contractId, 4);
}

/**
 * Extrai código de serviço no formato exibido (últimos 8 caracteres)
 * @param serviceId - ID completo do serviço
 * @returns Código do serviço em maiúsculas
 */
export function getServiceDisplayCode(serviceId: string): string {
  return extractIdCode(serviceId, 8);
}
