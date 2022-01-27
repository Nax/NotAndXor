import React from 'react';

import { Outlet } from 'react-router-dom';

import svgLinkedIn from '../assets/social/linkedin.svg';
import svgGitHub from '../assets/social/github.svg';
import svgTwitter from '../assets/social/twitter.svg';

export const AppLayout = () => (
    <>
      <header className="header">
        <h1><a href="/">Not And Xor</a></h1>
      </header>
      <main className="content">
        <Outlet/>
      </main>
      <footer className="footer">
        <div className="social">
          <a href="https://www.linkedin.com/in/mbacoux/" dangerouslySetInnerHTML={{__html: svgLinkedIn}}/>
          <a href="https://github.com/Nax" dangerouslySetInnerHTML={{__html: svgGitHub}}/>
          <a href="https://twitter.com/nax_dev" dangerouslySetInnerHTML={{__html: svgTwitter}}/>
        </div>
        <div className="copyright">
          &copy; 2013-2021 Maxime Bacoux. Some rights reserved.
        </div>
      </footer>
    </>
);
