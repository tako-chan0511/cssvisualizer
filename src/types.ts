// src/types.ts の変更案

export interface ElementState { // BoxStateからElementStateに改名
  id: string;
  type: 'box' | 'circle' | 'text' | 'image' | 'button'; // ★要素の種類を追加
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  content: string; // テキストやボタンのラベルに利用
  zIndex: number;
  // 画像用のプロパティなどをここに追加していく
  // src?: string; 
  // スタイル用のプロパティ
  // backgroundColor?: string;
  // borderRadius?: string;
}
