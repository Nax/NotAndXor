import React from 'react';
import strftime from 'strftime';

import { ArticleData } from '../database/article';

type ArticleProps = {
  preview: boolean;
  article: ArticleData;
};
const Article: React.FC<ArticleProps> = ({ preview = false, article }) => (
  <article className='post'>
    <div className='post-header'>
      <div className='post-title'>
        <h1>{article.title}</h1>
        {article.subtitle && <h2>{article.subtitle}</h2>}
      </div>
      <div className='post-date'>{strftime('%B %d, %Y', article.date)}</div>
      {article.tags &&
        <nav className='post-tags'>Tags:{" "}
          <ul>
            {article.tags.map(tag => <li key={tag}><a className='post-tag' href={`/tag/${tag.toLowerCase()}`}>{tag}</a></li>)}
          </ul>
        </nav>
      }
    </div>
    <div className='post-body' dangerouslySetInnerHTML={{__html: preview ? article.html : article.html}}/>
    {preview && <a href={`/${article.slug}`}>Read more...</a>}
  </article>
);

export default Article;
