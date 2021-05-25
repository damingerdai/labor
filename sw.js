importScripts('https://cdn.jsdelivr.net/gh/golang/go@go1.16.4/misc/wasm/wasm_exec.js')

async function registerLaborListener(wasm, { base, args = [] } = {}) {
  let path = new URL(registration.scope).pathname
  if (base && base !== '') path = `${trimEnd(path, '/')}/${trimStart(base, '/')}`

  const handlerPromise = new Promise(setHandler => {
    self.labor = {
      path,
      setHandler,
    }
  })

  const go = new Go()
  go.argv = [wasm, ...args]
  const { instance } = await WebAssembly.instantiateStreaming(fetch(wasm), go.importObject)
  go.run(instance)

  addEventListener('fetch', e => {
    const { pathname } = new URL(e.request.url)
    if (!pathname.startsWith(path)) return
    e.respondWith(handlerPromise.then(handler => handler(e.request)))
  })

  return global
}

function trimStart(s, c) {
  let r = s
  while (r.startsWith(c)) r = r.slice(c.length)
  return r
}

function trimEnd(s, c) {
  let r = s
  while (r.endsWith(c)) r = r.slice(0, -c.length)
  return r
}
