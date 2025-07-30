import { createStronglyTypedTiptapNode } from "@blocknote/core";
import { updateBlockCommand } from "@blocknote/core";
import { getBlockInfoFromSelection } from "@blocknote/core";
import { createBlockSpecFromStronglyTypedTiptapNode } from "@blocknote/core";
import { insertOrUpdateBlock } from "@blocknote/core";
import { schema } from "../blocknotesidebar";

const ArabicBlockContent = createStronglyTypedTiptapNode({
  name: "arabic",
  content: "inline*",
  group: "blockContent",

  parseHTML() {
    return [
      {
        tag: "div[data-content-type=arabic]",
        contentElement: ".bn-inline-content",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        ...HTMLAttributes,
        "data-content-type": "arabic",
        dir: "rtl",
        class: "bn-block arabic text-right py-2 px-2 rounded-md", // ✅ Tailwind here
      },
      ["div", { class: "bn-inline-content" }, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      "ctrl-Alt-y": () => {
        const blockInfo = getBlockInfoFromSelection(this.editor.state);
        if (!blockInfo.isBlockContainer) return false;

        return this.editor.commands.command(
          updateBlockCommand(blockInfo.bnBlock.beforePos, {
            type: "arabic",
          })
        );
      },
    };
  },
});

export const Arabic = createBlockSpecFromStronglyTypedTiptapNode(
  ArabicBlockContent,
  {} // no props needed right now
);

export const insertArabic = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Arabic",
  subtext: "Alert for emphasizing text",
  content: "inline",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "arabic",
    }),
  aliases: ["arabic", "ارابیچ"],
  group: "blockContent",
  badge: "Ctrl + Alt + a",
});
