import { Article } from '../gen/articles';
import { ArticleCard } from './ArticleCard';

type PageIndexProps = {
  articles: Article[];
};
export function PageIndex({ articles }: PageIndexProps) {
  return (
    <ol>{articles.map(article => <li key={article.slug}><ArticleCard link article={article}/></li>)}</ol>
  );
}
