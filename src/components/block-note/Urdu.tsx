import { createStronglyTypedTiptapNode } from "@blocknote/core";
import { updateBlockCommand } from "@blocknote/core";
import { getBlockInfoFromSelection } from "@blocknote/core";
import { createBlockSpecFromStronglyTypedTiptapNode } from "@blocknote/core";
import { insertOrUpdateBlock } from "@blocknote/core";
import { schema } from "../blocknotesidebar";

const UrduBlockContent = createStronglyTypedTiptapNode({
  name: "urdu",
  content: "inline*",
  group: "blockContent",

  parseHTML() {
    return [
      {
        tag: "div[data-content-type=urdu]",
        contentElement: ".bn-inline-content",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        ...HTMLAttributes,
        "data-content-type": "urdu",
        dir: "rtl",
        class: "bn-block urdu text-right py-2 px-2 rounded-md", // ✅ Tailwind here
      },
      ["div", { class: "bn-inline-content" }, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      "ctrl-Alt-u": () => {
        const blockInfo = getBlockInfoFromSelection(this.editor.state);
        if (!blockInfo.isBlockContainer) return false;

        return this.editor.commands.command(
          updateBlockCommand(blockInfo.bnBlock.beforePos, {
            type: "urdu",
          })
        );
      },
    };
  },
});

export const Urdu = createBlockSpecFromStronglyTypedTiptapNode(
  UrduBlockContent,
  {} // no props needed right now
);

export const insertUrdu = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Urdu",
  subtext: "Alert for emphasizing text",
  content: "inline",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "urdu",
    }),
  aliases: ["urdu", "ئردئ"],
  group: "blockContent",
  badge: "Ctrl + Alt + u",
});
