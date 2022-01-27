import React from 'react';

import { Route, Routes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

import { posts } from './posts';
import { AppLayout } from './components/AppLayout';
import { ViewPostShow } from './components/ViewPostShow';
import { ViewPostIndex } from './components/ViewPostIndex';

export interface API {
  setTitle: (title: string) => void;
};
export interface AppProps {
  api: API;
  path: string;
}

const tags = new Set(posts.map(x => x.tags).flat());

export const App = ({ api, path }: AppProps) => {
  return (
    <StaticRouter location={path}>
      <Routes>
        <Route path="/" element={<AppLayout/>}>
          <Route path="/" element={<ViewPostIndex api={api} posts={posts}/>}/>
          {posts.map(p => <Route key={p.slug} path={`/${p.slug}`} element={<ViewPostShow api={api} post={p}/>}/>)}
          {[...tags].map(t => <Route key={t} path={`/tag/${t}`} element={<ViewPostIndex api={api} posts={posts.filter(p => p.tags.includes(t))}/>}/>)}
        </Route>
      </Routes>
    </StaticRouter>
  );
};
