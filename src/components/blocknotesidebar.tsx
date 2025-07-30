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
import { useEffect, useState } from "react";
import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
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
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { Urdu, insertUrdu } from "./block-note/Urdu";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    urdu: Urdu,
    arabic: Arabic,
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
    nanoPageId,
    SyncedQueue,
    isReadingMode,
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
        <input
          inert={isReadingMode ? true : false}
          className="text-xl font-bold w-full bg-transparent focus:outline-none px-2"
          value={pageTitle}
          placeholder="Page Title"
          onChange={(e) => setPageTitle(e.target.value)}
        />
        <input
          inert={isReadingMode ? true : false}
          className="w-full bg-transparent focus:outline-none px-2 text-muted-foreground text-sm"
          value={pageGuess}
          placeholder="Page Guess"
          onChange={(e) => setPageGuess(e.target.value)}
        />
        <ClassBookComboBox classorbook="class" />
        <ClassBookComboBox classorbook="book" />
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
        <div className="grid flex-1 gap-6 px-4 w-full">
          {editor && (
            <BlockNoteView
              editable={!isReadingMode}
              editor={editor}
              theme={"light"}
              spellCheck={!isReadingMode}
              slashMenu={false}
            >
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
                    insertArabic(editor)
                  );
                  // Returns filtered items based on the query.
                  return filterSuggestionItems(defaultItems, query);
                }}
              />
            </BlockNoteView>
          )}
        </div>
        <SheetFooter>
          <Button
            inert={isReadingMode ? true : false}
            type="submit"
            onClick={async () => {
              const currentContent = editor
                ? JSON.stringify(editor.topLevelBlocks, null, 2)
                : pageContent || ""; // fallback to last known content or empty string

              setPageContent(currentContent);
              try {
                await db.Items.add({
                  id: nanoPageId,
                  title: pageTitle,
                  guess: pageGuess,
                  content: currentContent,
                  renderRange: 0,
                  renderDate: new Date().getTime(),
                  classId: pageClass,
                  bookId: pageBook,
                  priority: pagePriority,
                });
                await SyncedQueue(nanoPageId, "Items", "add");
                toast.success("Success save id", {
                  description: nanoPageId,
                });
              } catch (error) {
                const err = error as { name: string; message: string };
                if (err.name === "ConstraintError") {
                  await db.Items.update(nanoPageId, {
                    id: nanoPageId,
                    title: pageTitle,
                    guess: pageGuess,
                    content: currentContent,
                    renderDate: new Date().getTime(),
                    classId: pageClass,
                    bookId: pageBook,
                    priority: pagePriority,
                  });
                  await SyncedQueue(nanoPageId, "Items", "update");

                  toast.success("Page already present successfully updated", {
                    description: nanoPageId,
                  });
                } else {
                  toast.error("Something went wrong", {
                    description: err.message,
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
