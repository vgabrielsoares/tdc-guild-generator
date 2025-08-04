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
                
                <!-- Descrição -->
                <section v-if="contract.description">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Descrição</h4>
                  <div class="text-gray-300 leading-relaxed whitespace-pre-line" v-html="formatMarkdown(contract.description)"></div>
                </section>

                <!-- 1. Objetivo -->
                <section v-if="contract.objective">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Objetivo</h4>
                  <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center gap-2 mb-2">
                      <font-awesome-icon :icon="['fas', 'bullseye']" class="text-amber-400" />
                      <span class="font-medium text-white">{{ contract.objective.category }}</span>
                    </div>
                    <p class="text-gray-300 mb-2">{{ contract.objective.description }}</p>
                    
                    <!-- Especificação do objetivo -->
                    <div v-if="contract.objective.specificObjective" class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-sm text-gray-400 mb-1">
                        <strong>Especificação:</strong>
                      </div>
                      <p class="text-gray-200">{{ contract.objective.specificObjective }}</p>
                    </div>
                    
                    <!-- Informações extras do objetivo -->
                    <div v-if="contract.objective.targetName" class="mt-2 text-sm text-gray-400">
                      <strong>Alvo:</strong> {{ contract.objective.targetName }}
                    </div>
                  </div>
                </section>

                <!-- 2. Localidade -->
                <section v-if="contract.location">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Localidade</h4>
                  <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center gap-2 mb-2">
                      <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="text-amber-400" />
                      <span class="font-medium text-white">{{ contract.location.name }}</span>
                    </div>
                    
                    <!-- Descrição da localidade -->
                    <div v-if="contract.location.description" class="text-gray-300 mb-2">
                      {{ contract.location.description }}
                    </div>
                    
                    <!-- Categoria da localidade -->
                    <div v-if="contract.location.category" class="mb-2">
                      <span class="text-sm text-gray-400">
                        <strong>Categoria:</strong>
                      </span>
                      <span class="text-sm text-blue-300 bg-blue-800/50 px-2 py-1 rounded ml-2">
                        {{ contract.location.category }}
                      </span>
                    </div>
                    
                    <!-- Local específico -->
                    <div v-if="contract.location.specificLocation" class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-sm text-gray-400 mb-1">
                        <strong>Local Específico:</strong>
                      </div>
                      <p class="text-gray-200">{{ contract.location.specificLocation }}</p>
                    </div>
                  </div>
                </section>

                <!-- 3. Antagonista -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Antagonista</h4>
                  <div class="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <div class="flex items-center gap-2 mb-2">
                      <font-awesome-icon :icon="['fas', 'user-times']" class="text-red-400" />
                      <span class="font-medium text-white">{{ contract.antagonist.name }}</span>
                      <span class="text-sm text-red-300 bg-red-800/50 px-2 py-1 rounded">
                        {{ contract.antagonist.category }}
                      </span>
                    </div>
                    <p class="text-gray-300 text-sm mb-2">{{ contract.antagonist.description }}</p>
                    <div class="text-xs text-red-200">
                      <strong>Tipo Específico:</strong> {{ contract.antagonist.specificType }}
                    </div>
                  </div>
                </section>

                <!-- 4. Complicações -->
                <section v-if="contract.complications?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Complicações</h4>
                  <div class="space-y-3">
                    <div 
                      v-for="complication in contract.complications" 
                      :key="complication.category"
                      class="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30"
                    >
                      <div class="flex items-center gap-2 mb-2">
                        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="text-orange-400" />
                        <span class="font-medium text-white">{{ complication.category }}</span>
                      </div>
                      <p class="text-gray-300 text-sm mb-1">{{ complication.description }}</p>
                      <div class="text-xs text-orange-200">
                        <strong>Detalhe:</strong> {{ complication.specificDetail }}
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 5. Aliados (Placeholder - Não implementado ainda) -->
                <!-- TODO: Implementar seção de aliados -->

                <!-- 6. Recompensas e Incentivos -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Recompensas e Incentivos</h4>
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
                          <div v-if="contract.value.modifiers.populationRelationValue !== 0" class="flex justify-between">
                            <span class="text-gray-400">Relação População:</span>
                            <span :class="getModifierClass(contract.value.modifiers.populationRelationValue)">
                              {{ formatModifier(contract.value.modifiers.populationRelationValue) }}
                            </span>
                          </div>
                          <div v-if="contract.value.modifiers.governmentRelationValue !== 0" class="flex justify-between">
                            <span class="text-gray-400">Relação Governo:</span>
                            <span :class="getModifierClass(contract.value.modifiers.governmentRelationValue)">
                              {{ formatModifier(contract.value.modifiers.governmentRelationValue) }}
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

                  <!-- Prazo e Pagamento -->
                  <div class="mt-4">
                    <h5 class="font-medium text-white mb-2">Prazo e Pagamento</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <h6 class="font-medium text-white mb-2 flex items-center gap-2">
                          <font-awesome-icon :icon="['fas', 'clock']" class="text-amber-400" />
                          Prazo
                        </h6>
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
                        <h6 class="font-medium text-white mb-2 flex items-center gap-2">
                          <font-awesome-icon :icon="['fas', 'coins']" class="text-amber-400" />
                          Pagamento
                        </h6>
                        <div class="text-sm">
                          <div class="text-gray-300">{{ getPaymentTypeDescription(contract.paymentType) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 7. Reviravoltas -->
                <section v-if="contract.twists?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Reviravoltas</h4>
                  <div class="space-y-3">
                    <div 
                      v-for="twist in contract.twists" 
                      :key="twist.description"
                      class="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30"
                    >
                      <div class="flex items-center gap-2 mb-2">
                        <font-awesome-icon :icon="['fas', 'surprise']" class="text-purple-400" />
                        <span class="font-medium text-white">Reviravolta</span>
                        <span v-if="twist.who" class="text-sm text-purple-300 bg-purple-800/50 px-2 py-1 rounded">
                          {{ twist.who }}
                        </span>
                      </div>
                      <p class="text-gray-300 text-sm mb-1">{{ twist.description }}</p>
                      <div v-if="twist.what" class="text-xs text-purple-200">
                        <strong>Revelação:</strong> {{ twist.what }}
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 8. Consequências Severas (Placeholder - Não implementado ainda) -->
                <!-- TODO: Implementar seção de consequências severas -->

                <!-- Pré-requisitos e Cláusulas -->
                <section v-if="contract.prerequisites?.length || contract.clauses?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Requisitos e Condições</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="contract.prerequisites?.length" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-yellow-400" />
                        Pré-requisitos
                      </h5>
                      <ul class="text-sm text-gray-300 space-y-1">
                        <li v-for="prerequisite in contract.prerequisites" :key="prerequisite" class="flex items-start gap-2">
                          <span class="text-yellow-400 mt-0.5">•</span>
                          <span>{{ prerequisite }}</span>
                        </li>
                      </ul>
                    </div>

                    <div v-if="contract.clauses?.length" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'scroll']" class="text-blue-400" />
                        Cláusulas Especiais
                      </h5>
                      <ul class="text-sm text-gray-300 space-y-1">
                        <li v-for="clause in contract.clauses" :key="clause" class="flex items-start gap-2">
                          <span class="text-blue-400 mt-0.5">•</span>
                          <span>{{ clause }}</span>
                        </li>
                      </ul>
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

function formatMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Converter **texto** para <strong>texto</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>')
    // Preservar quebras de linha
    .replace(/\n/g, '<br>');
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55, 65, 81);
}
</style>
