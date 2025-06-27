<!-- src/components/VisualButton.vue -->
<template>
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

  <div v-if="props.isSelected && !props.isLayoutMode" class="controls">
    <!-- 各種コントロール -->
    <label>テキスト:
      <input type="text" v-model="props.state.content" />
    </label>
    <label>フォントサイズ: {{ fontSize }}px
      <input type="range" v-model.number="fontSize" min="10" max="72" />
    </label>
    <label>フォント:
      <select v-model="fontFamily">
        <option value="sans-serif">sans-serif</option>
        <option value="serif">serif</option>
        <option value="monospace">monospace</option>
        <option value="cursive">cursive</option>
      </select>
    </label>
    <label>太さ:
      <select v-model="fontWeight">
        <option value="normal">normal</option>
        <option value="bold">bold</option>
        <option value="bolder">bolder</option>
        <option value="lighter">lighter</option>
      </select>
    </label>
    <label>スタイル:
      <select v-model="fontStyle">
        <option value="normal">normal</option>
        <option value="italic">italic</option>
        <option value="oblique">oblique</option>
      </select>
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
      <input type="range" v-model.number="height" min="30" max="200" />
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
import { ref, watch, computed, toRefs, type CSSProperties } from "vue";
import type { ElementState } from "../types";

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
  layoutSystem: string;
  floatState: { direction: "left" | "right"; gap: number };
}>();
const { state, isLayoutMode, layoutSystem, floatState } = toRefs(props);
const emit = defineEmits<{ (e: "select", id: string): void }>();

// 双方向バインド用 refs
const width      = ref(state.value.width);
const height     = ref(state.value.height);
const bgColor    = ref(state.value.backgroundColor || "#007acc");
const fontSize   = ref(state.value.fontSize ?? 16);
const fontColor  = ref(state.value.fontColor ?? "#000000");
const x          = ref(state.value.x);
const y          = ref(state.value.y);
const fontFamily = ref(state.value.fontFamily ?? "sans-serif");
const fontWeight = ref(state.value.fontWeight ?? "normal");
const fontStyle  = ref(state.value.fontStyle ?? "normal");

// state へ反映
watch(width,      v => state.value.width = v);
watch(height,     v => state.value.height = v);
watch(bgColor,    v => state.value.backgroundColor = v);
watch(fontSize,   v => state.value.fontSize = v);
watch(fontColor,  v => state.value.fontColor = v);
watch(x,          v => state.value.x = v);
watch(y,          v => state.value.y = v);
watch(fontFamily, v => state.value.fontFamily = v);
watch(fontWeight, v => state.value.fontWeight = v);
watch(fontStyle,  v => state.value.fontStyle = v);

// 選択ハンドラ
function onSelect() {
  if (!isLayoutMode.value) emit("select", state.value.id);
}

// 要素スタイル
const elementStyle = computed((): CSSProperties => {
  // 共通ベース：中央揃えの flex/inline-flex
  const displayType = state.value.display === "inline" ? "inline-flex" : "flex";
  const base: CSSProperties = {
    display:        displayType,
    justifyContent: "center",
    alignItems:     "center",
    color:          state.value.fontColor,
    fontSize:       `${state.value.fontSize}px`,
    fontFamily:     state.value.fontFamily,
    fontWeight:     state.value.fontWeight,
    fontStyle:      state.value.fontStyle,
    backgroundColor: state.value.backgroundColor,
    width:          `${state.value.width}px`,
    height:         `${state.value.height}px`,
    borderRadius:   "4px",
    boxSizing:      "border-box",
    border:         isLayoutMode.value ? "3px solid #000" : "none",
    boxShadow:      isLayoutMode.value ? "0 5px 15px rgba(33,147,176,0.4)" : "none",
    cursor:         "pointer",
    userSelect:     "none",
  };

  if (isLayoutMode.value) {
    // Float レイアウト
    if (layoutSystem.value === "float") {
      return {
        ...base,
        display: "block",
        float:   floatState.value.direction,
        margin: floatState.value.direction === "left"
          ? `0 ${floatState.value.gap}px 0 0`
          : `0 0 0 ${floatState.value.gap}px`,
      };
    }
    // Table レイアウト
    if (layoutSystem.value === "table") {
      return {
        ...base,
        display:       "table-cell",
        verticalAlign: "middle",
      };
    }
    // その他レイアウト
    return base;
  }

  // 個別編集モード：絶対配置＋移動＋回転
  return {
    ...base,
    position:  "absolute",
    left:      "0px",
    top:       "0px",
    transform: `translate(${x.value}px, ${y.value}px) rotate(${state.value.angle}deg)`,
    zIndex:    state.value.zIndex,
  };
});
</script>

<style scoped>
.visual-element.button {
  /* レイアウトモード時も見えるように */
}
.visual-element.selected {
  outline: 2px solid #ffc107;
}
.rotate-handle {
  position: absolute;
  width: 20px; height: 20px;
  background-color: #ffc107;
  border: 2px solid white;
  border-radius: 50%;
  top: -12px; right: -12px;
  cursor: alias;
}
.controls {
  position: fixed;
  top: 16px; right: 16px;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 8px; border-radius: 4px;
  z-index: 1000; font-size: 12px; line-height: 1.4;
}
.controls label {
  display: block; margin-bottom: 6px;
}
.controls input[type="range"] {
  width: 120px; vertical-align: middle;
}
.controls input[type="color"],
.controls input[type="text"] {
  width: 100%; margin-top: 2px;
}
</style>
