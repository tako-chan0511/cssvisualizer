// src/composables/useCssGenerator.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ElementState } from '@/types'

export function useCssGenerator(
  elements: Ref<ElementState[]>,
  selectedElementId: Ref<string | null>,
  editMode: Ref<'individual' | 'layout'>,
  flexState: any,
  gridState: any,
  layoutSystem: Ref<string>
) {
  const selectedElement = computed(() =>
    elements.value.find(e => e.id === selectedElementId.value) || null
  )

  const generatedIndividualCss = computed(() => {
    if (!selectedElement.value) {
      return "/* 要素をクリックして選択してください */"
    }
    const el = selectedElement.value
    const {
      id, width, height, x, y, angle, zIndex,
      backgroundColor, fontSize, fontColor,
      fontFamily, fontWeight, fontStyle, type
    } = el

    let css = `#${id} {
    position: absolute;
    width: ${width.toFixed(1)}px;
    height: ${height.toFixed(1)}px;
    background-color: ${backgroundColor || "#ffffff"};
    z-index: ${zIndex};
    transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg);
  }`

    if (['box','text','button','circle'].includes(type)) {
      let fontCss =
        `    color: ${fontColor   || "#000000"};\n` +
        `    font-size: ${fontSize?.toFixed(1) || 16}px;\n` +
        `    font-family: ${fontFamily || "sans-serif"};\n` +
        `    font-weight: ${fontWeight || "normal"};\n` +
        `    font-style: ${fontStyle || "normal"};\n`

      if (type === 'button') {
        fontCss +=
          `    border: none;\n` +
          `    border-radius: 4px;\n` +
          `    padding: 8px 16px;\n`
      }

      css = css.replace(/\}$/, fontCss + `}`)
    }

    return css.trim()
  })

  const generatedLayoutCss = computed(() => {
    switch (layoutSystem.value) {
      case 'flex':
        return `#sandbox {
  display: flex;
  height: ${flexState.containerHeight}%;
  flex-direction: ${flexState.direction};
  justify-content: ${flexState.justifyContent};
  align-items: ${flexState.alignItems};
  flex-wrap: ${flexState.flexWrap};
  gap: ${flexState.gap}px;
}`

      case 'grid':
        return `#sandbox {
  display: grid;
  grid-template-columns: ${gridState.columns};
  grid-template-rows: ${gridState.rows};
  row-gap: ${gridState.rowGap}px;
  column-gap: ${gridState.columnGap}px;
}`

      case 'flow':
        return `/* 標準フロー (block/inline) */
#sandbox {
  display: block;
}`

      case 'float':
        return `/* Float レイアウト */
#sandbox > * {
  float: left;
}`

      case 'multicol':
        return `/* マルチカラム */
#sandbox {
  column-count: 3;
  column-gap: 1em;
}`

      case 'table':
        return `/* テーブルレイアウト */
#sandbox {
  display: table;
  width: 100%;
}
#sandbox > * {
  display: table-cell;
}`

      case 'abs':
        return `/* 相対＋絶対配置 */
#sandbox {
  position: relative;
}
#sandbox > * {
  position: absolute;
}`

      default:
        return `/* 未対応のレイアウト方式です */`
    }
  })

  function updateElementFromCss(event: Event) {
    const cssText = (event.target as HTMLTextAreaElement).value
    const el = selectedElement.value
    if (!el) return
    const updates: Partial<ElementState> = {}
    const m = {
      w: cssText.match(/width:\s*(\d+\.?\d*)px/),
      h: cssText.match(/height:\s*(\d+\.?\d*)px/),
      bg: cssText.match(/background-color:\s*(#[0-9A-Fa-f]+)/),
      c: cssText.match(/color:\s*(#[0-9A-Fa-f]+)/),
      fs: cssText.match(/font-size:\s*(\d+\.?\d*)px/),
      tr: cssText.match(/translate\(\s*(-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px/),
      rt: cssText.match(/rotate\(\s*(-?\d+\.?\d*)deg/)
    }
    if (m.w) updates.width = parseFloat(m.w[1])
    if (m.h) updates.height = parseFloat(m.h[1])
    if (m.bg) updates.backgroundColor = m.bg[1]
    if (m.c) updates.fontColor = m.c[1]
    if (m.fs) updates.fontSize = parseFloat(m.fs[1])
    if (m.tr) {
      updates.x = parseFloat(m.tr[1])
      updates.y = parseFloat(m.tr[2])
    }
    if (m.rt) updates.angle = parseFloat(m.rt[1])
    Object.assign(el, updates)
  }

  function copyCss() {
    const code = editMode.value === 'individual'
      ? generatedIndividualCss.value
      : generatedLayoutCss.value
    if (!code.startsWith('/*')) navigator.clipboard.writeText(code)
  }

  return {
    selectedElement,
    generatedIndividualCss,
    generatedLayoutCss,
    updateElementFromCss,
    copyCss
  }
}
