import ReactDOMServer from 'react-dom/server';

import { App, AppProps } from './App';

const render = async (props: AppProps): Promise<string> => {
  return ReactDOMServer.renderToString(App(props));
}

export default render;
