export type Favicons = {
  ico: {path: string};
  svg: {path: string};
  png: {size: number, path: string}[];
};

export type OutputFile = {
  source?: string;
  name: string;
  content: string | Uint8Array;
  mimeType?: string;
};

type PageDataMeta = {
  name?: string;
  property?: string;
  content: string;
};

export type PageData = {
  favicons: Favicons;
  title: string;
  css: string;
  fonts: string[];
  canonicalUrl?: string;
  meta: PageDataMeta[];
  ld: any[];
};
