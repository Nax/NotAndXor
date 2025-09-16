export type OutputFile = {
  name: string;
  content: string | Uint8Array;
  mimeType: string;
};

export type PageData = {
  title: string;
  css: string;
};
