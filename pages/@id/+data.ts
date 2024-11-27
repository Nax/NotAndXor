import { PageContext } from 'vike/types';
import { getArticle } from '../../database/article';

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const article = await getArticle(id);

  return article;
}

export default data;
