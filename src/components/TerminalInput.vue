<template>
  <div class="terminal-input-container">
    <span class="prompt">{{ prompt }}</span>
    <input
      ref="inputRef"
      v-model="localValue"
      type="text"
      class="terminal-input"
      autocomplete="off"
      spellcheck="false"
      @keydown="handleKeyDown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  modelValue: string;
  prompt: string;
  autocompleteFn?: (cursorPos: number) => Promise<{ suggestions: string[]; replacement: string }>;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
  (e: 'interrupt'): void;
  (e: 'typing'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const inputRef = ref<HTMLInputElement | null>(null);
const localValue = ref(props.modelValue);
const history = ref<string[]>(loadHistoryFromStorage());
const historyIndex = ref(history.value.length); // Initialize to end of history
const currentInput = ref('');
const lastSuggestions = ref<string[]>([]);
const suggestionIndex = ref(0);

const HISTORY_STORAGE_KEY = 'wcli_command_history';
const MAX_HISTORY_SIZE = 1000;

// Detect macOS to handle cmd vs ctrl properly
const isMac = typeof navigator !== 'undefined' && /Mac|iPad|iPhone|iPod/.test(navigator.platform);

function loadHistoryFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
  }
  return [];
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.value));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
}

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

function handleKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Tab') {
    lastSuggestions.value = [];
    suggestionIndex.value = 0;
    
    if (!['ArrowUp', 'ArrowDown', 'Enter', 'Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
      emit('typing');
    }
  }

  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      handleSubmit();
      break;

    case 'ArrowUp':
      e.preventDefault();
      handleHistoryUp();
      break;

    case 'ArrowDown':
      e.preventDefault();
      handleHistoryDown();
      break;

    case 'Tab':
      e.preventDefault();
      handleAutocomplete();
      break;

    case 'c':
      // On Mac: Cmd+C = copy (allow browser default), Ctrl+C = interrupt
      // On other platforms: Ctrl+C = interrupt (no Cmd key)
      if (isMac) {
        // On Mac, allow Cmd+C to copy if text is selected
        if (e.metaKey && inputRef.value && inputRef.value.selectionStart !== inputRef.value.selectionEnd) {
          return; // Let browser handle copy
        }
        // On Mac, Ctrl+C interrupts
        if (e.ctrlKey) {
          e.preventDefault();
          handleInterrupt();
        }
      } else {
        // On non-Mac, Ctrl+C interrupts unless text is selected
        if (e.ctrlKey) {
          if (inputRef.value && inputRef.value.selectionStart !== inputRef.value.selectionEnd) {
            return; // Let browser handle copy
          }
          e.preventDefault();
          handleInterrupt();
        }
      }
      break;

    case 'l':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleClear();
      }
      break;

    case 'a':
      // On Mac: Cmd+A = select all (browser default), Ctrl+A = move to start
      // On other platforms: Ctrl+A = move to start
      if (isMac) {
        // On Mac, allow Cmd+A to select all
        if (e.metaKey) {
          return; // Let browser handle select all
        }
        // Ctrl+A moves to start
        if (e.ctrlKey) {
          e.preventDefault();
          if (inputRef.value) {
            inputRef.value.setSelectionRange(0, 0);
          }
        }
      } else {
        // On non-Mac, Ctrl+A moves to start
        if (e.ctrlKey) {
          e.preventDefault();
          if (inputRef.value) {
            inputRef.value.setSelectionRange(0, 0);
          }
        }
      }
      break;

    case 'e':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (inputRef.value) {
          const len = inputRef.value.value.length;
          inputRef.value.setSelectionRange(len, len);
        }
      }
      break;

    case 'u':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (inputRef.value) {
          const cursorPos = inputRef.value.selectionStart || 0;
          localValue.value = localValue.value.slice(cursorPos);
          inputRef.value.setSelectionRange(0, 0);
        }
      }
      break;

    case 'k':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (inputRef.value) {
          const cursorPos = inputRef.value.selectionStart || 0;
          localValue.value = localValue.value.slice(0, cursorPos);
        }
      }
      break;

    case 'w':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        deleteWord();
      }
      break;
  }
}

function handleSubmit() {
  const input = localValue.value.trim();
  
  if (input) {
    if (history.value.length === 0 || history.value[history.value.length - 1] !== input) {
      history.value.push(input);
      
      // Limit history size
      if (history.value.length > MAX_HISTORY_SIZE) {
        history.value = history.value.slice(-MAX_HISTORY_SIZE);
      }
      
      // Save to localStorage
      saveHistoryToStorage();
    }
    emit('submit');
  }
  
  historyIndex.value = history.value.length;
}

function handleHistoryUp() {
  if (historyIndex.value > 0) {
    if (historyIndex.value === history.value.length) {
      currentInput.value = localValue.value;
    }
    historyIndex.value--;
    localValue.value = history.value[historyIndex.value];
  }
}

function handleHistoryDown() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    localValue.value = history.value[historyIndex.value];
  } else if (historyIndex.value === history.value.length - 1) {
    historyIndex.value = history.value.length;
    localValue.value = currentInput.value;
  }
}

async function handleAutocomplete() {
  if (!inputRef.value || !props.autocompleteFn) return;

  const input = localValue.value;
  const cursorPos = inputRef.value.selectionStart || input.length;

  if (lastSuggestions.value.length > 1) {
    suggestionIndex.value = (suggestionIndex.value + 1) % lastSuggestions.value.length;
    localValue.value = lastSuggestions.value[suggestionIndex.value];
    return;
  }

  const result = await props.autocompleteFn(cursorPos);

  if (result.suggestions.length === 1) {
    const beforeCursor = input.slice(0, cursorPos);
    const afterCursor = input.slice(cursorPos);
    const parts = beforeCursor.split(' ');
    parts[parts.length - 1] = result.suggestions[0];
    localValue.value = parts.join(' ') + afterCursor;
    
    const newCursorPos = parts.join(' ').length;
    inputRef.value.setSelectionRange(newCursorPos, newCursorPos);
  } else if (result.suggestions.length > 1) {
    const beforeCursor = input.slice(0, cursorPos);
    const afterCursor = input.slice(cursorPos);
    const parts = beforeCursor.split(' ');
    
    lastSuggestions.value = result.suggestions.map(s => {
      const newParts = [...parts];
      newParts[newParts.length - 1] = s;
      return newParts.join(' ') + afterCursor;
    });
    suggestionIndex.value = 0;
    
    const commonPrefix = findCommonPrefix(result.suggestions);
    if (commonPrefix && commonPrefix.length > result.replacement.length) {
      parts[parts.length - 1] = commonPrefix;
      localValue.value = parts.join(' ') + afterCursor;
      const newCursorPos = parts.join(' ').length;
      inputRef.value.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      localValue.value = lastSuggestions.value[0];
      const newCursorPos = lastSuggestions.value[0].length - afterCursor.length;
      inputRef.value.setSelectionRange(newCursorPos, newCursorPos);
    }
  }
}

function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

function deleteWord() {
  if (!inputRef.value) return;
  
  const cursorPos = inputRef.value.selectionStart || 0;
  const value = localValue.value;
  const beforeCursor = value.slice(0, cursorPos);
  const afterCursor = value.slice(cursorPos);
  
  if (beforeCursor.length === 0) return;
  
  let i = beforeCursor.length - 1;
  
  while (i >= 0 && /[\s/.\-_]/.test(beforeCursor[i])) {
    i--;
  }
  
  while (i >= 0 && !/[\s/.\-_]/.test(beforeCursor[i])) {
    i--;
  }
  
  const newBeforeCursor = beforeCursor.slice(0, i + 1);
  const newCursorPos = newBeforeCursor.length;
  localValue.value = newBeforeCursor + afterCursor;
  
  // Use nextTick to ensure DOM is updated before setting cursor position
  requestAnimationFrame(() => {
    if (inputRef.value) {
      inputRef.value.setSelectionRange(newCursorPos, newCursorPos);
    }
  });
}

function handleInterrupt() {
  emit('interrupt');
  localValue.value = '';
  historyIndex.value = history.value.length;
  currentInput.value = '';
}

function handleClear() {
  emit('submit');
  localValue.value = '';
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});
</script>

