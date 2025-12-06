import openapiTS, { astToString } from 'openapi-typescript';

const getSchema = async () => {
    const response = await fetch('https://www.torn.com/swagger/openapi.json');
    
    if(!response.ok) {
        throw new Error('Failed fetching OpenAPI Schema from Torn');
    }

    const ast = await openapiTS(await response.text());
    const schema = astToString(ast);

    await Bun.write('./src/torn-api.ts', schema);
}

const start = performance.now();

await getSchema();

console.log(`Schema fetched and processed in ${(performance.now() - start).toFixed(0)}ms`);