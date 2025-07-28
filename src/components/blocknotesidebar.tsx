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
import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import imageCompression from "browser-image-compression";

// interface EditorProps {
//   onChange: (value: string) => void;
//   initialContent?: string;
//   editable?: boolean;
// }
// {onChange,initialContent, editable}: EditorProps
export function BlockNoteSidebar() {
  const {
    openSidebar,
    setOpenSidebar,
    pageTitle,
    setPageTitle,
    pageGuess,
    setPageGuess,

    pageClass,
    pageBook,
    pageContent,
    nanoPageId,
    SyncedQueue,
    isReadingMode,
  } = useGlobalStore();
  // const editor = useCreateBlockNote({
  //   initialContent:
  //     pageContent && pageContent !== ""
  //       ? JSON.parse(pageContent)
  //       : [
  //           {
  //             type: "paragraph",
  //             content: [],
  //           },
  //         ],
  // });

  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  // const editor : BlockNoteEditor = useBlockNote({
  //   editable,
  //   initialContent: initialContent? JSON.parse(initialContent),
  //   onEitorContentChange: (editor) => {
  //     onChange(JSON.stringify(editor.topLevelBlocks,null,2))
  //   }
  // })

  // const editor = useCreateBlockNote({
  //   initialContent: fallbackContent,
  // });

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

  // Uploads a file to tmpfiles.org and returns the URL to the uploaded file.
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
      <SheetContent className="w-full sm:max-w-1/2 overflow-auto">
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
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {editor && (
            <BlockNoteView
              editable={!isReadingMode}
              editor={editor}
              theme={"light"}
            />
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

              // setPageContent(currentContent);
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
                  priority: "low",
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
                    priority: "low",
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
