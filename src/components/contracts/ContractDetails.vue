<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        @click="closeModal"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 transform scale-95"
          leave-to-class="opacity-0 transform scale-95"
        >
          <div
            v-if="isOpen && contract"
            @click.stop
            class="relative bg-gray-800 rounded-lg shadow-xl border border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-600">
              <div class="flex items-center gap-3">
                <font-awesome-icon
                  :icon="contractorIcon"
                  class="text-amber-400 text-xl"
                />
                <div>
                  <h3 class="text-xl font-semibold text-amber-400">
                    {{ contract.title || `Contrato ${contract.id.slice(0, 8)}` }}
                  </h3>
                  <p class="text-sm text-gray-400">
                    {{ contractorTypeLabel }} - {{ contract.contractorName || 'Nome não especificado' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <ContractStatus :status="contract.status" size="md" />
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="text-lg" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div class="space-y-6">
                
                <!-- Descrição e Objetivo -->
                <section class="space-y-4">
                  <div v-if="contract.description">
                    <h4 class="text-lg font-semibold text-amber-400 mb-2">Descrição</h4>
                    <p class="text-gray-300 leading-relaxed">{{ contract.description }}</p>
                  </div>

                  <div v-if="contract.objective">
                    <h4 class="text-lg font-semibold text-amber-400 mb-2">Objetivo</h4>
                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div class="flex items-center gap-2 mb-2">
                        <font-awesome-icon :icon="['fas', 'bullseye']" class="text-amber-400" />
                        <span class="font-medium text-white">{{ contract.objective.category }}</span>
                      </div>
                      <p class="text-gray-300">{{ contract.objective.description }}</p>
                      <div v-if="contract.objective.targetName" class="mt-2 text-sm text-gray-400">
                        <strong>Alvo:</strong> {{ contract.objective.targetName }}
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Localização -->
                <section v-if="contract.location">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Localização</h4>
                  <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center gap-2 mb-2">
                      <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="text-amber-400" />
                      <span class="font-medium text-white">{{ contract.location.name }}</span>
                    </div>
                    <div v-if="contract.location.description" class="text-gray-300">
                      {{ contract.location.description }}
                    </div>
                    <div v-if="contract.location.category" class="mt-2 text-sm text-gray-400">
                      <strong>Tipo:</strong> {{ contract.location.category }}
                    </div>
                  </div>
                </section>

                <!-- Valores e Recompensas -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Valores e Recompensas</h4>
                  <ContractValue
                    :value="contract.value"
                    :difficulty="contract.difficulty"
                    :payment-type="contract.paymentType"
                    size="lg"
                    :show-tooltip="false"
                  />
                  
                  <!-- Detalhes dos Modificadores -->
                  <div class="mt-4 bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <h5 class="font-medium text-white mb-3">Detalhamento dos Modificadores</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div class="space-y-2">
                          <div class="flex justify-between">
                            <span class="text-gray-400">Rolagem Base (1d100):</span>
                            <span class="text-white font-mono">{{ contract.value.baseValue }}</span>
                          </div>
                          <div v-if="contract.value.modifiers.distance !== 0" class="flex justify-between">
                            <span class="text-gray-400">Distância:</span>
                            <span :class="getModifierClass(contract.value.modifiers.distance)">
                              {{ formatModifier(contract.value.modifiers.distance) }}
                            </span>
                          </div>
                          <div v-if="contract.value.modifiers.populationRelation !== 0" class="flex justify-between">
                            <span class="text-gray-400">Relação População:</span>
                            <span :class="getModifierClass(contract.value.modifiers.populationRelation)">
                              {{ formatModifier(contract.value.modifiers.populationRelation) }}
                            </span>
                          </div>
                          <div v-if="contract.value.modifiers.governmentRelation !== 0" class="flex justify-between">
                            <span class="text-gray-400">Relação Governo:</span>
                            <span :class="getModifierClass(contract.value.modifiers.governmentRelation)">
                              {{ formatModifier(contract.value.modifiers.governmentRelation) }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="space-y-2">
                          <div v-if="contract.value.modifiers.staffPreparation !== 0" class="flex justify-between">
                            <span class="text-gray-400">Funcionários:</span>
                            <span :class="getModifierClass(contract.value.modifiers.staffPreparation)">
                              {{ formatModifier(contract.value.modifiers.staffPreparation) }}
                            </span>
                          </div>
                          <div v-if="contract.value.modifiers.requirementsAndClauses > 0" class="flex justify-between">
                            <span class="text-gray-400">Pré-req./Cláusulas:</span>
                            <span class="text-green-300">
                              +{{ contract.value.modifiers.requirementsAndClauses }}
                            </span>
                          </div>
                          <div class="flex justify-between border-t border-gray-600 pt-2">
                            <span class="text-gray-400 font-medium">Mult. Experiência:</span>
                            <span class="text-white">×{{ contract.value.modifiers.difficultyMultiplier.experienceMultiplier }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-400 font-medium">Mult. Recompensa:</span>
                            <span class="text-white">×{{ contract.value.modifiers.difficultyMultiplier.rewardMultiplier }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Prazo e Pagamento -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Prazo e Pagamento</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'clock']" class="text-amber-400" />
                        Prazo
                      </h5>
                      <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-400">Tipo:</span>
                          <span class="text-white">{{ contract.deadline.type }}</span>
                        </div>
                        <div v-if="contract.deadline.value" class="flex justify-between">
                          <span class="text-gray-400">Tempo:</span>
                          <span class="text-white">{{ contract.deadline.value }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-400">Flexibilidade:</span>
                          <span :class="contract.deadline.isFlexible ? 'text-green-400' : 'text-orange-400'">
                            {{ contract.deadline.isFlexible ? 'Flexível' : 'Rígido' }}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-400">Arbitrário:</span>
                          <span :class="contract.deadline.isArbitrary ? 'text-yellow-400' : 'text-blue-400'">
                            {{ contract.deadline.isArbitrary ? 'Sim' : 'Não' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'coins']" class="text-amber-400" />
                        Pagamento
                      </h5>
                      <div class="text-sm">
                        <div class="text-gray-300">{{ getPaymentTypeDescription(contract.paymentType) }}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Informações de Debug (se habilitado) -->
                <section v-if="showDebugInfo" class="border-t border-gray-600 pt-4">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Informações de Geração</h4>
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <div class="text-gray-400">ID: {{ contract.id }}</div>
                        <div class="text-gray-400">Criado: {{ formatDate(contract.createdAt) }}</div>
                        <div v-if="contract.completedAt" class="text-gray-400">
                          Concluído: {{ formatDate(contract.completedAt) }}
                        </div>
                      </div>
                      <div v-if="contract.generationData">
                        <div class="text-gray-400">Rolagem Base: {{ contract.generationData.baseRoll }}</div>
                        <div class="text-gray-400">Tipo Assentamento: {{ contract.generationData.settlementType || 'N/A' }}</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <!-- Footer com ações -->
            <div class="flex items-center justify-between p-6 border-t border-gray-600 bg-gray-750">
              <div class="flex items-center gap-2 text-sm text-gray-400">
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                <span>{{ getDifficultyDescription(contract.difficulty) }}</span>
              </div>
              
              <div class="flex gap-3">
                <button
                  v-if="canAccept"
                  @click="handleAccept"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Aceitar Contrato
                </button>
                
                <button
                  v-if="canComplete"
                  @click="handleComplete"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Marcar como Concluído
                </button>
                
                <button
                  v-if="canAbandon"
                  @click="handleAbandon"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Abandonar
                </button>
                
                <button
                  @click="closeModal"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Contract } from '@/types/contract';
import { ContractorType, ContractDifficulty, PaymentType } from '@/types/contract';
import ContractStatus from './ContractStatus.vue';
import ContractValue from './ContractValue.vue';

interface Props {
  isOpen: boolean;
  contract: Contract | null;
  showDebugInfo?: boolean;
}

interface Emits {
  close: [];
  accept: [contract: Contract];
  complete: [contract: Contract];
  abandon: [contract: Contract];
}

const props = withDefaults(defineProps<Props>(), {
  showDebugInfo: false
});

const emit = defineEmits<Emits>();

// ===== COMPUTED =====

const contractorIcon = computed(() => {
  if (!props.contract) return ['fas', 'question'];
  
  switch (props.contract.contractorType) {
    case ContractorType.POVO:
      return ['fas', 'users'];
    case ContractorType.GOVERNO:
      return ['fas', 'crown'];
    case ContractorType.INSTITUICAO:
      return ['fas', 'building'];
    default:
      return ['fas', 'question'];
  }
});

const contractorTypeLabel = computed(() => {
  return props.contract?.contractorType || 'Desconhecido';
});

const canAccept = computed(() => {
  return props.contract?.status === 'Disponível';
});

const canComplete = computed(() => {
  return props.contract && [
    'Aceito',
    'Em andamento'
  ].includes(props.contract.status);
});

const canAbandon = computed(() => {
  return props.contract && [
    'Aceito',
    'Em andamento'
  ].includes(props.contract.status);
});

// ===== METHODS =====

function closeModal() {
  emit('close');
}

function handleAccept() {
  if (props.contract) {
    emit('accept', props.contract);
  }
}

function handleComplete() {
  if (props.contract) {
    emit('complete', props.contract);
  }
}

function handleAbandon() {
  if (props.contract) {
    emit('abandon', props.contract);
  }
}

function formatModifier(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function getModifierClass(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

function getPaymentTypeDescription(paymentType: PaymentType): string {
  switch (paymentType) {
    case PaymentType.DIRETO_CONTRATANTE:
      return 'Pagamento direto com o contratante';
    case PaymentType.METADE_GUILDA_METADE_CONTRATANTE:
      return 'Metade com a guilda, metade com o contratante';
    case PaymentType.METADE_GUILDA_METADE_BENS:
      return 'Metade com a guilda, metade em bens com o contratante';
    case PaymentType.BENS_SERVICOS:
      return 'Em materiais, joias, bens ou serviços do contratante';
    case PaymentType.TOTAL_GUILDA:
      return 'Pagamento total na guilda em PO$';
    case PaymentType.TOTAL_GUILDA_MAIS_SERVICOS:
      return 'Pagamento total na guilda em PO$ e serviços do contratante';
    default:
      return 'Tipo de pagamento não especificado';
  }
}

function getDifficultyDescription(difficulty: ContractDifficulty): string {
  switch (difficulty) {
    case ContractDifficulty.FACIL:
      return 'Contrato de dificuldade fácil - adequado para aventureiros iniciantes';
    case ContractDifficulty.MEDIO:
      return 'Contrato de dificuldade média - requer experiência moderada';
    case ContractDifficulty.DIFICIL:
      return 'Contrato difícil - recomendado para aventureiros experientes';
    case ContractDifficulty.MORTAL:
      return 'Contrato mortal - extremamente perigoso, apenas para veteranos';
    default:
      return 'Dificuldade não especificada';
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55, 65, 81);
}
</style>
