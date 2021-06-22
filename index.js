const Builder = require('./src/builder');
const { dev } = require('./src/config');
const devServer = require('./src/dev-server');

const builder = new Builder;
builder.run().then(() => {
  if (dev) {
    builder.watch();
    devServer();
  }
});
