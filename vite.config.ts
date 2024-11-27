import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vike from 'vike/plugin';
import { plugin as md, Mode as MarkdownMode } from 'vite-plugin-markdown';

export default defineConfig({
  plugins: [md({mode: [MarkdownMode.HTML]}), vike({ prerender: true }), react({})],
});
