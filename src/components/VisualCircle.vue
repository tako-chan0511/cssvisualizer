<!-- src/components/VisualCircle.vue -->
<template>
  <!-- 実際の円 -->
  <div
    :id="state.id"
    class="visual-element circle"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="onSelect"
  >
    <!-- 中央にラベルを出す -->
    <span class="circle-label">{{ state.content }}</span>
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- 選択中かつ個別編集モードのときだけ出すコントロール -->
  <div v-if="isSelected && !isLayoutMode" class="controls">
    <label>
      幅: {{ width }}px
      <input type="range" v-model.number="width" min="50" max="600" />
    </label>
    <label>
      高さ: {{ height }}px
      <input type="range" v-model.number="height" min="50" max="600" />
    </label>
    <label>
      背景色:
      <input type="color" v-model="bgColor" />
    </label>
    <label>
      X: {{ x }}px
      <input type="range" v-model.number="x" :min="-300" :max="300" />
    </label>
    <label>
      Y: {{ y }}px
      <input type="range" v-model.number="y" :min="-300" :max="300" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, type CSSProperties } from 'vue'
import type { ElementState } from '../types'

const props = defineProps<{
  state: ElementState
  isSelected: boolean
  isLayoutMode: boolean
}>()

// ローカル双方向バインド用
const width   = ref(props.state.width)
const height  = ref(props.state.height)
const bgColor = ref(props.state.backgroundColor ?? '#ffffff')
const x       = ref(props.state.x)
const y       = ref(props.state.y)

// state を直接書き換えて親に反映
watch(width,   v => props.state.width  = v)
watch(height,  v => props.state.height = v)
watch(bgColor, v => props.state.backgroundColor = v)
watch(x,       v => props.state.x      = v)
watch(y,       v => props.state.y      = v)

// 選択ハンドリング（App.vue が listen しています）
const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
function onSelect() {
  emit('select', props.state.id)
}

// スタイル
const elementStyle = computed<CSSProperties>(() => {
  const base: Record<string, any> = {
    width:  `${props.state.width}px`,
    height: `${props.state.height}px`,
    backgroundColor: props.state.backgroundColor,
    borderRadius: '50%',
    zIndex: props.state.zIndex,
    boxSizing: 'border-box',
  }
  if (props.isLayoutMode) {
    return {
      ...base
    }
  } else {
    return {
      ...base,
      position: 'absolute' as CSSProperties['position'],
      left:   '0px',
      top:    '0px',
      transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
    }
  }
})
</script>

<style scoped>
.visual-element {
  cursor: grab;
  touch-action: none;
  transition: all 0.2s;
  position: relative;
}
.visual-element.selected {
  outline: 3px solid #ffc107;
}

/* 円固有 */
.visual-element.circle {
  border: 3px solid #000;
  box-shadow: 0 5px 15px rgba(33,147,176,0.4);
}

/* ラベルを中央に */
.circle-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  font-weight: bold;
  color: #333;
}

/* 回転ハンドル */
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

/* コントロールパネル */
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
.controls input[type="color"] {
  width: 32px;
  height: 24px;
  border: none;
  vertical-align: middle;
}
</style>
