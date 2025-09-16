import { Article } from '../gen/articles';

type PageIndexProps = {
  articles: Article[];
};
export function PageIndex({ articles }: PageIndexProps) {
  return (
    <ol>
      {articles.map(article => (
        <li key={article.slug}>
          <a href={`/${article.slug}/`}>{article.title}</a> - <time dateTime={article.date.toISOString()}>{article.date.toDateString()}</time>
          <p>{article.description}</p>
        </li>
      ))}
    </ol>
  );
}
