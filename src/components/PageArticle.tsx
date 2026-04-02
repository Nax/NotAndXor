import { JSX } from 'preact/jsx-runtime';
import { Article as ArticleData } from '../gen/articles';
import { Article } from './Article';
import { Asset } from '../gen/types';
import { ArticleProvider } from '../gen/articles/ArticleContext';

type PageArticleProps = {
  article: ArticleData;
  assets: Asset[];
  body: JSX.Element;
};
export function PageArticle({ article, assets, body }: PageArticleProps) {
  return (
    <ArticleProvider assets={assets}>
      <Article article={article} body={body}/>
    </ArticleProvider>
  );
}
