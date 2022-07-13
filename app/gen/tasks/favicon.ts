import favicons from 'favicons';
import { TaskFunc } from '../task';

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

export default (): TaskFunc => (files, builder) => {
  const { fullpath } = files[0];

  return new Promise((resolve, reject) => {
    favicons(fullpath, conf, (err, res) => {
      if (err) return reject(err);

      builder.data.favicon = res.html.join('');

      return resolve([...res.images, ...res.files].map(x => ({ filename: '_favicon/' + x.name, data: x.contents })));
    });
  });
};
