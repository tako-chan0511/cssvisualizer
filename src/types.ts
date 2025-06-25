// src/types.ts

// 操作対象となる要素（ボックス、円など）の状態を定義する共通の型
export interface ElementState {
  id: string;
  // ★★★ 修正: 'text', 'image', 'button' を追加 ★★★
  type: 'box' | 'circle' | 'text' | 'image' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  content: string; // ボックスやボタン、テキスト要素の表示内容
  zIndex: number;

  // ★★★ 追加: 背景色プロパティ ★★★
  backgroundColor: string;
  // ★★★ テクスト関連のプロパティ ★★★
  fontSize?: number
  fontColor?: string
  /** 追加: フォントファミリー */
  fontFamily?: string;
  /** 追加：文字の太さ */
  fontWeight?: string;
  /** 追加：文字スタイル */
  fontStyle?: string;

  // ★★★ 追加: 画像要素のためのプロパティ（オプション） ★★★
  src?: string;
}
