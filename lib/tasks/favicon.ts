import favicons, { FaviconResponse } from 'favicons';

import { Builder } from '../builder';

const conf = {
  path: "/_favicon/",
  appName: "NotAndXor",
  appShortName: "NotAndXor",
  appDescription: "A blog about computer science and software",
  developerName: "Maxime Bacoux",
  developerURL: "https://nax.io",
  dir: "auto",
  lang: "en-US",
  background: "#fff",
  theme_color: "#fff",
  appleStatusBarStyle: "black-translucent",
  display: "standalone",
  orientation: "any",
  scope: "/",
  start_url: "/?homescreen=1",
  version: "1.0",
  logging: false,
  pixel_art: false,
  loadManifestWithCredentials: false,
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    favicons: true,
    firefox: false,
    windows: false,
    yandex: false
  }
} as const;

export const faviconTask = (builder: Builder, path: string) => {
  const files = builder.files(path);
  return builder.task({ files }, ({ files }, next: (v: Promise<string>) => void) => {
    if (!files) return;
    const promise = (async () => {
      const icons = (await favicons(path, conf)) as FaviconResponse;
      await Promise.all([...icons.images, ...icons.files].map((icon) => {
        builder.emit({ filename: '_favicon/' + icon.name, data: icon.contents as Buffer | string });
      }));
      return icons.html.join('');
    })();
    next(promise);
  });
};
