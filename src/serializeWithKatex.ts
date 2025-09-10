// utils/serializeWithKatex.ts
import { serializeHtml } from "platejs";
import katex from "katex";

export async function serializeWithKatex(editor: any) {
    console.log(editor.children)

  return serializeHtml(editor, {
    editorComponent: undefined, // 👈 no React
    stripClassNames: false,
    stripDataAttributes: false,

    nodes: [
      // Paragraphs & Headings
      { type: "p", serialize: ({ children }) => `<p>${children}</p>` },
      { type: "h1", serialize: ({ children }) => `<h1>${children}</h1>` },
      { type: "h2", serialize: ({ children }) => `<h2>${children}</h2>` },
      { type: "h3", serialize: ({ children }) => `<h3>${children}</h3>` },
      {
        type: "blockquote",
        serialize: ({ children }) => `<blockquote>${children}</blockquote>`,
      },

      // Images
      {
        type: "img",
        serialize: ({ element }) => {
          const src = element.url ? ` src="${element.url}"` : "";
          const alt = element.alt ? ` alt="${element.alt}"` : "";
          const width = element.width ? ` width="${element.width}"` : "";
          return `<img${src}${alt}${width}/>`;
        },
      },

      // Media wrappers (avoid Plate's React components)
      {
        type: "media",
        serialize: ({ children }) => `<figure>${children}</figure>`,
      },
      {
        type: "media_embed",
        serialize: ({ element }) => {
          const url = element.url || "";
          return `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
        },
      },
      {
        type: "caption",
        serialize: ({ children }) => `<figcaption>${children}</figcaption>`,
      },
      {
        type: "resizable",
        serialize: ({ children }) => children, // drop wrapper
      },

      // Equations
      {
        type: "equation",
        serialize: ({ element }) =>
          katex.renderToString(element.texExpression || "", {
            throwOnError: false,
            displayMode: true,
            trust: true,
            output: "htmlAndMathml",
          }),
      },
      {
        type: "inline_equation",
        serialize: ({ element }) =>
          katex.renderToString(element.texExpression || "", {
            throwOnError: false,
            displayMode: false,
            trust: true,
            output: "htmlAndMathml",
          }),
      },
    ],
  } as any);
}
