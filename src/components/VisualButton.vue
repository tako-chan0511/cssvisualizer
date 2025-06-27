<!-- src/components/VisualButton.vue -->
<template>
  <!-- 実際のボタン -->
  <div
    :id="props.state.id"
    class="visual-element button"
    :class="{ selected: props.isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
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
      フォント:
      <select v-model="fontFamily">
        <option value="sans-serif">sans-serif</option>
        <option value="serif">serif</option>
        <option value="monospace">monospace</option>
        <option value="cursive">cursive</option>
      </select>
    </label>
    <label>
      太さ:
      <select v-model="fontWeight">
        <option value="normal">normal</option>
        <option value="bold">bold</option>
        <option value="bolder">bolder</option>
        <option value="lighter">lighter</option>
      </select>
    </label>
    <label>
      スタイル:
      <select v-model="fontStyle">
        <option value="normal">normal</option>
        <option value="italic">italic</option>
        <option value="oblique">oblique</option>
      </select>
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
import { ref, watch, computed, type CSSProperties } from "vue";
import type { ElementState } from "../types";

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
  layoutSystem: string;
  floatState: { direction: "left" | "right"; gap: number };
}>();
const emit = defineEmits<{ (e: "select", id: string): void }>();

// 双方向バインド用 refs
const width = ref(props.state.width);
const height = ref(props.state.height);
const bgColor = ref(props.state.backgroundColor || "#007acc");
const fontSize = ref(props.state.fontSize ?? 16);
const fontColor = ref(props.state.fontColor ?? "#000000");
const x = ref(props.state.x);
const y = ref(props.state.y);
const fontFamily = ref(props.state.fontFamily ?? "sans-serif");
const fontWeight = ref(props.state.fontWeight ?? "normal");
const fontStyle = ref(props.state.fontStyle ?? "normal");

// state へ反映
watch(width, v => props.state.width = v);
watch(height, v => props.state.height = v);
watch(bgColor, v => props.state.backgroundColor = v);
watch(fontSize, v => props.state.fontSize = v);
watch(fontColor, v => props.state.fontColor = v);
watch(x, v => props.state.x = v);
watch(y, v => props.state.y = v);
watch(fontFamily, v => props.state.fontFamily = v);
watch(fontWeight, v => props.state.fontWeight = v);
watch(fontStyle, v => props.state.fontStyle = v);

// 選択ハンドラ
function onSelect() {
  if (!props.isLayoutMode) emit("select", props.state.id);
}

// 要素スタイル
const elementStyle = computed((): CSSProperties => {
  // 共通: フレックスで中央揃え
  const common: CSSProperties = {
    display: props.state.display === 'inline' ? 'inline-flex' : 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: props.state.fontColor,
    fontSize: `${props.state.fontSize}px`,
    fontFamily: props.state.fontFamily,
    fontWeight: props.state.fontWeight,
    fontStyle: props.state.fontStyle,
    backgroundColor: props.state.backgroundColor,
    width: `${props.state.width}px`,  
    height: `${props.state.height}px`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    border: props.isLayoutMode ? '3px solid #000' : 'none',
    boxShadow: props.isLayoutMode ? '0 5px 15px rgba(33, 147, 176, 0.4)' : 'none',
    cursor: 'pointer',
    userSelect: 'none',
  };

  if (props.isLayoutMode) {
    if (props.layoutSystem === 'float') {
      return {
        ...common,
        float: props.floatState.direction,
        margin: props.floatState.direction === 'left'
          ? `0 ${props.floatState.gap}px 0 0`
          : `0 0 0 ${props.floatState.gap}px`,
      };
    }
    return common;
  }

  return {
    ...common,
    position: 'absolute',
    left: '0px',
    top: '0px',
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
    zIndex: props.state.zIndex,
  };
});
</script>

<style scoped>
.visual-element.button {
  /* 共通の flex 中央揃えは elementStyle で設定 */
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
.controls input[type="color"],
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
