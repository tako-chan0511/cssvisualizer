<!-- src/components/VisualText.vue -->
<template>
  <!-- 実際のテキスト要素 -->
  <div
    :id="state.id"
    class="visual-element text"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop.prevent="onSelect"
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
import { ref, watch, computed, toRefs, type CSSProperties } from "vue";
import type { ElementState } from "../types";

// props 受け取り
const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();
const { state, isSelected, isLayoutMode } = toRefs(props);
const emit = defineEmits<{ (e: "select", id: string): void }>();

// ローカルバインド用 refs
const textContent = ref(state.value.content);
const fontSize = ref(state.value.fontSize ?? 24);
const fontColor = ref(state.value.fontColor ?? "#333333");
const bgColor = ref(state.value.backgroundColor ?? "#ffffff");
const width = ref(state.value.width);
const height = ref(state.value.height);
const x = ref(state.value.x);
const y = ref(state.value.y);
const fontFamily = ref(state.value.fontFamily ?? "sans-serif");
const fontWeight = ref(state.value.fontWeight ?? "normal");
const fontStyle = ref(state.value.fontStyle ?? "normal");

// state への反映
watch(textContent, v => state.value.content = v);
watch(fontSize, v => state.value.fontSize = v);
watch(fontColor, v => state.value.fontColor = v);
watch(bgColor, v => state.value.backgroundColor = v);
watch(width, v => state.value.width = v);
watch(height, v => state.value.height = v);
watch(x, v => state.value.x = v);
watch(y, v => state.value.y = v);
watch(fontFamily, v => state.value.fontFamily = v);
watch(fontWeight, v => state.value.fontWeight = v);
watch(fontStyle, v => state.value.fontStyle = v);

// 選択ハンドラ
function onSelect() {
  if (!isLayoutMode.value) emit("select", state.value.id);
}

// 要素スタイル
const elementStyle = computed((): CSSProperties => {
  const baseStyle: CSSProperties = {
    display: state.value.display,
    color: state.value.fontColor,
    fontSize: `${state.value.fontSize}px`,
    fontFamily: state.value.fontFamily,
    fontWeight: state.value.fontWeight,
    fontStyle: state.value.fontStyle,
    backgroundColor: state.value.backgroundColor,
    textAlign: "center",
    wordBreak: "break-word",
    width: `${state.value.width}px`,
    height: `${state.value.height}px`,
  };
  if (isLayoutMode.value) {
    return baseStyle;
  }
  return {
    ...baseStyle,
    position: "absolute",
    left: "0px",
    top: "0px",
    transform: `translate(${state.value.x}px, ${state.value.y}px) rotate(${state.value.angle}deg)`,
    zIndex: state.value.zIndex,
  };
});
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
  /* レイアウトモードでも見えるようにスタイル追加 */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: transparent;
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
  vertical-align: middle;
}
.controls input[type="color"],
.controls input[type="text"] {
  width: 100%;
  margin-top: 2px;
}
</style>
