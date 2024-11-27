import '../styles/index.css';

import React from 'react';

import { Link } from '../components/Link';
import svgKofiUrl from '../assets/social/kofi.svg';
import svgGithubUrl from '../assets/social/github.svg';
import svgTwitchUrl from '../assets/social/twitch.svg';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>
    <header className='header'>
      <h1><a href="/">Not And Xor</a></h1>
    </header>
    <main className='content'>
      {children}
    </main>
    <footer className='footer'>
      <div className='social'>
        <a href="https://ko-fi.com/nax__" title="Ko-fi"><img src={svgKofiUrl}/></a>
        <a href="https://github.com/Nax" title="GitHub"><img src={svgGithubUrl}/></a>
        <a href="https://www.twitch.tv/naxunderscore" title="Twitch"><img src={svgTwitchUrl}/></a>
      </div>
      <div className='copyright'>
        &copy; 2013-{new Date().getFullYear()} Maxime Bacoux. Some rights reserved.
      </div>
    </footer>
  </>;
}
