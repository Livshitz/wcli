export async function onRequest(context) {
  try {
    // Try to fetch the actual asset
    const response = await context.env.ASSETS.fetch(context.request);
    
    // If the asset exists, return it
    if (response.status !== 404) {
      return response;
    }
    
    // Otherwise, return index.html for SPA routing
    return context.env.ASSETS.fetch(new Request(new URL('/index.html', context.request.url)));
  } catch (e) {
    // Fallback to index.html
    return context.env.ASSETS.fetch(new Request(new URL('/index.html', context.request.url)));
  }
}

