<template>
  <!-- 実際のテキスト要素 -->
  <div
    :id="state.id"
    class="visual-element text"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
    @click.stop.prevent="onSelect"
  >
    {{ textContent }}
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- 個別編集モード時のコントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
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
import { ref, watch, computed, toRefs, type CSSProperties } from 'vue'
import type { ElementState } from '../types'

const props = defineProps<{
  state: ElementState
  isSelected: boolean
  isLayoutMode: boolean
  layoutSystem: string
  floatState: { direction: 'left' | 'right'; gap: number }
}>()
// 分割代入で props のリアクティブ参照を取得
const { state, isSelected, isLayoutMode, layoutSystem, floatState } = toRefs(props)
const emit = defineEmits<{ (e: 'select', id: string): void }>()

// ローカルバインド用 refs
const textContent = ref(state.value.content)
const fontSize    = ref(state.value.fontSize  ?? 24)
const fontColor   = ref(state.value.fontColor ?? '#333333')
const bgColor     = ref(state.value.backgroundColor ?? '#ffffff')
const width       = ref(state.value.width)
const height      = ref(state.value.height)
const x           = ref(state.value.x)
const y           = ref(state.value.y)

// ローカル変更を state に反映
watch(textContent, v => state.value.content = v)
watch(fontSize,    v => state.value.fontSize = v)
watch(fontColor,   v => state.value.fontColor = v)
watch(bgColor,     v => state.value.backgroundColor = v)
watch(width,       v => state.value.width = v)
watch(height,      v => state.value.height = v)
watch(x,           v => state.value.x = v)
watch(y,           v => state.value.y = v)

// state が外部から変わった場合、ローカルにも反映
watch(() => state.value.content, v => textContent.value = v)
watch(() => state.value.fontSize, v => fontSize.value = v)
watch(() => state.value.fontColor, v => fontColor.value = v)
watch(() => state.value.backgroundColor, v => bgColor.value = v)
watch(() => state.value.width, v => width.value = v)
watch(() => state.value.height, v => height.value = v)
watch(() => state.value.x, v => x.value = v)
watch(() => state.value.y, v => y.value = v)

// 選択ハンドラ
function onSelect() {
  if (!isLayoutMode.value) {
    emit('select', state.value.id)
  }
}

// 要素スタイル計算
const elementStyle = computed((): CSSProperties => {
  // フロー/レイアウトに応じて表示方式と配置を切り替え
  const baseDisplay = state.value.display === 'inline' ? 'inline-flex' : 'flex'
  const base: CSSProperties = {
    display:        baseDisplay,
    justifyContent: 'center',
    alignItems:     'center',
    color:          fontColor.value,
    fontSize:       `${fontSize.value}px`,
    backgroundColor: bgColor.value,
    textAlign:      'center',
    wordBreak:      'break-word',
    boxSizing:      'border-box',
    width:          `${width.value}px`,  
    height:         `${height.value}px`,
    border:         isLayoutMode.value ? '3px solid #000' : 'none',
    boxShadow:      isLayoutMode.value ? '0 5px 15px rgba(33,147,176,0.4)' : 'none',
  }

  if (isLayoutMode.value) {
     // ① abs（相対＋絶対）モード時は individual と同じ絶対配置を適用
    if (layoutSystem.value === 'abs') {
      return {
        ...base,
        position:  'absolute',
        left:      '0',
        top:       '0',
        transform: `translate(${state.value.x}px, ${state.value.y}px) rotate(${state.value.angle}deg)`,
        zIndex:    state.value.zIndex,
        border:    '3px solid #000',
      }
    }
    // float モード
    if (layoutSystem.value === 'float') {
      return {
        ...base,
        display: 'block',
        float:   floatState.value.direction,
        margin: floatState.value.direction === 'left'
          ? `0 ${floatState.value.gap}px 0 0`
          : `0 0 0 ${floatState.value.gap}px`,
      }
    }
    // table モード
    if (layoutSystem.value === 'table') {
      return {
        ...base,
        display:       'table-cell',
        verticalAlign: 'middle',
      }
    }
    // その他フロー/コンテナ等
    return base
  }

  // 個別編集モード: 絶対配置＋変形
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
  box-shadow: 0 0 20px rgba(255,193,7,0.8);
}
.visual-element.text {
  /* 背景は elementStyle に委ねる */
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
