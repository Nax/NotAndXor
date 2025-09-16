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
  favicons: string[];
  title: string;
  css: string;
  canonicalUrl?: string;
  meta: PageDataMeta[];
  ld: any[];
};
