import { getAllArticles } from '../../database/article';

async function data() {
  const articles = await getAllArticles();
  return articles;
}

export default data;
