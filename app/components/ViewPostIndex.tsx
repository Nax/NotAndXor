import React from 'react';

import { Post as PostObject } from '../posts';
import { Post } from './Post';
import { API } from '../App';

interface Props {
  api: API;
  posts: PostObject[];
}

const sort = (a: PostObject, b: PostObject) => a.date == b.date ? 0 : a.date > b.date ? -1 : 1;

export const ViewPostIndex = ({ posts }:Props) => <>{posts.sort(sort).map(p => <Post key={p.slug} preview post={p}/>)}</>;
