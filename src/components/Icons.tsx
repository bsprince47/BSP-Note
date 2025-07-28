import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalStore } from "@/GlobalProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { db } from "@/Dexie";
import { useLiveQuery } from "dexie-react-hooks";

export function Icons() {
  const iconDbArray = useLiveQuery(() => db.Icons.toArray(), []) || [];
  const { SyncedQueue, openIcon, setOpenIcon } = useGlobalStore();

  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("Quran");
  return (
    <Dialog open={openIcon} onOpenChange={setOpenIcon}>
      <DialogTitle className="hidden">Edit Icon</DialogTitle>
      <DialogContent className="sm:max-w-[425px]">
        <DialogDescription className="sr-only">
          Select or edit an icon
        </DialogDescription>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="mx-2">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              {iconDbArray
                ? iconDbArray.find((item) => item.value === icon)?.value
                : `Select icon`}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput
                placeholder={`Search Icon`}
                className="h-9"
                onKeyDown={async (e) => {
                  if (e.key === "F2") {
                    const iconName = prompt("Enter icon name:");
                    const iconURL = prompt("Enter icon URL:");
                    if (!iconName) return;
                    if (!iconURL) return;
                    setIcon(iconName);
                    const item = {
                      value: iconName,
                      url: iconURL,
                    };
                    await db.Icons.put(item);
                    await SyncedQueue(iconName, "Icons", "add");
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {iconDbArray
                    .filter((item: any) => item.value)
                    .map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={(currentValue: any) => {
                          setIcon(currentValue === icon ? "" : currentValue);

                          setOpen(false);
                        }}
                      >
                        <div className="flex gap-2 items-center">
                          <img
                            src={
                              iconDbArray.find((v) => v.value === item.value)
                                ?.url ||
                              iconDbArray.find((v) => v.value === "placeholder")
                                ?.url
                            }
                            className="h-6 aspect-square"
                          />
                          <span>{item.value}</span>
                        </div>

                        <Check
                          className={cn(
                            "ml-auto",
                            icon === item.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
