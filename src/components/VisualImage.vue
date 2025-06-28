<template>
  <!-- 実際の画像要素 -->
  <div
    :id="props.state.id"
    class="visual-element image"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
  >
    <img :src="srcValue" alt="Image" />
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- 個別編集モード用コントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
    <label>
      画像URL:
      <input type="text" v-model="srcValue" />
    </label>
    <label>
      幅: {{ width }}px
      <input type="range" v-model.number="width" min="50" max="800" />
    </label>
    <label>
      高さ: {{ height }}px
      <input type="range" v-model.number="height" min="50" max="800" />
    </label>
    <label>
      X: {{ x }}px
      <input type="range" v-model.number="x" :min="-400" :max="400" />
    </label>
    <label>
      Y: {{ y }}px
      <input type="range" v-model.number="y" :min="-400" :max="400" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRefs, type CSSProperties } from 'vue'
import type { ElementState } from '../types'

const props = defineProps<{
  state: ElementState
  isSelected: boolean
  isLayoutMode: boolean
  layoutSystem: string
  floatState: { direction: 'left' | 'right'; gap: number }
}>()
const { state, isSelected, isLayoutMode, layoutSystem, floatState } = toRefs(props)
const emit = defineEmits<{ (e: 'select', id: string): void }>()

// --- 双方向バインド用ローカル refs ---
const srcValue = ref(state.value.src || '')
const width    = ref(state.value.width)
const height   = ref(state.value.height)
const x        = ref(state.value.x)
const y        = ref(state.value.y)

// コントロールの変更を state に反映
watch(srcValue, v => state.value.src    = v)
watch(width,    v => state.value.width  = v)
watch(height,   v => state.value.height = v)
watch(x,        v => state.value.x      = v)
watch(y,        v => state.value.y      = v)

// --- 選択ハンドラ ---
function onSelect() {
  if (!isLayoutMode.value) {
    emit('select', state.value.id)
  }
}

// --- スタイル計算 ---
const elementStyle = computed((): CSSProperties => {
  // 編集モード or 絶対配置モード
  if (!isLayoutMode.value || layoutSystem.value === 'abs') {
    return {
      display:        state.value.display === 'inline' ? 'inline-flex' : 'flex',
      justifyContent: 'center',
      alignItems:     'center',
      width:          `${state.value.width}px`,
      height:         `${state.value.height}px`,
      overflow:       'hidden',
      boxSizing:      'border-box',
      position:       'absolute',
      left:           '0px',
      top:            '0px',
      transform:      `translate(${state.value.x}px, ${state.value.y}px) rotate(${state.value.angle}deg)`,
      zIndex:         state.value.zIndex,
      border:         !isLayoutMode.value ? 'none' : '3px solid #000',
      boxShadow:      !isLayoutMode.value ? 'none' : '0 5px 15px rgba(33,147,176,0.4)',
    }
  }

  // レイアウトモード：相対配置
  if (layoutSystem.value === 'rel') {
    return {
      display:        state.value.display === 'inline' ? 'inline-flex' : 'flex',
      justifyContent: 'center',
      alignItems:     'center',
      width:          `${state.value.width}px`,
      height:         `${state.value.height}px`,
      overflow:       'hidden',
      boxSizing:      'border-box',
      position:       'relative',
      transform:      `translate(${state.value.x}px, ${state.value.y}px) rotate(${state.value.angle}deg)`,
      zIndex:         state.value.zIndex,
      border:         '3px solid #000',
      boxShadow:      '0 5px 15px rgba(33,147,176,0.4)',
    }
  }

  // Float レイアウト
  if (layoutSystem.value === 'float') {
    return {
      display: 'block',
      float:   floatState.value.direction,
      margin:  floatState.value.direction === 'left'
        ? `0 ${floatState.value.gap}px 0 0`
        : `0 0 0 ${floatState.value.gap}px`,
      width:      `${state.value.width}px`,
      height:     `${state.value.height}px`,
      overflow:   'hidden',
      boxSizing:  'border-box',
      border:     '3px solid #000',
      boxShadow:  '0 5px 15px rgba(33,147,176,0.4)',
    }
  }

  // Table レイアウト
  if (layoutSystem.value === 'table') {
    return {
      display:       'table-cell',
      verticalAlign: 'middle',
      width:         `${state.value.width}px`,
      height:        `${state.value.height}px`,
      overflow:      'hidden',
      boxSizing:     'border-box',
      border:        '3px solid #000',
      boxShadow:     '0 5px 15px rgba(33,147,176,0.4)',
    }
  }

  // その他（flex/grid/multicol/flow）
  return {
    display:        state.value.display === 'inline' ? 'inline-flex' : 'flex',
    justifyContent: 'center',
    alignItems:     'center',
    width:          `${state.value.width}px`,
    height:         `${state.value.height}px`,
    overflow:       'hidden',
    boxSizing:      'border-box',
    border:         '3px solid #000',
    boxShadow:      '0 5px 15px rgba(33,147,176,0.4)',
  }
})
</script>

<style scoped>
.visual-element.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.visual-element {
  cursor: grab;
  touch-action: none;
  transition: all 0.2s;
  flex-shrink: 0;
}
.visual-element.selected {
  outline: 2px solid #ffc107;
}
.rotate-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #ffc107;
  border: 2px solid white;
  border-radius: 50%;
  top: -12px;
  right: -12px;
  cursor: alias;
}
.controls {
  position: fixed;
  top: 16px;
  right: 16px;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  z-index: 1000;
  font-size: 12px;
  line-height: 1.4;
}
.controls label {
  display: block;
  margin-bottom: 6px;
}
.controls input[type="range"] {
  width: 120px;
  vertical-align: middle;
}
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
