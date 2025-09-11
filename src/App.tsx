import type { Value } from "platejs";

import { MathKit } from "@/components/math-kit";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { Editor, EditorContainer } from "@/components/ui/editor";
import {
  EquationElement,
  InlineEquationElement,
} from "@/components/ui/equation-node";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ImageElement } from "@/components/ui/media-image-node";
import { ToolbarButton } from "@/components/ui/toolbar";
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { CaptionPlugin } from "@platejs/caption/react";
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react";
import { ImagePlugin } from "@platejs/media/react";
import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  QuoteIcon,
  TrashIcon,
  UnderlineIcon,
} from "lucide-react";
import {
  deserializeHtml,
  KEYS,
  serializeHtml,
  TrailingBlockPlugin,
} from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { InlineEquationToolbarButton } from "./components/ui/equation-toolbar-button";

const initialValue: Value = [
  {
    children: [{ text: "Title" }],
    type: "h3",
  },
  {
    children: [{ text: "This is a quote." }],
    type: "blockquote",
  },
  {
    children: [
      { text: "With some " },
      { bold: true, text: "bold" },
      { text: " text for emphasis!" },
    ],
    type: "p",
  },
];

export default function App() {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      ...MathKit,
      EquationPlugin.withComponent(EquationElement),
      InlineEquationPlugin.withComponent(InlineEquationElement),
      ImagePlugin.withComponent(ImageElement),
      CaptionPlugin.configure({
        options: {
          query: {
            allow: [
              KEYS.img,
              KEYS.video,
              KEYS.audio,
              KEYS.file,
              KEYS.mediaEmbed,
            ],
          },
        },
      }),
      TrailingBlockPlugin.configure({
        options: {
          type: "p", // Paragraph block
          exclude: ["blockquote"], // Don't add after these types
        },
      }),
    ],
    value: () => {
      const savedValue = localStorage.getItem("installation-react-demo");
      return savedValue ? JSON.parse(savedValue) : initialValue;
    },
  });

  return (
    <>
      <Plate
        editor={editor}
        onChange={({ value }) => {
          localStorage.setItem(
            "installation-react-demo",
            JSON.stringify(value)
          );
        }}
      >
        <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
          <ToolbarButton onClick={() => editor.tf.h1.toggle()}>
            <Heading1Icon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h2.toggle()}>
            <Heading2Icon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h3.toggle()}>
            <Heading3Icon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>
            <QuoteIcon />
          </ToolbarButton>
          <InlineEquationToolbarButton tooltip="Insertar ecuación">
            IEq
          </InlineEquationToolbarButton>
          <MarkToolbarButton nodeType={KEYS.bold} tooltip="Negrita (⌘+B)">
            <BoldIcon />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={KEYS.italic} tooltip="Cursiva (⌘+I)">
            <ItalicIcon />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={KEYS.underline} tooltip="Subrayar (⌘+U)">
            <UnderlineIcon />
          </MarkToolbarButton>
          <div className="flex-1" />
          <ToolbarButton
            className="px-2"
            onClick={() => editor.tf.setValue(initialValue)}
          >
            {/* Limpiar */}
            <TrashIcon />
          </ToolbarButton>
        </FixedToolbar>
        <EditorContainer>
          <Editor placeholder="Type your amazing content here..." />
        </EditorContainer>
      </Plate>
      <button
        onClick={async () => {
          const html = await serializeHtml(editor);

          const slateValue = deserializeHtml(editor, {
            element: html,
          });

          console.log({
            html,
            slateValue,
          });
        }}
        style={{ border: "1px solid red" }}
      >
        Serialize
      </button>
    </>
  );
}
