<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        @click="closeModal">
        <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 transform scale-95" leave-to-class="opacity-0 transform scale-95">
          <div v-if="isOpen && contract" @click.stop
            class="relative bg-gray-800 rounded-lg shadow-xl border border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-600">
              <div class="flex items-center gap-3">
                <component :is="contractorIcon" class="w-6 h-6 text-amber-400" />
                <div>
                  <h3 class="text-xl font-semibold text-amber-400">
                    {{ contract.title || `Contrato ${contract.id.slice(0, 8)}` }}
                  </h3>
                  <p class="text-md text-gray-400">
                    {{ contractorTypeLabel }} - {{ contract.contractorName || 'Nome não especificado' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <ContractStatus :status="contract.status" size="md" />
                <button @click="closeModal"
                  class="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div class="space-y-6">

                <!-- Descrição -->
                <section v-if="contract.description">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Descrição</h4>
                  <div class="text-gray-300 leading-relaxed whitespace-pre-line"
                    v-html="formatMarkdown(contract.description)"></div>
                </section>

                <!-- 1. Objetivo -->
                <section v-if="contract.objective">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Objetivo</h4>
                  <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center gap-2 mb-2">
                      <XCircleIcon class="w-5 h-5 text-amber-400" />
                      <span class="font-medium text-white">{{ getCategoryDisplayName(contract.objective.category)
                      }}</span>
                    </div>
                    <p class="text-gray-300 mb-2">{{ contract.objective.description }}</p>

                    <!-- Especificação do objetivo -->
                    <div v-if="contract.objective.specificObjective"
                      class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-sm text-gray-400 mb-1">
                        <strong>Especificação:</strong>
                      </div>
                      <p class="text-gray-200">{{ contract.objective.specificObjective }}</p>
                    </div>
                  </div>
                </section>

                <!-- 1.5. Contratante Inusitado -->
                <section v-if="contract.unusualContractor?.isUnusual">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Contratante Inusitado</h4>
                  <div class="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                    <div class="flex items-center gap-2 mb-2">
                      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium text-white">Figura Excêntrica</span>
                    </div>
                    <p class="text-gray-300 mb-3">{{ contract.unusualContractor.description }}</p>

                    <!-- Palavras-chave temáticas -->
                    <div
                      v-if="contract.unusualContractor.themeKeywords && contract.unusualContractor.themeKeywords.length > 0"
                      class="mt-3 p-3 bg-purple-800/20 rounded border border-purple-500/20">
                      <div class="text-sm text-purple-300 mb-2">
                        <strong>Palavras-chave para criatividade:</strong>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="keyword in contract.unusualContractor.themeKeywords"
                          :key="`${keyword.set}-${keyword.keyword}`"
                          class="inline-block bg-purple-700/30 text-purple-200 px-2 py-1 rounded text-sm border border-purple-500/20">
                          {{ keyword.keyword }}
                        </span>
                      </div>
                      <div class="text-xs text-purple-400 mt-2">
                        <InformationCircleIcon class="w-3 h-3 inline mr-1" />
                        Use essas palavras-chave para inspirar características únicas, motivações, aparência ou
                        maneirismos do contratante.
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 2. Localidade -->
                <section v-if="contract.location">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Localidade</h4>
                  <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center gap-2 mb-2">
                      <MapPinIcon class="w-5 h-5 text-amber-400" />
                      <span class="font-medium text-white">{{ contract.location.name }}</span>
                    </div>

                    <!-- Especificação da localidade -->
                    <div v-if="contract.location.specification"
                      class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-md text-gray-400 mb-1">
                        <strong>Localização específica:</strong>
                      </div>
                      <p class="text-gray-200 mb-1">{{ contract.location.specification.location }}</p>
                      <div
                        v-if="contract.location.specification.description !== contract.location.specification.location"
                        class="text-sm text-gray-300">
                        → {{ contract.location.specification.description }}
                      </div>
                    </div>

                    <!-- Distrito específico -->
                    <div v-if="contract.location.district" class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-md text-gray-400 mb-1">
                        <strong>Distrito:</strong>
                      </div>
                      <p class="text-gray-200">
                        {{ contract.location.district.primary.name }}
                        <span v-if="contract.location.district.secondary"> e {{
                          contract.location.district.secondary.name }}</span>
                      </p>
                    </div>

                    <!-- Importância do local -->
                    <div v-if="contract.location.importance && contract.location.importance.type !== 'nenhuma'"
                      class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-md text-gray-400 mb-1">
                        <strong>Importância:</strong>
                      </div>
                      <p class="text-gray-200 mb-1">{{ contract.location.importance.name }}</p>
                      <div v-if="contract.location.importance.description !== contract.location.importance.name"
                        class="text-sm text-gray-300">
                        → {{ contract.location.importance.description }}
                      </div>
                    </div>

                    <!-- Peculiaridade do local -->
                    <div v-if="contract.location.peculiarity && contract.location.peculiarity.type !== 'nenhuma'"
                      class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                      <div class="text-md text-gray-400 mb-1">
                        <strong>Peculiaridade:</strong>
                      </div>
                      <p class="text-gray-200 mb-1">{{ contract.location.peculiarity.name }}</p>
                      <div v-if="contract.location.peculiarity.description !== contract.location.peculiarity.name"
                        class="text-sm text-gray-300">
                        → {{ contract.location.peculiarity.description }}
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 3. Distância -->
                <section v-if="contract.generationData.distanceRoll">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Distância</h4>
                  <div class="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <div class="flex items-center gap-2 mb-2">
                      <MapPinIcon class="w-5 h-5 text-blue-400" />
                      <span class="font-medium text-white">{{ distanceDetails?.description || 'Distância não especificada' }}</span>
                    </div>
                    <div v-if="distanceDetails?.hexagons || distanceDetails?.kilometers" class="mt-4">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Hexágonos -->
                        <div>
                          <div class="flex justify-center md:justify-middle">
                            <span class="text-gray-400 font-medium">Hexágonos</span>
                          </div>
                          <div class="flex justify-center md:justify-middle mt-1">
                            <span class="text-gray-300 text-lg font-semibold">
                              <template v-if="distanceDetails?.hexagons">
                                <template v-if="distanceDetails.hexagons.min === distanceDetails.hexagons.max">
                                  {{ distanceDetails.hexagons.min }} hexágono{{ distanceDetails.hexagons.min > 1 ? 's' :
                                    '' }}
                                </template>
                                <template v-else>
                                  {{ distanceDetails.hexagons.min }}-{{ distanceDetails.hexagons.max }} hexágonos
                                </template>
                              </template>
                              <template v-else>
                                —
                              </template>
                            </span>
                          </div>
                        </div>
                        <!-- Distância aproximada -->
                        <div>
                          <div class="flex justify-center md:justify-middle">
                            <span class="text-gray-400 font-medium">Distância aproximada</span>
                          </div>
                          <div class="flex justify-center md:justify-middle mt-1">
                            <span class="text-gray-300 text-lg font-semibold">
                              <template v-if="distanceDetails?.kilometers">
                                <template v-if="distanceDetails.kilometers.min === distanceDetails.kilometers.max">
                                  {{ distanceDetails.kilometers.min }} km
                                </template>
                                <template v-else>
                                  {{ distanceDetails.kilometers.min }}-{{ distanceDetails.kilometers.max }} km
                                </template>
                              </template>
                              <template v-else>
                                —
                              </template>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="text-sm text-gray-400 mt-3 pt-2 border-t border-blue-500/20">
                      <div class="flex items-center gap-1">
                        <InformationCircleIcon class="w-3 h-3" />
                        <span>1 hexágono = 9,5 km (6 milhas)</span>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 4. Antagonista -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Antagonista</h4>
                  <div class="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <div class="flex items-center gap-2 mb-2">
                      <UserMinusIcon class="w-5 h-5 text-red-400" />
                      <span class="font-medium text-white">{{ contract.antagonist.specificType }}</span>
                      <span class="text-sm text-red-300 bg-red-800/50 px-2 py-1 rounded">
                        {{ getCategoryDisplayName(contract.antagonist.category) }}
                      </span>
                    </div>
                    <p class="text-gray-300 text-md">{{ contract.antagonist.description }}</p>
                  </div>
                </section>

                <!-- 5. Complicações -->
                <section v-if="contract.complications?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Complicações</h4>
                  <div class="space-y-3">
                    <div v-for="complication in contract.complications" :key="complication.category"
                      class="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                      <div class="flex items-center gap-2 mb-2">
                        <ExclamationCircleIcon class="w-5 h-5 text-orange-400" />
                        <span class="font-medium text-white">{{ complication.specificDetail }}</span>
                        <span class="text-sm text-orange-300 bg-orange-800/50 px-2 py-1 rounded">
                          {{ getCategoryDisplayName(complication.category) }}
                        </span>
                      </div>
                      <p class="text-gray-300 text-md">{{ complication.description }}</p>
                    </div>
                  </div>
                </section>

                <!-- 6. Aliados -->
                <section v-if="contract.allies?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Aliados Potenciais</h4>
                  <div class="space-y-3">
                    <div v-for="ally in contract.allies" :key="ally.name"
                      class="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                      <div class="flex items-center gap-2 mb-2">
                        <UserPlusIcon class="w-5 h-5 text-green-400" />
                        <span class="font-medium text-white">{{ ally.name }}</span>
                        <span class="text-sm text-green-300 bg-green-800/50 px-2 py-1 rounded">
                          {{ getCategoryDisplayName(ally.category) }}
                        </span>
                      </div>
                      <p class="text-gray-300 text-md mb-2">{{ ally.description }}</p>

                      <!-- Detalhes específicos do aliado -->
                      <div class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div class="text-gray-400 mb-1">
                              <strong>Tipo específico:</strong>
                            </div>
                            <p class="text-gray-200">{{ ally.specificType }}</p>
                          </div>
                          <div>
                            <div class="text-gray-400 mb-1">
                              <strong>Quando aparece:</strong>
                            </div>
                            <p class="text-gray-200">{{ getTimingDisplayName(ally.timing) }}</p>
                          </div>

                          <!-- Nível de poder para aventureiros -->
                          <div v-if="ally.powerLevel !== undefined" class="md:col-span-2">
                            <div class="text-gray-400 mb-1">
                              <strong>Nível de Ameaça:</strong>
                            </div>
                            <p class="text-gray-200">NA {{ ally.powerLevel }}</p>
                          </div>

                          <!-- Características para monstruosidades -->
                          <div v-if="ally.characteristics?.length" class="md:col-span-2">
                            <div class="text-gray-400 mb-1">
                              <strong>Características especiais:</strong>
                            </div>
                            <ul class="text-gray-200 space-y-1">
                              <li v-for="characteristic in ally.characteristics" :key="characteristic"
                                class="flex items-start gap-2">
                                <span class="text-green-400 mt-0.5">•</span>
                                <span>{{ characteristic }}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 7. Reviravoltas -->
                <section v-if="contract.twists?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Reviravoltas</h4>
                  <div class="space-y-3">
                    <div v-for="twist in contract.twists" :key="twist.description"
                      class="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                      <div class="flex items-center gap-2 mb-2">
                        <FaceSmileIcon class="w-5 h-5 text-purple-400" />
                        <span class="font-medium text-white">Reviravolta</span>
                        <span v-if="twist.who" class="text-sm text-purple-300 bg-purple-800/50 px-2 py-1 rounded">
                          {{ twist.who }}
                        </span>
                      </div>
                      <p class="text-gray-300 text-sm mb-1">{{ twist.description }}</p>
                      <div v-if="twist.what" class="text-sm text-purple-200">
                        <strong>Revelação:</strong> {{ twist.what }}
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 8. Consequências Severas -->
                <section v-if="contract.severeConsequences?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Consequências por Falha</h4>
                  <div class="space-y-3">
                    <div v-for="consequence in contract.severeConsequences" :key="consequence.description"
                      class="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                      <div class="flex items-center gap-2 mb-2">
                        <ShieldExclamationIcon class="w-5 h-5 text-red-400" />
                        <span class="font-medium text-white">{{ consequence.category }}</span>
                        <span class="text-sm text-red-300 bg-red-800/50 px-2 py-1 rounded">
                          Consequência Severa
                        </span>
                      </div>
                      <p class="text-gray-300 text-sm mb-2">{{ consequence.description }}</p>

                      <!-- Detalhes específicos da consequência -->
                      <div class="mt-3 p-3 bg-gray-800 rounded border border-gray-500">
                        <div class="space-y-3 text-sm">
                          <div>
                            <div class="text-gray-400 mb-1">
                              <strong>Consequência específica:</strong>
                            </div>
                            <p class="text-gray-200">{{ consequence.specificConsequence }}</p>
                          </div>

                          <div>
                            <div class="text-gray-400 mb-1">
                              <strong>Impacto nos contratados:</strong>
                            </div>
                            <p class="text-gray-200">{{ consequence.affectsContractors }}</p>
                          </div>

                          <!-- Efeito adicional se existir -->
                          <div v-if="consequence.additionalEffect">
                            <div class="text-gray-400 mb-1">
                              <strong>Efeito adicional:</strong>
                            </div>
                            <p class="text-gray-200">{{ consequence.additionalEffect }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- 9. Pagamento -->
                <section>
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Pagamento</h4>
                  <ContractValue :value="contract.value" :difficulty="contract.difficulty"
                    :contractor-type="contract.contractorType" :payment-type="contract.paymentType" size="lg" />

                  <!-- Recompensas e Incentivos -->
                  <section v-if="contract.additionalRewards?.length">
                    <h4 class="text-lg font-semibold text-amber-400 mb-2 flex items-center gap-2">
                      <GiftIcon class="w-5 h-5" />
                      Recompensas e Incentivos
                    </h4>
                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div class="space-y-3">
                        <div v-for="reward in contract.additionalRewards" :key="reward.specificReward"
                          class="flex items-start gap-3 p-3 rounded-lg border"
                          :class="reward.isPositive ? 'bg-green-900/20 border-green-600/30' : 'bg-red-900/20 border-red-600/30'">
                          <div class="flex-shrink-0 mt-0.5">
                            <CheckCircleIcon v-if="reward.isPositive" class="w-5 h-5 text-green-400" />
                            <ExclamationTriangleIcon v-else class="w-5 h-5 text-red-400" />
                          </div>
                          <div class="flex-1">
                            <div class="font-medium text-white mb-1">{{ getCategoryDisplayName(reward.category) }}</div>
                            <div class="text-sm text-gray-300">{{ reward.specificReward }}</div>
                            <div v-if="reward.description && reward.description !== reward.specificReward"
                              class="text-sm text-gray-400 mt-1">{{ reward.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <!-- Penalidades e Multas -->
                  <section v-if="contract.penalty">
                    <h4 class="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <ExclamationTriangleIcon class="w-5 h-5" />
                      Penalidade Aplicada
                    </h4>
                    <div class="bg-red-900/20 rounded-lg p-4 border border-red-600/30">
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-0.5">
                          <XCircleIcon class="w-6 h-6 text-red-400" />
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-red-200 mb-2">Multa por Quebra de Contrato</div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div class="text-sm text-gray-400 mb-1">Valor da Multa:</div>
                              <div class="text-lg font-bold text-red-300">
                                {{ contract.penalty.amount }} PO
                              </div>
                            </div>
                            <div>
                              <div class="text-sm text-gray-400 mb-1">Data da Aplicação:</div>
                              <div class="text-sm text-gray-200">
                                {{ formatGameDate(contract.penalty.appliedAt) }}
                              </div>
                            </div>
                          </div>
                          <div class="mt-3">
                            <div class="text-sm text-gray-400 mb-1">Motivo:</div>
                            <div class="text-sm text-red-200 bg-red-900/30 p-2 rounded border border-red-600/20">
                              {{ contract.penalty.reason }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <!-- Prazo e Tipo de Pagamento -->
                  <div class="mt-4">
                    <h5 class="font-medium text-white mb-2">Prazo e Tipo de Pagamento</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <h6 class="font-medium text-white mb-2 flex items-center gap-2">
                          <ClockIcon class="w-5 h-5 text-amber-400" />
                          Prazo
                        </h6>
                        <div class="space-y-1 text-md">
                          <div class="flex justify-between">
                            <span class="text-gray-400">Tipo:</span>
                            <span class="text-white">{{ contract.deadline.type }}</span>
                          </div>
                          <div v-if="contract.deadline.value" class="flex justify-between">
                            <span class="text-gray-400">Tempo:</span>
                            <span class="text-white">{{ contract.deadline.value }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <h6 class="font-medium text-white mb-2 flex items-center gap-2">
                          <CurrencyDollarIcon class="w-5 h-5 text-amber-400" />
                          Tipo de Pagamento
                        </h6>
                        <div class="text-md">
                          <div class="text-gray-300">{{ getPaymentTypeDescription(contract.paymentType) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Pré-requisitos e Cláusulas -->
                <section v-if="contract.prerequisites?.length || contract.clauses?.length">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Requisitos e Condições</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="contract.prerequisites?.length"
                      class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <ExclamationTriangleIcon class="w-5 h-5 text-yellow-400" />
                        Pré-requisitos
                      </h5>
                      <ul class="text-md text-gray-300 space-y-1">
                        <li v-for="prerequisite in contract.prerequisites" :key="prerequisite"
                          class="flex items-start gap-2">
                          <span class="text-yellow-400 mt-0.5">•</span>
                          <span>{{ prerequisite }}</span>
                        </li>
                      </ul>
                    </div>

                    <div v-if="contract.clauses?.length" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h5 class="font-medium text-white mb-2 flex items-center gap-2">
                        <DocumentTextIcon class="w-5 h-5 text-blue-400" />
                        Cláusulas Especiais
                      </h5>
                      <ul class="text-md text-gray-300 space-y-1">
                        <li v-for="clause in contract.clauses" :key="clause" class="flex items-start gap-2">
                          <span class="text-blue-400 mt-0.5">•</span>
                          <span>{{ clause }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <!-- Palavras-chave temáticas do contrato -->
                <section v-if="contract.themeKeywords && contract.themeKeywords.length > 0">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Palavras-chave Temáticas</h4>
                  <div class="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                    <div class="flex items-center gap-2 mb-3">
                      <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span class="font-medium text-white">Inspiração Criativa</span>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-3">
                      <span v-for="keyword in contract.themeKeywords"
                        :key="`contract-${keyword.set}-${keyword.keyword}`"
                        class="inline-block bg-indigo-700/30 text-indigo-200 px-3 py-1 rounded-full text-sm border border-indigo-500/20">
                        {{ keyword.keyword }}
                      </span>
                    </div>

                    <div class="text-xs text-indigo-400">
                      <InformationCircleIcon class="w-3 h-3 inline mr-1" />
                      Use essas palavras-chave para inspirar elementos criativos, atmosfera, temas e desenvolvimento do
                      contrato como um
                      todo.
                    </div>
                  </div>
                </section>

                <!-- Informações de Debug (se habilitado) -->
                <section v-if="showDebugInfo" class="border-t border-gray-600 pt-4">
                  <h4 class="text-lg font-semibold text-amber-400 mb-2">Informações de Geração</h4>
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                      <div>
                        <div class="text-gray-400">ID: {{ contract.id }}</div>
                        <div class="text-gray-400">Criado: {{ formatDate(contract.createdAt) }}</div>
                        <div v-if="contract.completedAt" class="text-gray-400">
                          Concluído: {{ formatDate(contract.completedAt) }}
                        </div>
                      </div>
                      <div v-if="contract.generationData">
                        <div class="text-gray-400">Rolagem Base: {{ contract.generationData.baseRoll }}</div>
                        <div class="text-gray-400">Tipo Assentamento: {{ contract.generationData.settlementType || 'N/A'
                        }}</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <!-- Footer com ações -->
            <div class="flex items-center justify-between p-6 border-t border-gray-600 bg-gray-750">
              <div class="flex items-center gap-2 text-sm text-gray-400">
                <InformationCircleIcon class="w-4 h-4" />
                <span>{{ getDifficultyDescription(contract.difficulty) }}</span>
              </div>

              <div class="flex gap-3">
                <button v-if="canAccept" @click="handleAccept"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
                  Aceitar Contrato
                </button>

                <button v-if="canComplete" @click="handleComplete"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                  Marcar como Concluído
                </button>

                <button v-if="canAbandon" @click="handleAbandon"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                  Abandonar
                </button>

                <button @click="closeModal"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
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
import { ContractGenerator } from '@/utils/generators/contractGenerator';
import ContractStatus from './ContractStatus.vue';
import ContractValue from './ContractValue.vue';
import {
  UsersIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  MapPinIcon,
  UserMinusIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  GiftIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';
import {
  XCircleIcon
} from '@heroicons/vue/24/solid';

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
  if (!props.contract) return QuestionMarkCircleIcon;

  switch (props.contract.contractorType) {
    case ContractorType.POVO:
      return UsersIcon;
    case ContractorType.GOVERNO:
      return BuildingOfficeIcon;
    case ContractorType.INSTITUICAO:
      return BuildingOfficeIcon;
    default:
      return QuestionMarkCircleIcon;
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

const distanceDetails = computed(() => {
  if (!props.contract) return null;
  return getDistanceDetails(props.contract);
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

function getDistanceDetails(contract: Contract): {
  description: string;
  hexagons: { min: number; max: number } | null;
  kilometers: { min: number; max: number } | null;
} {
  return ContractGenerator.getContractDistanceDetails(contract);
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

function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'ATACAR_DESTRUIR': 'Atacar/Destruir',
    'ENCONTRAR_RECUPERAR': 'Encontrar/Recuperar',
    'CAPTURAR': 'Capturar',
    'PROTEGER_SALVAR': 'Proteger/Salvar',
    'EXPLORAR_DESCOBRIR': 'Explorar/Descobrir',
    'ENTREGAR_RECEBER': 'Entregar/Receber',
    'INVESTIGAR_SABOTAR': 'Investigar/Sabotar',
    'SERVICOS_PERIGOSOS': 'Serviços Perigosos',
    'RELIGIOSO': 'Religioso',
    'HUMANOIDE_PODEROSO': 'Humanoide Poderoso',
    'ARTEFATO_MAGICO': 'Artefato Mágico',
    'ORGANIZACAO': 'Organização',
    'PERIGO_IMINENTE': 'Perigo Iminente',
    'ENTIDADE_SOBRENATURAL': 'Entidade Sobrenatural',
    'ANOMALIA': 'Anomalia',
    'DESASTRE_ACIDENTE': 'Desastre/Acidente',
    'CRISE': 'Crise',
    'MISTERIO': 'Mistério',
    'RECURSOS': 'Recursos',
    'VITIMAS': 'Vítimas',
    'MIRACULOSO': 'Miraculoso',
    'AMBIENTE_HOSTIL': 'Ambiente Hostil',
    'INUSITADO': 'Inusitado',
    'PROBLEMAS_DIPLOMATICOS': 'Problemas Diplomáticos',
    'PROTECAO': 'Proteção',
    'CONTRA_TEMPO_AMISTOSO': 'Contra-tempo Amistoso',
    'ENCONTRO_HOSTIL': 'Encontro Hostil',
    // Categorias de Aliados
    'ARTEFATO': 'Artefato',
    'CRIATURA_PODEROSA': 'Criatura Poderosa',
    'INESPERADO': 'Inesperado',
    'AJUDA_SOBRENATURAL': 'Ajuda Sobrenatural',
    'CIVIS_ORDINARIOS': 'Civis Ordinários',
    'NATUREZA': 'Natureza',
    'REFUGIO': 'Refúgio',
    'AVENTUREIROS': 'Aventureiros',
    'MONSTRUOSIDADE_AMIGAVEL': 'Monstruosidade Amigável',
    // Categorias de Consequências
    'MALDICAO': 'Maldição',
    'GUERRA': 'Guerra',
    'CALAMIDADE_NATURAL': 'Calamidade Natural',
    'PRAGA': 'Praga',
    'EVENTOS_SOBRENATURAIS': 'Eventos Sobrenaturais',
    'FOME_SECA': 'Fome/Seca',
    'CRISE_ECONOMICA': 'Crise Econômica',
    'PERSEGUICAO': 'Perseguição',
    'MORTE_IMPORTANTES': 'Morte de Importantes',
    // Categorias de Recompensas Adicionais
    'RIQUEZAS': 'Riquezas',
    'ARTEFATOS_MAGICOS': 'Artefatos Mágicos',
    'PODER': 'Poder',
    'CONHECIMENTO': 'Conhecimento',
    'INFLUENCIA_RENOME': 'Influência e Renome',
    'GLORIA': 'Glória',
    'MORAL': 'Moral',
    'PAGAMENTO_DIFERENCIADO': 'Pagamento Diferenciado',
    'RECOMPENSA_BIZARRA': 'Recompensa Bizarra',
    'APARENCIAS_ENGANAM': 'Aparências Enganam'
  };

  return categoryMap[category] || category;
}

function getTimingDisplayName(timing: string): string {
  const timingMap: Record<string, string> = {
    'CORRENDO_PERIGO': 'Correndo perigo',
    'JEITO_CONSTRANGEDOR': 'De um jeito constrangedor',
    'MANEIRA_COMUM': 'De maneira comum e pacata',
    'PEDINDO_AJUDA_DESCANSO': 'Pedindo ajuda durante um descanso',
    'AINDA_ASSENTAMENTO': 'Ainda no assentamento',
    'LIDANDO_COMPLICACAO': 'Já estará lidando com a complicação',
    'UM_D4_DIAS_APOS': '1d4 dias após o começo do contrato',
    'DOIS_D4_DIAS_APOS': '2d4 dias após o começo do contrato',
    'MAGICAMENTE_INVOCADO': 'Magicamente invocado',
    'PARA_SALVAR_DIA': 'Para salvar o dia'
  };

  return timingMap[timing] || timing;
}

function getDifficultyDescription(difficulty: ContractDifficulty): string {
  switch (difficulty) {
    case ContractDifficulty.FACIL:
      return 'Contrato de dificuldade fácil - Dificuldade e recompensa equilibradas';
    case ContractDifficulty.MEDIO:
      return 'Contrato de dificuldade média - Dificuldade e recompensa levemente elevadas';
    case ContractDifficulty.DIFICIL:
      return 'Contrato de dificuldade difícil - Dificuldade elevada e recompensa compensada';
    case ContractDifficulty.MORTAL:
      return 'Contrato de dificuldade mortal - Dificuldade mortal e recompensa triplicada';
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

function formatGameDate(gameDate: { day: number; month: number; year: number }): string {
  return `${gameDate.day.toString().padStart(2, '0')}/${gameDate.month.toString().padStart(2, '0')}/${gameDate.year}`;
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
