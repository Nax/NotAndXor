import { Article as ArticleData } from '../gen/articles';
import { Article } from './Article';

type PageIndexProps = {
  articles: ArticleData[];
};
export function PageIndex({ articles }: PageIndexProps) {
  return (
    <ol>{articles.map(article => <li key={article.slug}><Article article={article}/></li>)}</ol>
  );
}
