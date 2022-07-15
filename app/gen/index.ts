import { Builder } from './builder';
import { layouts } from './tasks/layouts';

const builder = new Builder();

const layoutsTask = layouts(builder, 'app/layouts');

builder.run();
