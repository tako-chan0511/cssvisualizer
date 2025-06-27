// src/composables/useLayout.ts
import { ref, reactive, computed, type CSSProperties } from "vue";

// Composable for managing layout (Flexbox & CSS Grid) state and styles
// composables/useLayout.ts

export type LayoutCategory = {
  name: string;
  modes: { id: string; label: string }[];
};

export const layoutCategories: LayoutCategory[] = [
  {
    name: "標準フロー",
    modes: [
      { id: "flow", label: "block/inline" },
      { id: "float", label: "Float" },
      { id: "multicol", label: "マルチカラム" },
    ],
  },
  {
    name: "コンテナレイアウト",
    modes: [
      { id: "flex", label: "Flexbox" },
      { id: "grid", label: "CSS Grid" },
      { id: "table", label: "テーブルレイアウト" },
    ],
  },
  {
    name: "絶対配置系",
    modes: [{ id: "abs", label: "相対＋絶対配置" }],
  },
];

export function useLayout() {
  // マルチカラム用ステート
  const multicolState = reactive({
    count: 3, // column-count: 何列に分割するか
    gap: 16, // column-gap: カラム間の隙間(px)
    fill: 'balance' as 'balance' | 'auto'   // ← 追加
  });
  // レイアウト方式: flow | flex | grid | table | float | abs
  const layoutSystem = ref<string>("flow");

  // 標準フロー時の display モード
  const flowState = reactive({
    display: "block" as "block" | "inline",
  });

  // Flexbox 用ステート
  const flexState = reactive({
    containerHeight: 100,
    direction: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexWrap: "nowrap",
    gap: 10,
  });

  // CSS Grid 用ステート
  const gridState = reactive({
    columns: "1fr 1fr 1fr",
    rows: "auto",
    gap: 10,
    rowGap: 10,
    columnGap: 10,
  });

  /**
   * 標準フロー (block/inline) の display を切り替える
   */
  function setLayoutDisplay(mode: "block" | "inline") {
    flowState.display = mode;
  }

  // サンドボックスの style 属性を計算
  const sandboxStyle = computed<CSSProperties>(() => {
    switch (layoutSystem.value) {
      case "flow":
        return {
          display: flowState.display,
          width: "100%",
        };
      case "multicol":
        return {
          columnCount: multicolState.count,
          columnGap: `${multicolState.gap}px`,
          columnFill:   multicolState.fill,
        };
      case "flex":
        return {
          display: "flex",
          height: `${flexState.containerHeight}%`,
          flexDirection: flexState.direction as any,
          justifyContent: flexState.justifyContent,
          alignItems: flexState.alignItems,
          flexWrap: flexState.flexWrap as any,
          gap: `${flexState.gap}px`,
        };
      case "grid":
        return {
          display: "grid",
          gridTemplateColumns: gridState.columns,
          gridTemplateRows: gridState.rows,
          gap: `${gridState.gap}px`,
          rowGap: `${gridState.rowGap}px`,
          columnGap: `${gridState.columnGap}px`,
        };
      case "float":
        return {
          display: "block",
          // float は子要素で個別指定
        };
      case "table":
        return {
          display: "table",
          width: "100%",
        };
      case "abs":
        return {
          position: "relative",
        };
      default:
        return {};
    }
  });

  // Container の CSS コードを生成
  const generatedLayoutCss = computed(() => {
    switch (layoutSystem.value) {
      case "flow":
        return `#sandbox {\n  display: ${flowState.display};\n}`;
      case "multicol":
        return (
          `/* マルチカラム */\n#sandbox {\n` +
          `  column-count: ${multicolState.count};\n` +
          `  column-gap: ${multicolState.gap}px;\n` +
          `  column-fill: ${multicolState.fill};\n` +
          `}`
        );
      case "flex":
        return `#sandbox {\n  display: flex;\n  height: ${flexState.containerHeight}%;\n  flex-direction: ${flexState.direction};\n  justify-content: ${flexState.justifyContent};\n  align-items: ${flexState.alignItems};\n  flex-wrap: ${flexState.flexWrap};\n  gap: ${flexState.gap}px;\n}`;
      default:
        return `#sandbox {\n  display: grid;\n  grid-template-columns: ${gridState.columns};\n  grid-template-rows: ${gridState.rows};\n  gap: ${gridState.gap}px;\n  row-gap: ${gridState.rowGap}px;\n  column-gap: ${gridState.columnGap}px;\n}`;
    }
  });

  return {
    layoutSystem,
    flowState,
    multicolState,       // ← これを返す
    setLayoutDisplay,
    flexState,
    gridState,
    sandboxStyle,
    generatedLayoutCss,
    layoutCategories,
  };
}
