<template>
  <div class="main-container">
    <!-- 左側の操作エリア -->
    <div class="sandbox-container">
      <div class="instructions">
        <b>操作方法:</b> 要素をクリックで選択。Alt/Option + ドラッグで複写。<br>
        選択中の要素は角のハンドルで回転。削除ボタンで削除できます。
      </div>
      <div class="toolbar">
        <button @click="addElement('box')">ボックス追加</button>
        <button @click="addElement('circle')">円を追加</button>
      </div>
      <div id="sandbox" ref="sandboxRef" @click.self="deselectAll" :style="sandboxStyle">
        <component
          v-for="element in elements"
          :key="element.id"
          :is="componentMap[element.type]"
          :state="element"
          :is-selected="selectedElementId === element.id"
          :is-layout-mode="editMode === 'layout'"
        />
      </div>
    </div>
    <!-- 右側のコード表示エリア -->
    <div class="code-container">
        <div class="mode-tabs">
            <button :class="{active: editMode === 'individual'}" @click="setEditMode('individual')">個別編集</button>
            <button :class="{active: editMode === 'layout'}" @click="setEditMode('layout')">レイアウト</button>
        </div>

        <div class="css-panel-wrapper">
          <div class="css-panel" v-show="editMode === 'individual'">
              <h2>Selected Element CSS</h2>
              <textarea 
                  id="css-output-individual" 
                  :value="generatedIndividualCss"
                  @input="updateElementFromCss"
              ></textarea>
          </div>
          
          <div class="css-panel" v-show="editMode === 'layout'">
              <h2>Container CSS (#sandbox)</h2>
              <div class="layout-controls">
                  <div class="control-group">
                      <label>height</label>
                      <input type="range" min="20" max="100" v-model.number="flexState.containerHeight" />
                      <span>{{ flexState.containerHeight }}%</span>
                  </div>
                  <div class="control-group">
                      <label>flex-direction</label>
                      <select v-model="flexState.direction">
                          <option>row</option><option>row-reverse</option><option>column</option><option>column-reverse</option>
                      </select>
                  </div>
                  <div class="control-group">
                      <label>justify-content</label>
                      <select v-model="flexState.justifyContent">
                          <option>flex-start</option><option>flex-end</option><option>center</option><option>space-between</option><option>space-around</option><option>space-evenly</option>
                      </select>
                  </div>
                  <div class="control-group">
                      <label>align-items</label>
                      <select v-model="flexState.alignItems">
                          <option>flex-start</option><option>flex-end</option><option>center</option><option>stretch</option><option>baseline</option>
                      </select>
                  </div>
                  <div class="control-group">
                      <label>flex-wrap</label>
                      <select v-model="flexState.flexWrap">
                          <option>nowrap</option><option>wrap</option><option>wrap-reverse</option>
                      </select>
                  </div>
                  <div class="control-group">
                      <label>gap</label>
                      <input type="range" min="0" max="50" v-model.number="flexState.gap" />
                      <span>{{ flexState.gap }}px</span>
                  </div>
              </div>
              <pre id="css-output-layout"><code>{{ generatedLayoutCss }}</code></pre>
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
import { ref, computed, onMounted, nextTick, reactive, watch, type CSSProperties } from 'vue';
import VisualBox from './components/VisualBox.vue';
import VisualCircle from './components/VisualCircle.vue';
import type { ElementState } from './types';
import interact from 'interactjs';

const elements = ref<ElementState[]>([]);
const selectedElementId = ref<string | null>(null);
const sandboxRef = ref<HTMLElement | null>(null);
let elementCounter = 0;
const editMode = ref<'individual' | 'layout'>('individual');

const flexState = reactive({
    containerHeight: 100,
    direction: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: 10
});

const componentMap = {
    box: VisualBox,
    circle: VisualCircle
};

const sandboxStyle = computed((): CSSProperties => {
    if (editMode.value === 'layout') {
        return {
            display: 'flex',
            height: `${flexState.containerHeight}%`,
            flexDirection: flexState.direction as any,
            justifyContent: flexState.justifyContent,
            alignItems: flexState.alignItems,
            flexWrap: flexState.flexWrap as any,
            gap: `${flexState.gap}px`
        };
    }
    return { height: '100%' };
});

const generatedIndividualCss = computed(() => {
  const selectedElement = elements.value.find(b => b.id === selectedElementId.value);
  if (!selectedElement) return '/* 要素をクリックして選択してください */';
  const { id, width, height, x, y, angle, zIndex } = selectedElement;
  const code = `
#${id} {
    position: absolute; 
    width: ${width.toFixed(1)}px;
    height: ${height.toFixed(1)}px;
    z-index: ${zIndex};
    transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg);
}`;
  return code.trim().replace(/^ {4}/gm, '    ');
});

const generatedLayoutCss = computed(() => {
    const code = `
#sandbox {
    display: flex;
    height: ${flexState.containerHeight}%;
    flex-direction: ${flexState.direction};
    justify-content: ${flexState.justifyContent};
    align-items: ${flexState.alignItems};
    flex-wrap: ${flexState.flexWrap};
    gap: ${flexState.gap}px;
}`;
    return code.trim().replace(/^ {4}/gm, '    ');
});

const addElement = (type: 'box' | 'circle', initialState: Partial<ElementState> = {}) => {
  const sandboxRect = sandboxRef.value?.getBoundingClientRect();
  elementCounter++;
  const id = `${type}-${elementCounter}`;
  const newElement: ElementState = {
    id, type,
    x: initialState.x ?? (sandboxRect ? sandboxRect.width / 2 - 75 : 100),
    y: initialState.y ?? (sandboxRect ? sandboxRect.height / 2 - 75 : 100),
    width: initialState.width ?? 150,
    height: initialState.height ?? 150,
    angle: initialState.angle ?? 0,
    content: `${type.toUpperCase()} ${elementCounter}`,
    zIndex: elementCounter,
  };
  elements.value.push(newElement);
  selectElement(id);
};

const selectElement = (id: string | null) => {
  selectedElementId.value = id;
};

const deselectAll = () => {
    if (editMode.value === 'individual') {
        selectedElementId.value = null;
    }
}

const handleElementUpdate = (newState: ElementState) => {
  const index = elements.value.findIndex(b => b.id === newState.id);
  if (index !== -1) {
    elements.value[index] = newState;
  }
};

const cloneElement = (originalState: ElementState) => {
    addElement(originalState.type, { ...originalState, x: originalState.x + 20, y: originalState.y + 20 });
}

const setEditMode = (mode: 'individual' | 'layout') => {
    editMode.value = mode;
    if (mode === 'layout') {
        deselectAll();
    }
}

const updateElementFromCss = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const cssText = target.value;
    const selectedElement = elements.value.find(b => b.id === selectedElementId.value);
    if (!selectedElement) return;
    try {
        const widthMatch = cssText.match(/width:\s*(\d*\.?\d+)/);
        const heightMatch = cssText.match(/height:\s*(\d*\.?\d+)/);
        const zIndexMatch = cssText.match(/z-index:\s*(\d+)/);
        const translateMatch = cssText.match(/translate\(\s*(-?\d*\.?\d+)px,\s*(-?\d*\.?\d+)px\)/);
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
    const codeToCopy = editMode.value === 'individual' ? generatedIndividualCss.value : generatedLayoutCss.value;
    if(codeToCopy.startsWith('/*')) return;
    navigator.clipboard.writeText(codeToCopy);
};

const deleteSelectedElement = () => {
    if (!selectedElementId.value) return;
    const index = elements.value.findIndex(b => b.id === selectedElementId.value);
    if (index !== -1) {
        elements.value.splice(index, 1);
        deselectAll();
    }
}

const initializeInteract = () => {
    interact('.visual-element')
        .on('down', (event) => {
            if (editMode.value === 'individual') {
                selectElement(event.currentTarget.id);
            }
            event.stopPropagation();
        })
        .draggable({
            listeners: {
                start(event) {
                    if (event.altKey) {
                        const originalElement = elements.value.find(b => b.id === event.target.id);
                        if (originalElement) cloneElement({ ...originalElement });
                        event.interaction.stop();
                    }
                },
                move(event) {
                    const element = elements.value.find(b => b.id === event.target.id);
                    if (element) {
                        handleElementUpdate({ ...element, x: element.x + event.dx, y: element.y + event.dy });
                    }
                }
            },
            modifiers: [interact.modifiers.restrictRect({ restriction: 'parent' })]
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move(event) {
                    const element = elements.value.find(b => b.id === event.target.id);
                    if(element) {
                        const updates: Partial<ElementState> = {
                            width: event.rect.width,
                            height: event.rect.height,
                            x: element.x + event.deltaRect.left,
                            y: element.y + event.deltaRect.top,
                        };
                        if (element.type === 'circle') {
                            updates.height = event.rect.width;
                        }
                        updateElementState(element.id, updates);
                    }
                }
            },
            modifiers: [
                interact.modifiers.restrictRect({ restriction: 'parent' }),
                interact.modifiers.restrictSize({ min: { width: 50, height: 50 } })
            ]
        });

    interact('.rotate-handle')
        .draggable({
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
                const element = elements.value.find(b => b.id === boxElement.id);
                if(element) {
                    const angle = Math.atan2(event.clientY - event.interaction.boxCenterY, event.clientX - event.interaction.boxCenterX);
                    handleElementUpdate({ ...element, angle: angle * (180 / Math.PI) + 90 });
                }
            }
        });
}

onMounted(() => {
    nextTick(() => {
        addElement('box');
        addElement('box');
        addElement('circle');
        selectElement(null);
    });
    initializeInteract();
    
    watch(editMode, (newValue) => {
        const isIndividual = newValue === 'individual';
        interact('.visual-element').draggable({ enabled: isIndividual });
        interact('.visual-element').resizable({ enabled: isIndividual });
        interact('.rotate-handle').draggable({ enabled: isIndividual });
    }, { immediate: true });
});
</script>

<style>
/* ... (グローバルスタイルは変更なし) ... */
body { font-family: 'M PLUS Rounded 1c', sans-serif; background-color: #f4f7f9; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
#app { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.main-container { display: flex; width: 95%; max-width: 1200px; height: 90vh; max-height: 800px; background: #fff; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
/* ★★★ 修正: sandbox-containerの高さを揃える ★★★ */
.sandbox-container { 
    flex: 1; 
    padding: 30px; 
    display: flex; 
    flex-direction: column; 
    position: relative; 
}
.instructions { width: 100%; text-align: center; padding: 10px; background-color: #e9f5e9; border-radius: 8px; margin-bottom: 10px; color: #2c6e49; flex-shrink: 0; }
.toolbar { display: flex; gap: 10px; margin-bottom: 10px; flex-shrink: 0; }
.toolbar button { padding: 8px 15px; border-radius: 6px; border: 1px solid #ccc; background-color: #f0f0f0; cursor: pointer; transition: all 0.2s; }
.toolbar button:hover { background-color: #e0e0e0; border-color: #aaa; }
#sandbox { width: 100%; flex-grow: 1; border: 2px dashed #d0dbe3; border-radius: 10px; position: relative; background-image: linear-gradient(to right, #eef2f5 1px, transparent 1px), linear-gradient(to bottom, #eef2f5 1px, transparent 1px); background-size: 20px 20px; }
.code-container { width: 45%; min-width: 450px; background-color: #2d2d2d; color: #f8f8f2; padding: 30px; display: flex; flex-direction: column; box-sizing: border-box; border-left: 1px solid #ddd; }
.code-container h2 { margin: 0 0 15px 0; font-size: 1.6em; border-bottom: 2px solid #444; padding-bottom: 10px; flex-shrink: 0; }
.mode-tabs { display: flex; margin-bottom: 20px; background-color: #444; border-radius: 8px; padding: 5px; flex-shrink: 0; }
.mode-tabs button { flex: 1; padding: 10px; border: none; background-color: transparent; color: #ccc; font-size: 1.1em; cursor: pointer; transition: all 0.2s; border-radius: 6px; }
.mode-tabs button.active { background-color: #666; color: white; font-weight: bold; }
.css-panel-wrapper { flex-grow: 1; display: flex; flex-direction: column; min-height: 0; }
.css-panel { flex-grow: 1; display: flex; flex-direction: column; min-height: 0; }
#css-output-individual, #css-output-layout { 
    background-color: #212121; border: 1px solid #444; border-radius: 8px; padding: 20px; font-family: 'Source Code Pro', monospace; font-size: 1.1em; line-height: 1.6; white-space: pre-wrap; color: #f8f8f2; resize: none;
}
#css-output-individual { flex-grow: 1; overflow-y: auto; }
/* ★★★ 修正: レイアウトパネルのレイアウト ★★★ */
.layout-controls {
  flex-shrink: 0; /* コントロールパネルは縮まない */
  margin-bottom: 15px;
}
.control-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; flex-shrink: 0; }
.control-group label { font-size: 1em; color: #aaa; }
.control-group select, .control-group input[type="range"] { width: 100%; padding: 8px; background-color: #333; border: 1px solid #555; color: white; border-radius: 4px; font-size: 1em; }
.control-group span { text-align: right; color: #aaa; }
#css-output-layout {
  flex-grow: 1; /* 残りのスペースを埋める */
  overflow-y: auto; /* 必要に応じてスクロール */
}
.button-area { margin-top: auto; padding-top: 20px; display: flex; gap: 10px; flex-shrink: 0;}
.copy-button, .delete-button { flex: 1; padding: 15px; border: none; border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
.copy-button { background-color: #4caf50; color: white; }
.copy-button:hover { background-color: #45a049; }
.delete-button { background-color: #f44336; color: white; }
.delete-button:hover { background-color: #d32f2f; }
</style>
