import { CONFIG } from '../gen/config';
import type { ComponentChildren } from 'preact';
import { PageData } from '../gen/types';

type LayoutProps = {
  data: PageData;
  children?: ComponentChildren;
};

export function Layout({ data, children }: LayoutProps) {
  const year = new Date().getFullYear();

  return (
    <html lang='en-US'>
      <head>
        <meta charSet='utf-8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
        <meta name='description' content={CONFIG.siteDescription}/>
        <title>{data.title}</title>
        <link rel='stylesheet' href={`/${data.css}`}/>
      </head>
      <body>
        <header>
          <h1><a href='/'>{CONFIG.siteName}</a></h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2013 - {year} Maxime Bacoux.<br/>Some rights reserved.</p>
        </footer>
      </body>
    </html>
  );
};
