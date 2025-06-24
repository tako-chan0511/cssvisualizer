<template>
  <div class="main-container">
    <!-- 左側の操作エリア -->
    <div class="sandbox-container">
      <div class="instructions">
        <b>操作方法:</b> ボックスをクリックで選択。Alt/Option + ドラッグで複写。<br>
        選択中のボックスは角のハンドルで回転。右のコード編集もリアルタイムで反映されます。
      </div>
      <div id="sandbox" ref="sandboxRef" @click.self="deselectAll">
        <VisualBox
          v-for="box in boxes"
          :key="box.id"
          :state="box"
          :is-selected="selectedBoxId === box.id"
        />
      </div>
    </div>
    <!-- 右側のコード表示エリア -->
    <div class="code-container">
      <h2>Generated CSS</h2>
      <textarea 
        id="css-output" 
        :value="generatedCss"
        @input="updateBoxFromCss"
      ></textarea>
      <button class="copy-button" @click="copyCss">コードをコピー</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import VisualBox from './components/VisualBox.vue';
import type { BoxState } from './types';
import interact from 'interactjs';

const boxes = ref<BoxState[]>([]);
const selectedBoxId = ref<string | null>(null);
const sandboxRef = ref<HTMLElement | null>(null);
let boxCounter = 0;

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
    createNewBox({
        ...originalState,
        x: originalState.x + 20,
        y: originalState.y + 20,
    });
}

const generatedCss = computed(() => {
  const selectedBox = boxes.value.find(b => b.id === selectedBoxId.value);
  if (!selectedBox) return '/* ボックスをクリックして選択してください */';
  
  const { id, width, height, x, y, angle, zIndex } = selectedBox;
  const code = `
#${id} {
    width: ${width.toFixed(1)}px;
    height: ${height.toFixed(1)}px;
    z-index: ${zIndex};
    transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg);
}`;
  return code.trim().replace(/^ {4}/gm, '    ');
});


const updateBoxFromCss = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const cssText = target.value;
    const selectedBox = boxes.value.find(b => b.id === selectedBoxId.value);
    if (!selectedBox) return;

    try {
        // 正規表現を使って各プロパティの値を抽出
        const widthMatch = cssText.match(/width:\s*(\d*\.?\d+)/);
        const heightMatch = cssText.match(/height:\s*(\d*\.?\d+)/);
        const zIndexMatch = cssText.match(/z-index:\s*(\d+)/); // ★★★ 修正: z-indexを抽出する正規表現を追加 ★★★
        const translateMatch = cssText.match(/translate\(\s*(-?\d*\.?\d+)px,\s*(-?\d*\.?\d+)px\)/);
        const rotateMatch = cssText.match(/rotate\(\s*(-?\d*\.?\d+)deg\)/);

        const updates: Partial<BoxState> = {};

        if (widthMatch) updates.width = parseFloat(widthMatch[1]);
        if (heightMatch) updates.height = parseFloat(heightMatch[1]);
        if (zIndexMatch) updates.zIndex = parseInt(zIndexMatch[1], 10); // ★★★ 修正: z-indexを更新リストに追加 ★★★
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
    if(generatedCss.value.startsWith('/*')) return;
    navigator.clipboard.writeText(generatedCss.value);
};

onMounted(() => {
    nextTick(() => {
        createNewBox();
        selectBox(null);
    });

    interact('.box')
        .on('down', (event) => {
            selectBox(event.currentTarget.id);
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
                        handleBoxUpdate({
                            ...box,
                            x: box.x + event.dx,
                            y: box.y + event.dy,
                        });
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
});
</script>

<style>
/* ... (スタイルは変更ありません) ... */
body { font-family: 'M PLUS Rounded 1c', sans-serif; background-color: #f4f7f9; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
#app { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.main-container { display: flex; width: 95%; max-width: 1200px; height: 90vh; max-height: 800px; background: #fff; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
.sandbox-container { flex: 1; padding: 30px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; }
.instructions { width: 100%; text-align: center; padding: 10px; background-color: #e9f5e9; border-radius: 8px; margin-bottom: 20px; color: #2c6e49; }
#sandbox { width: 100%; flex-grow: 1; border: 2px dashed #d0dbe3; border-radius: 10px; position: relative; background-image: linear-gradient(to right, #eef2f5 1px, transparent 1px), linear-gradient(to bottom, #eef2f5 1px, transparent 1px); background-size: 20px 20px; }
.code-container { width: 40%; min-width: 400px; background-color: #2d2d2d; color: #f8f8f2; padding: 30px; display: flex; flex-direction: column; box-sizing: border-box; border-left: 1px solid #ddd; }
.code-container h2 { margin-top: 0; margin-bottom: 20px; font-size: 1.8em; border-bottom: 2px solid #444; padding-bottom: 10px; }
#css-output { 
    flex-grow: 1; 
    background-color: #212121; 
    border: 1px solid #444;
    border-radius: 8px; 
    padding: 20px; 
    font-family: 'Source Code Pro', monospace; 
    font-size: 1.1em; 
    line-height: 1.6; 
    white-space: pre-wrap; 
    overflow-y: auto;
    color: #f8f8f2;
    resize: none;
}
#css-output:focus {
    outline: none;
    border-color: #ffc107;
}
.copy-button { display: block; width: 100%; padding: 15px; margin-top: 20px; background-color: #4caf50; color: white; border: none; border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
.copy-button:hover { background-color: #45a049; transform: translateY(-2px); }
.copy-button:active { transform: translateY(0); }
</style>
