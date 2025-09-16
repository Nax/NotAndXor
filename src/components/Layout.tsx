import { CONFIG } from '../gen/config';
import type { ComponentChildren, ComponentType } from 'preact';
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

  return (
    <html lang='en-US'>
      <head>
        <meta charSet='utf-8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
        <meta name='description' content={CONFIG.siteDescription}/>
        {data.canonicalUrl && <link rel='canonical' href={data.canonicalUrl}/>}
        <title>{data.title}</title>
        <link rel='stylesheet' href={`/${data.css}`}/>
      </head>
      <body>
        <header>
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
          <p>&copy; 2013 - {year} Maxime Bacoux.<br/>Some rights reserved.</p>
        </footer>
      </body>
    </html>
  );
};
