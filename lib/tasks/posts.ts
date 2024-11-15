import { Builder } from '../builder';
import { parsePost, Post } from '../parser';

export type PostSet = {[k: string]: Post}

export const postsTask = (builder: Builder, dir: string) => {
  const files = builder.files(dir, '**/*.md');
  return builder.task({ files }, ({ files }, next: (v: Promise<PostSet>) => void) => {
    if (!files) return;
    const promises: Promise<PostSet>[] = [];
    for (const file of Object.values(files)) {
      if (!file) continue;
      const promise = file.read()
      .then(raw => parsePost(raw.toString('utf8')))
      .then(post => ({ [post.slug]: post }))
      promises.push(promise);
    }
    next(Promise.all(promises).then(x => Object.assign({}, ...x)));
  });
}
