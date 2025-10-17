import type { TerminalHistory } from '@/types';

export class InputHistoryManager implements TerminalHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private currentInput: string = '';

  add(command: string): void {
    if (command.trim() && (this.history.length === 0 || this.history[this.history.length - 1] !== command)) {
      this.history.push(command);
    }
    this.currentIndex = this.history.length;
  }

  get(index: number): string | undefined {
    return this.history[index];
  }

  getPrevious(): string | undefined {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return undefined;
  }

  getNext(): string | undefined {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else if (this.currentIndex === this.history.length - 1) {
      this.currentIndex = this.history.length;
      return this.currentInput;
    }
    return undefined;
  }

  search(query: string): string[] {
    return this.history.filter(cmd => cmd.includes(query));
  }

  getAll(): string[] {
    return [...this.history];
  }

  reset(): void {
    this.currentIndex = this.history.length;
  }

  setCurrentInput(input: string): void {
    this.currentInput = input;
  }
}

export class InputHandler {
  private inputElement: HTMLInputElement;
  private history: InputHistoryManager;
  private onSubmit: (input: string) => void;
  private onAutocomplete?: (input: string, cursorPos: number) => Promise<{ suggestions: string[]; replacement: string }>;
  private onInterrupt?: () => void;
  private onTyping?: () => void;
  private lastSuggestions: string[] = [];
  private suggestionIndex: number = 0;

  constructor(
    inputElement: HTMLInputElement,
    onSubmit: (input: string) => void,
    onAutocomplete?: (input: string, cursorPos: number) => Promise<{ suggestions: string[]; replacement: string }>,
    onInterrupt?: () => void,
    onTyping?: () => void
  ) {
    this.inputElement = inputElement;
    this.history = new InputHistoryManager();
    this.onSubmit = onSubmit;
    this.onAutocomplete = onAutocomplete;
    this.onInterrupt = onInterrupt;
    this.onTyping = onTyping;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.inputElement.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Reset suggestions on any key except Tab
    if (e.key !== 'Tab') {
      this.lastSuggestions = [];
      this.suggestionIndex = 0;
      
      // Notify about typing (for hiding suggestions)
      if (this.onTyping && !['ArrowUp', 'ArrowDown', 'Enter', 'Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
        this.onTyping();
      }
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.handleSubmit();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.handleHistoryUp();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.handleHistoryDown();
        break;

      case 'Tab':
        e.preventDefault();
        this.handleAutocomplete();
        break;

      case 'c':
        // On Mac (metaKey), allow Cmd+C for copying if there's a selection
        if (e.metaKey && this.inputElement.selectionStart !== this.inputElement.selectionEnd) {
          // Let the browser handle copy
          return;
        }
        // Ctrl+C always interrupts, Cmd+C only interrupts if no selection
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.handleInterrupt();
        }
        break;

      case 'l':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.handleClear();
        }
        break;

      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.inputElement.setSelectionRange(0, 0);
        }
        break;

      case 'e':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const len = this.inputElement.value.length;
          this.inputElement.setSelectionRange(len, len);
        }
        break;

      case 'u':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const cursorPos = this.inputElement.selectionStart || 0;
          this.inputElement.value = this.inputElement.value.slice(cursorPos);
          this.inputElement.setSelectionRange(0, 0);
        }
        break;

      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const cursorPos = this.inputElement.selectionStart || 0;
          this.inputElement.value = this.inputElement.value.slice(0, cursorPos);
        }
        break;

      case 'w':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.deleteWord();
        }
        break;
    }
  }

  private handleSubmit(): void {
    const input = this.inputElement.value.trim();
    
    if (input) {
      this.history.add(input);
      this.onSubmit(input);
    }
    
    this.inputElement.value = '';
    this.history.reset();
  }

  private handleHistoryUp(): void {
    const prev = this.history.getPrevious();
    if (prev !== undefined) {
      if (this.history.get(this.history.getAll().length - 1) === undefined) {
        this.history.setCurrentInput(this.inputElement.value);
      }
      this.inputElement.value = prev;
    }
  }

  private handleHistoryDown(): void {
    const next = this.history.getNext();
    if (next !== undefined) {
      this.inputElement.value = next;
    }
  }

  private async handleAutocomplete(): Promise<void> {
    if (!this.onAutocomplete) return;

    const input = this.inputElement.value;
    const cursorPos = this.inputElement.selectionStart || input.length;

    // If we're cycling through suggestions
    if (this.lastSuggestions.length > 1) {
      this.suggestionIndex = (this.suggestionIndex + 1) % this.lastSuggestions.length;
      this.inputElement.value = this.lastSuggestions[this.suggestionIndex];
      return;
    }

    const result = await this.onAutocomplete(input, cursorPos);

    if (result.suggestions.length === 1) {
      // Single match - autocomplete it by replacing the last part
      const beforeCursor = input.slice(0, cursorPos);
      const afterCursor = input.slice(cursorPos);
      const parts = beforeCursor.split(' ');
      parts[parts.length - 1] = result.suggestions[0];
      this.inputElement.value = parts.join(' ') + afterCursor;
      // Move cursor to end of completed part
      const newCursorPos = parts.join(' ').length;
      this.inputElement.setSelectionRange(newCursorPos, newCursorPos);
    } else if (result.suggestions.length > 1) {
      // Multiple matches - store them for cycling
      const beforeCursor = input.slice(0, cursorPos);
      const afterCursor = input.slice(cursorPos);
      const parts = beforeCursor.split(' ');
      
      this.lastSuggestions = result.suggestions.map(s => {
        const newParts = [...parts];
        newParts[newParts.length - 1] = s;
        return newParts.join(' ') + afterCursor;
      });
      this.suggestionIndex = 0;
      
      // Find common prefix
      const commonPrefix = this.findCommonPrefix(result.suggestions);
      if (commonPrefix && commonPrefix.length > result.replacement.length) {
        parts[parts.length - 1] = commonPrefix;
        this.inputElement.value = parts.join(' ') + afterCursor;
        const newCursorPos = parts.join(' ').length;
        this.inputElement.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        // Show first suggestion
        this.inputElement.value = this.lastSuggestions[0];
        const newCursorPos = this.lastSuggestions[0].length - afterCursor.length;
        this.inputElement.setSelectionRange(newCursorPos, newCursorPos);
      }
    }
  }

  private findCommonPrefix(strings: string[]): string {
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

  private deleteWord(): void {
    const cursorPos = this.inputElement.selectionStart || 0;
    const value = this.inputElement.value;
    const beforeCursor = value.slice(0, cursorPos);
    const afterCursor = value.slice(cursorPos);
    
    if (beforeCursor.length === 0) return;
    
    // zsh/macOS Terminal behavior: Ctrl+W deletes back to word boundaries
    // Word boundaries include whitespace and special chars like / . - etc.
    let i = beforeCursor.length - 1;
    
    // Skip any trailing whitespace or delimiters
    while (i >= 0 && /[\s/.\-_]/.test(beforeCursor[i])) {
      i--;
    }
    
    // Delete until we hit a word boundary (whitespace or delimiter) or the beginning
    while (i >= 0 && !/[\s/.\-_]/.test(beforeCursor[i])) {
      i--;
    }
    
    const newBeforeCursor = beforeCursor.slice(0, i + 1);
    this.inputElement.value = newBeforeCursor + afterCursor;
    this.inputElement.setSelectionRange(newBeforeCursor.length, newBeforeCursor.length);
  }

  private handleInterrupt(): void {
    if (this.onInterrupt) {
      this.onInterrupt();
    }
    this.inputElement.value = '';
  }

  private handleClear(): void {
    // This would trigger a clear in the terminal
    this.onSubmit('clear');
    this.inputElement.value = '';
  }

  focus(): void {
    this.inputElement.focus();
  }

  getHistory(): InputHistoryManager {
    return this.history;
  }
}

