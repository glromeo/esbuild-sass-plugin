const {parentPort} = require('worker_threads')

parentPort.on('message', (buffer) => {
  buffer.foo = 42
  const view = new Uint8Array(buffer)
  view[0] = 2
  console.log('updated in worker')
})