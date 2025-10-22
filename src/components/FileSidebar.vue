<template>
  <div v-if="visible">
    <!-- Backdrop for mobile -->
    <div class="sidebar-backdrop" @click="hide"></div>
    
    <div class="file-sidebar">
      <div class="sidebar-control-bar">
      <button class="control-btn" @click="handleAddFile" title="Add File">
        <span class="icon">📄</span>
      </button>
      <button class="control-btn" @click="handleAddFolder" title="Add Folder">
        <span class="icon">📁</span>
      </button>
      <button class="control-btn" @click="handleGoUp" title="Go Up" :disabled="currentPath === '/'">
        <span class="icon">⬆️</span>
      </button>
      <div class="spacer"></div>
      <button class="control-btn close-btn" @click="hide" title="Close Sidebar (Ctrl+B)">
        <span class="icon">✕</span>
      </button>
    </div>

    <div class="sidebar-path">{{ currentPath }}</div>

    <div class="file-list">
      <div
        v-for="item in sortedItems"
        :key="item.name"
        class="file-item"
        :class="{ 'is-directory': item.isDirectory }"
        @click="handleItemClick(item)"
        @mouseenter="hoveredItem = item.name"
        @mouseleave="hoveredItem = null"
      >
        <span class="file-icon" :style="getFileIconStyle(item)"></span>
        <span class="file-name">{{ item.name }}</span>
        <button
          class="file-actions-btn"
          :class="{ visible: hoveredItem === item.name }"
          @click.stop="toggleActionsMenu(item, $event)"
        >
          ⋯
        </button>
      </div>

      <div v-if="sortedItems.length === 0" class="empty-message">
        Empty directory
      </div>
    </div>

    <!-- Actions popup menu -->
    <div
      v-if="actionsMenuTarget"
      class="actions-menu"
      :style="actionsMenuStyle"
      @click.stop
    >
      <button
        v-if="actionsMenuTarget.isDirectory"
        class="action-item"
        @click="handleOpen(actionsMenuTarget)"
      >
        Open
      </button>
      <button
        v-if="!actionsMenuTarget.isDirectory && isExecutable(actionsMenuTarget)"
        class="action-item"
        @click="handleExecute(actionsMenuTarget)"
      >
        Execute
      </button>
      <button
        v-if="!actionsMenuTarget.isDirectory && isViewable(actionsMenuTarget)"
        class="action-item"
        @click="handleView(actionsMenuTarget)"
      >
        View
      </button>
      <button
        v-if="!actionsMenuTarget.isDirectory"
        class="action-item"
        @click="handleEdit(actionsMenuTarget)"
      >
        Edit
      </button>
      <button class="action-item" @click="handleRename(actionsMenuTarget)">
        Rename
      </button>
      <button class="action-item danger" @click="handleDelete(actionsMenuTarget)">
        Delete
      </button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Terminal } from '../core/Terminal';

interface FileItem {
  name: string;
  isDirectory: boolean;
  extension: string;
}

const props = defineProps<{
  terminal: Terminal;
}>();

const SIDEBAR_VISIBLE_KEY = 'wcli-sidebar-visible';

const visible = ref(true);
const currentPath = ref('/');
const items = ref<FileItem[]>([]);
const hoveredItem = ref<string | null>(null);
const actionsMenuTarget = ref<FileItem | null>(null);
const actionsMenuStyle = ref({});

// Load visibility from localStorage
const storedVisibility = localStorage.getItem(SIDEBAR_VISIBLE_KEY);
if (storedVisibility !== null) {
  visible.value = storedVisibility === 'true';
}

function toggle() {
  visible.value = !visible.value;
  localStorage.setItem(SIDEBAR_VISIBLE_KEY, String(visible.value));
}

function show() {
  visible.value = true;
  localStorage.setItem(SIDEBAR_VISIBLE_KEY, 'true');
}

function hide() {
  visible.value = false;
  localStorage.setItem(SIDEBAR_VISIBLE_KEY, 'false');
}

function isVisible() {
  return visible.value;
}

// Expose methods for external control
defineExpose({
  toggle,
  show,
  hide,
  isVisible,
  visible,
});

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    // Directories first
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });
});

async function loadDirectory() {
  try {
    const fs = props.terminal.getFilesystem();
    currentPath.value = fs.getCwd();
    const entries = await fs.readDir(currentPath.value);
    
    const fileItems: FileItem[] = [];
    for (const entry of entries) {
      const fullPath = currentPath.value === '/' ? `/${entry}` : `${currentPath.value}/${entry}`;
      const isDir = await fs.isDirectory(fullPath);
      const ext = isDir ? '' : getFileExtension(entry);
      fileItems.push({
        name: entry,
        isDirectory: isDir,
        extension: ext,
      });
    }
    
    items.value = fileItems;
  } catch (error) {
    console.error('Failed to load directory:', error);
    items.value = [];
  }
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

function getFileIconStyle(item: FileItem): Record<string, string> {
  if (item.isDirectory) {
    return {
      backgroundColor: '#5ba3d0',
      borderRadius: '2px',
    };
  }
  
  // Simple color coding by file type
  const colorMap: Record<string, string> = {
    js: '#f7df1e',
    ts: '#3178c6',
    vue: '#42b883',
    html: '#e34c26',
    css: '#563d7c',
    json: '#292929',
    md: '#083fa1',
    txt: '#888888',
    sh: '#4eaa25',
    py: '#3776ab',
  };
  
  const color = colorMap[item.extension] || '#999999';
  return {
    backgroundColor: color,
    borderRadius: '2px',
  };
}

function isExecutable(item: FileItem): boolean {
  return ['js', 'sh', 'py'].includes(item.extension);
}

function isViewable(item: FileItem): boolean {
  return ['vue', 'html', 'md', 'png', 'jpg', 'jpeg', 'gif', 'svg'].includes(item.extension);
}

function handleItemClick(item: FileItem) {
  if (item.isDirectory) {
    handleOpen(item);
  }
}

async function handleOpen(item: FileItem) {
  if (!item.isDirectory) return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const newPath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
    fs.setCwd(newPath);
    await loadDirectory();
    closeActionsMenu();
  } catch (error) {
    console.error('Failed to open directory:', error);
  }
}

async function handleAddFile() {
  const filename = prompt('Enter filename:');
  if (!filename) return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const filePath = currentPath.value === '/' ? `/${filename}` : `${currentPath.value}/${filename}`;
    await fs.writeFile(filePath, '');
    await loadDirectory();
  } catch (error) {
    alert(`Failed to create file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleAddFolder() {
  const dirname = prompt('Enter folder name:');
  if (!dirname) return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const dirPath = currentPath.value === '/' ? `/${dirname}` : `${currentPath.value}/${dirname}`;
    await fs.createDir(dirPath);
    await loadDirectory();
  } catch (error) {
    alert(`Failed to create folder: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleGoUp() {
  if (currentPath.value === '/') return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const parentPath = currentPath.value.substring(0, currentPath.value.lastIndexOf('/')) || '/';
    fs.setCwd(parentPath);
    await loadDirectory();
  } catch (error) {
    console.error('Failed to go up:', error);
  }
}

function toggleActionsMenu(item: FileItem, event: MouseEvent) {
  if (actionsMenuTarget.value?.name === item.name) {
    closeActionsMenu();
  } else {
    actionsMenuTarget.value = item;
    
    // Position the menu next to the clicked button
    const button = event.target as HTMLElement;
    const rect = button.getBoundingClientRect();
    actionsMenuStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left - 100}px`, // Offset to the left to show full menu
      zIndex: '1000',
    };
  }
}

function closeActionsMenu() {
  actionsMenuTarget.value = null;
}

async function handleExecute(item: FileItem) {
  const filePath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
  await props.terminal.executeCommand(`exec ${filePath}`);
  closeActionsMenu();
}

async function handleView(item: FileItem) {
  const filePath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
  
  if (item.extension === 'vue') {
    // For .vue files, try to load as component
    const componentName = item.name.replace('.vue', '');
    await props.terminal.executeCommand(`view ${componentName}`);
  } else {
    await props.terminal.executeCommand(`view ${filePath}`);
  }
  closeActionsMenu();
}

async function handleEdit(item: FileItem) {
  const filePath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
  await props.terminal.executeCommand(`code ${filePath}`);
  closeActionsMenu();
}

async function handleRename(item: FileItem) {
  const newName = prompt(`Rename "${item.name}" to:`, item.name);
  if (!newName || newName === item.name) return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const oldPath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
    const newPath = currentPath.value === '/' ? `/${newName}` : `${currentPath.value}/${newName}`;
    
    // Read content, create new file, delete old
    if (item.isDirectory) {
      alert('Renaming directories is not yet supported');
      return;
    }
    
    const content = await fs.readFile(oldPath);
    await fs.writeFile(newPath, content);
    await fs.deleteFile(oldPath);
    await loadDirectory();
    closeActionsMenu();
  } catch (error) {
    alert(`Failed to rename: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleDelete(item: FileItem) {
  const confirmed = confirm(`Delete "${item.name}"?`);
  if (!confirmed) return;
  
  try {
    const fs = props.terminal.getFilesystem();
    const filePath = currentPath.value === '/' ? `/${item.name}` : `${currentPath.value}/${item.name}`;
    await fs.deleteFile(filePath);
    await loadDirectory();
    closeActionsMenu();
  } catch (error) {
    alert(`Failed to delete: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Close actions menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (actionsMenuTarget.value) {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-menu') && !target.closest('.file-actions-btn')) {
      closeActionsMenu();
    }
  }
}

// Handle keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+B to toggle sidebar
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault();
    toggle();
  }
}

let unsubscribeCwd: (() => void) | null = null;
let unsubscribeFs: (() => void) | null = null;

onMounted(async () => {
  await loadDirectory();
  
  // Listen for directory changes
  const fs = props.terminal.getFilesystem();
  unsubscribeCwd = fs.onCwdChange(() => {
    loadDirectory();
  });
  
  unsubscribeFs = fs.onFilesystemChange(() => {
    loadDirectory();
  });
  
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (unsubscribeCwd) unsubscribeCwd();
  if (unsubscribeFs) unsubscribeFs();
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.file-sidebar {
  width: 250px;
  height: 100%;
  background-color: var(--wcli-bg-color, #0a0e14);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  color: var(--wcli-text-color, #b3b9c5);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  transition: transform 0.3s ease;
}

.sidebar-backdrop {
  display: none;
}

/* Responsive: smaller screens */
@media (max-width: 768px) {
  .file-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 75%;
    max-width: 280px;
    z-index: 1001;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .control-btn {
    padding: 5px 8px;
    font-size: 13px;
  }

  .sidebar-path {
    font-size: 11px;
    padding: 6px 10px;
  }

  .file-item {
    padding: 5px 6px;
    font-size: 12px;
  }

  .file-icon {
    width: 12px;
    height: 12px;
  }
}

.sidebar-control-bar {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
}

.control-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  color: var(--wcli-text-color, #b3b9c5);
  font-size: 14px;
  transition: background 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn .icon {
  display: inline-block;
}

.spacer {
  flex: 1;
}

.close-btn {
  font-weight: bold;
  font-size: 16px;
}

.sidebar-path {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--wcli-prompt-color, #39bae6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
  transition: background 0.2s;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.file-item.is-directory {
  font-weight: 500;
}

.file-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions-btn {
  background: transparent;
  border: none;
  color: var(--wcli-text-color, #b3b9c5);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.2s;
  width: 20px;
  flex-shrink: 0;
}

.file-actions-btn.visible {
  opacity: 0.7;
}

.file-actions-btn.visible:hover {
  opacity: 1;
}

.empty-message {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.actions-menu {
  position: fixed;
  background: var(--wcli-bg-color, #0a0e14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 4px;
  min-width: 120px;
  z-index: 1002;
}

.action-item {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--wcli-text-color, #b3b9c5);
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: background 0.2s;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-item.danger {
  color: var(--wcli-error-color, #ff3333);
}

.action-item.danger:hover {
  background: rgba(255, 51, 51, 0.1);
}

/* Scrollbar styling */
.file-list::-webkit-scrollbar {
  width: 8px;
}

.file-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.file-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

