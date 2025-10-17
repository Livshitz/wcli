import type { Terminal } from '@/core/Terminal';
import type { TerminalLine } from '@/types';
import { LineRenderer } from './LineRenderer';
import { InputHandler } from './InputHandler';
import { IntroAnimation } from './IntroAnimation';

export interface TerminalUIConfig {
  showIntroAnimation?: boolean;
  introDuration?: number;
}

export class TerminalUI {
  private terminal: Terminal;
  private container: HTMLElement;
  private outputContainer: HTMLElement;
  private inputContainer: HTMLElement;
  private inputElement: HTMLInputElement;
  private promptElement: HTMLElement;
  private suggestionsContainer: HTMLElement;
  private lineRenderer: LineRenderer;
  private inputHandler: InputHandler;
  private config: Required<TerminalUIConfig>;

  constructor(terminal: Terminal, containerSelector: string, config: TerminalUIConfig = {}) {
    this.config = {
      showIntroAnimation: config.showIntroAnimation ?? true,
      introDuration: config.introDuration ?? 1800,
    };
    this.terminal = terminal;
    
    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`Container not found: ${containerSelector}`);
    }
    this.container = container as HTMLElement;

    this.outputContainer = this.createOutputContainer();
    this.suggestionsContainer = this.createSuggestionsContainer();
    this.inputContainer = this.createInputContainer();
    this.promptElement = this.inputContainer.querySelector('.prompt') as HTMLElement;
    this.inputElement = this.inputContainer.querySelector('input') as HTMLInputElement;

    this.lineRenderer = new LineRenderer(this.outputContainer);
    this.inputHandler = new InputHandler(
      this.inputElement,
      (input) => this.handleInput(input),
      (input, cursorPos) => this.handleAutocomplete(input, cursorPos),
      () => this.handleInterrupt(),
      () => this.hideSuggestions()
    );

    this.setupTerminalCallbacks();
    this.updatePrompt();
    this.inputHandler.focus();
  }

  private createOutputContainer(): HTMLElement {
    const output = document.createElement('div');
    output.className = 'terminal-output';
    this.container.appendChild(output);
    return output;
  }

  private createSuggestionsContainer(): HTMLElement {
    const suggestions = document.createElement('div');
    suggestions.className = 'terminal-suggestions';
    this.container.appendChild(suggestions);
    return suggestions;
  }

  private createInputContainer(): HTMLElement {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'terminal-input-container';
    inputContainer.innerHTML = `
      <span class="prompt"></span>
      <input type="text" class="terminal-input" autocomplete="off" spellcheck="false" />
    `;
    this.container.appendChild(inputContainer);
    return inputContainer;
  }

  private setupTerminalCallbacks(): void {
    this.terminal.onOutput((line: TerminalLine) => {
      this.lineRenderer.appendLine(line);
      this.updatePrompt();
    });
    
    // Inject history into history command
    this.injectHistoryCommand();
  }

  private injectHistoryCommand(): void {
    const historyCmd = this.terminal.getExecutor().getCommand('history');
    if (historyCmd) {
      const originalExecute = historyCmd.execute;
      historyCmd.execute = async (args, options) => {
        (options as any).history = this.inputHandler.getHistory().getAll();
        return originalExecute.call(historyCmd, args, options);
      };
    }
  }

  private async handleInput(input: string): Promise<void> {
    // Hide suggestions
    this.hideSuggestions();
    
    // Add input to output
    const prompt = this.terminal.getPrompt();
    this.lineRenderer.appendLine({
      id: this.generateId(),
      type: 'input',
      content: prompt + input,
      timestamp: new Date(),
    });

    // Execute command
    await this.terminal.executeCommand(input);
    
    // Update prompt after command execution
    this.updatePrompt();
    
    // Focus back on input
    this.inputHandler.focus();
  }

  private async handleAutocomplete(input: string, cursorPos: number): Promise<{ suggestions: string[]; replacement: string }> {
    const beforeCursor = input.slice(0, cursorPos);
    const parts = beforeCursor.trim().split(/\s+/);
    const lastPart = parts[parts.length - 1] || '';

    let result: { suggestions: string[]; replacement: string };

    // If it's the first word, autocomplete commands
    if (parts.length === 1 && !beforeCursor.endsWith(' ')) {
      const commands = this.terminal.getExecutor().getAllCommands();
      const suggestions = commands
        .map(cmd => cmd.name)
        .filter(name => name.startsWith(lastPart))
        .sort();
      
      result = { suggestions, replacement: lastPart };
    } else {
      // Otherwise, autocomplete file paths
      result = await this.autocompleteFilePath(lastPart);
    }

    // Show suggestions if there are multiple
    if (result.suggestions.length > 1) {
      this.showSuggestions(result.suggestions);
    } else {
      this.hideSuggestions();
    }

    return result;
  }

  private showSuggestions(suggestions: string[]): void {
    const maxDisplay = 10;
    const displaySuggestions = suggestions.slice(0, maxDisplay);
    const hasMore = suggestions.length > maxDisplay;

    this.suggestionsContainer.innerHTML = displaySuggestions
      .map(s => `<span class="suggestion-item">${this.escapeHtml(s)}</span>`)
      .join(' ');
    
    if (hasMore) {
      this.suggestionsContainer.innerHTML += ` <span class="suggestion-more">(+${suggestions.length - maxDisplay} more)</span>`;
    }

    this.suggestionsContainer.style.display = 'block';
  }

  private hideSuggestions(): void {
    this.suggestionsContainer.style.display = 'none';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private async autocompleteFilePath(partial: string): Promise<{ suggestions: string[]; replacement: string }> {
    const fs = this.terminal.getFilesystem();
    const cwd = fs.getCwd();

    try {
      // Determine the directory to search and the prefix to match
      let searchDir: string;
      let prefix: string;

      if (partial.includes('/')) {
        // Path contains directory separator
        const lastSlash = partial.lastIndexOf('/');
        const dirPart = partial.slice(0, lastSlash + 1);
        prefix = partial.slice(lastSlash + 1);
        
        if (partial.startsWith('/')) {
          // Absolute path
          searchDir = dirPart || '/';
        } else {
          // Relative path
          searchDir = fs.resolvePath(dirPart || '.', cwd);
        }
      } else {
        // No directory separator - search in current directory
        searchDir = cwd;
        prefix = partial;
      }

      // Get directory entries
      if (!(await fs.exists(searchDir)) || !(await fs.isDirectory(searchDir))) {
        return { suggestions: [], replacement: partial };
      }

      const entries = await fs.readDir(searchDir);
      const matches: string[] = [];

      for (const entry of entries) {
        if (entry.startsWith(prefix)) {
          const fullPath = searchDir === '/' ? `/${entry}` : `${searchDir}/${entry}`;
          const isDir = await fs.isDirectory(fullPath);
          
          // For display, use the original path format
          let displayPath: string;
          if (partial.includes('/')) {
            const lastSlash = partial.lastIndexOf('/');
            const dirPart = partial.slice(0, lastSlash + 1);
            displayPath = dirPart + entry + (isDir ? '/' : '');
          } else {
            displayPath = entry + (isDir ? '/' : '');
          }
          
          matches.push(displayPath);
        }
      }

      return { suggestions: matches.sort(), replacement: partial };
    } catch (error) {
      return { suggestions: [], replacement: partial };
    }
  }

  private handleInterrupt(): void {
    // Handle Ctrl+C - show ^C and start new prompt
    this.lineRenderer.appendLine({
      id: this.generateId(),
      type: 'output',
      content: '^C',
      timestamp: new Date(),
    });
  }

  private updatePrompt(): void {
    const prompt = this.terminal.getPrompt();
    this.promptElement.textContent = prompt;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clear(): void {
    this.lineRenderer.clear();
    this.terminal.clearLines();
  }

  async renderWelcome(): Promise<void> {
    if (this.config.showIntroAnimation) {
      await this.renderIntroAnimation();
    } else {
      // Show simple text logo if animation is disabled
      this.lineRenderer.appendLine({
        id: this.generateId(),
        type: 'output',
        content: 'WCLI - Web Command Line Interface',
        timestamp: new Date(),
      });
    }
    
    const welcomeLines = [
      '',
      'A modular terminal simulator in your browser',
      '',
      'Keyboard Shortcuts:',
      '  Tab           - Autocomplete commands and file paths',
      '  ↑/↓           - Navigate command history',
      '  Ctrl+C        - Interrupt current input',
      '  Ctrl+L        - Clear screen',
      '  Ctrl+A/E      - Jump to beginning/end of line',
      '  Ctrl+U/K      - Delete to beginning/end of line',
      '  Ctrl+W        - Delete word',
      '',
      'Type "help" to see available commands, or try "cat /home/README.txt"',
      '',
    ];

    for (const line of welcomeLines) {
      this.lineRenderer.appendLine({
        id: this.generateId(),
        type: 'output',
        content: line,
        timestamp: new Date(),
      });
    }
  }

  private async renderIntroAnimation(): Promise<void> {
    const animation = new IntroAnimation({
      duration: this.config.introDuration,
      ditherSteps: Math.floor(this.config.introDuration / 150),
      colors: ['#39bae6', '#5ccfe6', '#59c2ff', '#d4bfff'],
    });

    // Create a temporary container for the animation
    const animationContainer = document.createElement('div');
    animationContainer.className = 'intro-animation';
    this.outputContainer.appendChild(animationContainer);

    await animation.animate(
      (content: string, progress: number) => {
        // Update the animation frame
        animationContainer.innerHTML = `<pre class="intro-logo">${this.escapeHtml(content)}</pre>`;
      },
      () => {
        // On complete, replace with colored final logo
        animationContainer.innerHTML = '';
        const logoHtml = animation.getGradientLogo();
        animationContainer.innerHTML = `<pre class="intro-logo intro-logo-final">${logoHtml}</pre>`;
        
        // Add a subtle entrance effect
        animationContainer.classList.add('intro-complete');
      }
    );

    // Small delay to appreciate the final logo
    await this.delay(400);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

