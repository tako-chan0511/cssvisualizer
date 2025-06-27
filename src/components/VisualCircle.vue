<!-- src/components/VisualCircle.vue -->
<template>
  <!-- 実際の円要素 -->
  <div
    :id="props.state.id"
    class="visual-element circle"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
  >
    {{ props.state.content }}
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- 個別編集モード用コントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
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
import { ref, watch, computed, type CSSProperties } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

// ローカル双方向バインド用
const width = ref(props.state.width);
const height = ref(props.state.height);
const bgColor = ref(props.state.backgroundColor ?? '#ffffff');
const x = ref(props.state.x);
const y = ref(props.state.y);

// コントロールの変更を state に反映
watch([width, height, bgColor, x, y], ([w, h, bg, xx, yy]) => {
  props.state.width = w;
  props.state.height = h;
  props.state.backgroundColor = bg;
  props.state.x = xx;
  props.state.y = yy;
});

// 選択ハンドラ
function onSelect() {
  if (!props.isLayoutMode) emit('select', props.state.id);
}

// 要素スタイル
const elementStyle = computed((): CSSProperties => {
  // display: inline-flex or flex でサイズを保持しつつ中央配置
  const displayType = props.state.display === 'inline' ? 'inline-flex' : 'flex';
  const base: CSSProperties = {
    display: displayType,
    justifyContent: 'center',
    alignItems: 'center',
    width: `${props.state.width}px`,
    height: `${props.state.height}px`,
    backgroundColor: props.state.backgroundColor,
    borderRadius: '50%',
    color: props.state.fontColor,
    fontSize: `${props.state.fontSize}px`,
    fontFamily: props.state.fontFamily,
    fontWeight: props.state.fontWeight,
    fontStyle: props.state.fontStyle,
    boxSizing: 'border-box',
    zIndex: props.state.zIndex,
  };
  if (props.isLayoutMode) {
    // レイアウトモードでは絶対配置を外し、通常フローまたは inline に従う
    return base;
  }
  // 個別編集モード: 絶対配置＋移動＋回転
  return {
    ...base,
    position: 'absolute',
    left: '0px',
    top: '0px',
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
  };
});
</script>

<style scoped>
.visual-element {
  cursor: grab;
  touch-action: none;
  transition: all 0.2s;
  user-select: none;
}
.visual-element.selected {
  outline: 3px solid #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
}
.visual-element.circle {
  border: 3px solid #000;
  box-shadow: 0 5px 15px rgba(33, 147, 176, 0.4);
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
}
.controls input[type="color"] {
  width: 32px;
  height: 24px;
}
</style>
