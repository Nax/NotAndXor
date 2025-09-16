import { Article } from '../gen/articles';
import { ArticleCard } from './ArticleCard';

type PageArticleProps = {
  article: Article;
};
export function PageArticle({ article }: PageArticleProps) {
  return (
    <article>
      <ArticleCard article={article}/>
      <div class="prose" dangerouslySetInnerHTML={{ __html: article.html }}/>
    </article>
  );
}
