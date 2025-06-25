<!-- src/components/VisualText.vue -->
<template>
  <!-- 実際のテキスト要素 -->
  <div
    :id="state.id"
    class="visual-element text"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="onSelect"
  >
    {{ state.content }}
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- 個別編集モード時のコントロールパネル -->
  <div v-if="isSelected && !isLayoutMode" class="controls">
    <label>
      テキスト:
      <input type="text" v-model="textContent" />
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
      <input type="range" v-model.number="height" min="20" max="300" />
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

// props 受け取り
const props = defineProps<{
  state: ElementState
  isSelected: boolean
  isLayoutMode: boolean
}>()

// emit 定義
const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

// ローカルバインド用
const textContent = ref(props.state.content)
const fontSize    = ref(props.state.fontSize ?? 24)
const fontColor   = ref(props.state.fontColor ?? '#333333')
const bgColor     = ref(props.state.backgroundColor ?? '#ffffff')
const width       = ref(props.state.width)
const height      = ref(props.state.height)
const x           = ref(props.state.x)
const y           = ref(props.state.y)

// state への反映
watch(textContent, v => props.state.content = v)
watch(fontSize,    v => props.state.fontSize = v)
watch(fontColor,   v => props.state.fontColor = v)
watch(bgColor,     v => props.state.backgroundColor = v)
watch(width,       v => props.state.width = v)
watch(height,      v => props.state.height = v)
watch(x,           v => props.state.x = v)
watch(y,           v => props.state.y = v)

// 選択ハンドラ
function onSelect() {
  emit('select', props.state.id)
}

// 要素スタイル
const elementStyle = computed<CSSProperties>(() => {
  const { state, isLayoutMode } = props
  const baseStyle: CSSProperties = {
    color: state.fontColor,
    fontSize: `${state.fontSize}px`,
    backgroundColor: state.backgroundColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    wordBreak: 'break-word',
    width: `${state.width}px`,
    height: `${state.height}px`,
  }

  if (isLayoutMode) {
    // レイアウトモードでは絶対配置を外す
    return baseStyle
  } else {
    // 個別編集モードでは絶対配置と回転を追加
    return {
      ...baseStyle,
      position: 'absolute',
      left: '0px',
      top: '0px',
      transform: `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`,
      zIndex: state.zIndex,
    }
  }
})
</script>

<style scoped>
.visual-element {
  cursor: grab;
  touch-action: none;
  box-sizing: border-box;
  border: 3px solid transparent;
  transition: all 0.2s;
  user-select: none;
}
.visual-element.selected {
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
  z-index: 100 !important;
}
.visual-element.text {
  /* テキスト要素固有 */
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
