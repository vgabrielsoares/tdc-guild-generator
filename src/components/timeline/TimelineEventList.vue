<template>
  <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <h3 class="text-lg font-semibold text-white">Lista de Eventos</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-400">
          {{ filteredEvents.length }} evento(s)
        </span>
        <Tooltip
          content="Lista completa de todos os eventos agendados na timeline da guilda com filtros por categoria."
          title="Lista de Eventos"
          position="auto"
        >
          <InfoButton
            help-key="timeline-events"
            @open-help="$emit('open-help', 'timeline-events')"
          />
        </Tooltip>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-4 border-b border-gray-700 bg-gray-750/50">
      <div class="flex flex-wrap gap-2">
        <!-- Filtro "Todos" -->
        <button
          @click="setFilter('all')"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all',
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Todos ({{ events.length }})
        </button>

        <!-- Filtros por categoria -->
        <button
          @click="setFilter('contracts')"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all',
            activeFilter === 'contracts'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Contratos ({{ contractEvents.length }})
        </button>

        <!-- Filtros preparados para futuro -->
        <button
          @click="setFilter('services')"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all',
            activeFilter === 'services'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
          disabled
          title="Implementação futura"
        >
          Serviços (0)
        </button>

        <button
          @click="setFilter('members')"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all',
            activeFilter === 'members'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
          disabled
          title="Implementação futura"
        >
          Membros (0)
        </button>

        <button
          @click="setFilter('notices')"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all',
            activeFilter === 'notices'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
          disabled
          title="Implementação futura"
        >
          Mural (0)
        </button>
      </div>
    </div>

    <!-- Lista de eventos -->
    <div class="max-h-96 overflow-y-auto">
      <div
        v-if="filteredEvents.length === 0"
        class="p-6 text-center text-gray-400"
      >
        <div class="text-4xl mb-2">
          <CalendarIcon class="w-6 h-6 mx-auto text-gray-500" />
        </div>
        <p class="text-lg mb-1">Nenhum evento encontrado</p>
        <p class="text-sm text-gray-500">
          {{ getEmptyStateMessage() }}
        </p>
      </div>

      <div v-else class="divide-y divide-gray-700">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="p-4 hover:bg-gray-750/50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <!-- Indicador de tipo -->
              <div
                class="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                :class="getEventIconColor(event.type)"
              ></div>

              <!-- Conteúdo do evento -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-white text-sm">
                      {{ event.description }}
                    </h4>
                    <div class="flex items-center space-x-4 mt-1">
                      <span class="text-xs text-gray-400">
                        {{ getEventTypeLabel(event.type) }}
                      </span>
                      <span class="text-xs text-gray-400">
                        {{ formatEventDate(event.date) }}
                      </span>
                    </div>
                  </div>

                  <!-- Status temporal -->
                  <div class="text-right ml-4 flex-shrink-0">
                    <div
                      class="text-sm font-medium"
                      :class="getDaysUntilEventColor(event.date)"
                    >
                      {{ getDaysUntilEvent(event.date) }}
                    </div>
                    <div
                      class="text-xs px-2 py-1 rounded-full mt-1"
                      :class="getEventStatusBadge(event.date)"
                    >
                      {{ getEventStatus(event.date) }}
                    </div>
                  </div>
                </div>

                <!-- Dados adicionais (se existirem) -->
                <div
                  v-if="event.data && Object.keys(event.data).length > 0"
                  class="mt-2 text-xs text-gray-500"
                >
                  <details class="group">
                    <summary
                      class="cursor-pointer hover:text-gray-400 transition-colors"
                    >
                      Detalhes do evento
                    </summary>
                    <div class="mt-1 pl-4 border-l-2 border-gray-600">
                      <pre class="text-xs text-gray-400 whitespace-pre-wrap">{{
                        formatEventData(event.data)
                      }}</pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação (se necessário no futuro) -->
    <div
      v-if="filteredEvents.length > 0"
      class="p-4 border-t border-gray-700 text-center"
    >
      <span class="text-sm text-gray-400">
        Mostrando {{ filteredEvents.length }} de {{ events.length }} eventos
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { ScheduledEventType, type GameDate } from "@/types/timeline";
import { CalendarIcon } from "@heroicons/vue/24/solid";

// Types
type FilterType = "all" | "contracts" | "services" | "members" | "notices";

// Emits
defineEmits<{
  "open-help": [key: string];
}>();

// State
const activeFilter = ref<FilterType>("all");

// Stores e composables
const { currentDate, events, dateUtils } = useTimeline();

// Computed - Eventos por categoria
const contractEvents = computed(() => {
  return events.value.filter((event) =>
    [
      ScheduledEventType.NEW_CONTRACTS,
      ScheduledEventType.CONTRACT_EXPIRATION,
      ScheduledEventType.CONTRACT_RESOLUTION,
    ].includes(event.type)
  );
});

// Computed - Eventos filtrados
const filteredEvents = computed(() => {
  const sortedEvents = [...events.value].sort((a, b) => {
    // Ordenar por data (mais próximos primeiro)
    if (!currentDate.value) return 0;

    const daysA = dateUtils.getDaysDifference(currentDate.value, a.date);
    const daysB = dateUtils.getDaysDifference(currentDate.value, b.date);

    return daysA - daysB;
  });

  switch (activeFilter.value) {
    case "contracts":
      return sortedEvents.filter((event) =>
        contractEvents.value.includes(event)
      );
    case "services":
      // TODO: implementar filtro de serviços
      return [];
    case "members":
      // TODO: implementar filtro de membros
      return [];
    case "notices":
      // TODO: implementar filtro de mural
      return [];
    default:
      return sortedEvents;
  }
});

// Methods
function setFilter(filter: FilterType) {
  activeFilter.value = filter;
}

function getEmptyStateMessage(): string {
  switch (activeFilter.value) {
    case "contracts":
      return "Nenhum evento de contratos agendado";
    case "services":
      return "Sistema de serviços será implementado em breve";
    case "members":
      return "Sistema de membros será implementado em breve";
    case "notices":
      return "Sistema de mural será implementado em breve";
    default:
      return "Adicione eventos à timeline para vê-los aqui";
  }
}

function formatEventDate(date: GameDate): string {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${date.day} de ${months[date.month - 1]}, ${date.year}`;
}

function getDaysUntilEvent(date: GameDate): string {
  const current = currentDate.value;
  if (!current) return "N/A";

  const days = dateUtils.getDaysDifference(current, date);

  if (days < 0) return `${Math.abs(days)} dias atrás`;
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}

function getDaysUntilEventColor(date: GameDate): string {
  const current = currentDate.value;
  if (!current) return "text-gray-300";

  const days = dateUtils.getDaysDifference(current, date);

  if (days < 0) return "text-red-400";
  if (days === 0) return "text-yellow-400";
  if (days <= 3) return "text-orange-400";
  if (days <= 7) return "text-blue-400";
  return "text-gray-300";
}

function getEventStatus(date: GameDate): string {
  const current = currentDate.value;
  if (!current) return "N/A";

  const days = dateUtils.getDaysDifference(current, date);

  if (days < 0) return "Atrasado";
  if (days === 0) return "Hoje";
  if (days <= 3) return "Urgente";
  if (days <= 7) return "Próximo";
  return "Futuro";
}

function getEventStatusBadge(date: GameDate): string {
  const current = currentDate.value;
  if (!current) return "bg-gray-600 text-gray-300";

  const days = dateUtils.getDaysDifference(current, date);

  if (days < 0) return "bg-red-600 text-red-100";
  if (days === 0) return "bg-yellow-600 text-yellow-100";
  if (days <= 3) return "bg-orange-600 text-orange-100";
  if (days <= 7) return "bg-blue-600 text-blue-100";
  return "bg-gray-600 text-gray-300";
}

function getEventTypeLabel(type: ScheduledEventType): string {
  const labels = {
    [ScheduledEventType.NEW_CONTRACTS]: "Novos Contratos",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "Expiração de Contrato",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "Resolução de Contrato",
    [ScheduledEventType.NEW_SERVICES]: "Novos Serviços",
    [ScheduledEventType.SERVICE_RESOLUTION]: "Resolução de Serviço",
    [ScheduledEventType.NEW_NOTICES]: "Novos Avisos",
    [ScheduledEventType.NOTICE_EXPIRATION]: "Expiração de Aviso",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]: "Atualização de Membros",
    [ScheduledEventType.RENOWN_AUTHORIZATION]: "Autorização de Renome",
    [ScheduledEventType.RESOURCE_AVAILABILITY]: "Disponibilidade de Recursos",
  } as const;

  return labels[type] || "Evento Desconhecido";
}

function getEventIconColor(type: ScheduledEventType): string {
  const colors = {
    [ScheduledEventType.NEW_CONTRACTS]: "bg-emerald-400",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "bg-yellow-400",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "bg-red-400",
    [ScheduledEventType.NEW_SERVICES]: "bg-indigo-400",
    [ScheduledEventType.SERVICE_RESOLUTION]: "bg-orange-400",
    [ScheduledEventType.NEW_NOTICES]: "bg-blue-400",
    [ScheduledEventType.NOTICE_EXPIRATION]: "bg-cyan-400",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]: "bg-purple-400",
    [ScheduledEventType.RENOWN_AUTHORIZATION]: "bg-pink-400",
    [ScheduledEventType.RESOURCE_AVAILABILITY]: "bg-teal-400",
  } as const;

  return colors[type] || "bg-gray-400";
}

function formatEventData(data: Record<string, unknown>): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "Dados inválidos";
  }
}
</script>
