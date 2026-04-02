import { ComponentChildren, JSX } from 'preact';

import { Article as ArticleData } from '../gen/articles';
import { Giscus } from './Giscus';

type ArticleProps = {
  article: ArticleData;
  body?: JSX.Element;
}
export function Article({ article, body }: ArticleProps) {
  const isPreview = !body;
  const date = article.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
      {!isPreview && <>
        <div class="article-body prose">
          {body}
        </div>
        <Giscus/>
      </>}
    </article>
  );
}
