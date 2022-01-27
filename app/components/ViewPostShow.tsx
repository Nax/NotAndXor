import React from 'react';

import { Post as PostObject } from '../posts';
import { Post } from './Post';
import { API } from '../App';

interface ViewPostShowProps {
  api: API;
  post: PostObject;
}

export const ViewPostShow = ({ api, post }:ViewPostShowProps) => {
  api.setTitle(post.title);
  return <Post post={post}/>
};
