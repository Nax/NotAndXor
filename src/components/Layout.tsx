import type { ComponentChildren, ComponentType } from 'preact';

import { CONFIG } from '../gen/config';
import { PageData } from '../gen/types';
import { IconGithub, IconKoFi, IconLinkedin, IconRss, IconTwitch } from './Icons';

type SocialLinkProps = {
  href: string;
  alt: string;
  icon: ComponentType;
};
function SocialLink({ href, alt, icon: Icon }: SocialLinkProps) {
  return (
    <a href={href} target='_blank' rel='noopener noreferrer' aria-label={alt}>
      <Icon/>
    </a>
  );
}

type LayoutProps = {
  data: PageData;
  children?: ComponentChildren;
};

export function Layout({ data, children }: LayoutProps) {
  const year = new Date().getFullYear();

  const ldWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": CONFIG.baseUrl,
    "name": CONFIG.siteName,
    "author": CONFIG.ldAuthor,
  };

  const ldWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": data.canonicalUrl,
    "name": data.title,
    "author": CONFIG.ldAuthor,
  };

  return (
    <html lang='en-US' prefix="og: http://ogp.me/ns#">
      <head>
        <meta charSet='utf-8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
        {data.canonicalUrl && <link rel='canonical' href={data.canonicalUrl}/>}
        <title>{data.title}</title>
        {data.fonts.map((f, i) => <link key={i} rel='preload' as='font' type="font/woff2" crossorigin='anonymous' href={`/${f}`}/>)}
        <link rel='stylesheet' href={`/${data.css}`}/>
        {data.meta.map((m, i) => <meta key={i} name={m.name} property={m.property} content={m.content}/>)}
        <script async src="https://scripts.simpleanalyticscdn.com/latest.js"/>
        <link rel="icon" href={data.favicons.svg.path} type="image/svg+xml"/>
        {data.favicons.png.map(f => (
          <link key={f.size} rel="icon" type="image/png" sizes={`${f.size}x${f.size}`} href={f.path}/>
        ))}
        <link rel="icon" sizes="32x32" type="image/x-icon" href="/favicon.ico"/>
      </head>
      <body>
        <header class="header">
          <h1><a href='/'>Not And Xor</a></h1>
        </header>
        <main>{children}</main>
        <footer>
          <div class="social">
            <SocialLink href="https://github.com/Nax" icon={IconGithub} alt="GitHub"/>
            <SocialLink href="https://www.linkedin.com/in/mbacoux/" icon={IconLinkedin} alt="LinkedIn"/>
            <SocialLink href="https://www.twitch.tv/naxunderscore" icon={IconTwitch} alt="Twitch"/>
            <SocialLink href="https://ko-fi.com/nax__" icon={IconKoFi} alt="Ko-Fi"/>
            <SocialLink href="/rss.xml" icon={IconRss} alt="RSS"/>
          </div>
          <p><a href="mailto:max@bacoux.com">Contact me</a></p>
          <p>&copy; 2013 - {year} Maxime Bacoux.<br/>Some rights reserved.</p>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWebsite) }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWebPage) }}/>
        {data.ld.map((ldItem, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldItem) }}/>
        ))}
      </body>
    </html>
  );
};
