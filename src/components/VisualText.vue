<template>
  <div
    :id="state.id"
    class="visual-element text"
    :class="{ selected: isSelected }"
    :style="elementStyle"
  >
    <!-- contenteditable属性で直接テキスト編集を可能にする -->
    <p 
      :contenteditable="!isLayoutMode" 
      @input="updateContent"
      @blur="onBlur"
      class="text-content"
    >
      {{ state.content }}
    </p>
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties, watch } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', state: ElementState): void;
}>();


const elementStyle = computed((): CSSProperties => {
    // テキスト要素はtransformを使わず、width/heightも自動に任せる方が自然な場合が多い
    // ここでは他の要素と統一感を出すために、同様のスタイルを適用します。
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

// テキスト編集用の関数
const updateContent = (event: Event) => {
    const target = event.target as HTMLParagraphElement;
    const updatedState = { ...props.state, content: target.innerText };
    emit('update', updatedState);
};

// フォーカスが外れた時に、空のテキストをデフォルトに戻す
const onBlur = (event: Event) => {
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
    /* 背景や枠線は基本的に不要 */
    background: transparent;
    color: #333;
    font-size: 1.5em; /* フォントサイズは後でコントロールパネルで変更できるようにする */
    font-weight: bold;
    padding: 10px;
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
