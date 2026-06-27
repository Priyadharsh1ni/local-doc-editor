import Paragraph from "@editorjs/paragraph";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Warning from "@editorjs/warning";

/**
 * Editor.js tools have broken typings.
 * We explicitly cast them to `any` once,
 * instead of polluting component code.
 */
export const editorTools = {
  paragraph: {
    class: Paragraph as any,
    inlineToolbar: true,
  },
  header: {
    class: Header as any,
    inlineToolbar: true,
    config: {
      levels: [1, 2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote as any,
    inlineToolbar: true,
  },
  list: {
    class: List as any,
    inlineToolbar: true,
  },
  image: {
    class: ImageTool as any,
  },
  warning: {
    class: Warning as any,
  },
};