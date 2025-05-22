export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_next/static/')) {
      url.pathname = `/static${url.pathname.slice('/_next/static/'.length)}`;
    }
    return env.ASSETS.fetch(url);
  }
};
