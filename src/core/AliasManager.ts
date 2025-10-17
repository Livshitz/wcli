export class AliasManager {
  private aliases: Map<string, string> = new Map();

  constructor() {
    // Initialize with common shell aliases
    this.setDefaultAliases();
  }

  private setDefaultAliases(): void {
    // Common ls aliases
    this.aliases.set('l', 'ls');
    this.aliases.set('ll', 'ls -la');
    this.aliases.set('la', 'ls -a');
    this.aliases.set('lt', 'ls -lt');
    
    // Common navigation aliases
    this.aliases.set('..', 'cd ..');
    this.aliases.set('...', 'cd ../..');
    this.aliases.set('~', 'cd ~');
    
    // Common utility aliases
    this.aliases.set('h', 'history');
    this.aliases.set('c', 'clear');
    this.aliases.set('cls', 'clear');
  }

  /**
   * Resolve an alias to its expanded command
   * @param input The original command input
   * @returns The resolved command string
   */
  resolve(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return trimmed;

    // Split into command and rest
    const firstSpace = trimmed.indexOf(' ');
    const commandPart = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);
    const restPart = firstSpace === -1 ? '' : trimmed.substring(firstSpace);

    // Check if the command is an alias
    const aliasValue = this.aliases.get(commandPart);
    if (aliasValue) {
      // If the alias contains arguments, merge them with the input arguments
      return aliasValue + restPart;
    }

    return input;
  }

  /**
   * Set an alias
   */
  set(alias: string, command: string): void {
    this.aliases.set(alias, command);
  }

  /**
   * Remove an alias
   */
  unset(alias: string): boolean {
    return this.aliases.delete(alias);
  }

  /**
   * Get an alias value
   */
  get(alias: string): string | undefined {
    return this.aliases.get(alias);
  }

  /**
   * Get all aliases
   */
  getAll(): Map<string, string> {
    return new Map(this.aliases);
  }

  /**
   * Check if an alias exists
   */
  has(alias: string): boolean {
    return this.aliases.has(alias);
  }

  /**
   * Clear all aliases (including defaults)
   */
  clear(): void {
    this.aliases.clear();
  }

  /**
   * Reset to default aliases
   */
  reset(): void {
    this.aliases.clear();
    this.setDefaultAliases();
  }
}

