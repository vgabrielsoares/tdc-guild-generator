<template>
    <div class="relative inline-block">
        <!-- Trigger elemento -->
        <div @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @focus="showTooltip = true"
            @blur="showTooltip = false" class="cursor-help">
            <slot />
        </div>

        <!-- Tooltip -->
        <Transition enter-active-class="transition-opacity duration-200"
            leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
            leave-to-class="opacity-0">
            <div v-if="showTooltip" :class="[
                'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-600',
                'max-w-sm break-words',
                positionClasses
            ]" role="tooltip">
                <div class="tooltip-content">
                    <div v-if="title" class="font-semibold text-amber-400 mb-1">{{ title }}</div>
                    <div class="text-gray-200">{{ content }}</div>

                    <!-- Informações específicas de contratos -->
                    <div v-if="contractorType" class="mt-2 text-xs">
                        <div class="text-blue-300 font-medium">Tipo: {{ contractorType }}</div>
                    </div>

                    <div v-if="difficulty" class="mt-1 text-xs">
                        <span class="text-purple-300 font-medium">Dificuldade: </span>
                        <span :class="getDifficultyColor(difficulty)">{{ difficulty }}</span>
                    </div>

                    <div v-if="deadline" class="mt-1 text-xs">
                        <span class="text-orange-300 font-medium">Prazo: </span>
                        <span class="text-orange-200">{{ deadline }}</span>
                    </div>

                    <div v-if="hasModifiers" class="mt-1 text-xs text-yellow-300">
                        <span class="font-medium">⚡ Valor modificado por:</span>
                        <div class="ml-2">
                            {{ modifierReasons }}
                        </div>
                    </div>
                </div>

                <!-- Arrow -->
                <div :class="[
                    'absolute w-2 h-2 bg-gray-900 border border-gray-600 transform rotate-45',
                    arrowClasses
                ]"></div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
    content: string
    title?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    // Props específicas para contratos
    contractorType?: string
    difficulty?: 'Fácil' | 'Médio' | 'Difícil' | 'Mortal'
    deadline?: string
    hasModifiers?: boolean
    modifierReasons?: string
}

const props = withDefaults(defineProps<Props>(), {
    position: 'top'
})

const showTooltip = ref(false)

const positionClasses = computed(() => {
    switch (props.position) {
        case 'bottom':
            return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
        case 'left':
            return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
        case 'right':
            return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
        default: // top
            return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
})

const arrowClasses = computed(() => {
    switch (props.position) {
        case 'bottom':
            return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1'
        case 'left':
            return 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1 ml-1'
        case 'right':
            return 'right-full top-1/2 transform -translate-y-1/2 translate-x-1 mr-1'
        default: // top
            return 'top-full left-1/2 transform -translate-x-1/2 -mt-1'
    }
})

function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case 'Fácil':
            return 'text-green-400'
        case 'Médio':
            return 'text-yellow-400'
        case 'Difícil':
            return 'text-orange-400'
        case 'Mortal':
            return 'text-red-400'
        default:
            return 'text-gray-400'
    }
}
</script>
