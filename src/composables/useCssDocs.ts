// src/composables/useCssDocs.ts
import { computed, type Ref } from 'vue'
import { cssDocs, type CssDoc } from '@/constants/cssDocs'
import type { ElementState } from '@/types'

/**
 * "background-color" → "backgroundColor" などに変換
 */
function toCamelCase(prop: string) {
  return prop.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// プロパティを表示したい順序
const propOrder = [
  'display',
  'position',
  'top',
  'left',
  'width',
  'height',
  'transform',
  'zIndex',
  'backgroundColor',
  // 必要に応じて他プロパティを追加
]

export function useCssDocs(
  state: Ref<ElementState|null>,
  generatedCss: Ref<string>
) {
  const docs = computed<CssDoc[]>(() => {
    if (!state.value) return []

    // プロパティ部分だけを抽出 (セレクタ部を除去)
    const cssContent = generatedCss.value.replace(/^[^{]*\{/, '')

    // 各プロパティ行を取得して camelCase 化
    const propsList = cssContent
      .split(';')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => toCamelCase(line.split(':')[0].trim()))

    // cssDocs マップから Doc を取り出す (key付き)
    let list = propsList
      .map(prop => ({ key: prop, doc: cssDocs[prop] }))
      .filter(item => item.doc !== undefined)
      .map(item => ({ key: item.key, ...item.doc! }))

    // transform が使われている場合、補助的に position/top/left を追加
    if (propsList.includes('transform')) {
      ['position', 'top', 'left'].forEach(key => {
        const doc = cssDocs[key]
        if (doc && !list.some(item => item.key === key)) {
          list.push({ key, ...doc })
        }
      })
    }

    // propOrder に従ってソートして返却
    return list.sort((a, b) => {
      const ai = propOrder.indexOf(a.key)
      const bi = propOrder.indexOf(b.key)
      const pa = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
      const pb = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
      return pa - pb
    })
  })

  return { docs }
}
