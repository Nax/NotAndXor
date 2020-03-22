const express = require('express');

const devServer = () => {
  const app = express();
  app.use(express.static('./dist'));

  app.listen(8080, () => {
    console.log('Dev Server up and running on localhost:8080');
  });
};

module.exports = devServer;
