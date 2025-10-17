export class PathResolver {
  static normalize(path: string): string {
    // Remove trailing slashes except for root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Handle empty path
    if (!path) {
      return '/';
    }
    
    // Split and process parts
    const parts = path.split('/').filter(p => p && p !== '.');
    const result: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        if (result.length > 0) {
          result.pop();
        }
      } else {
        result.push(part);
      }
    }
    
    return '/' + result.join('/');
  }

  static resolve(path: string, cwd: string): string {
    // Already absolute
    if (path.startsWith('/')) {
      return this.normalize(path);
    }
    
    // Relative to cwd
    const fullPath = cwd === '/' ? `/${path}` : `${cwd}/${path}`;
    return this.normalize(fullPath);
  }

  static dirname(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    
    if (lastSlash === 0) {
      return '/';
    }
    
    return normalized.slice(0, lastSlash);
  }

  static basename(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    return normalized.slice(lastSlash + 1);
  }

  static join(...paths: string[]): string {
    const joined = paths.join('/');
    return this.normalize(joined);
  }

  static isAbsolute(path: string): boolean {
    return path.startsWith('/');
  }

  static relative(from: string, to: string): string {
    const fromParts = this.normalize(from).split('/').filter(p => p);
    const toParts = this.normalize(to).split('/').filter(p => p);
    
    // Find common base
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }
    
    // Build relative path
    const upCount = fromParts.length - i;
    const ups = Array(upCount).fill('..');
    const remaining = toParts.slice(i);
    
    return [...ups, ...remaining].join('/') || '.';
  }
}

