import { NormalizedType } from '../types';

// Centralized type mapping between MetaAST internal types and target languages
export const typeMappings: Record<string, NormalizedType> = {
  'number': { tsType: 'number', pyType: 'int' },
  'string': { tsType: 'string', pyType: 'str' },
  'boolean': { tsType: 'boolean', pyType: 'bool' },
  'object': { tsType: 'object', pyType: 'dict' },
  'unknown': { tsType: 'unknown', pyType: 'Any' },
  'any': { tsType: 'any', pyType: 'Any' }
};

export function getTsType(metaType: string): string {
  return typeMappings[metaType]?.tsType || 'any';
}

export function getPyType(metaType: string): string {
  return typeMappings[metaType]?.pyType || 'Any';
}
