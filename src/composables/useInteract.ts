// src/composables/useInteract.ts
import { onMounted, watch, Ref } from 'vue'
import interact from 'interactjs'
import type { ElementState } from '@/types'

interface UseInteractParams {
  elements: Ref<ElementState[]>
  editMode: Ref<'individual' | 'layout'>
  selectElement: (id: string | null) => void
  handleElementUpdate: (newState: ElementState) => void
  cloneElement: (originalState: ElementState) => void
  /** ガイドグリッドの表示・スナップ制御 */
  gridEnabled?: Ref<boolean>
  gridSize?:    Ref<number>
}

/**
 * interact.js 周りの初期化／有効化ロジックをまとめる
 */
export function useInteract({
  elements,
  editMode,
  selectElement,
  handleElementUpdate,
  cloneElement,
  gridEnabled,
  gridSize,
}: UseInteractParams) {
  const initializeInteract = () => {
    interact('.visual-element').unset()
    interact('.rotate-handle').unset()

    interact('.visual-element')
      .on('down', event => {
        if (editMode.value === 'individual') {
          selectElement(event.currentTarget.id)
        }
        event.stopPropagation()
      })
      .draggable({
        listeners: {
          start(event) {
            if (event.altKey) {
              const orig = elements.value.find(e => e.id === event.target.id)
              if (orig) cloneElement({ ...orig })
              event.interaction.stop()
            }
          },
          move(event) {
            const el = elements.value.find(e => e.id === event.target.id)
            if (el) {
              handleElementUpdate({
                ...el,
                x: el.x + event.dx,
                y: el.y + event.dy,
              })
            }
          },
          end(event) {
            const el = elements.value.find(e => e.id === event.target.id)
            if (el && gridEnabled?.value) {
              const g = gridSize!.value
              const snappedX = Math.round(el.x / g) * g
              const snappedY = Math.round(el.y / g) * g
              handleElementUpdate({ ...el, x: snappedX, y: snappedY })
            }
          },
        },
        modifiers: [
          interact.modifiers.restrictRect({ restriction: 'parent' }),
        ],
      })
      .resizable({
        edges: { left: true, right: true, top: true, bottom: true },
        listeners: {
          move(event) {
            const el = elements.value.find(e => e.id === event.target.id)
            if (el) {
              const updates: Partial<ElementState> = {
                width:  event.rect.width,
                height: event.rect.height,
                x:      el.x + event.deltaRect.left,
                y:      el.y + event.deltaRect.top,
              }
              if (el.type === 'circle') {
                updates.height = event.rect.width
              }
              handleElementUpdate({ ...el, ...updates })
            }
          },
          end(event) {
            const el = elements.value.find(e => e.id === event.target.id)
            if (el && gridEnabled?.value) {
              const g = gridSize!.value
              const snappedW = Math.round(el.width / g) * g
              const snappedH = Math.round(el.height / g) * g
              handleElementUpdate({ ...el, width: snappedW, height: snappedH })
            }
          },
        },
        modifiers: [
          interact.modifiers.restrictRect({ restriction: 'parent' }),
          interact.modifiers.restrictSize({ min: { width: 50, height: 50 } }),
        ],
      })

    interact('.rotate-handle').draggable({
      onstart(event) {
        const box = (event.target as HTMLElement).parentElement!
        const rect = box.getBoundingClientRect()
        // @ts-ignore
        event.interaction.boxCenterX = rect.left + rect.width / 2
        // @ts-ignore
        event.interaction.boxCenterY = rect.top + rect.height / 2
      },
      onmove(event) {
        const box = (event.target as HTMLElement).parentElement!
        const el = elements.value.find(e => e.id === box.id)
        if (el) {
          const angle =
            (Math.atan2(
              event.clientY - event.interaction.boxCenterY,
              event.clientX - event.interaction.boxCenterX
            ) *
              180) /
              Math.PI +
            90
          handleElementUpdate({ ...el, angle })
        }
      },
    })
  }

  onMounted(() => {
    initializeInteract()
  })

  watch(
    editMode,
    mode => {
      const enabled = mode === 'individual'
      interact('.visual-element').draggable({ enabled })
      interact('.visual-element').resizable({ enabled })
      interact('.rotate-handle').draggable({ enabled })
    },
    { immediate: true }
  )

  return {
    initializeInteract,
  }
}
