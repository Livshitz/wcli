<template>
  <div class="terminal-wrapper">
    <FileSidebar
      v-if="terminal"
      ref="sidebarRef"
      :terminal="terminal"
    />
    <div class="terminal-main">
      <button 
        v-if="!sidebarVisible"
        class="sidebar-toggle-btn" 
        @click="toggleSidebar" 
        title="Open Sidebar (Ctrl+B)"
      >
      <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.25 1.25H21.25M1.25 8.75H21.25M1.25 16.25H21.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      </button>
      <TerminalComponent ref="terminalRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TerminalComponent from './components/TerminalComponent.vue';
import FileSidebar from './components/FileSidebar.vue';

const terminalRef = ref<InstanceType<typeof TerminalComponent> | null>(null);
const sidebarRef = ref<InstanceType<typeof FileSidebar> | null>(null);
const terminal = ref<any>(null);

const sidebarVisible = computed(() => sidebarRef.value?.visible || false);

onMounted(() => {
  // Get terminal instance from TerminalComponent
  // Use setTimeout to ensure TerminalComponent is fully mounted
  setTimeout(() => {
    if (terminalRef.value) {
      terminal.value = terminalRef.value.getTerminal();
    }
  }, 0);
});

function toggleSidebar() {
  sidebarRef.value?.toggle();
}
</script>

<style>
@import './styles/host.css';
@import './styles/terminal.css';
</style>

