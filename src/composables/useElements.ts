import { ref, computed } from 'vue';
import type { ElementState } from '../types';

/**
 * Composable for managing visual elements and selection state
 */
export function useElements() {
  // List of elements on the canvas
  const elements = ref<ElementState[]>([]);
  // Currently selected element ID
  const selectedElementId = ref<string | null>(null);

  // Computed reference to the currently selected element object
  const selectedElement = computed<ElementState | null>(
    () => elements.value.find(el => el.id === selectedElementId.value) || null
  );

  // Internal counter to generate unique element IDs
  let elementCounter = 0;

  /**
   * Add a new element of the given type to the canvas
   */
  function addElement(
    type: ElementState['type'],
    initialState: Partial<ElementState> = {}
  ) {
    elementCounter++;
    const id = `${type}-${elementCounter}`;
    const defaults: Partial<ElementState> = {
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      angle: 0,
      content: `${type.toUpperCase()} ${elementCounter}`,
      zIndex: elementCounter,
      backgroundColor: type === 'box' ? '#6dd5ed' : undefined,
      fontSize: 16,
      fontColor: '#000000',
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
    };

    if (type === 'text') {
      defaults.height = 50;
      defaults.content = 'テキスト要素';
    }
    if (type === 'button') {
      defaults.height = 60;
      defaults.content = 'ボタン';
    }
    if (type === 'image') {
      defaults.content = '';
      defaults.src = 'https://placehold.co/600x400/EEE/31343C?text=Image';
    }

    const newElement: ElementState = {
      id,
      type,
      ...defaults,
      ...initialState,
    } as ElementState;

    elements.value.push(newElement);
    selectElement(id);
  }

  /**
   * Select an element by its ID
   */
  function selectElement(id: string | null) {
    selectedElementId.value = id;
  }

  /**
   * Deselect any currently selected element
   */
  function deselectAll() {
    selectedElementId.value = null;
  }

  /**
   * Update an element's state
   */
  function handleElementUpdate(newState: ElementState) {
    const idx = elements.value.findIndex(el => el.id === newState.id);
    if (idx !== -1) {
      elements.value[idx] = newState;
    }
  }

  /**
   * Clone an existing element, offsetting its position
   */
  function cloneElement(original: ElementState) {
    addElement(original.type, {
      x: original.x + 20,
      y: original.y + 20,
      width: original.width,
      height: original.height,
      angle: original.angle,
    });
  }

  /**
   * Delete the currently selected element
   */
  function deleteSelectedElement() {
    if (!selectedElementId.value) return;
    const idx = elements.value.findIndex(el => el.id === selectedElementId.value);
    if (idx !== -1) {
      elements.value.splice(idx, 1);
      deselectAll();
    }
  }

  return {
    elements,
    selectedElementId,
    selectedElement,
    addElement,
    selectElement,
    deselectAll,
    handleElementUpdate,
    cloneElement,
    deleteSelectedElement,
  };
}
