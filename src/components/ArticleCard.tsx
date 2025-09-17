import strftime from 'strftime';
import { ComponentChildren } from 'preact';

import { Article } from '../gen/articles';

type ArticleCardProps = {
  link?: boolean;
  article: Article;
}
export function ArticleCard({ article, link }: ArticleCardProps) {
  const date = strftime('%B %d, %Y', article.date);

  const Wrapper = ({ children }: { children: ComponentChildren }) => link ? <a class="article-card" href={`/${article.slug}`}>{children}</a> : <div class="article-card">{children}</div>;

  return (
    <Wrapper>
      <span class="article-card-title">{article.title}</span>
      <span class="article-card-date">{date}</span>
      <span class="article-card-description">{article.description}</span>
    </Wrapper>
  );
}
