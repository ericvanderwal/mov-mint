const fs = require('fs');
const path = require('path');

// Ensure workers-site directory exists
const workersSiteDir = path.join(__dirname, 'workers-site');
if (!fs.existsSync(workersSiteDir)) {
  fs.mkdirSync(workersSiteDir, { recursive: true });
}

// Create worker file content
const workerContent = `
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event)
  } catch (e) {
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(\`\${new URL(req.url).origin}/404.html\`, req),
        })

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}`;

// Write the worker file
fs.writeFileSync(path.join(workersSiteDir, 'index.js'), workerContent);
console.log('Worker file created at workers-site/index.js');
