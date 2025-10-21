import type { TerminalLine } from '../types';

export class LineRenderer {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(line: TerminalLine): HTMLElement {
    const lineElement = document.createElement('div');
    lineElement.className = `terminal-line terminal-line-${line.type}`;
    lineElement.setAttribute('data-id', line.id);

    switch (line.type) {
      case 'input':
        lineElement.innerHTML = `<span class="prompt">${this.escapeHtml(this.getPromptFromLine(line.content))}</span><span class="input-text">${this.escapeHtml(this.getInputFromLine(line.content))}</span>`;
        break;

      case 'output':
        lineElement.innerHTML = this.formatOutput(line.content);
        break;

      case 'error':
        lineElement.innerHTML = `<span class="error-text">${this.escapeHtml(line.content)}</span>`;
        break;

      case 'prompt':
        lineElement.innerHTML = `<span class="prompt">${this.escapeHtml(line.content)}</span>`;
        break;
    }

    return lineElement;
  }

  private getPromptFromLine(content: string): string {
    // Extract prompt if it's in the format "user:path$ command"
    const match = content.match(/^(.+?\$)\s/);
    return match ? match[1] + ' ' : '';
  }

  private getInputFromLine(content: string): string {
    // Extract input after prompt
    const match = content.match(/^.+?\$\s(.*)$/);
    return match ? match[1] : content;
  }

  private formatOutput(content: string): string {
    // Handle ANSI escape codes (basic support)
    let formatted = this.escapeHtml(content);

    // Clear screen codes
    if (formatted.includes('\x1b[2J\x1b[H')) {
      return '<span class="clear-screen"></span>';
    }

    // Color codes (basic support)
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

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  appendLine(line: TerminalLine): void {
    const lineElement = this.render(line);
    
    // Check if this is a clear screen marker
    if (line.type === 'output' && line.content.includes('\x1b[2J\x1b[H')) {
      this.clear();
      return;
    }
    
    this.container.appendChild(lineElement);
    this.scrollToBottom();
  }

  clear(): void {
    this.container.innerHTML = '';
  }

  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight;
  }
}

