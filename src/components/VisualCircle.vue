<template>
  <div
    :id="state.id"
    class="visual-element circle"
    :class="{ selected: isSelected }"
    :style="circleStyle"
  >
    {{ state.content }}
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

const circleStyle = computed((): CSSProperties => {
    if (props.isLayoutMode) {
        // レイアウトモードでは、Flexboxアイテムとしてのスタイルを適用
        return {
            width: `${props.state.width}px`,
            height: `${props.state.height}px`, // 円なので幅と高さを同じにする
            position: 'relative', 
        };
    } else {
        // 個別編集モードでは、絶対配置でスタイルを適用
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
/* visual-elementクラスは、App.vueでinteract.jsの対象とするために共通で付与 */
.visual-element {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    font-weight: bold;
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

/* 円固有のスタイル */
.circle {
    background: linear-gradient(135deg, #ff8c42, #ff3d00);
    color: white;
    border-radius: 50%; /* ★★★ これが円にするための重要なスタイル ★★★ */
    box-shadow: 0 5px 15px rgba(255, 61, 0, 0.4);
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
