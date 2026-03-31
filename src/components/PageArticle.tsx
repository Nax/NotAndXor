import { Article as ArticleData } from '../gen/articles';
import { Article } from './Article';
import { Giscus } from './Giscus';

type PageArticleProps = {
  article: ArticleData;
  html: string;
};
export function PageArticle({ article, html }: PageArticleProps) {
  return (
    <Article article={article} html={html}/>
  );
}
