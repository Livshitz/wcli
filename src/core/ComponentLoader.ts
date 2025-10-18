import { defineAsyncComponent, type Component } from 'vue';

export class ComponentLoader {
  private static remoteComponentCache = new Map<string, Component>();
  private static localComponents: Record<string, () => Promise<any>> | null = null;

  /**
   * Load local components using Vite's glob import for auto-discovery
   */
  private static getLocalComponents(): Record<string, () => Promise<any>> {
    if (!this.localComponents) {
      // Auto-discover all .vue files in components directory and subdirectories
      const modules = import.meta.glob('@/components/**/*.vue');
      
      // Convert paths to component names
      // e.g., '@/components/Matrix.vue' -> 'Matrix'
      // e.g., '@/components/demo/MatrixClock.vue' -> 'demo/MatrixClock'
      this.localComponents = Object.entries(modules).reduce((acc, [path, loader]) => {
        // Extract everything after /components/
        const match = path.match(/\/components\/(.+)\.vue$/);
        if (match) {
          const componentName = match[1];
          acc[componentName] = loader as () => Promise<any>;
        }
        return acc;
      }, {} as Record<string, () => Promise<any>>);
      
      console.log('[ComponentLoader] Auto-discovered components:', Object.keys(this.localComponents));
    }
    
    return this.localComponents;
  }

  /**
   * Load a remote component from a URL
   */
  private static async loadRemoteComponent(name: string, url: string): Promise<Component> {
    // Check cache first
    const cacheKey = `${name}:${url}`;
    if (this.remoteComponentCache.has(cacheKey)) {
      return this.remoteComponentCache.get(cacheKey)!;
    }

    // Expose Vue globally for UMD modules
    if (!(window as any).Vue) {
      const vue = await import('vue');
      (window as any).Vue = vue;
    }

    // Check if already loaded globally
    if ((window as any)[name]) {
      const component = (window as any)[name];
      this.remoteComponentCache.set(cacheKey, component);
      return component;
    }

    // Load the script
    await this.loadRemoteScript(url);

    // Try common global variable patterns
    const globalComponent = 
      (window as any)[name] || 
      (window as any).VueQrcode ||
      (window as any).default;

    if (!globalComponent) {
      throw new Error(
        `Remote component "${name}" not found in global scope after loading ${url}. ` +
        `Make sure the component exports itself as window.${name}`
      );
    }

    this.remoteComponentCache.set(cacheKey, globalComponent);
    return globalComponent;
  }

  /**
   * Load a script tag dynamically
   */
  private static loadRemoteScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load a component (local or remote)
   */
  static async loadComponent(
    name: string, 
    source: 'local' | 'remote' = 'local', 
    url?: string
  ): Promise<Component> {
    if (source === 'remote') {
      if (!url) {
        throw new Error(`Remote component "${name}" requires a URL`);
      }
      return this.loadRemoteComponent(name, url);
    }

    // Load local component
    const components = this.getLocalComponents();
    const loader = components[name];
    
    if (!loader) {
      throw new Error(
        `Component "${name}" not found. Available: ${Object.keys(components).join(', ')}`
      );
    }

    return defineAsyncComponent(loader);
  }

  /**
   * Get list of available local components
   */
  static getAvailableComponents(): string[] {
    return Object.keys(this.getLocalComponents());
  }

  /**
   * Clear caches (useful for testing or hot reload)
   */
  static clearCache(): void {
    this.remoteComponentCache.clear();
    this.localComponents = null;
  }
}

