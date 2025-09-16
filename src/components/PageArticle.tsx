import { Article } from '../gen/articles';
import { ArticleCard } from './ArticleCard';
import { Giscus } from './Giscus';

type PageArticleProps = {
  article: Article;
  html: string;
};
export function PageArticle({ article, html }: PageArticleProps) {
  return (
    <article>
      <ArticleCard article={article}/>
      <div class="prose" dangerouslySetInnerHTML={{ __html: html }}/>
      <Giscus/>
    </article>
  );
}
