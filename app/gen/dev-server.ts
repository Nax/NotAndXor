import express from 'express';
import livereload from 'livereload';

export const devServer = () => {
  const reloadServer = livereload.createServer({ usePolling: true });
  reloadServer.watch('./dist/');

  const app = express();
  app.use(express.static('./dist'));

  app.listen(8080, () => {
    console.log('Dev Server up and running on localhost:8080');
  });
};
