<template>
  <div
    :id="state.id"
    class="box"
    :class="{ selected: isSelected }"
    :style="boxStyle"
  >
    {{ state.content }}
    <!-- 個別編集モードの時だけ回転ハンドルを表示 -->
    <div v-if="isSelected && !isLayoutMode" class="rotate-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import type { BoxState } from '../types';

const props = defineProps<{
  state: BoxState;
  isSelected: boolean;
  isLayoutMode: boolean; // レイアウトモードかどうかを親から受け取る
}>();

// レイアウトモードかどうかでスタイルを切り替える
const boxStyle = computed((): CSSProperties => {
    if (props.isLayoutMode) {
        // レイアウトモードでは、Flexboxアイテムとしてのスタイルを適用
        return {
            width: `${props.state.width}px`,
            height: `${props.state.height}px`,
            // transform や position はFlexboxコンテナが制御するのでここでは不要
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

// onMountedフックやinteract.jsの初期化はApp.vueに移動したため、このコンポーネントでは完全に不要
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
    /* positionは動的に設定するため、ここでは削除 */
    box-sizing: border-box;
    border: 3px solid transparent;
    transition: all 0.2s; 
    flex-shrink: 0; /* Flexboxコンテナ内で縮まないようにする */
}
.box:active {
    cursor: grabbing;
}
.box.selected {
    border-color: #ffc107;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
    z-index: 10 !important;
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
