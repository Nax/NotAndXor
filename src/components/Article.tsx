import strftime from 'strftime';
import { ComponentChildren } from 'preact';

import { Article as ArticleData } from '../gen/articles';

type ArticleProps = {
  article: ArticleData;
  html?: string;
}
export function Article({ article, html }: ArticleProps) {
  const isPreview = !html;
  const date = strftime('%B %d, %Y', article.createdAt);

  const LinkWrapper = ({children}: {children: ComponentChildren}) => isPreview ? <a href={`/${article.slug}`}>{children}</a> : children;
  const className = ['article'];
  if (isPreview) {
    className.push('article-preview');
  } else {
    className.push('article-full');
  }

  return (
    <article class={className.join(' ')}>
      <header class="article-header">
        <LinkWrapper>
          <div class="article-header-title">{article.title}</div>
          <div class="article-header-date">{date}</div>
          <div class="article-header-description">{article.description}</div>
        </LinkWrapper>
      </header>
      {!isPreview && <div class="article-body prose" dangerouslySetInnerHTML={{__html: html}}/>}
    </article>
  );
}
