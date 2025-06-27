<template>
  <div class="main-container">
    <!-- 左側の操作エリア -->
    <div class="sandbox-container">
      <div class="instructions">
        <b>操作方法:</b> 要素をクリックで選択。Alt/Option + ドラッグで複写。<br />
        選択中の要素は角のハンドルで回転。削除ボタンで削除できます。
      </div>
      <!-- ▼ ツールバー ▼ -->
      <div class="toolbar">
        <button @click="addElement('box')">ボックス追加</button>
        <button @click="addElement('circle')">円を追加</button>
        <button @click="addElement('text')">テキスト追加</button>
        <button @click="addElement('image')">画像追加</button>
        <button @click="addElement('button')">ボタン追加</button>
      </div>
      <!-- ▲ ツールバー ▲ -->

      <!-- ▼ サンドボックス本体 ▼ -->
      <div
        id="sandbox"
        ref="sandboxRef"
        @click.self="deselectAll"
        :style="sandboxStyle"
      >
        <!-- 各要素を描画 -->
        <component
          v-for="el in elements"
          :key="el.id"
          :is="componentMap[el.type]"
          :state="el"
          :is-selected="selectedElementId === el.id"
          :is-layout-mode="editMode === 'layout'"
          @select="selectElement"
          @update="handleElementUpdate"
          @clone="cloneElement"
        />

        <!-- レイアウトモード用ポップアップ -->
        <div v-if="editMode === 'layout'" class="controls layout-popup">
          <h3>Container</h3>
          <!-- App.vue のレイアウトモード用ポップアップ内 -->
          <label>
            レイアウト方式:
            <select v-model="layoutSystem">
              <optgroup
                v-for="cat in layoutCategories"
                :key="cat.name"
                :label="cat.name"
              >
                <option
                  v-for="mode in cat.modes"
                  :key="mode.id"
                  :value="mode.id"
                >
                  {{ mode.label }}
                </option>
              </optgroup>
            </select>
          </label>

          <!-- layout-popup 内、Flex と Grid のテンプレートの前に -->
          <template v-if="layoutSystem === 'flow'">
            <label>
              表示モード:
              <label
                ><input
                  type="radio"
                  value="block"
                  v-model="flowState.display"
                />
                block</label
              >
              <label
                ><input
                  type="radio"
                  value="inline"
                  v-model="flowState.display"
                />
                inline</label
              >
            </label>
          </template>

          <!-- Flex モード -->
          <template v-if="layoutSystem === 'flex'">
            <label>
              height: {{ flexState.containerHeight }}%
              <input
                type="range"
                min="20"
                max="100"
                v-model.number="flexState.containerHeight"
              />
            </label>
            <label>
              direction:
              <select v-model="flexState.direction">
                <option>row</option>
                <option>row-reverse</option>
                <option>column</option>
                <option>column-reverse</option>
              </select>
            </label>
            <label>
              justify-content:
              <select v-model="flexState.justifyContent">
                <option>flex-start</option>
                <option>flex-end</option>
                <option>center</option>
                <option>space-between</option>
                <option>space-around</option>
                <option>space-evenly</option>
              </select>
            </label>
            <label>
              align-items:
              <select v-model="flexState.alignItems">
                <option>flex-start</option>
                <option>flex-end</option>
                <option>center</option>
                <option>stretch</option>
                <option>baseline</option>
              </select>
            </label>
            <label>
              flex-wrap:
              <select v-model="flexState.flexWrap">
                <option>nowrap</option>
                <option>wrap</option>
                <option>wrap-reverse</option>
              </select>
            </label>
            <label>
              gap: {{ flexState.gap }}px
              <input
                type="range"
                min="0"
                max="50"
                v-model.number="flexState.gap"
              />
            </label>
          </template>

          <!-- Grid モード -->
          <template v-else>
            <label>
              grid-template-columns:
              <input
                type="text"
                v-model="gridState.columns"
                placeholder="1fr 1fr 1fr"
              />
            </label>
            <label>
              grid-template-rows:
              <input
                type="text"
                v-model="gridState.rows"
                placeholder="auto auto"
              />
            </label>
            <label>
              row-gap: {{ gridState.rowGap }}px
              <input
                type="range"
                min="0"
                max="50"
                v-model.number="gridState.rowGap"
              />
            </label>
            <label>
              column-gap: {{ gridState.columnGap }}px
              <input
                type="range"
                min="0"
                max="50"
                v-model.number="gridState.columnGap"
              />
            </label>
          </template>

          <h3>CSS</h3>
          <textarea readonly rows="6">{{ generatedLayoutCss }}</textarea>
        </div>
      </div>
      <!-- ▲ サンドボックス本体 ▲ -->
    </div>

    <!-- 右側のコード表示エリア -->
    <div class="code-container">
      <div class="mode-tabs">
        <button
          :class="{ active: editMode === 'individual' }"
          @click="setEditMode('individual')"
        >
          個別編集
        </button>
        <button
          :class="{ active: editMode === 'layout' }"
          @click="setEditMode('layout')"
        >
          レイアウト
        </button>
      </div>

      <div class="css-panel-wrapper">
        <!-- 一つのパネルにまとめて、ヘッダーと中身を切り替える -->
        <div class="css-panel">
          <h2>
            {{
              editMode === "individual"
                ? "Selected Element CSS"
                : "Container CSS (#sandbox)"
            }}
          </h2>

          <!-- 個別編集モードの中身 -->
          <template v-if="editMode === 'individual'">
            <div class="control-group">
              <label>背景色</label>
              <input
                type="color"
                v-if="selectedElement"
                v-model="selectedElement.backgroundColor"
              />
            </div>
            <textarea
              id="css-output-individual"
              :value="generatedIndividualCss"
              @input="updateElementFromCss"
            ></textarea>
          </template>

          <!-- レイアウトモードの中身 -->
          <template v-else>
            <textarea id="css-output-layout" readonly>{{
              generatedLayoutCss
            }}</textarea>
          </template>
        </div>
      </div>

      <div class="button-area">
        <button class="copy-button" @click="copyCss">コードをコピー</button>
        <button
          v-if="editMode === 'individual' && selectedElementId"
          class="delete-button"
          @click="deleteSelectedElement"
        >
          選択中の要素を削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useCssGenerator } from './composables/useCssGenerator';
import {
  ref,
  computed,
  reactive,
  watch,
  onMounted,
  nextTick,
  type CSSProperties,
} from "vue";
import interact from "interactjs";
import { useInteract } from "@/composables/useInteract";
import { useElements } from "./composables/useElements";
import { useLayout } from "./composables/useLayout";
// import { useCssGenerator } from "./composables/useCssGenerator";
import type { ElementState } from "./types";
import VisualBox from "./components/VisualBox.vue";
import VisualCircle from "./components/VisualCircle.vue";
import VisualText from "./components/VisualText.vue";
import VisualImage from "./components/VisualImage.vue";
import VisualButton from "./components/VisualButton.vue";

const componentMap = {
  box: VisualBox,
  circle: VisualCircle,
  text: VisualText,
  image: VisualImage,
  button: VisualButton,
};
// ──────── ① editMode をいちばん上で宣言 ────────
const editMode = ref<"individual" | "layout">("individual");

// ──────── ② useElements で要素操作ロジック ────────
const {
  elements,
  selectedElementId,
  selectedElement,
  addElement,
  selectElement,
  deselectAll,
  handleElementUpdate,
  cloneElement,
  deleteSelectedElement,
} = useElements();

// ──────── ③ useLayout を呼んで、grid/flex と CSS 生成 ────────
//     → ここで generatedLayoutCss も受け取る
const {
  layoutSystem,
  flowState,
  flexState,
  gridState,
  sandboxStyle,
  generatedLayoutCss,
  layoutCategories
} = useLayout();
// flowState.display を Ref として取り出す
const { display: flowDisplay } = toRefs(flowState);

// ──────── ④ useCssGenerator で個別要素用の CSS 生成 ────────
const { 
  selectedElement: cssSelectedElement, 
  generatedIndividualCss, 
  generatedLayoutCss: layoutCss,
   updateElementFromCss, 
   copyCss } =
  useCssGenerator(
    elements,
    selectedElementId,
    editMode, // ← 先に宣言しておいた editMode を渡す
    flexState,
    gridState,
    layoutSystem,
    toRefs(flowState).display
  );

  // 「block/inline」が変わったら、全要素の state.display も一括更新
 watch(
   () => flowState.display,
   (newDisp) => {
     if (layoutSystem.value === 'flow') {
       elements.value.forEach(el => el.display = newDisp);
     }
   }
 );
 // 併せて、flowモードに切り替わったときも display を反映
 watch(
   () => layoutSystem.value,
   (mode) => {
     if (mode === 'flow') {
       elements.value.forEach(el => el.display = flowState.display);
     }
   }
 );



// ② interact.js ロジックを composable に移譲
useInteract({
  elements,
  editMode,
  selectElement,
  handleElementUpdate,
  cloneElement,
});

const setEditMode = (mode: "individual" | "layout") => {
  editMode.value = mode;
  if (mode === "layout") deselectAll();
};

onMounted(() => {
  nextTick(() => {
    // addElement("box") などデフォルト追加が不要ならコメントアウト
    selectElement(null);
  });
  // initializeInteract();
});
</script>

<style>
/* スタイルは変更ありません */
body {
  font-family: "M PLUS Rounded 1c", sans-serif;
  background-color: #f4f7f9;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}
#app {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.main-container {
  display: flex;
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  max-height: 800px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}
.sandbox-container {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.instructions {
  width: 100%;
  text-align: center;
  padding: 10px;
  background-color: #e9f5e9;
  border-radius: 8px;
  margin-bottom: 10px;
  color: #2c6e49;
  flex-shrink: 0;
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.toolbar button {
  padding: 8px 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}
.toolbar button:hover {
  background-color: #e0e0e0;
  border-color: #aaa;
}
#sandbox {
  width: 100%;
  flex-grow: 1;
  border: 2px dashed #d0dbe3;
  border-radius: 10px;
  position: relative;
  background-image: linear-gradient(to right, #eef2f5 1px, transparent 1px),
    linear-gradient(to bottom, #eef2f5 1px, transparent 1px);
  background-size: 20px 20px;
}
.code-container {
  width: 45%;
  min-width: 450px;
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 30px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-left: 1px solid #ddd;
}
.code-container h2 {
  margin: 0 0 15px 0;
  font-size: 1.6em;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
  flex-shrink: 0;
}
.mode-tabs {
  display: flex;
  margin-bottom: 20px;
  background-color: #444;
  border-radius: 8px;
  padding: 5px;
  flex-shrink: 0;
}
.mode-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background-color: transparent;
  color: #ccc;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
}
.mode-tabs button.active {
  background-color: #666;
  color: white;
  font-weight: bold;
}
.css-panel-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.css-panel {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
#css-output-individual,
#css-output-layout {
  background-color: #212121;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 20px;
  font-family: "Source Code Pro", monospace;
  font-size: 1.1em;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #f8f8f2;
  resize: none;
}
#css-output-individual {
  flex-grow: 1;
  overflow-y: auto;
}
.layout-controls {
  flex-shrink: 0;
  margin-bottom: 15px;
}
#css-output-layout {
  flex-grow: 1;
  overflow-y: auto;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.control-group label {
  font-size: 1em;
  color: #aaa;
}
.control-group select,
.control-group input[type="range"] {
  width: 100%;
  padding: 8px;
  background-color: #333;
  border: 1px solid #555;
  color: white;
  border-radius: 4px;
  font-size: 1em;
}
.control-group span {
  text-align: right;
  color: #aaa;
}
.button-area {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.copy-button,
.delete-button {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}
.copy-button {
  background-color: #4caf50;
  color: white;
}
.copy-button:hover {
  background-color: #45a049;
}
.delete-button {
  background-color: #f44336;
  color: white;
}
.delete-button:hover {
  background-color: #d32f2f;
}
/* ポップアップを右上に固定 */
.controls.layout-popup {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 260px;
  max-height: calc(100% - 32px);
  overflow-y: auto;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 6px;
  z-index: 1000;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.controls.layout-popup h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: bold;
}
.controls.layout-popup label {
  display: block;
  margin-bottom: 10px;
}
.controls.layout-popup input,
.controls.layout-popup select,
.controls.layout-popup textarea {
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
}
.controls.layout-popup textarea {
  font-family: monospace;
  height: 80px;
  resize: none;
}
.controls.layout-popup {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 260px;
  max-height: calc(100%-32px);
  overflow-y: auto;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 6px;
  z-index: 1000;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
