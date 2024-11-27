import { getAllArticlesSlugs } from '../../database/article';

async function onBeforePrerenderStart() {
  const slugs = await getAllArticlesSlugs();
  return slugs.map(slug => `/${slug}`);
}

export default onBeforePrerenderStart;
