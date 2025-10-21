export interface PromptOptions {
  message: string;
  defaultValue?: string;
  password?: boolean;
  validate?: (input: string) => boolean | string;
}

export interface PromptRequest {
  id: string;
  options: PromptOptions;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

export class PromptManager {
  private currentPrompt: PromptRequest | null = null;
  private onPromptCallback?: (request: PromptRequest) => void;
  private onPromptClearCallback?: () => void;

  /**
   * Request user input with a prompt message
   */
  async prompt(options: string | PromptOptions): Promise<string> {
    const promptOptions: PromptOptions = typeof options === 'string' 
      ? { message: options } 
      : options;

    return new Promise<string>((resolve, reject) => {
      if (this.currentPrompt) {
        reject(new Error('Another prompt is already active'));
        return;
      }

      const request: PromptRequest = {
        id: this.generateId(),
        options: promptOptions,
        resolve: (value: string) => {
          // Validate input if validator provided
          if (promptOptions.validate) {
            const validationResult = promptOptions.validate(value);
            if (validationResult === true) {
              this.currentPrompt = null;
              if (this.onPromptClearCallback) {
                this.onPromptClearCallback();
              }
              resolve(value);
            } else if (typeof validationResult === 'string') {
              reject(new Error(validationResult));
              this.currentPrompt = null;
              if (this.onPromptClearCallback) {
                this.onPromptClearCallback();
              }
            } else {
              reject(new Error('Invalid input'));
              this.currentPrompt = null;
              if (this.onPromptClearCallback) {
                this.onPromptClearCallback();
              }
            }
          } else {
            this.currentPrompt = null;
            if (this.onPromptClearCallback) {
              this.onPromptClearCallback();
            }
            resolve(value);
          }
        },
        reject: (error: Error) => {
          this.currentPrompt = null;
          if (this.onPromptClearCallback) {
            this.onPromptClearCallback();
          }
          reject(error);
        },
      };

      this.currentPrompt = request;

      if (this.onPromptCallback) {
        this.onPromptCallback(request);
      } else {
        reject(new Error('No prompt handler registered'));
        this.currentPrompt = null;
      }
    });
  }

  /**
   * Respond to the current prompt
   */
  respond(value: string): void {
    if (!this.currentPrompt) {
      throw new Error('No active prompt');
    }

    this.currentPrompt.resolve(value);
  }

  /**
   * Cancel the current prompt
   */
  cancel(): void {
    if (this.currentPrompt) {
      this.currentPrompt.reject(new Error('Prompt cancelled'));
    }
  }

  /**
   * Check if there's an active prompt
   */
  hasActivePrompt(): boolean {
    return this.currentPrompt !== null;
  }

  /**
   * Get the current prompt request
   */
  getCurrentPrompt(): PromptRequest | null {
    return this.currentPrompt;
  }

  /**
   * Register callback for when a prompt is requested
   */
  onPrompt(callback: (request: PromptRequest) => void): void {
    this.onPromptCallback = callback;
  }

  /**
   * Register callback for when a prompt is cleared
   */
  onPromptClear(callback: () => void): void {
    this.onPromptClearCallback = callback;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


