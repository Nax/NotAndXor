import strftime from 'strftime';

import type { Post as PostData } from '../../lib/parser';

type PostProps = {
  preview: boolean;
  post: PostData;
};
export default function Post({ preview = false, post }: PostProps) {
  return (
    <article class='post'>
      <div class='post-header'>
        <div class='post-title'>
          <h1>{post.title}</h1>
          {post.subtitle && <h2>{post.subtitle}</h2>}
        </div>
        {post.tags &&
          <ul class='post-tags'>
            {post.tags.map(tag => <li key={tag}><a class='post-tag' href={`/tag/${tag.toLowerCase()}`}>{tag}</a></li>)}
          </ul>
        }
        <div class='post-date'>{strftime('%B %d, %Y', post.date)}</div>
      </div>
      <div class='post-body' dangerouslySetInnerHTML={{__html: preview ? post.htmlPreview : post.html}}/>
      {preview && <a href={`/${post.slug}`}>Read more...</a>}
    </article>
  );
}
