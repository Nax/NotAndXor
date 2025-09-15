import { ComponentChildren } from 'preact';

type LayoutsProps = {
  children?: ComponentChildren;
  title?: string;
  css?: string[];
  js?: string[];
  jsInline?: string[];
  raw: {[k: string]: string};
  ld?: string[];
  favicon?: string;
  canonical?: string;
};
export default function({ children, title, css, js, jsInline, raw, ld, favicon, canonical }: LayoutsProps) {
  return (
    <html lang='en-US'>
      <head>
        {css && css.map((href) => <link key={href} rel='stylesheet' href={'/' + href} />)}
        <title>{[title, 'Not And Xor'].filter(x => !!x).join(' — ')}</title>
        {favicon && <script dangerouslySetInnerHTML={{__html: `</script>${favicon}<script>`}}/>}
        {js && js.map((href) => <script key={href} type="module" src={'/' + href}/>)}
        {jsInline && jsInline.map((src) => <script key={src} dangerouslySetInnerHTML={{ __html: src }}/>)}
        {canonical && <link rel="canonical" href={canonical}/>}
      </head>
      <body>
        <header class='header'>
          <h1><a href="/">Not And Xor</a></h1>
        </header>
        <main class='content'>
          {children}
        </main>
        <footer class='footer'>
          <div class='social'>
            <a href="https://ko-fi.com/nax__" title="Ko-fi" dangerouslySetInnerHTML={{__html: raw['social/kofi.svg']}}/>
            <a href="https://github.com/Nax" title="GitHub" dangerouslySetInnerHTML={{__html: raw['social/github.svg']}}/>
            <a href="https://www.twitch.tv/naxunderscore" title="Twitch" dangerouslySetInnerHTML={{__html: raw['social/twitch.svg']}}/>
          </div>
          <div class='copyright'>
            &copy; 2013-{new Date().getFullYear()} Maxime Bacoux. Some rights reserved.
          </div>
        </footer>
        {ld && ld.map((x, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html: x}}/>)}
      </body>
    </html>
  );
};
