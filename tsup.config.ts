import { defineConfig } from 'tsup'

export default defineConfig({
  format: ["esm"],
  minify: 'terser',
  dts: true,
  clean: true,
  entry: ['src/index.ts']
})


// src/index.ts --dts --format esm --minify terser
