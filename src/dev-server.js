const express = require('express');
const livereload = require('livereload');

const devServer = () => {
  const reloadServer = livereload.createServer({ usePolling: true });
  reloadServer.watch('./dist/');

  const app = express();
  app.use(express.static('./dist'));

  app.listen(8080, () => {
    console.log('Dev Server up and running on localhost:8080');
  });
};

module.exports = devServer;
