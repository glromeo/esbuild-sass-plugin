#!/usr/bin/env node

const { Worker } = require('worker_threads');
const worker = new Worker(__dirname + '/worker.js');

const buffer = new SharedArrayBuffer(1024);
const view = new Uint8Array(buffer);

console.log('now', view[0]);

worker.postMessage(buffer);

setTimeout(() => {
  console.log('later', view[0]);
  console.log('prop', buffer.foo);
  worker.unref();
}, 500);