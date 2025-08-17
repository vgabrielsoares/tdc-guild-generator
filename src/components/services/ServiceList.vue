<template>
  <div class="service-list p-6 bg-gray-800 rounded-lg border border-gray-700">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-amber-400 mb-4 flex items-center justify-center gap-2">
        <CogIcon class="w-6 h-6 text-amber-400" />
        Lista de Serviços
      </h3>

      <!-- Demonstração do Sistema de Testes de Perícia -->
      <div v-if="mockService" class="mt-6">
        <p class="text-gray-300 mb-4">
          Demo da Issue 5.23 - Sistema de Testes de Perícia:
        </p>

        <!-- Componente de Testes de Perícia -->
        <ServiceSkillTests :service="mockService" @test:completed="onTestCompleted" @tests:finished="onTestsFinished"
          @service:complete="onServiceComplete" @tests:reset="onTestsReset" />
      </div>

      <div v-else class="text-gray-300">
        <p class="mb-2">Componente será implementado na Issue 5.24</p>
        <button @click="createMockService"
          class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
          Testar Sistema de Perícias
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CogIcon } from '@heroicons/vue/24/outline'
import ServiceSkillTests from './ServiceSkillTests.vue'
import type { Service, ServiceTestStructure } from '@/types/service'
import {
  ServiceStatus,
  ServiceComplexity,
  ServiceDifficulty,
  ServiceContractorType,
  ServicePaymentType,
  ServiceDeadlineType,
  ServiceObjectiveType
} from '@/types/service'
import { createGameDate } from '@/utils/date-utils'
import type { SkillTestResult } from '@/utils/service-skill-resolution'

// ServiceList component
// Demo implementation for Issue 5.23 - Sistema de Testes de Perícia para Resolução

const mockService = ref<Service | null>(null)

const createMockService = () => {
  mockService.value = {
    id: 'mock-service-1',
    title: 'Serviço de Demonstração',
    description: 'Treinar pessoas em combate para demonstrar o sistema de testes',
    status: ServiceStatus.ACEITO,
    complexity: ServiceComplexity.MODERADA,
    difficulty: ServiceDifficulty.MEDIA_ND17,
    testStructure: {
      complexity: ServiceComplexity.MODERADA,
      baseND: 17,
      totalTests: 2,
      skillRequirement: 'same' as const,
      tests: [],
      successCount: 0,
      completed: false,
    },
    contractorType: ServiceContractorType.POVO,
    contractorName: 'João da Silva',
    objective: {
      type: ServiceObjectiveType.TREINAR_OU_ENSINAR,
      description: 'Treinar or ensinar a arte do combate para crianças órfãs',
      action: 'A arte do combate',
      target: 'Para crianças órfãs',
      complication: 'mas o conhecimento será usado contra você'
    },
    value: {
      rewardRoll: '2d4 C$',
      rewardAmount: 6,
      currency: 'C$' as const,
      recurrenceBonus: '+0,5 C$',
      recurrenceBonusAmount: 0.5,
      difficulty: ServiceDifficulty.MEDIA_ND17
    },
    deadline: {
      type: ServiceDeadlineType.SEMANAS,
      value: '1 semana'
    },
    paymentType: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
    createdAt: createGameDate(1, 1, 2025),
    acceptedAt: createGameDate(1, 1, 2025),
    isActive: true,
    isExpired: false
  }
}

const onTestCompleted = (_result: SkillTestResult) => {
  // Handle test completion
  // Log removed for production
}

const onTestsFinished = (_testStructure: ServiceTestStructure) => {
  // Handle all tests completion
  // Log removed for production
}

const onServiceComplete = (_service: Service) => {
  // Handle service completion
  // Log removed for production
  // Reset for new demo
  setTimeout(() => {
    mockService.value = null
  }, 3000)
}

const onTestsReset = () => {
  // Handle tests reset
  // Log removed for production
}
</script>
