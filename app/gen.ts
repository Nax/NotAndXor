import css from './index.css';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { App, API } from './App';

const render = ({ path }: { path: string }) => {
  let title = "";
  const setTitle = (t: string) => { title = t; };
  const api: API = { setTitle };
  const body = ReactDOMServer.renderToString(React.createElement(App, { api, path }));

  const fullTitle = [title, "Not And Xor"].filter(x => x).join(" – ");

  return `<!doctype html><html><head><link rel="stylesheet" href="${css}"><title>${fullTitle}</title></head><body>${body}</body></html>`;
}

export default render;
