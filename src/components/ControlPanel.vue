<template>
  <!-- ★★★ このv-ifは重要です。編集対象のオブジェクトがある時のみパネルを表示します。 ★★★ -->
  <div class="controls-panel" v-if="editableState">
    <!-- 背景色のコントロール -->
    <div class="control-group">
      <label for="bg-color">background-color</label>
      <input id="bg-color" type="color" v-model="editableState.backgroundColor">
    </div>

    <!-- 角の丸みのコントロール -->
    <div class="control-group">
      <label for="border-radius">border-radius (px)</label>
      <div class="slider-group">
        <input id="border-radius" type="range" min="0" :max="maxBorderRadius" v-model.number="editableState.borderRadius">
        <span>{{ editableState.borderRadius }}px</span>
      </div>
    </div>

    <!-- 今後、他のコントロールもここに追加していきます -->
    <!-- 例：
    <div class="control-group">
      <label>opacity</label>
      <input type="range" min="0" max="1" step="0.01" v-model.number="editableState.opacity">
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ElementState } from '../types';

// `defineModel`は、v-modelで渡されたデータをリアクティブに扱うためのVue 3.4からの新機能です。
// これにより、親コンポーネントとのデータの同期が非常に簡単になります。
const editableState = defineModel<ElementState>();

// 角の丸みは、要素の幅/高さの半分以上にはならないように上限を設定
const maxBorderRadius = computed(() => {
    if (!editableState.value) return 50;
    return Math.min(editableState.value.width, editableState.value.height) / 2;
});
</script>

<style scoped>
.controls-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 5px; /* 上下のパディングを少し追加 */
  box-sizing: border-box;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.control-group label {
  font-size: 1em;
  color: #aaa;
}
.control-group input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  height: 40px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: transparent; /* 背景は透明にして、ブラウザのカラーピッカーUIを活かす */
  cursor: pointer;
}
/* Webkitブラウザ（Chrome, Safariなど）用のスタイル */
.control-group input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
.control-group input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.control-group .slider-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.control-group input[type="range"] {
  flex-grow: 1;
}
.control-group span {
    color: #fff;
    min-width: 50px; /* 値表示エリアの幅を確保 */
    text-align: right;
}
</style>
