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
import { toast } from "sonner";
import { DbIcon } from "./dbIcon";

type Props = {
  classorbook: string;
};

export function ClassBookComboBox({ classorbook }: Props) {
  const data = useLiveQuery(() => db.ClassorBook.toArray(), [], []);

  const {
    pageClass,
    setPageClass,
    pageBook,
    setPageBook,
    SyncedQueue,
    isReadingMode,
  } = useGlobalStore();
  const [open, setOpen] = React.useState(false);

  const classSet = Array.from(new Set(data.map((item) => item.classId)));

  if (classorbook === "class") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="mx-2">
          <Button
            inert={isReadingMode ? true : false}
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
                      <DbIcon keyName={item} />
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
            inert={isReadingMode ? true : false}
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
                  if (!classId || !bookId) return;

                  setPageClass(classId);
                  setPageBook(bookId);

                  // Check if item already exists
                  const exists = await db.ClassorBook.where({
                    classId,
                    bookId,
                  }).first();

                  if (!exists) {
                    const item = {
                      id: nanoid(),
                      classId,
                      bookId,
                    };
                    await db.ClassorBook.add(item);
                    await SyncedQueue(item.id, "ClassorBook", "add");
                  } else {
                    toast.error("Duplicate Error", {
                      description: "Alread Present",
                    });
                  }
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
                        <DbIcon keyName={item.bookId} />
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
