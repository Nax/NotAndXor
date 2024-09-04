import React from 'react';
import strftime from 'strftime';

import type { Post as PostData } from '../gen/parser';

type PostProps = {
  preview: boolean;
  post: PostData;
};
const Post: React.FC<PostProps> = ({ preview = false, post }) => (
  <article className='post'>
    <div className='post-header'>
      <div className='post-title'>
        <h1>{post.title}</h1>
        {post.subtitle && <h2>{post.subtitle}</h2>}
      </div>
      <div className='post-date'>{strftime('%B %d, %Y', post.date)}</div>
      {post.tags &&
        <nav className='post-tags'>Tags:{" "}
          <ul>
            {post.tags.map(tag => <li key={tag}><a className='post-tag' href={`/tag/${tag.toLowerCase()}`}>{tag}</a></li>)}
          </ul>
        </nav>
      }
    </div>
    <div className='post-body' dangerouslySetInnerHTML={{__html: preview ? post.htmlPreview : post.html}}/>
    {preview && <a href={`/${post.slug}`}>Read more...</a>}
  </article>
);

export default Post;
