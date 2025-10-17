<template>
  <div ref="containerRef" class="terminal-output">
    <div ref="introSlotRef" class="intro-slot"></div>
    <div
      v-for="line in lines"
      :key="line.id"
      :class="`terminal-line terminal-line-${line.type}`"
      :data-id="line.id"
      v-html="renderLine(line)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { TerminalLine } from '@/types';

interface Props {
  lines: TerminalLine[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const introSlotRef = ref<HTMLElement | null>(null);

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

function scrollToBottom() {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
}

watch(() => props.lines, async () => {
  await nextTick();
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

