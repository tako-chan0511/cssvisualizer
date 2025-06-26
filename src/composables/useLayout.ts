import { ref, reactive, computed, type CSSProperties } from 'vue';

// Composable for managing layout (Flexbox & CSS Grid) state and styles
export function useLayout() {
  // レイアウト方式: 'flex' | 'grid'
  const layoutSystem = ref<'flex' | 'grid'>('flex');

  // Flexbox 用ステート
  const flexState = reactive({
    containerHeight: 100,
    direction: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: 10,
  });

  // CSS Grid 用ステート
  const gridState = reactive({
    columns: '1fr 1fr 1fr',
    rows: 'auto',
    gap: 10,
    rowGap: 10,
    columnGap: 10,
  });

  // サンドボックスの style 属性を計算
  const sandboxStyle = computed<CSSProperties>(() => {
    if (layoutSystem.value === 'flex') {
      return {
        display: 'flex',
        height: `${flexState.containerHeight}%`,
        flexDirection: flexState.direction as any,
        justifyContent: flexState.justifyContent,
        alignItems: flexState.alignItems,
        flexWrap: flexState.flexWrap as any,
        gap: `${flexState.gap}px`,
      };
    }
    // CSS Grid モード
    return {
      display: 'grid',
      gridTemplateColumns: gridState.columns,
      gridTemplateRows: gridState.rows,
      gap: `${gridState.gap}px`,
      rowGap: `${gridState.rowGap}px`,
      columnGap: `${gridState.columnGap}px`,
    };
  });

  // Container の CSS コードを生成
  const generatedLayoutCss = computed(() => {
    if (layoutSystem.value === 'flex') {
      return `#sandbox {
  display: flex;
  height: ${flexState.containerHeight}%;
  flex-direction: ${flexState.direction};
  justify-content: ${flexState.justifyContent};
  align-items: ${flexState.alignItems};
  flex-wrap: ${flexState.flexWrap};
  gap: ${flexState.gap}px;
}`;
    }
    return `#sandbox {
  display: grid;
  grid-template-columns: ${gridState.columns};
  grid-template-rows: ${gridState.rows};
  gap: ${gridState.gap}px;
  row-gap: ${gridState.rowGap}px;
  column-gap: ${gridState.columnGap}px;
}`;
  });

  return {
    layoutSystem,
    flexState,
    gridState,
    sandboxStyle,
    generatedLayoutCss,
  };
}
