import { MetaAstType } from '../types';

/**
 * Normalized Semantic Types
 * These represent the core semantic constructs that are language-agnostic.
 */
export enum SemanticKind {
  String = 'StringType',
  Numeric = 'NumericType',
  Boolean = 'BooleanType',
  Any = 'AnyType',
  Array = 'ArrayType',
  Object = 'ObjectType',
  Optional = 'OptionalType',
}

export interface NormalizedSemanticType {
  kind: SemanticKind;
  properties?: Record<string, NormalizedSemanticType>; // For Object
  elementType?: NormalizedSemanticType; // For Array
  innerType?: NormalizedSemanticType; // For Optional
  originalType?: string; // For debugging/tracing
}

/**
 * Mappings for language-specific type resolution.
 */
export const LANGUAGE_MAPPINGS = {
  typescript: {
    [SemanticKind.String]: 'string',
    [SemanticKind.Numeric]: 'number',
    [SemanticKind.Boolean]: 'boolean',
    [SemanticKind.Any]: 'any',
  },
  python: {
    [SemanticKind.String]: 'str',
    [SemanticKind.Numeric]: 'float', // Default to float for numeric, though can be specialized
    [SemanticKind.Boolean]: 'bool',
    [SemanticKind.Any]: 'Any',
  },
  rust: {
    [SemanticKind.String]: 'String',
    [SemanticKind.Numeric]: 'f64',
    [SemanticKind.Boolean]: 'bool',
    [SemanticKind.Any]: 'Box<dyn Any>',
  }
};
