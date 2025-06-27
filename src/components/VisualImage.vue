<!-- src/components/VisualImage.vue -->
<template>
  <!-- 実際の画像要素 -->
  <div
    :id="props.state.id"
    class="visual-element image"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
  >
    <img :src="props.state.src" alt="Image" />
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
import { ref, watch, computed, type CSSProperties } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

// 双方向バインド用 refs
const srcValue = ref(props.state.src ?? '');
const width    = ref(props.state.width);
const height   = ref(props.state.height);
const x        = ref(props.state.x);
const y        = ref(props.state.y);

// 親 state に反映
watch(srcValue, v => props.state.src = v);
watch(width,    v => props.state.width = v);
watch(height,   v => props.state.height = v);
watch(x,        v => props.state.x = v);
watch(y,        v => props.state.y = v);

// 選択ハンドラ
function onSelect() {
  if (!props.isLayoutMode) emit('select', props.state.id);
}

// 要素スタイル
const elementStyle = computed((): CSSProperties => {
  const isInline = props.state.display === 'inline';
  const base: CSSProperties = {
    display: isInline ? 'inline-flex' : 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: `${props.state.width}px`,  
    height: `${props.state.height}px`,
    overflow: 'hidden',
    boxSizing: 'border-box',
    border: props.isLayoutMode ? '3px solid #000' : 'none',
    boxShadow: props.isLayoutMode ? '0 5px 15px rgba(33,147,176,0.4)' : 'none',
  };
  if (props.isLayoutMode) {
    return base;
  }
  return {
    ...base,
    position: 'absolute',
    left: '0px',
    top: '0px',
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
    zIndex: props.state.zIndex,
  };
});
</script>

<style scoped>
.visual-element.image {
  /* 内部 img をフルサイズに */
}
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
}
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
