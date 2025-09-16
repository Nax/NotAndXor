type Config = {
  env: 'development' | 'production';
  dev: boolean;
  baseUrl: string;
  siteName: string;
  siteDescription: string;
  ldAuthor: any;
};

const dev = process.env.NODE_ENV !== 'production';
const env = dev ? 'development' : 'production';
const baseUrl = dev ? 'http://localhost:8080' : 'https://nax.io';

export const CONFIG: Config = {
  env: env,
  dev: dev,
  baseUrl: baseUrl,
  siteName: 'NotAndXor',
  siteDescription: 'A blog about modding Zelda games and other fun endeavors.',
  ldAuthor: {
    "@type": "Person",
    "name": "Maxime Bacoux",
  }
};
