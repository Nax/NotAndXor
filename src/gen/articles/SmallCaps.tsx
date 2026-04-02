import { RenderableProps } from 'preact';

export function SmallCaps({ children }: RenderableProps<{}>) {
  return <span class="small-caps">{children}</span>;
}
