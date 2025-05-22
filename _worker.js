export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle static assets
    if (url.pathname.startsWith('/_next/static/')) {
      url.pathname = `/static${url.pathname.slice('/_next/static/'.length)}`;
    }
    
    // Serve the static site
    return env.ASSETS.fetch(url);
  }
};