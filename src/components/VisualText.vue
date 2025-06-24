<template>
  <div
    :id="state.id"
    class="visual-element text"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @dblclick="enableEditing"
  >
    <p
      ref="textContentRef"
      :contenteditable="isEditing"
      @input="updateContent"
      @blur="onBlur"
      @keydown.esc.stop="disableEditing"
      class="text-content"
    >
      {{ state.content }}
    </p>
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties, watch, nextTick } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', state: ElementState): void;
}>();

// ★★★ 追加: テキスト編集モードの状態管理 ★★★
const isEditing = ref(false);
const textContentRef = ref<HTMLParagraphElement | null>(null);

const elementStyle = computed((): CSSProperties => {
    if (props.isLayoutMode) {
        return {
            position: 'relative',
        };
    } else {
        return {
            width: `${props.state.width}px`,
            height: `${props.state.height}px`,
            zIndex: props.state.zIndex,
            position: 'absolute',
            left: '0px',
            top: '0px',
            transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
        };
    }
});

// ★★★ 追加: ダブルクリックで編集モードを開始する関数 ★★★
const enableEditing = () => {
    if (props.isLayoutMode) return;
    isEditing.value = true;
    // DOMが更新された後にフォーカスを当て、カーソルを末尾に移動
    nextTick(() => {
        if (textContentRef.value) {
            textContentRef.value.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textContentRef.value);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    });
};

// ★★★ 追加: 編集モードを終了する関数 ★★★
const disableEditing = () => {
    isEditing.value = false;
};

// テキスト編集用の関数
const updateContent = (event: Event) => {
    const target = event.target as HTMLParagraphElement;
    const updatedState = { ...props.state, content: target.innerText };
    emit('update', updatedState);
};

// フォーカスが外れた時に編集モードを終了し、空の場合はデフォルトテキストに戻す
const onBlur = (event: Event) => {
    disableEditing();
    const target = event.target as HTMLParagraphElement;
    if (target.innerText.trim() === '') {
        const updatedState = { ...props.state, content: "テキスト" };
        emit('update', updatedState);
    }
}
</script>

<style scoped>
.visual-element {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
    touch-action: none;
    box-sizing: border-box;
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

/* テキスト要素固有のスタイル */
.text {
    background: transparent;
    color: #333;
    font-size: 1.5em;
    font-weight: bold;
    padding: 10px;
    /* ★★★ 修正: ドラッグできない問題を解決するため、テキスト選択を無効化 ★★★ */
    user-select: none;
}

.text-content {
    outline: none;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
}
.text-content[contenteditable="true"] {
    cursor: text;
    user-select: auto; /* 編集モードの時だけテキスト選択を許可 */
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
</style>
