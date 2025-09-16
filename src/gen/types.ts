export type OutputFile = {
  source?: string;
  name: string;
  content: string | Uint8Array;
  mimeType?: string;
};

export type PageData = {
  favicons: string[];
  title: string;
  css: string;
  canonicalUrl?: string;
};
