import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { ClassBookComboBox } from "./classbookcombobox";

import { useGlobalStore } from "@/GlobalProvider";
import { db } from "@/Dexie";
// import { nanoid } from "nanoid";
import { DialogTitle } from "@radix-ui/react-dialog";
import { codeBlock } from "@blocknote/code-block";

import { useEffect, useState } from "react";
import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultStyleSpecs,
  filterSuggestionItems,
  type PartialBlock,
} from "@blocknote/core";
import imageCompression from "browser-image-compression";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Arabic, insertArabic } from "./block-note/Arabic";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  NestBlockButton,
  SuggestionMenuController,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";
import { Urdu, insertUrdu, Font, BlueButton } from "./block-note/Urdu";
import { YouTubeBlock, insertYouTube } from "./block-note/Youtube";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    urdu: Urdu,
    arabic: Arabic,
    youtube: YouTubeBlock,
  },
  styleSpecs: {
    // Adds all default styles.
    ...defaultStyleSpecs,
    // Adds the Font style.
    font: Font,
  },
});

export function BlockNoteSidebar() {
  const {
    openSidebar,
    setOpenSidebar,
    pageTitle,
    setPageTitle,
    pageGuess,
    setPageGuess,
    setPageContent,
    pageClass,
    pageBook,
    pageContent,
    pagePriority,
    setPagePriority,
    pageIcon,
    setPageIcon,
    nanoPageId,
    SyncedQueue,
    setIsReadingMode,
    isReadingMode,
    setOpenQuiz,
  } = useGlobalStore();

  // const [editor, setEditor] = useState<BlockNoteEditor<typeof schema> | null>(null);
  const [editor, setEditor] = useState<any>(null);

  const fallbackContent: PartialBlock[] = [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "",
          styles: {},
        },
      ],
    },
  ];

  async function uploadFile(file: File) {
    // const body = new FormData();
    // body.append("file", file);
    // const ret = await fetch("https://tmpfiles.org/api/v1/upload", {
    //   method: "POST",
    //   body: body,
    // });
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.1, // 100KB
      useWebWorker: true,
      initialQuality: 0.4, // start more aggressive
      maxWidthOrHeight: 1024, // shrink it more
    });
    console.log(compressed.size);
    const base64 = await imageCompression.getDataUrlFromFile(compressed);
    console.log("Base64 String:", base64); // ← Use this however you want
    return base64;
    // return (await ret.json()).data.url.replace(
    //   "tmpfiles.org/",
    //   "tmpfiles.org/dl/"
    // );
  }

  useEffect(() => {
    const createEditor = async () => {
      let parsedContent;

      try {
        parsedContent =
          pageContent && pageContent !== ""
            ? JSON.parse(pageContent)
            : fallbackContent;
      } catch (err) {
        parsedContent = fallbackContent;
      }

      const newEditor = await BlockNoteEditor.create({
        codeBlock,
        schema,
        initialContent: parsedContent,
        uploadFile,
      });

      setEditor(newEditor);
    };

    createEditor();
  }, [pageContent]);

  return (
    <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
      <DialogTitle className="hidden">Edit Page</DialogTitle>
      <SheetContent className="w-full sm:max-w-1/2 overflow-y-auto overflow-x-hidden">
        <div>
          <input
            inert={isReadingMode ? true : false}
            className="text-xl font-bold w-full bg-transparent focus:outline-none px-2"
            value={pageTitle}
            placeholder="Page Title"
            onChange={(e) => setPageTitle(e.target.value)}
          />
        </div>
        <input
          inert={isReadingMode ? true : false}
          className="w-full bg-transparent focus:outline-none px-2 text-muted-foreground text-sm"
          value={pageGuess}
          placeholder="Page Guess"
          onChange={(e) => setPageGuess(e.target.value)}
        />
        <div className="grid grid-cols-2">
          <ClassBookComboBox classorbook="class" />
          <ClassBookComboBox classorbook="book" />
        </div>
        <div className="grid grid-cols-2">
          <Select
            disabled={isReadingMode ? true : false}
            value={pagePriority}
            onValueChange={(value) => setPagePriority(value)}
          >
            <SelectTrigger className="w-auto mx-2">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="high">high</SelectItem>
            </SelectContent>
          </Select>
          <div className="border border-slate-400/30 mx-2 rounded-md px-2 justify-between flex items-center">
            <Label data-key="r" htmlFor="readingmode">
              Reading Mode
            </Label>
            <Switch
              id="readingmode"
              checked={isReadingMode}
              onCheckedChange={setIsReadingMode}
            />
            <Button variant="outline" onClick={() => setOpenQuiz(true)}>
              Quiz
            </Button>
          </div>
        </div>
        <div className="grid flex-1 gap-6 px-4 w-full">
          {editor && (
            <BlockNoteView
              editable={!isReadingMode}
              editor={editor}
              theme={"light"}
              spellCheck={!isReadingMode}
              slashMenu={false}
            >
              <FormattingToolbarController
                formattingToolbar={() => (
                  <FormattingToolbar>
                    <BlockTypeSelect key={"blockTypeSelect"} />
                    {/* Extra button to toggle blue text & background */}
                    <BlueButton key={"customButton"} />
                    <FileCaptionButton key={"fileCaptionButton"} />
                    <FileReplaceButton key={"replaceFileButton"} />
                    <BasicTextStyleButton
                      basicTextStyle={"bold"}
                      key={"boldStyleButton"}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={"italic"}
                      key={"italicStyleButton"}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={"underline"}
                      key={"underlineStyleButton"}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={"strike"}
                      key={"strikeStyleButton"}
                    />
                    {/* Extra button to toggle code styles */}
                    <BasicTextStyleButton
                      key={"codeStyleButton"}
                      basicTextStyle={"code"}
                    />
                    <TextAlignButton
                      textAlignment={"left"}
                      key={"textAlignLeftButton"}
                    />
                    <TextAlignButton
                      textAlignment={"center"}
                      key={"textAlignCenterButton"}
                    />
                    <TextAlignButton
                      textAlignment={"right"}
                      key={"textAlignRightButton"}
                    />
                    <ColorStyleButton key={"colorStyleButton"} />
                    <NestBlockButton key={"nestBlockButton"} />
                    <UnnestBlockButton key={"unnestBlockButton"} />
                    <CreateLinkButton key={"createLinkButton"} />
                  </FormattingToolbar>
                )}
              />
              <SuggestionMenuController
                triggerCharacter={"/"}
                getItems={async (query) => {
                  // Gets all default slash menu items.
                  const defaultItems = getDefaultReactSlashMenuItems(editor);
                  // Finds index of last item in "Basic blocks" group.
                  const lastBasicBlockIndex = defaultItems.findLastIndex(
                    (item) => item.group === "basics"
                  );
                  // Inserts the Alert item as the last item in the "Basic blocks" group.
                  defaultItems.splice(
                    lastBasicBlockIndex + 1,
                    0,
                    insertUrdu(editor),
                    insertArabic(editor),
                    insertYouTube(editor)
                  );
                  // Returns filtered items based on the query.
                  return filterSuggestionItems(defaultItems, query);
                }}
              />
            </BlockNoteView>
          )}
        </div>
        <SheetFooter>
          <input
            type="text"
            value={pageIcon ?? ""}
            placeholder="Page Icon"
            onChange={(e) => setPageIcon(e.target.value)}
          />
          <Button
            inert={isReadingMode ? true : false}
            type="submit"
            onClick={async () => {
              const currentContent = editor
                ? JSON.stringify(editor.topLevelBlocks, null, 2)
                : pageContent || ""; // fallback to last known content or empty string

              setPageContent(currentContent);
              try {
                const items: any = {
                  id: nanoPageId,
                  title: pageTitle,
                  guess: pageGuess,
                  content: currentContent,
                  renderRange: 0,
                  renderDate: new Date().getTime(),
                  classId: pageClass,
                  bookId: pageBook,
                  priority: pagePriority,
                };

                if (typeof pageIcon === "string" && pageIcon.trim() !== "") {
                  items.pageIcon = pageIcon;
                }
                await db.Items.add(items);
                await SyncedQueue(nanoPageId, "Items", "add");
                toast.success("add", {
                  description: nanoPageId,
                  duration: 500,
                });
              } catch (error) {
                const err = error as { name: string; message: string };
                if (err.name === "ConstraintError") {
                  const changes: any = {
                    id: nanoPageId,
                    title: pageTitle,
                    guess: pageGuess,
                    content: currentContent,
                    renderDate: new Date().getTime(),
                    classId: pageClass,
                    bookId: pageBook,
                    priority: pagePriority,
                  };
                  if (typeof pageIcon === "string" && pageIcon.trim() !== "") {
                    changes.pageIcon = pageIcon;
                  }
                  await db.Items.update(nanoPageId, changes);
                  await SyncedQueue(nanoPageId, "Items", "update");

                  toast.success("updated", {
                    description: nanoPageId,
                    duration: 100,
                  });
                } else {
                  toast.error("Something went wrong to save or update doc", {
                    description: err.message,
                    duration: 7000,
                  });
                }
              }
            }}
          >
            Save changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
