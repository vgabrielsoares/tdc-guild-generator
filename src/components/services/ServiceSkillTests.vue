<template>
    <div class="service-skill-tests bg-gray-800 rounded-lg border border-gray-700 p-6">
        <!-- Cabeçalho dos Testes -->
        <div class="mb-6">
            <h3 class="text-xl font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <BeakerIcon class="w-6 h-6" />
                Testes de Perícia
            </h3>
            <p class="text-gray-300 text-sm">
                Execute os testes necessários para resolver este serviço
            </p>
        </div>

        <!-- Informações Gerais dos Testes -->
        <div class="bg-gray-900 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span class="text-gray-400">Complexidade:</span>
                    <p class="text-white font-medium">{{ testStructure.complexity }}</p>
                </div>
                <div>
                    <span class="text-gray-400">ND Base:</span>
                    <p class="text-white font-medium">{{ testStructure.baseND }}</p>
                </div>
                <div>
                    <span class="text-gray-400">Total de Testes:</span>
                    <p class="text-white font-medium">{{ testStructure.totalTests }}</p>
                </div>
                <div>
                    <span class="text-gray-400">Perícias:</span>
                    <p class="text-white font-medium">{{ skillRequirementText }}</p>
                </div>
            </div>
        </div>

        <!-- Progresso dos Testes -->
        <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Progresso</span>
                <span class="text-sm text-gray-300">
                    {{ statistics.completedTests }}/{{ statistics.totalTests }} testes
                </span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
                <div :class="progressBarColor" class="h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${(statistics.completedTests / statistics.totalTests) * 100}%` }"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>{{ statistics.successCount }} sucessos</span>
                <span>{{ statistics.failureCount }} fracassos</span>
            </div>
        </div>

        <!-- Configuração de Perícias -->
        <div v-if="!skillsConfigured && !testStructure.completed" class="mb-6">
            <div class="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <h4 class="text-lg font-medium text-purple-300 mb-3">
                    Configurar Perícias dos Testes
                </h4>
                <p class="text-purple-200 text-sm mb-4">
                    Antes de iniciar os testes, configure qual perícia será usada para cada teste:
                </p>

                <div class="space-y-3 mb-4">
                    <div v-for="(test, index) in testStructure.tests" :key="index"
                        class="flex items-center gap-3 bg-gray-900 rounded p-3">
                        <div class="flex-shrink-0">
                            <span class="text-white font-medium">Teste {{ index + 1 }}:</span>
                            <div class="text-xs text-gray-400">
                                ND {{ test.finalND }}
                                <span v-if="test.ndModifier !== 0">
                                    ({{ test.ndModifier > 0 ? '+' : '' }}{{ test.ndModifier }})
                                </span>
                            </div>
                        </div>
                        <div class="flex-1">
                            <input v-model="skillsSetup[index]" type="text" :placeholder="getSkillPlaceholder(index)"
                                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white 
                                       focus:border-purple-500 focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button @click="configureSkills" :disabled="!allSkillsConfigured" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 
                               disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        Iniciar Testes
                    </button>
                    <button @click="autoConfigureSkills"
                        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                        Auto-configurar
                    </button>
                </div>
            </div>
        </div>

        <!-- Sugestões de Perícias -->
        <div v-if="skillSuggestions.length > 0 && !skillsConfigured && !testStructure.completed" class="mb-6">
            <h4 class="text-lg font-medium text-amber-300 mb-3">Sugestões de Perícias</h4>
            <div class="grid gap-3">
                <div v-for="suggestion in skillSuggestions" :key="suggestion.skillName"
                    class="bg-gray-900 rounded-lg p-3 border border-gray-600">
                    <div class="flex items-start justify-between">
                        <div>
                            <h5 class="font-medium text-white">{{ suggestion.skillName }}</h5>
                            <p class="text-sm text-gray-300 mt-1">{{ suggestion.description }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ suggestion.reasoning }}</p>
                        </div>
                        <LightBulbIcon class="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Teste Atual -->
        <div v-if="currentTestIndex !== -1 && !testStructure.completed && currentTestInfo && skillsConfigured"
            class="mb-6">
            <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h4 class="text-lg font-medium text-blue-300 mb-3">
                    Teste {{ currentTestInfo.testNumber }} de {{ currentTestInfo.totalTests }}
                </h4>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-blue-200 text-sm">Perícia:</span>
                        <p class="text-white font-bold text-lg">{{ skillsSetup[currentTestIndex] }}</p>
                    </div>
                    <div>
                        <span class="text-blue-200 text-sm">ND do Teste:</span>
                        <p class="text-white font-bold text-lg">{{ currentTestInfo.finalND }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-blue-200 text-sm">Modificador:</span>
                        <p class="text-white font-medium">{{ currentTestInfo.modifier }}</p>
                    </div>
                    <div>
                        <span class="text-blue-200 text-sm">Tipo de Perícia:</span>
                        <p class="text-white font-medium">{{ currentTestInfo.skillRequirement }}</p>
                    </div>
                </div>

                <!-- Input para Resultado -->
                <div class="flex gap-3 mb-4">
                    <div class="flex-1">
                        <label for="rollResult" class="block text-sm text-blue-200 mb-2">
                            Resultado da Rolagem (1-50):
                        </label>
                        <input id="rollResult" v-model.number="rollInput" type="number" min="1" max="50" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white 
                     focus:border-blue-500 focus:outline-none" placeholder="Digite o resultado da rolagem"
                            :disabled="isProcessing" />
                    </div>
                    <div class="flex flex-col justify-end">
                        <button @click="processCurrentTest" :disabled="!isValidRoll || isProcessing" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                            <span v-if="isProcessing">Processando...</span>
                            <span v-else>Testar</span>
                        </button>
                    </div>
                </div>

                <!-- Botões de Ação Rápida -->
                <div class="flex gap-2">
                    <button @click="quickTest(true)" :disabled="isProcessing" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 
                   disabled:bg-gray-600 transition-colors">
                        Sucesso
                    </button>
                    <button @click="quickTest(false)" :disabled="isProcessing" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 
                   disabled:bg-gray-600 transition-colors">
                        Fracasso
                    </button>
                </div>
            </div>
        </div>

        <!-- Histórico de Testes -->
        <div v-if="testStructure.tests.some(t => t.completed)" class="mb-6">
            <h4 class="text-lg font-medium text-gray-300 mb-3">Histórico de Testes</h4>
            <div class="space-y-2">
                <div v-for="(test, index) in testStructure.tests" :key="index" v-show="test.completed"
                    class="flex items-center justify-between bg-gray-900 rounded p-3" :class="{
                        'border-l-4 border-green-500': test.success,
                        'border-l-4 border-red-500': test.success === false
                    }">
                    <div class="flex items-center gap-3">
                        <CheckCircleIcon v-if="test.success" class="w-5 h-5 text-green-400" />
                        <XCircleIcon v-else class="w-5 h-5 text-red-400" />
                        <div>
                            <span class="text-white">Teste {{ index + 1 }}</span>
                            <div class="text-xs text-gray-400">{{ skillsSetup[index] || 'Perícia não definida' }}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-white font-medium">
                            {{ test.rollResult }} vs ND {{ test.finalND }}
                        </div>
                        <div class="text-xs" :class="test.success ? 'text-green-400' : 'text-red-400'">
                            {{ test.success ? 'Sucesso' : 'Fracasso' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultado Final -->
        <div v-if="testStructure.completed && testStructure.outcome && formattedOutcome" class="mb-6">
            <div class="rounded-lg p-4 border-l-4" :class="{
                'bg-green-900/30 border-green-500': formattedOutcome.statusClass === 'success',
                'bg-red-900/30 border-red-500': formattedOutcome.statusClass === 'failure'
            }">
                <h4 class="text-lg font-medium mb-2" :class="{
                    'text-green-300': formattedOutcome.statusClass === 'success',
                    'text-red-300': formattedOutcome.statusClass === 'failure'
                }">
                    Resultado Final
                </h4>
                <p class="text-white mb-2">{{ formattedOutcome.resultText }}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-400">Renome:</span>
                        <span class="text-white ml-2">{{ formattedOutcome.renownText }}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Recompensa:</span>
                        <span class="text-white ml-2">{{ formattedOutcome.rewardText }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ações Finais -->
        <div class="flex gap-3">
            <button v-if="testStructure.completed" @click="completeService"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Concluir Serviço
            </button>
            <button @click="resetTests"
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                Reiniciar Testes
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    BeakerIcon,
    LightBulbIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/vue/24/outline'
import type { Service, ServiceTestStructure } from '@/types/service'
import {
    initializeServiceTests,
    processSkillTest,
    getNextTestIndex,
    getCurrentTestInfo,
    generateSkillSuggestions,
    formatTestOutcome,
    getTestStatistics,
    type SkillTestResult
} from '@/utils/service-skill-resolution'

// Props
interface Props {
    service: Service
    initialTestStructure?: ServiceTestStructure
}

const props = withDefaults(defineProps<Props>(), {
    initialTestStructure: undefined
})

// Emits
const emit = defineEmits<{
    'test:completed': [result: SkillTestResult]
    'tests:finished': [outcome: ServiceTestStructure]
    'service:complete': [service: Service]
    'tests:reset': []
}>()

// State
const rollInput = ref<number>()
const isProcessing = ref(false)
const skillsSetup = ref<string[]>([])
const skillsConfigured = ref(false)
const testStructure = ref<ServiceTestStructure>(
    props.initialTestStructure || initializeServiceTests(props.service)
)

// Computed
const currentTestIndex = computed(() => getNextTestIndex(testStructure.value))

const currentTestInfo = computed(() => {
    if (currentTestIndex.value === -1) return null
    return getCurrentTestInfo(testStructure.value, currentTestIndex.value)
})

const skillRequirementText = computed(() => {
    const mapping = {
        'same': 'Mesma perícia',
        'different': 'Perícias diferentes',
        'mixed': 'Perícias mistas'
    }
    return mapping[testStructure.value.skillRequirement]
})

const skillSuggestions = computed(() => {
    return generateSkillSuggestions(
        props.service.objective?.description,
        testStructure.value.skillRequirement
    )
})

const statistics = computed(() => getTestStatistics(testStructure.value))

const formattedOutcome = computed(() => {
    if (!testStructure.value.outcome) return null
    return formatTestOutcome(testStructure.value.outcome)
})

const isValidRoll = computed(() => {
    return rollInput.value !== undefined &&
        rollInput.value >= 1 &&
        rollInput.value <= 50
})

const allSkillsConfigured = computed(() => {
    return skillsSetup.value.length === testStructure.value.totalTests &&
        skillsSetup.value.every(skill => skill && skill.trim() !== '')
})

const progressBarColor = computed(() => {
    if (statistics.value.completedTests === 0) return 'bg-amber-500'

    const successRate = statistics.value.successCount / statistics.value.completedTests
    const failureRate = statistics.value.failureCount / statistics.value.completedTests

    if (successRate > failureRate) return 'bg-green-500'
    if (failureRate > successRate) return 'bg-red-500'
    return 'bg-amber-500' // Empate
})

// Methods
function getSkillPlaceholder(testIndex: number): string {
    const suggestions = skillSuggestions.value
    if (suggestions.length > 0) {
        return suggestions[testIndex % suggestions.length]?.skillName || `Perícia para teste ${testIndex + 1}`
    }
    return `Perícia para teste ${testIndex + 1}`
}

function configureSkills() {
    if (!allSkillsConfigured.value) return
    skillsConfigured.value = true
}

function autoConfigureSkills() {
    const suggestions = skillSuggestions.value
    for (let i = 0; i < testStructure.value.totalTests; i++) {
        if (suggestions.length > 0) {
            skillsSetup.value[i] = suggestions[i % suggestions.length]?.skillName || `Perícia ${i + 1}`
        } else {
            skillsSetup.value[i] = `Perícia ${i + 1}`
        }
    }
}

async function processCurrentTest() {
    if (!isValidRoll.value || currentTestIndex.value === -1) return

    isProcessing.value = true

    try {
        const { result, updatedStructure } = processSkillTest(
            testStructure.value,
            currentTestIndex.value,
            rollInput.value!
        )

        testStructure.value = updatedStructure
        rollInput.value = undefined

        emit('test:completed', result)

        if (updatedStructure.completed) {
            emit('tests:finished', updatedStructure)
        }
    } catch (error) {
        // Log error for debugging
        // console.error('Erro ao processar teste:', error)
    } finally {
        isProcessing.value = false
    }
}

async function quickTest(success: boolean) {
    if (currentTestIndex.value === -1) return

    const currentTest = testStructure.value.tests[currentTestIndex.value]
    const rollResult = success ? currentTest.finalND : currentTest.finalND - 1

    rollInput.value = rollResult
    await processCurrentTest()
}

function resetTests() {
    testStructure.value = initializeServiceTests(props.service)
    rollInput.value = undefined
    skillsSetup.value = []
    skillsConfigured.value = false
    emit('tests:reset')
}

function completeService() {
    emit('service:complete', props.service)
}

// Watch for changes in initial test structure
watch(
    () => props.initialTestStructure,
    (newStructure) => {
        if (newStructure) {
            testStructure.value = newStructure
        }
    },
    { immediate: true }
)
</script>
