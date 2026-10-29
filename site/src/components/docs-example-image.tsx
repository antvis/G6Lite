import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentProps } from 'react';

type ExampleImageProps = ComponentProps<typeof defaultMdxComponents.img>;

export function DocsExampleImage({ title, alt, ...props }: ExampleImageProps) {
  const caption = title || alt || 'Example';
  const Image = defaultMdxComponents.img;

  // Spans keep Markdown images valid inside paragraphs, links, and table cells.
  return (
    <span className="docs-example-card not-prose" role="figure" aria-label={caption}>
      <span className="docs-example-card-body">
        <Image {...props} alt={alt} />
      </span>
      <span className="docs-example-card-caption">{caption}</span>
    </span>
  );
}
