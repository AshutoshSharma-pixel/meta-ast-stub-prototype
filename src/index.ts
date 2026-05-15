import * as path from 'path';
import { MetaAstParser } from './parser/metaAstParser';
import { DtsGenerator } from './generators/dtsGenerator';
import { PyiGenerator } from './generators/pyiGenerator';
import { writeToFile } from './utils/fileUtils';

function main() {
  const inputPath = path.join(__dirname, '../input/metaast.json');
  const dtsOutputPath = path.join(__dirname, '../output/metacall.d.ts');
  const pyiOutputPath = path.join(__dirname, '../output/metacall.pyi');

  console.log('[meta-ast-stub-prototype]');

  try {
    // 1. Parse the semantic metadata
    const parser = new MetaAstParser();
    const schema = parser.parse(inputPath);
    console.log('✓ Parsed semantic metadata');

    // 2. Generate .d.ts stubs
    const dtsGenerator = new DtsGenerator();
    const dtsContent = dtsGenerator.generate(schema);
    writeToFile(dtsOutputPath, dtsContent);
    console.log('✓ Generated TypeScript stubs (.d.ts)');

    // 3. Generate .pyi stubs
    const pyiGenerator = new PyiGenerator();
    const pyiContent = pyiGenerator.generate(schema);
    writeToFile(pyiOutputPath, pyiContent);
    console.log('✓ Generated Python stubs (.pyi)');

    console.log('\nGeneration summary:');
    console.log(`- Functions processed: ${schema.funcs.length}`);
    console.log(`- Output directory: ${path.join(__dirname, '../output')}`);
  } catch (error) {
    console.error('✗ Error during generation:', error);
    process.exit(1);
  }
}

main();
