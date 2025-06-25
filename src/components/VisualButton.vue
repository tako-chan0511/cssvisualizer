<!-- src/components/VisualButton.vue -->
<template>
  <!-- 実際のボタン -->
  <div
    :id="props.state.id"
    class="visual-element button"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
  >
    {{ props.state.content }}
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- コントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
    <label>
      テキスト:
      <input type="text" v-model="props.state.content" />
    </label>
    <label>
      フォントサイズ: {{ fontSize }}px
      <input type="range" v-model.number="fontSize" min="10" max="72" />
    </label>
    <label>
      文字色:
      <input type="color" v-model="fontColor" />
    </label>
    <label>
      背景色:
      <input type="color" v-model="bgColor" />
    </label>
    <label>
      幅: {{ width }}px
      <input type="range" v-model.number="width" min="50" max="600" />
    </label>
    <label>
      高さ: {{ height }}px
      <input type="range" v-model.number="height" min="30" max="200" />
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

// ── 双方向バインド用ローカル refs ──
const width    = ref(props.state.width)
const height   = ref(props.state.height)
const bgColor  = ref(props.state.backgroundColor || '#007acc')
const fontSize = ref(props.state.fontSize ?? 16)
const fontColor= ref(props.state.fontColor ?? '#000000')
const x        = ref(props.state.x)
const y        = ref(props.state.y)

// ── コントロール側の変更を state に反映 ──
watch(width,    v => (props.state.width  = v))
watch(height,   v => (props.state.height = v))
watch(bgColor,  v => (props.state.backgroundColor = v))
watch(fontSize, v => (props.state.fontSize = v))
watch(fontColor,v => (props.state.fontColor = v))
watch(x,        v => (props.state.x = v))
watch(y,        v => (props.state.y = v))

// ── state 側の変更をコントロールに反映 ──
watch(() => props.state.width,           v => (width.value     = v))
watch(() => props.state.height,          v => (height.value    = v))
watch(() => props.state.backgroundColor, v => (bgColor.value   = v || '#007acc'))
watch(() => props.state.fontSize,        v => (fontSize.value  = v))
watch(() => props.state.fontColor,       v => (fontColor.value = v))
watch(() => props.state.x,               v => (x.value         = v))
watch(() => props.state.y,               v => (y.value         = v))

// ── 要素スタイル ──
const elementStyle = computed((): CSSProperties => {
  const base: CSSProperties = {
    display:         'flex',
    justifyContent:  'center',
    alignItems:      'center',
    color:           props.state.fontColor,
    fontSize:        `${props.state.fontSize}px`,
    backgroundColor: props.state.backgroundColor,
    width:           `${props.state.width}px`,
    height:          `${props.state.height}px`,
    border:          'none',
    borderRadius:    '4px',
    cursor:          'pointer',
    userSelect:      'none',
    boxSizing:       'border-box',
  }
  if (props.isLayoutMode) {
    return base
  }
  return {
    ...base,
    position:  'absolute',
    left:      '0px',
    top:       '0px',
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
    zIndex:    props.state.zIndex,
  }
})
</script>

<style scoped>
.visual-element.button {
  transition: all 0.2s;
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
.controls input[type="color"],
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
