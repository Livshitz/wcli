<template>
  <div class="html-viewer">
    <div v-if="!showRaw" class="html-content" v-html="sanitizedHtml"></div>
    <pre v-else class="html-raw">{{ htmlContent }}</pre>
    <div class="html-controls">
      <button @click="toggleRaw" class="control-btn">
        {{ showRaw ? 'Show Rendered' : 'Show Raw' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  html?: string;
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
});

const showRaw = ref(false);
const htmlContent = ref(props.html);

const sanitizedHtml = computed(() => {
  // Basic HTML sanitization to prevent common XSS attacks
  // Remove script tags and event handlers
  let cleaned = htmlContent.value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  return cleaned;
});

function toggleRaw() {
  showRaw.value = !showRaw.value;
}
</script>

<style scoped>
.html-viewer {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
  max-width: 100%;
  overflow: hidden;
}

.html-content {
  background: white;
  color: black;
  padding: 1rem;
  border-radius: 4px;
  max-height: 600px;
  overflow: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.html-content :deep(a) {
  color: #0066cc;
  text-decoration: underline;
}

.html-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.html-content :deep(pre) {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
}

.html-content :deep(code) {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.html-raw {
  background: rgba(0, 0, 0, 0.5);
  color: #00ff00;
  padding: 1rem;
  border-radius: 4px;
  max-height: 600px;
  overflow: auto;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.html-controls {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid rgba(0, 255, 0, 0.5);
  color: #00ff00;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(0, 255, 0, 0.3);
  border-color: #00ff00;
}

.control-btn:active {
  transform: scale(0.98);
}
</style>

