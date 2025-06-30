// src/constants/cssDocs.ts
export interface CssDoc {
  label: string         // プロパティ名（日本語）
  description: string   // 短い説明
  mdn: string           // MDNへのURL
}

export const cssDocs: Record<string, CssDoc> = {
  display: {
    label: "表示形式",
    description: "要素のレイアウト方式を指定します。flex, grid, blockなど。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/display",
  },
  position: {
    label: "位置指定",
    description: "要素の配置方法を指定します。static, relative, absoluteなど。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/position",
  },
  top: {
    label: "上位置",
    description: "position で基準に対する上方向のオフセットを指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/top",
  },
  left: {
    label: "左位置",
    description: "position で基準に対する左方向のオフセットを指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/left",
  },
  width: {
    label: "幅",
    description: "要素の幅を指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/width",
  },
  height: {
    label: "高さ",
    description: "要素の高さを指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/height",
  },
  backgroundColor: {
    label: "背景色",
    description: "要素の背景色を指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/background-color",
  },
  transform: {
    label: "変形",
    description: "要素の回転・拡大縮小・移動をまとめて指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/transform",
  },
  zIndex: {
    label: "重なり順序",
    description: "要素の重なり順を指定します。",
    mdn: "https://developer.mozilla.org/docs/Web/CSS/z-index",
  },
  /* 必要に応じて他のプロパティも追加 */
}
