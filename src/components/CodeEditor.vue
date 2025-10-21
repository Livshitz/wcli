<template>
  <div class="code-editor-wrapper">
    <div class="editor-header">
      <span class="filename">{{ filename || 'untitled' }}</span>
      <span class="editor-status">{{ statusMessage }}</span>
      <div class="editor-actions">
        <button @click="save" class="btn-save" :disabled="!isDirty">
          Save <span class="shortcut">(Cmd+S)</span>
        </button>
        <button @click="close" class="btn-close">
          Close <span class="shortcut">(Esc)</span>
        </button>
      </div>
    </div>
    <div ref="editorRef" class="code-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import type { IFilesystem } from '../types';
import type { KeyBinding } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

interface Props {
  filename: string;
  content?: string;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
});

// Access filesystem from global terminal instance
const getFilesystem = (): IFilesystem | null => {
  const terminal = (window as any).terminal;
  return terminal?.getFilesystem() || null;
};

const editorRef = ref<HTMLElement | null>(null);
const statusMessage = ref('');
const isDirty = ref(false);
let editorView: EditorView | null = null;
let originalContent = props.content || '';

const emit = defineEmits<{
  saved: [content: string];
  closed: [];
}>();

// Detect language from filename
const getLanguageExtension = (filename: string): Extension => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript();
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return css();
    case 'html':
    case 'htm':
      return html();
    case 'json':
      return json();
    case 'md':
    case 'markdown':
      return markdown();
    default:
      return javascript(); // Default fallback
  }
};

const save = async () => {
  if (!editorView) return;
  
  const fs = getFilesystem();
  if (!fs) {
    statusMessage.value = 'Error: Filesystem not available';
    return;
  }
  
  const content = editorView.state.doc.toString();
  
  try {
    await fs.writeFile(props.filename, content);
    originalContent = content;
    isDirty.value = false;
    statusMessage.value = 'Saved!';
    emit('saved', content);
    
    setTimeout(() => {
      statusMessage.value = '';
    }, 2000);
  } catch (error) {
    statusMessage.value = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const close = () => {
  if (isDirty.value) {
    const confirmed = confirm('You have unsaved changes. Close anyway?');
    if (!confirmed) return;
  }
  
  // Remove the component from the terminal by removing its wrapper
  const wrapper = editorRef.value?.closest('.terminal-line');
  if (wrapper) {
    wrapper.remove();
  }
  
  emit('closed');
};

onMounted(() => {
  if (!editorRef.value) return;
  
  // Get language extension based on filename
  const languageExtension = getLanguageExtension(props.filename);
  
  // Custom keybindings for save, close, and tab
  const customKeymap: KeyBinding[] = [
    {
      key: 'Mod-s',
      preventDefault: true,
      run: () => {
        save();
        return true;
      },
    },
    {
      key: 'Escape',
      preventDefault: true,
      run: () => {
        close();
        return true;
      },
    },
    {
      key: 'Tab',
      preventDefault: true,
      run: (view) => {
        // Insert 2 spaces at cursor position
        view.dispatch(view.state.replaceSelection('  '));
        return true;
      },
    },
    {
      key: 'Shift-Tab',
      preventDefault: true,
      run: (view) => {
        // Remove up to 2 spaces before cursor if they exist
        const { state } = view;
        const pos = state.selection.main.head;
        const line = state.doc.lineAt(pos);
        const beforeCursor = line.text.slice(0, pos - line.from);
        
        if (beforeCursor.endsWith('  ')) {
          view.dispatch({
            changes: { from: pos - 2, to: pos, insert: '' }
          });
        } else if (beforeCursor.endsWith(' ')) {
          view.dispatch({
            changes: { from: pos - 1, to: pos, insert: '' }
          });
        }
        return true;
      },
    },
  ];
  
  const state = EditorState.create({
    doc: props.content || '',
    extensions: [
      lineNumbers(),
      history(),
      // Add custom keymap before default ones so they take precedence
      keymap.of(customKeymap),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      languageExtension,
      syntaxHighlighting(defaultHighlightStyle),
      autocompletion(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const currentContent = update.state.doc.toString();
          isDirty.value = currentContent !== originalContent;
        }
      }),
      EditorView.theme({
        '&': {
          height: '400px',
          fontSize: '14px',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '10px 0',
        },
        '.cm-line': {
          padding: '0 10px',
        },
      }),
    ],
  });
  
  editorView = new EditorView({
    state,
    parent: editorRef.value,
  });
});

onUnmounted(() => {
  editorView?.destroy();
});
</script>

<style scoped>
.code-editor-wrapper {
  background: #1e1e1e;
  border: 1px solid #00ff00;
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #252525;
  border-bottom: 1px solid #00ff00;
  color: #00ff00;
  font-size: 14px;
}

.filename {
  font-weight: bold;
  color: #00ff00;
}

.editor-status {
  color: #888;
  font-size: 12px;
  margin-left: 10px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

button {
  background: #333;
  color: #00ff00;
  border: 1px solid #00ff00;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #00ff00;
  color: #000;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #666;
  border-color: #666;
}

.shortcut {
  opacity: 0.6;
  font-size: 10px;
}

.code-editor {
  background: #1e1e1e;
  color: #d4d4d4;
}

.code-editor :deep(.cm-editor) {
  background: #1e1e1e;
  color: #d4d4d4;
}

.code-editor :deep(.cm-gutters) {
  background: #252525;
  color: #858585;
  border-right: 1px solid #333;
}

.code-editor :deep(.cm-activeLineGutter) {
  background: #2a2a2a;
}

.code-editor :deep(.cm-activeLine) {
  background: #2a2a2a;
}

.code-editor :deep(.cm-selectionBackground) {
  background: #264f78 !important;
}

.code-editor :deep(.cm-cursor) {
  border-left: 2px solid #00ff00 !important;
}

.code-editor :deep(.cm-content) {
  caret-color: #00ff00 !important;
}

/* Syntax highlighting colors - brighter for dark theme */
.code-editor :deep(.cm-keyword) { color: #66d9ef; font-weight: 500; }
.code-editor :deep(.cm-variableName) { color: #f8f8f2; }
.code-editor :deep(.cm-string) { color: #e6db74; }
.code-editor :deep(.cm-number) { color: #ae81ff; }
.code-editor :deep(.cm-comment) { color: #75715e; font-style: italic; }
.code-editor :deep(.cm-operator) { color: #f92672; }
.code-editor :deep(.cm-punctuation) { color: #f8f8f2; }
.code-editor :deep(.cm-propertyName) { color: #a6e22e; }
.code-editor :deep(.cm-function) { color: #a6e22e; font-weight: 500; }
.code-editor :deep(.cm-typeName) { color: #66d9ef; }
.code-editor :deep(.cm-bool) { color: #ae81ff; }
.code-editor :deep(.cm-null) { color: #ae81ff; }
.code-editor :deep(.cm-meta) { color: #f92672; }
.code-editor :deep(.cm-regexp) { color: #e6db74; }
</style>

