import React from 'react';

import strftime from 'strftime';
import { Post as PostObject } from '../posts';

interface PostProps {
  post: PostObject;
  preview?: boolean;
};

export const Post = ({ post, preview }: PostProps) => (
  <article className="post">
    <h1>{post.title}</h1>
    <span className="post-date">{strftime("%B %d, %Y", post.date)} </span>
    {post.tags &&
      <nav className="post-tags">
        <ul>
          {post.tags.map(tag =>
            <li key={tag}><a className="post-tag" href={`/tag/${tag}`}>{tag}</a></li>
          )}
        </ul>
      </nav>
    }
    {preview ? <>
        <div className="post-body" dangerouslySetInnerHTML={{__html: post.htmlPreview}}/>
        <a href={`/${post.slug}`}>Read more...</a>
      </> : <>
        <div className="post-body" dangerouslySetInnerHTML={{__html: post.html}}/>
      </>
    }
  </article>
);
