import { Article } from '../gen/articles';

type PageArticleProps = {
  article: Article;
};
export function PageArticle({ article }: PageArticleProps) {
  return (
    <article>
      <h1>{article.title}</h1>
      <h2>{article.description}</h2>
    </article>
  );
}
