import * as path from 'path';
import * as fs from 'fs';
import { MetaAstParser } from './parser/metaAstParser';
import { DtsGenerator } from './generators/dtsGenerator';
import { PyiGenerator } from './generators/pyiGenerator';
import { GraphGenerator } from './generators/graphGenerator';
import { writeToFile } from './utils/fileUtils';

function run() {
  const inputPath = path.join(__dirname, '../input/metaast.json');
  const dtsOutputPath = path.join(__dirname, '../output/metacall.d.ts');
  const pyiOutputPath = path.join(__dirname, '../output/metacall.pyi');
  const graphJsonPath = path.join(__dirname, '../output/dependency-graph.json');
  const graphMmdPath = path.join(__dirname, '../output/dependency-graph.mmd');

  console.log('\x1b[36m[meta-ast-stub-prototype]\x1b[0m');

  try {
    // 1. Parse the semantic metadata
    const parser = new MetaAstParser();
    const schema = parser.parse(inputPath);
    console.log('✓ Parsed semantic metadata');

    // 2. Normalize and Generate Types
    // Note: Normalization is handled inside generators for now to keep it simple
    // but the architecture allows for a separate pass.
    console.log('✓ Normalized semantic types');

    // 3. Generate .d.ts stubs
    const dtsGenerator = new DtsGenerator();
    const dtsContent = dtsGenerator.generate(schema);
    writeToFile(dtsOutputPath, dtsContent);
    console.log('✓ Generated TypeScript stubs (.d.ts)');

    // 4. Generate .pyi stubs
    const pyiGenerator = new PyiGenerator();
    const pyiContent = pyiGenerator.generate(schema);
    writeToFile(pyiOutputPath, pyiContent);
    console.log('✓ Generated Python TypedDicts (.pyi)');

    // 5. Generate Graphs
    const graphGenerator = new GraphGenerator();
    const graphJson = graphGenerator.generateJson(schema);
    const graphMmd = graphGenerator.generateMermaid(schema);
    writeToFile(graphJsonPath, graphJson);
    writeToFile(graphMmdPath, graphMmd);
    console.log('✓ Generated dependency graph (JSON/Mermaid)');

    console.log('\n\x1b[32mGeneration summary:\x1b[0m');
    console.log(`- Functions processed: ${schema.funcs.length}`);
    console.log(`- References tracked: ${schema.references?.length || 0}`);
    console.log(`- Output directory: ${path.relative(process.cwd(), path.join(__dirname, '../output'))}`);
  } catch (error) {
    console.error('\x1b[31m✗ Error during generation:\x1b[0m', error);
    if (!process.argv.includes('--watch')) {
      process.exit(1);
    }
  }
}

function main() {
  if (process.argv.includes('--watch')) {
    const inputPath = path.join(__dirname, '../input/metaast.json');
    console.log(`\x1b[33mEntering watch mode...\x1b[0m Watching ${path.relative(process.cwd(), inputPath)}`);
    run();
    
    let debounceTimer: NodeJS.Timeout;
    fs.watch(inputPath, (event) => {
      if (event === 'change') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log('\n\x1b[90m--- File changed, regenerating ---\x1b[0m');
          run();
        }, 100);
      }
    });
  } else {
    run();
  }
}

main();

