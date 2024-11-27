import React from 'react';
import { useData } from 'vike-react/useData';
import { ArticleData } from '../../database/article';
import Article from '../../components/Article.server';

export default function Page() {
  const articles = useData<ArticleData[]>();
  return <>
    {articles.map(x => <Article key={x.slug} article={x} preview={true}/>)}
  </>
}
