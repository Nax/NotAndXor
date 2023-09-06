import React from 'react';

type LayoutsProps = {
  children: React.ReactNode;
  title?: string;
  css?: string[];
  js?: string[];
  jsInline?: string[];
  raw: {[k: string]: string};
  ld?: string[];
  favicon?: string;
  canonical?: string;
};
const Layout: React.FC<LayoutsProps> = ({ children, title, css, js, jsInline, raw, ld, favicon, canonical }) => (
  <html lang='en-US'>
    <head>
      {css && css.map((href) => <link key={href} rel='stylesheet' href={'/' + href} />)}
      <title>{[title, 'Not And Xor'].filter(x => !!x).join(' — ')}</title>
      {favicon && <script dangerouslySetInnerHTML={{__html: `</script>${favicon}<script>`}}/>}
      {js && js.map((href) => <script key={href} defer src={'/' + href}/>)}
      {jsInline && jsInline.map((src) => <script key={src} dangerouslySetInnerHTML={{ __html: src }}/>)}
      {canonical && <link rel="canonical" href={canonical}/>}
    </head>
    <body>
      <header className='header'>
        <h1><a href="/">Not And Xor</a></h1>
      </header>
      <main className='content'>
        {children}
      </main>
      <footer className='footer'>
        <div className='social'>
          <a href="https://www.linkedin.com/in/mbacoux/" dangerouslySetInnerHTML={{__html: raw['social/linkedin.svg']}}/>
          <a href="https://github.com/Nax" dangerouslySetInnerHTML={{__html: raw['social/github.svg']}}/>
          <a href="https://twitter.com/NaxDotIO" dangerouslySetInnerHTML={{__html: raw['social/twitter.svg']}}/>
        </div>
        <div className='copyright'>
          &copy; 2013-2022 Maxime Bacoux. Some rights reserved.
        </div>
      </footer>
      {ld && ld.map((x, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html: x}}/>)}
    </body>
  </html>
);

export default Layout;
