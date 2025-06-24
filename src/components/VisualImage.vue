<template>
  <div
    :id="state.id"
    class="visual-element image-container"
    :class="{ selected: isSelected }"
    :style="elementStyle"
  >
    <img :src="state.src" alt="visual element" draggable="false" />
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
    /* 画像がコンテナからはみ出ないように */
    overflow: hidden; 
}
.visual-element:active {
    cursor: grabbing;
}
.visual-element.selected {
    border-color: #ffc107;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
    z-index: 100 !important;
}

/* 画像要素固有のスタイル */
.image-container {
    background-color: #eee; /* 画像が読み込めない場合などのための背景色 */
}
.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 画像の比率を維持しつつ、要素に合わせてトリミング */
    pointer-events: none; /* 画像自体がドラッグされるのを防ぐ */
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
