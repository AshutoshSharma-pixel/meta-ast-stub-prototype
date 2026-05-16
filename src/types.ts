export type MetaAstType = 
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'any' }
  | { type: 'array'; elementType: MetaAstType }
  | { type: 'object'; properties: Record<string, MetaAstType>; required?: string[] }
  | { type: 'optional'; innerType: MetaAstType };

export interface MetaAstArg {
  name: string;
  type: MetaAstType | string; 
}

export interface MetaAstFunc {
  name: string;
  args: MetaAstArg[];
  ret: MetaAstType | string;
  docstring?: string;
}


export interface MetaAstReference {
  from: string;
  to: string;
  type?: 'dependency' | 'call' | 'import';
}

export interface MetaAstSchema {
  funcs: MetaAstFunc[];
  references?: MetaAstReference[];
}

export interface NormalizedType {
  tsType: string;
  pyType: string;
}

