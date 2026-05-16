import { MetaAstType } from '../types';
import { NormalizedSemanticType, SemanticKind } from './types';

export class SemanticNormalizer {
  /**
   * Normalizes a raw MetaAst type into the internal semantic representation.
   */
  public normalize(type: MetaAstType | string): NormalizedSemanticType {
    if (typeof type === 'string') {
      return this.normalizeString(type);
    }

    switch (type.type) {
      case 'string':
        return { kind: SemanticKind.String };
      case 'number':
        return { kind: SemanticKind.Numeric };
      case 'boolean':
        return { kind: SemanticKind.Boolean };
      case 'any':
        return { kind: SemanticKind.Any };
      case 'array':
        return {
          kind: SemanticKind.Array,
          elementType: this.normalize(type.elementType),
        };
      case 'object':
        const properties: Record<string, NormalizedSemanticType> = {};
        for (const [key, value] of Object.entries(type.properties)) {
          properties[key] = this.normalize(value);
        }
        return {
          kind: SemanticKind.Object,
          properties,
        };
      case 'optional':
        return {
          kind: SemanticKind.Optional,
          innerType: this.normalize(type.innerType),
        };
      default:
        return { kind: SemanticKind.Any, originalType: JSON.stringify(type) };
    }
  }

  private normalizeString(typeStr: string): NormalizedSemanticType {
    const lower = typeStr.toLowerCase();
    if (['string', 'str', 'text'].includes(lower)) {
      return { kind: SemanticKind.String };
    }
    if (['number', 'int', 'float', 'double', 'i32', 'f64', 'integer'].includes(lower)) {
      return { kind: SemanticKind.Numeric };
    }
    if (['boolean', 'bool'].includes(lower)) {
      return { kind: SemanticKind.Boolean };
    }
    return { kind: SemanticKind.Any, originalType: typeStr };
  }
}
