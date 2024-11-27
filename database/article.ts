function getAllArticlesModules() {
  return Promise.all(Object.values(import.meta.glob('../articles/**/*.md')).map(x => x()));
}

export type ArticleData = {
  slug: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  date: Date;
  html: string;
};

function makeArticle(data: any): ArticleData {
  return {
    slug: data.attributes.slug,
    title: data.attributes.title,
    subtitle: data.attributes.subtitle,
    tags: data.attributes.tags,
    date: new Date(data.attributes.date),
    html: data.html,
  };
}

export async function getArticle(slug: string): Promise<ArticleData> {
  const allArticles = await getAllArticlesModules();
  const rawArticle: any = allArticles.find((article: any) => article.attributes.slug === slug);
  if (!rawArticle) {
    throw new Error(`Article not found: ${slug}`);
  }

  return makeArticle(rawArticle);
}

export async function getAllArticles(): Promise<ArticleData[]> {
  const allArticles = await getAllArticlesModules();
  const articles = allArticles.map(makeArticle);
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getAllArticlesSlugs(): Promise<string[]> {
  const allArticles = await getAllArticlesModules();
  return allArticles.map((article: any) => article.attributes.slug);
}
