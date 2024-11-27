import React from 'react';
import { useData } from 'vike-react/useData';
import { ArticleData } from '../../database/article';
import Article from '../../components/Article.server';

function ArticlePage() {
  const article = useData<ArticleData>();
  return <Article article={article} preview={false} />;
}

export default ArticlePage;
