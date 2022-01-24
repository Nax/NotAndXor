import React from 'react';

import { StaticRouter } from 'react-router-dom/server';

import post from './posts/001-hello-world.md';

export interface AppProps {
  path: string;
}

export const App = (props: AppProps) => (
  <StaticRouter location={props.path}>
    <h1>Hello, world!</h1>
    <p>
      {post}
    </p>
  </StaticRouter>
);
