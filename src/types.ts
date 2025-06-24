// src/types.ts

// 操作対象となる要素（ボックス、円など）の状態を定義する共通の型
export interface ElementState {
  id: string;
  type: 'box' | 'circle'; // ★★★ 修正: 実装済みの型のみに限定 ★★★
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  content: string;
  zIndex: number;
}
