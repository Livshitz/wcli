<template>
  <div ref="containerRef" class="terminal-output">
    <div ref="introSlotRef" class="intro-slot"></div>
    <div
      v-for="line in lines"
      :key="line.id"
      :class="`terminal-line terminal-line-${line.type}`"
      :data-id="line.id"
    >
      <div v-if="line.type === 'component'" :ref="el => setComponentRef(line.id, el)"></div>
      <div v-else v-html="renderLine(line)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, createApp } from 'vue';
import type { TerminalLine } from '@/types';
import { ComponentLoader } from '@/core/ComponentLoader';

interface Props {
  lines: TerminalLine[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const introSlotRef = ref<HTMLElement | null>(null);
const componentRefs = new Map<string, HTMLElement>();
const mountedApps = new Map<string, any>();

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getPromptFromLine(content: string): string {
  const match = content.match(/^(.+?\$)\s/);
  return match ? match[1] + ' ' : '';
}

function getInputFromLine(content: string): string {
  const match = content.match(/^.+?\$\s(.*)$/);
  return match ? match[1] : content;
}

function formatOutput(content: string): string {
  let formatted = escapeHtml(content);

  if (formatted.includes('\x1b[2J\x1b[H')) {
    return '<span class="clear-screen"></span>';
  }

  formatted = formatted
    .replace(/\x1b\[31m/g, '<span class="ansi-red">')
    .replace(/\x1b\[32m/g, '<span class="ansi-green">')
    .replace(/\x1b\[33m/g, '<span class="ansi-yellow">')
    .replace(/\x1b\[34m/g, '<span class="ansi-blue">')
    .replace(/\x1b\[35m/g, '<span class="ansi-magenta">')
    .replace(/\x1b\[36m/g, '<span class="ansi-cyan">')
    .replace(/\x1b\[0m/g, '</span>');

  return `<span class="output-text">${formatted}</span>`;
}

function renderLine(line: TerminalLine): string {
  switch (line.type) {
    case 'input': {
      const prompt = getPromptFromLine(line.content);
      const input = getInputFromLine(line.content);
      return `<span class="prompt">${escapeHtml(prompt)}</span><span class="input-text">${escapeHtml(input)}</span>`;
    }
    case 'output':
      return formatOutput(line.content);
    case 'error':
      return `<span class="error-text">${escapeHtml(line.content)}</span>`;
    case 'prompt':
      return `<span class="prompt">${escapeHtml(line.content)}</span>`;
    default:
      return escapeHtml(line.content);
  }
}

function setComponentRef(lineId: string, el: any) {
  if (el) {
    componentRefs.set(lineId, el);
  }
}

function scrollToBottom() {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
}


async function mountComponent(lineId: string, line: TerminalLine) {
  if (!line.component) return;
  
  const element = componentRefs.get(lineId);
  if (!element) {
    // Element not ready yet, will retry on next watch
    return;
  }
  
  // Don't remount if already mounted
  if (mountedApps.has(lineId)) return;
  
  try {
    console.log('[TerminalOutput] Mounting component:', line.component);
    
    const component = await ComponentLoader.loadComponent(
      line.component.name,
      line.component.source,
      line.component.url
    );
    
    const app = createApp(component, line.component.props || {});
    app.mount(element);
    mountedApps.set(lineId, app);
  } catch (error) {
    console.error(`Failed to mount component for line ${lineId}:`, error);
    element.innerHTML = `<span class="error-text">Failed to load component: ${error instanceof Error ? error.message : String(error)}</span>`;
  }
}

watch(() => props.lines, async () => {
  await nextTick();
  
  // Mount any component lines
  for (const line of props.lines) {
    if (line.type === 'component') {
      await mountComponent(line.id, line);
    }
  }
  
  scrollToBottom();
}, { deep: true });

function getContainer(): HTMLElement | null {
  return containerRef.value;
}

function getIntroSlot(): HTMLElement | null {
  return introSlotRef.value;
}

defineExpose({
  getContainer,
  getIntroSlot,
});
</script>

