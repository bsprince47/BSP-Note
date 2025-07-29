import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGlobalStore } from "@/GlobalProvider";
import { db } from "@/Dexie";

export function CommandSearch() {
  const { openCommandSearch, setOpenCommandSearch } = useGlobalStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const {
    setOpenSidebar,
    setPageTitle,
    setPageGuess,
    setPageContent,
    setPageClass,
    setPageBook,
    setPagePriority,
    // setPagePriority,
    setNanoPageId,
  } = useGlobalStore();
  //   useEffect(() => {
  //     const down = (e: KeyboardEvent) => {
  //       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
  //         e.preventDefault();
  //         setOpen((open) => !open);
  //       }
  //     };
  //     document.addEventListener("keydown", down);
  //     return () => document.removeEventListener("keydown", down);
  //   }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      const lower = query.toLowerCase();

      const data = await db.Items.filter(
        (item) =>
          item.id.toLowerCase().includes(lower) ||
          item.guess.toLowerCase().includes(lower) ||
          item.title.toLowerCase().includes(lower) ||
          item.content.toLowerCase().includes(lower) ||
          item.bookId.toLowerCase().includes(lower) ||
          item.priority.toLowerCase().includes(lower)
      ).toArray();

      setResults(data);
      console.log(data);
    };

    runSearch();
  }, [query]);

  return (
    <CommandDialog open={openCommandSearch} onOpenChange={setOpenCommandSearch}>
      <CommandInput
        placeholder="Type a command or search..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {results.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
        <CommandGroup heading="Results">
          {results.map((note) => {
            console.log(note.priority);
            return (
              <CommandItem
                key={note.id}
                value={`${note.title} ${note.priority} ${note.bookId} ${note.id} ${note.guess}`}
                onSelect={() => {
                  setOpenCommandSearch(false);
                  setOpenSidebar(true);
                  setNanoPageId(note.id);
                  setPageTitle(note.title);
                  setPageGuess(note.guess);
                  setPagePriority(note.priority);
                  setPageContent(
                    note.content ??
                      `[{type: "paragraph",content: [{type: "text",text: "",styles: {},},],},]`
                  );
                  setPageClass(note.classId);
                  setPageBook(note.bookId);
                }}
                className="flex flex-col items-start"
              >
                <div className="font-medium w-full">{note.title}</div>
                <span>{note.guess}</span>
                <div className="text-xs text-muted-foreground flex justify-between gap-2 w-full">
                  <span>{note.id}</span>
                  <span>{note.priority}</span>
                  <span>{note.classId}</span>
                  <span>{note.bookId}</span>
                  <span>{note.renderRange}</span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
