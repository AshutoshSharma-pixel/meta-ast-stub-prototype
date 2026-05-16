import { MetaAstSchema } from '../types';

/**
 * Generates dependency graphs from semantic metadata.
 */
export class GraphGenerator {
  /**
   * Generates a Mermaid-compatible dependency graph (mmd).
   */
  public generateMermaid(schema: MetaAstSchema): string {
    let mmd = 'graph TD\n';
    
    if (!schema.references || schema.references.length === 0) {
      mmd += '  NoReferences\n';
      return mmd;
    }

    schema.references.forEach(ref => {
      const arrow = ref.type === 'call' ? '-->' : '-->'; // Could specialize based on type
      mmd += `  ${ref.from} ${arrow} ${ref.to}\n`;
    });

    return mmd;
  }

  /**
   * Generates a raw JSON dependency graph.
   */
  public generateJson(schema: MetaAstSchema): string {
    const graph = {
      nodes: schema.funcs.map(f => ({ id: f.name, type: 'function' })),
      edges: (schema.references || []).map(r => ({
        from: r.from,
        to: r.to,
        type: r.type || 'dependency'
      }))
    };
    return JSON.stringify(graph, null, 2);
  }
}
