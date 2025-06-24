<template>
  <div
    :id="state.id"
    class="visual-element button-container"
    :class="{ selected: isSelected }"
    :style="elementStyle"
  >
    <!-- ボタン要素として表示 -->
    <button>{{ state.content }}</button>
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import type { ElementState } from '../types';

const props = defineProps<{
  state: ElementState;
  isSelected: boolean;
  isLayoutMode: boolean;
}>();

const elementStyle = computed((): CSSProperties => {
    if (props.isLayoutMode) {
        // レイアウトモード
        return {
            width: `${props.state.width}px`,
            height: `${props.state.height}px`,
        };
    } else {
        // 個別編集モード
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

/* ボタン要素固有のスタイル */
.button-container button {
    width: 100%;
    height: 100%;
    border: none;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    font-size: 1.2em; /* コンテナのサイズに対して相対的に調整 */
    font-weight: bold;
    border-radius: 8px;
    cursor: grab;
    transition: background-color 0.3s;
    padding: 10px 20px;
    box-sizing: border-box;
    white-space: nowrap;
}
.button-container:active button {
    cursor: grabbing;
}
.button-container button:hover {
    background: linear-gradient(135deg, #0056b3, #007bff);
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
