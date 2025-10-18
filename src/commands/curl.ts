import type { Command, CommandOptions, CommandResult } from '@/types';

export const curlCommand: Command = {
  name: 'curl',
  description: 'Transfer data from or to a server',
  usage: 'curl [options] <url>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, stderr, flags } = options;
    
    try {
      // Parse flags
      const silent = flags?.s || flags?.silent;
      const includeHeaders = flags?.i || flags?.['include'];
      const headOnly = flags?.I || flags?.head;
      const followRedirects = flags?.L || flags?.location;
      const outputFile = flags?.o || flags?.output;
      const verbose = flags?.v || flags?.verbose;
      const method = (flags?.X || flags?.request || 'GET') as string;
      const data = flags?.d || flags?.data;
      const htmlMode = flags?.html; // Explicitly request HTML response
      const headers: Record<string, string> = {};
      
      // Parse custom headers (-H or --header)
      const headerFlag = flags?.H || flags?.header;
      if (headerFlag) {
        const headerLines = Array.isArray(headerFlag) ? headerFlag : [headerFlag];
        for (const line of headerLines) {
          const [key, ...valueParts] = (line as string).split(':');
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(':').trim();
          }
        }
      }
      
      // Get URL from remaining args
      const url = args.find(arg => !arg.startsWith('-'));
      
      if (!url) {
        await stderr.write('curl: no URL specified\n');
        await stderr.write('Usage: curl [options] <url>\n');
        await stderr.write('Options:\n');
        await stderr.write('  -s, --silent        Silent mode\n');
        await stderr.write('  -i, --include       Include response headers\n');
        await stderr.write('  -I, --head          Fetch headers only\n');
        await stderr.write('  -L, --location      Follow redirects\n');
        await stderr.write('  -o, --output FILE   Write output to file\n');
        await stderr.write('  -v, --verbose       Verbose output\n');
        await stderr.write('  -X, --request METHOD HTTP method (GET, POST, etc.)\n');
        await stderr.write('  -d, --data DATA     HTTP POST data\n');
        await stderr.write('  -H, --header LINE   Custom header\n');
        await stderr.write('  --html              Request HTML response (use browser User-Agent)\n');
        return { exitCode: 1 };
      }
      
      // Validate URL
      let fullUrl: URL;
      try {
        fullUrl = new URL(url);
      } catch (e) {
        // Try adding https:// if missing
        try {
          fullUrl = new URL(`https://${url}`);
        } catch (e2) {
          await stderr.write(`curl: (3) URL using bad/illegal format or missing URL\n`);
          return { exitCode: 3 };
        }
      }
      
      if (verbose) {
        await stdout.write(`* Trying ${fullUrl.hostname}...\n`);
        await stdout.write(`* Connected to ${fullUrl.hostname}\n`);
        await stdout.write(`> ${method} ${fullUrl.pathname}${fullUrl.search} HTTP/1.1\n`);
        await stdout.write(`> Host: ${fullUrl.hostname}\n`);
      }
      
      // Build fetch options
      const fetchOptions: RequestInit = {
        method: data ? 'POST' : method,
        headers: {
          // Use browser User-Agent if htmlMode is enabled, otherwise use curl
          'User-Agent': htmlMode 
            ? 'Mozilla/5.0 (compatible; wcli/1.0)' 
            : headers['User-Agent'] || 'curl/7.88.1',
          ...headers,
        },
        redirect: followRedirects ? 'follow' : 'manual',
      };
      
      if (data) {
        fetchOptions.body = data as string;
        if (!headers['Content-Type']) {
          (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }
      
      if (headOnly) {
        fetchOptions.method = 'HEAD';
      }
      
      // Make the request
      const response = await fetch(fullUrl.toString(), fetchOptions);
      
      if (verbose) {
        await stdout.write(`< HTTP/1.1 ${response.status} ${response.statusText}\n`);
      }
      
      let output = '';
      
      // Output headers if requested
      if (includeHeaders || headOnly) {
        output += `HTTP/1.1 ${response.status} ${response.statusText}\n`;
        response.headers.forEach((value, key) => {
          output += `${key}: ${value}\n`;
        });
        output += '\n';
      }
      
      // Output body (unless head-only)
      if (!headOnly) {
        const text = await response.text();
        output += text;
        
        // Add newline if content doesn't end with one
        if (!text.endsWith('\n')) {
          output += '\n';
        }
      }
      
      // Write to output
      if (outputFile && typeof outputFile === 'string') {
        // Write to file
        const { fs, cwd } = options;
        const resolvedPath = fs.resolvePath(outputFile, cwd);
        await fs.writeFile(resolvedPath, output);
        if (!silent) {
          await stdout.write(`Saved to ${outputFile}\n`);
        }
      } else {
        // Write to stdout
        if (!silent) {
          await stdout.write(output);
        }
      }
      
      if (verbose) {
        await stdout.write(`* Connection closed\n`);
      }
      
      return { exitCode: response.ok ? 0 : 22 };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle common errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        await stderr.write(`curl: (6) Could not resolve host\n`);
        return { exitCode: 6 };
      }
      
      if (errorMessage.includes('CORS')) {
        await stderr.write(`curl: (7) Failed to connect: CORS policy blocked the request\n`);
        return { exitCode: 7 };
      }
      
      await stderr.write(`curl: ${errorMessage}\n`);
      return { exitCode: 1 };
    }
  },
};

