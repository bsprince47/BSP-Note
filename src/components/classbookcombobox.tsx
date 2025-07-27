"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGlobalStore } from "@/GlobalProvider";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/Dexie";
import { nanoid } from "nanoid";

type Props = {
  classorbook: string;
};

export function ClassBookComboBox({ classorbook }: Props) {
  const data = useLiveQuery(() => db.ClassorBook.toArray(), [], []);

  const { icons, pageClass, setPageClass, pageBook, setPageBook, SyncedQueue } =
    useGlobalStore();
  const [open, setOpen] = React.useState(false);
  //   const [value, setValue] = React.useState("");

  // React.useEffect(() => {
  //   const handleKey = async (e: KeyboardEvent) => {
  //     if (e.key === "F2") {
  //       if (classorbook === "class") {
  //         const name = prompt("Enter class name:");
  //         if (!name) return;
  //         const newClass = {
  //           value: name.toLowerCase().replace(/\s+/g, "-"),
  //           label: name,
  //           sub: [],
  //         };
  //         await db.ClassorBook.add(newClass);
  //       } else if (classorbook === "book" && pageClass) {
  //         const name = prompt("Enter book name:");
  //         if (!name) return;
  //         const book = {
  //           value: name.toLowerCase().replace(/\s+/g, "-"),
  //           label: name,
  //         };
  //         const cls = await db.ClassorBook.get(pageClass);
  //         if (!cls) return;
  //         const updatedSub = [...(cls.sub || []), book];
  //         await db.ClassorBook.update(pageClass, { sub: updatedSub });
  //       }
  //     }
  //   };

  //   window.addEventListener("keydown", handleKey);
  //   return () => window.removeEventListener("keydown", handleKey);
  // }, [classorbook, pageClass]);
  const classSet = Array.from(new Set(data.map((item) => item.classId)));

  if (classorbook === "class") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="mx-2">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {pageClass
              ? data.find((item) => item.classId === pageClass)?.classId
              : `Select ${classorbook}`}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput
              placeholder={`Search ${classorbook}`}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {classSet.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={(currentValue) => {
                      setPageClass(
                        currentValue === pageClass ? "" : currentValue
                      );
                      setPageBook("");

                      setOpen(false);
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      <img
                        src={
                          icons.find((v) => v.value === item)?.url ||
                          icons.find((v) => v.value === "placeholder")?.url
                        }
                        // src={icons[item] || icons.placeholder}
                        className="h-6 aspect-square"
                      />
                      <span>{item}</span>
                    </div>

                    <Check
                      className={cn(
                        "ml-auto",
                        pageClass === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  } else {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="mx-2">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {pageBook
              ? data.find((item) => item.bookId === pageBook)?.bookId
              : `Select ${classorbook}`}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput
              placeholder={`Search ${classorbook}`}
              className="h-9"
              onKeyDown={async (e) => {
                if (e.key === "F2") {
                  const classId = prompt("Enter class name:", pageClass);
                  const bookId = prompt("Enter book name:");
                  if (!classId) return;
                  if (!bookId) return;
                  setPageClass(classId);
                  setPageBook(bookId);
                  const item = {
                    id: nanoid(),
                    classId: classId,
                    bookId: bookId,
                  };
                  await db.ClassorBook.add(item);
                  await SyncedQueue(item.id, "ClassorBook", "add");
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {data
                  .filter((item) => item.classId === pageClass)
                  .map((item) => (
                    <CommandItem
                      key={item.bookId}
                      value={item.bookId}
                      onSelect={(currentValue) => {
                        setPageBook(
                          currentValue === pageBook ? "" : currentValue
                        );

                        setOpen(false);
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <img
                          src={
                            icons.find((v) => v.value === item.bookId)?.url ||
                            icons.find((v) => v.value === "placeholder")?.url
                          }
                          className="h-6 aspect-square"
                        />
                        <span>{item.bookId}</span>
                      </div>

                      <Check
                        className={cn(
                          "ml-auto",
                          pageClass === item.bookId
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
}
