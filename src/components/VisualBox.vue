<template>
  <div
    :id="state.id"
    class="box"
    :class="{ selected: isSelected }"
    :style="boxStyle"
  >
    {{ state.content }}
    <div v-if="isSelected" class="rotate-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import type { BoxState } from '../types';

// propsは親コンポーネント(App.vue)から渡されるデータ。
// このコンポーネントは、このデータに基づいて自身の見た目を決定します。
const props = defineProps<{
  state: BoxState;
  isSelected: boolean;
}>();

// 見た目は常に親から渡されるprops(`state`)に追従する
// このコンポーネント自身は位置(x, y)やサイズ(width, height)のデータを持たない
const boxStyle = computed((): CSSProperties => ({
    width: `${props.state.width}px`,
    height: `${props.state.height}px`,
    zIndex: props.state.zIndex,
    // transformプロパティで位置、回転をまとめて設定
    position: 'absolute', // interact.jsが正しく座標を計算するために必要
    left: '0px',
    top: '0px',
    transform: `translate(${props.state.x}px, ${props.state.y}px) rotate(${props.state.angle}deg)`,
}));

// onMountedフックやinteract.jsの初期化は、すべて親のApp.vueで行うため、
// このコンポーネント内では完全に不要になります。
</script>

<style scoped>
.box {
    background: linear-gradient(135deg, #6dd5ed, #2193b0);
    color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(33, 147, 176, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    font-weight: bold;
    cursor: grab;
    touch-action: none;
    box-sizing: border-box;
    border: 3px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.box:active {
    cursor: grabbing;
}
.box.selected {
    border-color: #ffc107;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
    z-index: 10 !important; /* 選択中は最前面に */
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
