<!-- src/components/VisualBox.vue -->
<template>
  <!-- 実際のボックス -->
  <div
    :id="props.state.id"
    class="visual-element box"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
  >
    {{ props.state.content }}
    <div v-if="props.isSelected && !props.isLayoutMode" class="rotate-handle"></div>
  </div>

  <!-- コントロールパネル -->
  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
    <label>幅: {{ width }}px
      <input type="range" v-model.number="width" min="50" max="600" />
    </label>
    <label>高さ: {{ height }}px
      <input type="range" v-model.number="height" min="50" max="600" />
    </label>
    <label>背景色:
      <input type="color" v-model="bgColor" />
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
import { ref, watch, computed, type CSSProperties } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
  layoutSystem: string;
  floatState: { direction: 'left' | 'right'; gap: number };
}>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

// 双方向バインド用
const width   = ref(props.state.width);
const height  = ref(props.state.height);
const bgColor = ref(props.state.backgroundColor || '#6dd5ed');
const x       = ref(props.state.x);
const y       = ref(props.state.y);

// コントローラ→state
watch(width,   v => props.state.width = v);
watch(height,  v => props.state.height = v);
watch(bgColor, v => props.state.backgroundColor = v);
watch(x,       v => props.state.x = v);
watch(y,       v => props.state.y = v);
// state→コントローラ
watch(() => props.state.width,  v => (width.value = v));
watch(() => props.state.height, v => (height.value = v));
watch(() => props.state.backgroundColor, v => (bgColor.value = v || '#6dd5ed'));
watch(() => props.state.x, v => (x.value = v));
watch(() => props.state.y, v => (y.value = v));

/** 要素スタイル */
const elementStyle = computed((): CSSProperties => {
  // 1) 個別編集モード以外の共通プロパティはここにまとめる
  const common: CSSProperties = {
    width: `${props.state.width}px`,
    height: `${props.state.height}px`,
    backgroundColor: props.state.backgroundColor,
    boxSizing: 'border-box',
  };

  // 2) レイアウトモード時
  if (props.isLayoutMode) {
    // 2-1) Float レイアウト
    if (props.layoutSystem === 'float') {
      return {
        ...common,
        display: 'block',
        float: props.floatState.direction,
        margin: props.floatState.direction === 'left'
          ? `0 ${props.floatState.gap}px 0 0`
          : `0 0 0 ${props.floatState.gap}px`,
      };
    }
    // 2-2) Table レイアウト
    if (props.layoutSystem === 'table') {
      return {
        ...common,
        display: 'table-cell',
        verticalAlign: 'middle',
        textAlign: 'center',
      };
    }
    // 2-3) それ以外（flex/grid/multicol/flow/abs）は flex 中央揃え
    return {
      ...common,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  // 3) 個別編集モード
  return {
    ...common,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '0px',
    top: '0px',
    zIndex: props.state.zIndex,
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
  };
});

// 選択ハンドラ
function onSelect() {
  if (!props.isLayoutMode) emit('select', props.state.id);
}
</script>

<style scoped>
.visual-element {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  font-weight: bold;
  cursor: grab;
  touch-action: none;
  border: 3px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}
.visual-element:active {
  cursor: grabbing;
}
.visual-element.selected {
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
  z-index: 100 !important;
}

/* ボックス固有のスタイル */
.box {
  color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
.controls input[type="color"] {
  width: 32px;
  height: 24px;
  padding: 0;
  border: none;
  vertical-align: middle;
}
</style>
