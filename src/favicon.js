const favicons = require('favicons');
const { emit } = require('./util');

module.exports = (p) => {
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
  };

  return new Promise((resolve, reject) => {
    favicons(p, conf, (err, res) => {
      if (err) return reject(err);

      Promise.all([...res.images, ...res.files].map(x => emit('./dist/_favicon/' + x.name, x.contents))).then(() => {
        resolve(res.html.join(''));
      });
    });
  });
};
