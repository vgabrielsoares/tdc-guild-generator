import type { GameDate, ScheduledEvent, CalendarConfig } from '@/types/timeline';
import { 
  DEFAULT_CALENDAR_CONFIG, 
  createGameDate, 
  getDaysInMonth,
  isDateBeforeOrEqual,
  isSameDate
} from '@/types/timeline';

// Re-exportar funções importantes da timeline
export { 
  formatGameDate, 
  isSameDate, 
  isDateBeforeOrEqual,
  isDateAfter,
  isDateBefore,
  formatShortGameDate,
  createGameDate,
  getDaysInMonth
} from '@/types/timeline';

/**
 * Avança uma data do jogo por um número específico de dias
 */
export function addDays(date: GameDate, days: number): GameDate {
  if (days === 0) return { ...date };
  if (days < 0) return subtractDays(date, Math.abs(days));

  let newDay = date.day + days;
  let newMonth = date.month;
  let newYear = date.year;

  while (newDay > getDaysInMonth(newMonth, newYear)) {
    newDay -= getDaysInMonth(newMonth, newYear);
    newMonth++;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
  }

  return createGameDate(newDay, newMonth, newYear);
}

/**
 * Subtrai uma data do jogo por um número específico de dias
 */
export function subtractDays(date: GameDate, days: number): GameDate {
  if (days === 0) return { ...date };
  if (days < 0) return addDays(date, Math.abs(days));

  let newDay = date.day - days;
  let newMonth = date.month;
  let newYear = date.year;

  while (newDay < 1) {
    newMonth--;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
      
      if (newYear < 1) {
        throw new Error('Data resultante seria inválida (ano menor que 1)');
      }
    }
    
    newDay += getDaysInMonth(newMonth, newYear);
  }

  return createGameDate(newDay, newMonth, newYear);
}

/**
 * Adiciona semanas a uma data
 */
export function addWeeks(date: GameDate, weeks: number): GameDate {
  return addDays(date, weeks * 7);
}

/**
 * Adiciona meses a uma data
 */
export function addMonths(date: GameDate, months: number): GameDate {
  if (months === 0) return { ...date };
  
  let newMonth = date.month + months;
  let newYear = date.year;
  
  while (newMonth > 12) {
    newMonth -= 12;
    newYear++;
  }
  
  while (newMonth < 1) {
    newMonth += 12;
    newYear--;
    
    if (newYear < 1) {
      throw new Error('Data resultante seria inválida (ano menor que 1)');
    }
  }
  
  // Ajustar o dia caso o mês de destino tenha menos dias
  const maxDaysInTargetMonth = getDaysInMonth(newMonth, newYear);
  const newDay = Math.min(date.day, maxDaysInTargetMonth);
  
  return createGameDate(newDay, newMonth, newYear);
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function getDaysDifference(startDate: GameDate, endDate: GameDate): number {
  if (isSameDate(startDate, endDate)) return 0;
  
  // Implementação simplificada para cálculo rápido
  // Converte datas para número de dias desde o ano 1
  const startDays = dateToDays(startDate);
  const endDays = dateToDays(endDate);
  
  return endDays - startDays;
}

/**
 * Converte uma data em número total de dias desde o ano 1
 */
function dateToDays(date: GameDate): number {
  let totalDays = 0;
  
  // Adicionar dias dos anos completos
  for (let year = 1; year < date.year; year++) {
    totalDays += isLeapYear(year) ? 366 : 365;
  }
  
  // Adicionar dias dos meses completos do ano atual
  for (let month = 1; month < date.month; month++) {
    totalDays += getDaysInMonth(month, date.year);
  }
  
  // Adicionar dias do mês atual
  totalDays += date.day;
  
  return totalDays;
}

/**
 * Verifica se um ano é bissexto
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Filtra eventos que devem ser acionados em ou antes de uma data específica
 */
export function getTriggeredEvents(events: ScheduledEvent[], targetDate: GameDate): ScheduledEvent[] {
  return events.filter(event => isDateBeforeOrEqual(event.date, targetDate));
}

/**
 * Filtra eventos que ainda não foram acionados (futuro)
 */
export function getRemainingEvents(events: ScheduledEvent[], targetDate: GameDate): ScheduledEvent[] {
  return events.filter(event => !isDateBeforeOrEqual(event.date, targetDate));
}

/**
 * Ordena eventos por data (mais próximos primeiro)
 */
export function sortEventsByDate(events: ScheduledEvent[]): ScheduledEvent[] {
  return [...events].sort((a, b) => {
    if (isSameDate(a.date, b.date)) return 0;
    return isDateBeforeOrEqual(a.date, b.date) ? -1 : 1;
  });
}

/**
 * Encontra o próximo evento a partir de uma data
 */
export function getNextEvent(events: ScheduledEvent[], currentDate: GameDate): ScheduledEvent | null {
  const futureEvents = getRemainingEvents(events, currentDate);
  if (futureEvents.length === 0) return null;
  
  const sortedEvents = sortEventsByDate(futureEvents);
  return sortedEvents[0];
}

/**
 * Calcula dias até o próximo evento
 */
export function getDaysUntilNextEvent(events: ScheduledEvent[], currentDate: GameDate): number | null {
  const nextEvent = getNextEvent(events, currentDate);
  if (!nextEvent) return null;
  
  return getDaysDifference(currentDate, nextEvent.date);
}

/**
 * Cria uma data padrão para inicializar timeline (1 de Janeiro do ano base)
 */
export function createDefaultGameDate(config: CalendarConfig = DEFAULT_CALENDAR_CONFIG): GameDate {
  return createGameDate(1, 1, config.startYear);
}

/**
 * Valida se uma data está dentro dos limites válidos
 */
export function isValidGameDate(date: GameDate): boolean {
  try {
    createGameDate(date.day, date.month, date.year);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém informações sobre um mês específico
 */
export function getMonthInfo(month: number, year: number): {
  name: string;
  days: number;
  isLeapYear: boolean;
} {
  if (month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month}`);
  }
  
  return {
    name: DEFAULT_CALENDAR_CONFIG.monthNames[month - 1],
    days: getDaysInMonth(month, year),
    isLeapYear: month === 2 && isLeapYear(year),
  };
}

/**
 * Gera um array com todos os dias de um mês
 */
export function generateMonthDays(month: number, year: number): GameDate[] {
  const monthInfo = getMonthInfo(month, year);
  const days: GameDate[] = [];
  
  for (let day = 1; day <= monthInfo.days; day++) {
    days.push(createGameDate(day, month, year));
  }
  
  return days;
}
