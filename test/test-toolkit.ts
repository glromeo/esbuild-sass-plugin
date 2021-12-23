import {BuildOptions} from 'esbuild'
import path from 'path'
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs'

export * from "mocha-toolkit";

export function useFixture(name: string): BuildOptions {
  const absWorkingDir = path.resolve(__dirname, `fixture/${name}`)
  try {
    process.chdir(absWorkingDir)
  } catch (ignored) {
    mkdirSync(absWorkingDir, {recursive: true})
    process.chdir(absWorkingDir)
  }
  try {
    rmSync('out', {force: true, recursive: true})
  } catch (ignored) {
  }
  return {
    absWorkingDir // esbuild cwd is initialized when imported, we have to change it at each test case!
  }
}

export function deleteFixture(name: string) {
  const absWorkingDir = path.resolve(__dirname, `fixture/${name}`)
  try {
    rmSync(absWorkingDir, {force: true, recursive: true})
  } catch (ignored) {
  }
}

export function readTextFile(pathname: string) {
  return readFileSync(pathname, 'utf8')
}

export function readJsonFile(pathname: string) {
  return JSON.parse(readTextFile(pathname))
}

export function writeTextFile(pathname: string, content: string) {
  writeFileSync(pathname, content)
}
