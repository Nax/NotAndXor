const Builder = require('./src/build');
const Tasks = require('./src/tasks');

const builder = new Builder({ watch: true, devServer: true });

const svg = Tasks.svg(builder);
const js = Tasks.javascript(builder);
const fav = Tasks.favicon(builder);
const css = Tasks.css(builder);
const layout = Tasks.layout(builder);

const post = Tasks.post(builder, [svg, js, fav, css, layout]);
Tasks.postIndex(builder, [post]);
Tasks.static(builder);
builder.run();
