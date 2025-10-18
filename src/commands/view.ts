import type { Command, CommandOptions, CommandResult } from '@/types';
import { ComponentLoader } from '@/core/ComponentLoader';

export const viewCommand: Command = {
  name: 'view',
  description: 'Display a Vue component in the terminal',
  usage: 'view <component> [key=value]... [--remote url] | view --list',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, stderr, flags } = options;
    
    try {
      // Handle --list flag to show available components
      if (flags?.list) {
        const components = ComponentLoader.getAvailableComponents();
        await stdout.write('Available components:\n');
        
        // Group by directory
        const grouped: Record<string, string[]> = {};
        const rootComponents: string[] = [];
        
        for (const name of components) {
          if (name.includes('/')) {
            const dir = name.split('/')[0];
            if (!grouped[dir]) grouped[dir] = [];
            grouped[dir].push(name);
          } else {
            rootComponents.push(name);
          }
        }
        
        // Display root components first
        if (rootComponents.length > 0) {
          for (const name of rootComponents.sort()) {
            await stdout.write(`  ${name}\n`);
          }
        }
        
        // Display grouped components
        for (const [dir, names] of Object.entries(grouped).sort()) {
          await stdout.write(`\n  ${dir}/\n`);
          for (const name of names.sort()) {
            await stdout.write(`    ${name}\n`);
          }
        }
        
        return { exitCode: 0 };
      }
      
      if (args.length === 0) {
        await stderr.write('view: missing component name\n');
        await stderr.write(`Usage: ${this.usage}\n`);
        return { exitCode: 1 };
      }
      
      const componentName = args[0];
      const props: Record<string, any> = {};
      
      // Parse props from flags
      if (flags) {
        for (const [key, value] of Object.entries(flags)) {
          if (key === 'remote') continue;
          if (key === 'prop') {
            // Handle --prop key=value syntax
            if (typeof value === 'string' && value.includes('=')) {
              const [propKey, ...propValueParts] = value.split('=');
              const propValue = propValueParts.join('=');
              props[propKey] = parseValue(propValue);
            }
          } else {
            // Handle --key value syntax
            props[key] = parseValue(value);
          }
        }
      }
      
      // Check if first arg after component name is a URL (for --remote without =)
      let remoteUrl: string | undefined;
      let startArgIndex = 1;
      
      if (flags?.remote) {
        if (typeof flags.remote === 'string') {
          // --remote=url syntax
          remoteUrl = flags.remote;
        } else if (args.length > 1) {
          // --remote url syntax (url is in args)
          // Accept any URL-like string (http://, https://, or relative paths starting with /)
          const potentialUrl = args[1];
          if (potentialUrl.startsWith('http://') || 
              potentialUrl.startsWith('https://') || 
              potentialUrl.startsWith('/')) {
            remoteUrl = potentialUrl;
            startArgIndex = 2;
          }
        }
      }
      
      // Additional props from args like key=value
      for (let i = startArgIndex; i < args.length; i++) {
        const arg = args[i];
        if (arg.includes('=')) {
          const [key, ...valueParts] = arg.split('=');
          const value = valueParts.join('=');
          props[key] = parseValue(value);
        }
      }
      
      const source = remoteUrl ? 'remote' : 'local';
      const url = remoteUrl;
      
      // Output a special marker that the terminal will intercept
      const componentData = {
        __type: 'vue-component',
        name: componentName,
        props,
        source,
        url,
      };
      
      // Debug logging
      if (remoteUrl) {
        console.log('[view command] Remote component:', { name: componentName, url: remoteUrl, source });
      }
      
      await stdout.write(JSON.stringify(componentData) + '\n');
      
      return { exitCode: 0 };
    } catch (error) {
      await stderr.write(`view: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

function parseValue(value: string | boolean): any {
  if (typeof value === 'boolean') return value;
  
  // Try to parse as JSON first (handles numbers, booleans, arrays, objects)
  try {
    return JSON.parse(value);
  } catch {
    // Return as string if JSON parsing fails
    return value;
  }
}

