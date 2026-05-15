export interface MetaAstArg {
  name: string;
  type: string;
}

export interface MetaAstRet {
  type: string;
}

export interface MetaAstFunc {
  name: string;
  args: MetaAstArg[];
  ret: MetaAstRet;
  docstring?: string;
}

export interface MetaAstSchema {
  funcs: MetaAstFunc[];
}

export interface NormalizedType {
  tsType: string;
  pyType: string;
}
