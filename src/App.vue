<template>
  <div class="main-container">
    <!-- 左側の操作エリア -->
    <div class="sandbox-container">
      <div class="instructions">
        <b>操作方法:</b> 要素をクリックで選択。Alt/Option + ドラッグで複写。<br />
        選択中の要素は角のハンドルで回転。削除ボタンで削除できます。
      </div>
      <div class="toolbar">
        <button @click="addElement('box')">ボックス追加</button>
        <button @click="addElement('circle')">円を追加</button>
        <button @click="addElement('text')">テキスト追加</button>
        <button @click="addElement('image')">画像追加</button>
        <button @click="addElement('button')">ボタン追加</button>
      </div>
      <div
        id="sandbox"
        ref="sandboxRef"
        @click.self="deselectAll"
        :style="sandboxStyle"
      >
        <!-- 動的コンポーネントで要素を描画 -->
        <component
          v-for="element in elements"
          :key="element.id"
          :is="componentMap[element.type]"
          :state="element"
          :is-selected="selectedElementId === element.id"
          :is-layout-mode="editMode === 'layout'"
          @update="handleElementUpdate"
          @select="selectElement"
          @clone="cloneElement"
        />
        <!-- ★ レイアウトモード用ポップアップ -->
        <div v-if="editMode === 'layout'" class="controls layout-popup">
          <h3>Container</h3>
          <!-- レイアウト方式切替 -->
          <label>
            レイアウト方式:
            <select v-model="layoutSystem">
              <option value="flex">Flexbox</option>
              <option value="grid">CSS Grid</option>
            </select>
          </label>
          <!-- Flex モード -->
          <template v-if="layoutSystem === 'flex'">
            <label>height: {{ flexState.containerHeight }}%
              <input type="range" min="20" max="100" v-model.number="flexState.containerHeight" />
            </label>
            <label>direction:
              <select v-model="flexState.direction">
                <option>row</option>
                <option>row-reverse</option>
                <option>column</option>
                <option>column-reverse</option>
              </select>
            </label>
            <label>justify-content:
              <select v-model="flexState.justifyContent">
                <option>flex-start</option>
                <option>flex-end</option>
                <option>center</option>
                <option>space-between</option>
                <option>space-around</option>
                <option>space-evenly</option>
              </select>
            </label>
            <label>align-items:
              <select v-model="flexState.alignItems">
                <option>flex-start</option>
                <option>flex-end</option>
                <option>center</option>
                <option>stretch</option>
                <option>baseline</option>
              </select>
            </label>
            <label>flex-wrap:
              <select v-model="flexState.flexWrap">
                <option>nowrap</option>
                <option>wrap</option>
                <option>wrap-reverse</option>
              </select>
            </label>
            <label>gap: {{ flexState.gap }}px
              <input type="range" min="0" max="50" v-model.number="flexState.gap" />
            </label>
          </template>
          <!-- Grid モード -->
          <template v-else>
            <label>grid-template-columns:
              <input type="text" v-model="gridState.columns" placeholder="1fr 1fr 1fr" />
            </label>
            <label>grid-template-rows:
              <input type="text" v-model="gridState.rows" placeholder="auto auto" />
            </label>
            <!-- <label>gap: {{ gridState.gap }}px
              <input type="range" min="0" max="50" v-model.number="gridState.gap" />
            </label> -->
            <label>row-gap: {{ gridState.rowGap }}px
              <input type="range" min="0" max="50" v-model.number="gridState.rowGap" />
            </label>
            <label>column-gap: {{ gridState.columnGap }}px
              <input type="range" min="0" max="50" v-model.number="gridState.columnGap" />
            </label>
          </template>
          <h3>CSS</h3>
          <textarea readonly rows="6">{{ generatedLayoutCss }}</textarea>
        </div>
      </div>
    </div>
    <!-- 右側のコード表示エリア -->
    <div class="code-container">
      <div class="mode-tabs">
        <button :class="{ active: editMode === 'individual' }" @click="setEditMode('individual')">個別編集</button>
        <button :class="{ active: editMode === 'layout' }" @click="setEditMode('layout')">レイアウト</button>
      </div>

      <div class="css-panel-wrapper">
        <div class="css-panel" v-show="editMode === 'layout'">
          <h2>Container CSS (#sandbox)</h2>
          <textarea readonly id="css-output-layout">{{ generatedLayoutCss }}</textarea>
        </div>
        <div class="css-panel" v-show="editMode === 'individual'">
          <h2>Selected Element CSS</h2>
          <div class="control-group">
            <label>背景色</label>
            <input type="color" v-if="selectedElement" v-model="selectedElement.backgroundColor" />
          </div>
          <textarea id="css-output-individual" :value="generatedIndividualCss" @input="updateElementFromCss"></textarea>
        </div>
      </div>

      <div class="button-area">
        <button class="copy-button" @click="copyCss">コードをコピー</button>
        <button v-if="editMode === 'individual' && selectedElementId" class="delete-button" @click="deleteSelectedElement">選択中の要素を削除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, nextTick, type CSSProperties } from 'vue';
import interact from 'interactjs';
import VisualBox from './components/VisualBox.vue';
import VisualCircle from './components/VisualCircle.vue';
import VisualText from './components/VisualText.vue';
import VisualImage from './components/VisualImage.vue';
import VisualButton from './components/VisualButton.vue';
import { useElements } from './composables/useElements';
import type { ElementState } from './types';
import { useLayout } from '@/composables/useLayout';

const {
   elements,
   selectedElementId,
   selectedElement,
   addElement,
   selectElement,
   deselectAll,
   handleElementUpdate,
   cloneElement,
   deleteSelectedElement
 } = useElements();

 const { layoutSystem, flexState, gridState, sandboxStyle, generatedLayoutCss } = useLayout();

 const sandboxRef = ref<HTMLElement | null>(null);
let elementCounter = 0;
const editMode = ref<'individual'|'layout'>('individual');



const componentMap:Record<string,any> = { box:VisualBox, circle:VisualCircle, text:VisualText, image:VisualImage, button:VisualButton };



// 個別要素のCSSコードを生成するcomputed （フォント関連もBOX/ボタンに追加）
const generatedIndividualCss = computed(() => {
  if (!selectedElement.value) {
    return "/* 要素をクリックして選択してください */";
  }
  const el = selectedElement.value;
  const {
    id,
    width,
    height,
    x,
    y,
    angle,
    zIndex,
    backgroundColor,
    fontSize,
    fontColor,
    fontFamily,
    fontWeight,
    fontStyle,
    type,
  } = el;

  // 基本のCSSを作成
  let css = `#${id} {
    position: absolute;
    width: ${width.toFixed(1)}px;
    height: ${height.toFixed(1)}px;
    background-color: ${backgroundColor || "#ffffff"};
    z-index: ${zIndex};
    transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg);
  }`;

  // BOX / TEXT / BUTTON に対してフォント系プロパティを追加
  if (type === "box" || type === "text" || type === "button" || type === "circle") {
    // 挿入する文字系CSS
    let fontCss = 
      `    color: ${fontColor   || "#000000"};\n` +
      `    font-size: ${fontSize?.toFixed(1) || 16}px;\n` +
      `    font-family: ${fontFamily || "sans-serif"};\n` +
      `    font-weight: ${fontWeight || "normal"};\n` +
      `    font-style: ${fontStyle || "normal"};\n`;

    // ボタンだけはさらにボタン固有スタイルも追加
    if (type === "button") {
      fontCss +=
        `    border: none;\n` +
        `    border-radius: 4px;\n` +
        `    padding: 8px 16px;\n`;
    }

    // 最後の'}'の直前にまとめて挿入
    css = css.replace(/\}$/, fontCss + `}`);
  }

  return css.trim();
});


const setEditMode = (mode: "individual" | "layout") => {
  editMode.value = mode;
  if (mode === "layout") {
    deselectAll();
  }
};

const updateElementFromCss = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const cssText = target.value;
  const selectedElement = elements.value.find(
    (b) => b.id === selectedElementId.value
  );
  if (!selectedElement) return;
  try {
    const widthMatch = cssText.match(/width:\s*(\d*\.?\d+)/);
    const heightMatch = cssText.match(/height:\s*(\d*\.?\d+)/);
    const zIndexMatch = cssText.match(/z-index:\s*(\d+)/);
    const translateMatch = cssText.match(
      /translate\(\s*(-?\d*\.?\d+)px,\s*(-?\d*\.?\d+)px\)/
    );
    const rotateMatch = cssText.match(/rotate\(\s*(-?\d*\.?\d+)deg\)/);
    const updates: Partial<ElementState> = {};
    if (widthMatch) updates.width = parseFloat(widthMatch[1]);
    if (heightMatch) updates.height = parseFloat(heightMatch[1]);
    if (zIndexMatch) updates.zIndex = parseInt(zIndexMatch[1], 10);
    if (translateMatch) {
      updates.x = parseFloat(translateMatch[1]);
      updates.y = parseFloat(translateMatch[2]);
    }
    if (rotateMatch) updates.angle = parseFloat(rotateMatch[1]);
    Object.assign(selectedElement, updates);
  } catch (e) {
    console.error("CSSの解析に失敗しました:", e);
  }
};

const copyCss = () => {
  const codeToCopy =
    editMode.value === "individual"
      ? generatedIndividualCss.value
      : generatedLayoutCss.value;
  if (codeToCopy.startsWith("/*")) return;
  navigator.clipboard.writeText(codeToCopy);
};


const initializeInteract = () => {
  interact(".visual-element").unset();
  interact(".rotate-handle").unset();

  interact(".visual-element")
    .on("down", (event) => {
      if (editMode.value === "individual") {
        selectElement(event.currentTarget.id);
      }
      event.stopPropagation();
    })
    .draggable({
      listeners: {
        start(event) {
          if (event.altKey) {
            const originalElement = elements.value.find(
              (b) => b.id === event.target.id
            );
            if (originalElement) cloneElement({ ...originalElement });
            event.interaction.stop();
          }
        },
        move(event) {
          const element = elements.value.find((b) => b.id === event.target.id);
          if (element) {
            handleElementUpdate({
              ...element,
              x: element.x + event.dx,
              y: element.y + event.dy,
            });
          }
        },
      },
      modifiers: [interact.modifiers.restrictRect({ restriction: "parent" })],
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          const element = elements.value.find((b) => b.id === event.target.id);
          if (element) {
            const updates: Partial<ElementState> = {
              width: event.rect.width,
              height: event.rect.height,
              x: element.x + event.deltaRect.left,
              y: element.y + event.deltaRect.top,
            };
            if (element.type === "circle") {
              updates.height = event.rect.width;
            }
            handleElementUpdate({ ...element, ...updates });
          }
        },
      },
      modifiers: [
        interact.modifiers.restrictRect({ restriction: "parent" }),
        interact.modifiers.restrictSize({ min: { width: 50, height: 50 } }),
      ],
    });

  interact(".rotate-handle").draggable({
    onstart: function (event) {
      const boxElement = (event.target as HTMLElement).parentElement!;
      const rect = boxElement.getBoundingClientRect();
      // @ts-ignore
      event.interaction.boxCenterX = rect.left + rect.width / 2;
      // @ts-ignore
      event.interaction.boxCenterY = rect.top + rect.height / 2;
    },
    onmove: function (event) {
      const boxElement = (event.target as HTMLElement).parentElement!;
      const element = elements.value.find((b) => b.id === boxElement.id);
      if (element) {
        const angle = Math.atan2(
          event.clientY - event.interaction.boxCenterY,
          event.clientX - event.interaction.boxCenterX
        );
        handleElementUpdate({
          ...element,
          angle: angle * (180 / Math.PI) + 90,
        });
      }
    },
  });
};

onMounted(() => {
  nextTick(() => {
    // addElement("box");
    selectElement(null);
  });
  initializeInteract();

  watch(
    editMode,
    (newValue) => {
      const isIndividual = newValue === "individual";
      interact(".visual-element").draggable({ enabled: isIndividual });
      interact(".visual-element").resizable({ enabled: isIndividual });
      interact(".rotate-handle").draggable({ enabled: isIndividual });
    },
    { immediate: true }
  );
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
  position:fixed; top:16px; right:16px; width:260px;
  max-height:calc(100%-32px); overflow-y:auto;
  background:#fafafa; border:1px solid #ddd; padding:12px;
  border-radius:6px; z-index:1000; font-size:12px;
  box-shadow:0 2px 8px rgba(0,0,0,0.15);
}
</style>
