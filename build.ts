import dts from 'bun-plugin-dts';

const start = performance.now();

const glob = new Bun.Glob('dist/**/*');

for await (const file of glob.scan()) {
    Bun.file(file).delete();
}

await Bun.build({
    entrypoints: ['src/index.ts'],
    outdir: './dist',
    plugins: [
        dts()
    ],
    minify: true,
    format: 'esm',
    packages: 'external'
});

console.info(`Built in ${(performance.now() - start).toFixed(0)}ms`);
