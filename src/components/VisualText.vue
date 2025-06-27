<!-- src/components/VisualText.vue -->
<template>
  <!-- 実際のテキスト要素 -->
  <div
    :id="props.state.id"
    class="visual-element text"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
  >
    {{ textContent }}
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- コントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
    <label>テキスト:
      <input type="text" v-model="textContent" />
    </label>
    <label>フォントサイズ: {{ fontSize }}px
      <input type="range" v-model.number="fontSize" min="10" max="72" />
    </label>
    <label>文字色:
      <input type="color" v-model="fontColor" />
    </label>
    <label>背景色:
      <input type="color" v-model="bgColor" />
    </label>
    <label>幅: {{ width }}px
      <input type="range" v-model.number="width" min="50" max="600" />
    </label>
    <label>高さ: {{ height }}px
      <input type="range" v-model.number="height" min="20" max="300" />
    </label>
    <label>X: {{ x }}px
      <input type="range" v-model.number="x" :min="-300" :max="300" />
    </label>
    <label>Y: {{ y }}px
      <input type="range" v-model.number="y" :min="-300" :max="300" />
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
const { state, isLayoutMode, layoutSystem, floatState } = toRefs(props)
const emit = defineEmits<{ (e: 'select', id: string): void }>()

// local
const textContent = ref(state.value.content)
const fontSize    = ref(state.value.fontSize ?? 24)
const fontColor   = ref(state.value.fontColor ?? '#333333')
const bgColor     = ref(state.value.backgroundColor ?? '#ffffff')
const width       = ref(state.value.width)
const height      = ref(state.value.height)
const x           = ref(state.value.x)
const y           = ref(state.value.y)

// watch → state
watch(textContent, v => state.value.content = v)
watch(fontSize,    v => state.value.fontSize = v)
watch(fontColor,   v => state.value.fontColor = v)
watch(bgColor,     v => state.value.backgroundColor = v)
watch(width,       v => state.value.width = v)
watch(height,      v => state.value.height = v)
watch(x,           v => state.value.x = v)
watch(y,           v => state.value.y = v)

// 表示／選択
function onSelect() {
  if (!isLayoutMode.value) emit('select', state.value.id)
}

// スタイル計算
const elementStyle = computed((): CSSProperties => {
  // ベース
  const base: CSSProperties = {
    color:          fontColor.value,
    fontSize:       `${fontSize.value}px`,
    fontFamily:     state.value.fontFamily,
    fontWeight:     state.value.fontWeight,
    fontStyle:      state.value.fontStyle,
    backgroundColor: bgColor.value,
    textAlign:      'center',
    wordBreak:      'break-word',
    boxSizing:      'border-box',
    width:          `${width.value}px`,
    height:         `${height.value}px`,
    display:        state.value.display === 'inline' ? 'inline-flex' : 'flex',
    justifyContent: 'center',
    alignItems:     'center',
  }

  if (isLayoutMode.value) {
    // ① Float レイアウト
    if (layoutSystem.value === 'float') {
      return {
        ...base,
        display: 'block',
        border: '3px solid #000',
        float: floatState.value.direction,
        margin: floatState.value.direction === 'left'
          ? `0 ${floatState.value.gap}px 0 0`
          : `0 0 0 ${floatState.value.gap}px`,
      }
    }
    // ② Table レイアウト
    if (layoutSystem.value === 'table') {
      return {
        ...base,
        display: 'table-cell',
        verticalAlign: 'middle',
        border: '3px solid #000',
      }
    }
    // ③ その他（flex/grid/flow/multicol/abs）
    return {
      ...base,
      border: '3px solid #000',
    }
  }

  // 個別編集モード：絶対配置＋移動＋回転
  return {
    ...base,
    position:  'absolute',
    left:      '0px',
    top:       '0px',
    transform: `translate(${x.value}px, ${y.value}px) rotate(${state.value.angle}deg)`,
    zIndex:    state.value.zIndex,
  }
})
</script>

<style scoped>
.visual-element {
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: all 0.2s;
}
.visual-element.selected {
  outline: 3px solid #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
}
.visual-element.text {
  background: transparent;
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
.controls input[type="color"],
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
