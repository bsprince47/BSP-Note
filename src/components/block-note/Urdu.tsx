import { createStronglyTypedTiptapNode } from "@blocknote/core";
import { updateBlockCommand } from "@blocknote/core";
import { getBlockInfoFromSelection } from "@blocknote/core";
import { createBlockSpecFromStronglyTypedTiptapNode } from "@blocknote/core";
import { insertOrUpdateBlock } from "@blocknote/core";
import { schema } from "../blocknotesidebar";
import {
  createReactStyleSpec,
  useBlockNoteEditor,
  useComponentsContext,
} from "@blocknote/react";

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

// inline button for font change
// Custom Formatting Toolbar Button to toggle blue text & background color.

export const Font = createReactStyleSpec(
  {
    type: "font",
    propSchema: "string",
  },
  {
    render: (props) => (
      <span style={{ fontFamily: props.value }} ref={props.contentRef} />
    ),
  }
);

// export const  BlueButton = (editor: typeof schema.styleSchema) => () {
//   const editor = useBlockNoteEditor();
//   const Components = useComponentsContext()!;
//   // Tracks whether the text & background are both blue.
//   const [isSelected, setIsSelected] = useState<boolean>();
//   // Updates state on content or selection change.
//   useEditorContentOrSelectionChange(() => {
//     setIsSelected(
//       editor.addStyles({
//           font: "fontName",
//         });
//     );
//   }, editor);
//   return (
//     <Components.FormattingToolbar.Button
//       mainTooltip={"Blue Text & Background"}
//       onClick={() => {
//         editor.toggleStyles({
//           textColor: "blue",
//           backgroundColor: "blue",
//         });
//       }}
//       isSelected={isSelected}
//     >
//       Blue
//     </Components.FormattingToolbar.Button>
//   );
// }
export const BlueButton = () => {
  const editor = useBlockNoteEditor<
    typeof schema.blockSchema,
    typeof schema.inlineContentSchema,
    typeof schema.styleSchema
  >();
  const Components = useComponentsContext()!;
  // Use optional chaining and type narrowing
  const selection = editor.getSelection();
  const firstBlock = Array.isArray(selection) ? selection[0] : undefined;
  const currentFont =
    firstBlock?.styles?.font ??
    "Inter, SF Pro Display, -apple-system, sans serif";

  return (
    <Components.FormattingToolbar.Select
      items={[
        {
          text: "English",
          icon: null,
          onClick: () => editor.addStyles({ font: "urdu" }),
          isSelected:
            currentFont === "Inter, SF Pro Display, -apple-system, sans serif",
        },
        {
          text: "Urdu",
          icon: null,
          onClick: () => editor.addStyles({ font: "urdu" }),
          isSelected: currentFont === "urdu",
        },
        {
          text: "Arabic",
          icon: null,
          onClick: () => editor.addStyles({ font: "arabic" }),
          isSelected: currentFont === "arabic",
        },
      ]}
    />
    // <Components.FormattingToolbar.Button
    //   label="Set Font"
    //   mainTooltip={"Set Font"}
    //   icon={<ReceiptText />}
    //   onClick={() => {
    //     editor.addStyles({
    //       font: "urdu",
    //     });
    //   }}
    // />
  );
};
