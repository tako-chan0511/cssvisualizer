<template>
  <div class="main-container">
    <!-- 左側の操作エリア -->
    <div class="sandbox-container">
      <div class="instructions">
        <b>操作方法:</b> ボックスをクリックで選択。Alt/Option + ドラッグで複写。<br>
        「レイアウトモード」に切り替えると、ボックス全体を整列できます。
      </div>
      <!-- ★★★ 修正: :styleにflexboxスタイルをバインド ★★★ -->
      <div id="sandbox" ref="sandboxRef" @click.self="deselectAll" :style="sandboxStyle">
        <VisualBox
          v-for="box in boxes"
          :key="box.id"
          :state="box"
          :is-selected="selectedBoxId === box.id"
          :is-layout-mode="editMode === 'layout'"
        />
      </div>
    </div>
    <!-- 右側のコード表示エリア -->
    <div class="code-container">
        <!-- ★★★ 修正: モード切替タブ ★★★ -->
        <div class="mode-tabs">
            <button :class="{active: editMode === 'individual'}" @click="setEditMode('individual')">個別編集</button>
            <button :class="{active: editMode === 'layout'}" @click="setEditMode('layout')">レイアウト</button>
        </div>

        <!-- ★★★ 修正: v-show を使って表示を切り替え、レイアウトの崩れを防ぐ ★★★ -->
        <div class="css-panel" v-show="editMode === 'individual'">
            <h2>Selected Element CSS</h2>
            <textarea 
                id="css-output-individual" 
                :value="generatedIndividualCss"
                @input="updateBoxFromCss"
            ></textarea>
        </div>
        
        <div class="css-panel" v-show="editMode === 'layout'">
            <h2>Container CSS (#sandbox)</h2>
            <div class="layout-controls">
                <div class="control-group">
                    <label>flex-direction</label>
                    <select v-model="flexState.direction">
                        <option>row</option>
                        <option>row-reverse</option>
                        <option>column</option>
                        <option>column-reverse</option>
                    </select>
                </div>
                 <div class="control-group">
                    <label>justify-content</label>
                    <select v-model="flexState.justifyContent">
                        <option>flex-start</option>
                        <option>flex-end</option>
                        <option>center</option>
                        <option>space-between</option>
                        <option>space-around</option>
                        <option>space-evenly</option>
                    </select>
                </div>
                 <div class="control-group">
                    <label>align-items</label>
                    <select v-model="flexState.alignItems">
                        <option>flex-start</option>
                        <option>flex-end</option>
                        <option>center</option>
                        <option>stretch</option>
                        <option>baseline</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>flex-wrap</label>
                     <select v-model="flexState.flexWrap">
                        <option>nowrap</option>
                        <option>wrap</option>
                        <option>wrap-reverse</option>
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

      <button class="copy-button" @click="copyCss">コードをコピー</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive, watch, type CSSProperties } from 'vue';
import VisualBox from './components/VisualBox.vue';
import type { BoxState } from './types';
import interact from 'interactjs';

const boxes = ref<BoxState[]>([]);
const selectedBoxId = ref<string | null>(null);
const sandboxRef = ref<HTMLElement | null>(null);
let boxCounter = 0;
const editMode = ref<'individual' | 'layout'>('individual');

const flexState = reactive({
    direction: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: 10
});

const sandboxStyle = computed((): CSSProperties => {
    if (editMode.value === 'layout') {
        return {
            display: 'flex',
            flexDirection: flexState.direction as any,
            justifyContent: flexState.justifyContent,
            alignItems: flexState.alignItems,
            flexWrap: flexState.flexWrap as any,
            gap: `${flexState.gap}px`
        };
    }
    return {};
});

const generatedIndividualCss = computed(() => {
  const selectedBox = boxes.value.find(b => b.id === selectedBoxId.value);
  if (!selectedBox) return '/* ボックスをクリックして選択してください */';
  const { id, width, height, x, y, angle, zIndex } = selectedBox;
  const code = `
#${id} {
    /* 個別編集モードではpositionで配置します */
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
    flex-direction: ${flexState.direction};
    justify-content: ${flexState.justifyContent};
    align-items: ${flexState.alignItems};
    flex-wrap: ${flexState.flexWrap};
    gap: ${flexState.gap}px;
}`;
    return code.trim().replace(/^ {4}/gm, '    ');
});

const createNewBox = (initialState: Partial<BoxState> = {}) => {
  const sandboxRect = sandboxRef.value?.getBoundingClientRect();
  boxCounter++;
  const id = `box-${boxCounter}`;
  const newBox: BoxState = {
    id: id,
    x: initialState.x ?? (sandboxRect ? sandboxRect.width / 2 - 75 : 100),
    y: initialState.y ?? (sandboxRect ? sandboxRect.height / 2 - 75 : 100),
    width: initialState.width ?? 150,
    height: initialState.height ?? 150,
    angle: initialState.angle ?? 0,
    content: `BOX ${boxCounter}`,
    zIndex: boxCounter,
  };
  boxes.value.push(newBox);
  selectBox(id);
};

const selectBox = (id: string | null) => {
  selectedBoxId.value = id;
};

const deselectAll = () => {
    selectedBoxId.value = null;
}

const handleBoxUpdate = (newState: BoxState) => {
  const index = boxes.value.findIndex(b => b.id === newState.id);
  if (index !== -1) {
    boxes.value[index] = newState;
  }
};

const cloneBox = (originalState: BoxState) => {
    createNewBox({ ...originalState, x: originalState.x + 20, y: originalState.y + 20 });
}

// ★★★ 追加: モード切替時の処理 ★★★
const setEditMode = (mode: 'individual' | 'layout') => {
    editMode.value = mode;
    // レイアウトモードに切り替えたら、全てのボックスの選択を解除する
    if (mode === 'layout') {
        deselectAll();
    }
}

const updateBoxFromCss = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const cssText = target.value;
    const selectedBox = boxes.value.find(b => b.id === selectedBoxId.value);
    if (!selectedBox) return;
    try {
        const widthMatch = cssText.match(/width:\s*(\d*\.?\d+)/);
        const heightMatch = cssText.match(/height:\s*(\d*\.?\d+)/);
        const zIndexMatch = cssText.match(/z-index:\s*(\d+)/);
        const translateMatch = cssText.match(/translate\(\s*(-?\d*\.?\d+)px,\s*(-?\d*\.?\d+)px\)/);
        const rotateMatch = cssText.match(/rotate\(\s*(-?\d*\.?\d+)deg\)/);
        const updates: Partial<BoxState> = {};
        if (widthMatch) updates.width = parseFloat(widthMatch[1]);
        if (heightMatch) updates.height = parseFloat(heightMatch[1]);
        if (zIndexMatch) updates.zIndex = parseInt(zIndexMatch[1], 10);
        if (translateMatch) {
            updates.x = parseFloat(translateMatch[1]);
            updates.y = parseFloat(translateMatch[2]);
        }
        if (rotateMatch) updates.angle = parseFloat(rotateMatch[1]);
        Object.assign(selectedBox, updates);
    } catch (e) {
        console.error("CSSの解析に失敗しました:", e);
    }
};

const copyCss = () => {
    const codeToCopy = editMode.value === 'individual' ? generatedIndividualCss.value : generatedLayoutCss.value;
    if(codeToCopy.startsWith('/*')) return;
    navigator.clipboard.writeText(codeToCopy);
};

onMounted(() => {
    nextTick(() => {
        createNewBox();
        createNewBox();
        createNewBox();
        selectBox(null);
    });

    interact('.box')
        .on('down', (event) => {
            if (editMode.value === 'individual') {
                selectBox(event.currentTarget.id);
            }
            event.stopPropagation();
        })
        .draggable({
            listeners: {
                start(event) {
                    if (event.altKey) {
                        const originalBox = boxes.value.find(b => b.id === event.target.id);
                        if (originalBox) cloneBox({ ...originalBox });
                        event.interaction.stop();
                    }
                },
                move(event) {
                    const box = boxes.value.find(b => b.id === event.target.id);
                    if (box) {
                        handleBoxUpdate({ ...box, x: box.x + event.dx, y: box.y + event.dy });
                    }
                }
            },
            modifiers: [interact.modifiers.restrictRect({ restriction: 'parent' })]
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move(event) {
                    const box = boxes.value.find(b => b.id === event.target.id);
                    if(box) {
                        handleBoxUpdate({
                            ...box,
                            width: event.rect.width,
                            height: event.rect.height,
                            x: box.x + event.deltaRect.left,
                            y: box.y + event.deltaRect.top,
                        });
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
                const box = boxes.value.find(b => b.id === boxElement.id);
                if(box) {
                    const angle = Math.atan2(event.clientY - event.interaction.boxCenterY, event.clientX - event.interaction.boxCenterX);
                    handleBoxUpdate({ ...box, angle: angle * (180 / Math.PI) + 90 });
                }
            }
        });
    
    watch(editMode, (newValue) => {
        interact('.box').draggable({ enabled: newValue === 'individual' });
        interact('.box').resizable({ enabled: newValue === 'individual' });
        interact('.rotate-handle').draggable({ enabled: newValue === 'individual' });
    });
});
</script>

<style>
/* ... (グローバルスタイルは変更なし) ... */
body { font-family: 'M PLUS Rounded 1c', sans-serif; background-color: #f4f7f9; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
#app { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.main-container { display: flex; width: 95%; max-width: 1200px; height: 90vh; max-height: 800px; background: #fff; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
.sandbox-container { flex: 1; padding: 30px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; }
.instructions { width: 100%; text-align: center; padding: 10px; background-color: #e9f5e9; border-radius: 8px; margin-bottom: 20px; color: #2c6e49; }
#sandbox { width: 100%; flex-grow: 1; border: 2px dashed #d0dbe3; border-radius: 10px; position: relative; background-image: linear-gradient(to right, #eef2f5 1px, transparent 1px), linear-gradient(to bottom, #eef2f5 1px, transparent 1px); background-size: 20px 20px; }
.code-container { width: 45%; min-width: 450px; background-color: #2d2d2d; color: #f8f8f2; padding: 30px; display: flex; flex-direction: column; box-sizing: border-box; border-left: 1px solid #ddd; }
.code-container h2 { margin: 0 0 15px 0; font-size: 1.6em; border-bottom: 2px solid #444; padding-bottom: 10px; }

.mode-tabs { display: flex; margin-bottom: 20px; background-color: #444; border-radius: 8px; padding: 5px; }
.mode-tabs button { flex: 1; padding: 10px; border: none; background-color: transparent; color: #ccc; font-size: 1.1em; cursor: pointer; transition: all 0.2s; border-radius: 6px; }
.mode-tabs button.active { background-color: #666; color: white; font-weight: bold; }

/* ★★★ 修正: CSS表示/コントロールパネルのコンテナ ★★★ */
.css-panel {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* flexコンテナ内での縮小を許可 */
}

#css-output-individual, #css-output-layout { 
    flex-shrink: 1;
    background-color: #212121; border: 1px solid #444; border-radius: 8px; padding: 20px; font-family: 'Source Code Pro', monospace; font-size: 1.1em; line-height: 1.6; white-space: pre-wrap; overflow-y: auto; color: #f8f8f2; resize: none;
}
#css-output-individual {
    flex-grow: 1;
}
#css-output-layout {
    flex-grow: 1;
}
#css-output-individual:focus { outline: none; border-color: #ffc107; }

.layout-controls { display: flex; flex-direction: column; gap: 15px; margin-bottom: 15px; }
.control-group { display: flex; flex-direction: column; gap: 8px; }
.control-group label { font-size: 1em; color: #aaa; }
.control-group select, .control-group input[type="range"] { width: 100%; padding: 8px; background-color: #333; border: 1px solid #555; color: white; border-radius: 4px; font-size: 1em; }
.control-group span { text-align: right; color: #aaa; }

.copy-button { display: block; width: 100%; padding: 15px; margin-top: 20px; background-color: #4caf50; color: white; border: none; border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
.copy-button:hover { background-color: #45a049; transform: translateY(-2px); }
.copy-button:active { transform: translateY(0); }
</style>
