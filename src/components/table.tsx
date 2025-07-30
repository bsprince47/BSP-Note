import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
  type ColumnDef,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { BlockNoteSidebar } from "./blocknotesidebar";
import { useMemo } from "react";
import { toast } from "sonner";
import { useFilteredPages, useGlobalStore } from "@/GlobalProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/Dexie";
import type { PageItem } from "@/Dexie";
import { useDialogStore } from "@/stores/alert-dialog-store";
import { DbIcon } from "./dbIcon";
// import { Fdb } from "@/firebase";
// import { doc } from "firebase/firestore";

export default function Table() {
  const {
    setOpenSidebar,
    setPageTitle,
    setPageGuess,
    setPageContent,
    setPageClass,
    setPageBook,
    setNanoPageId,
    setPagePriority,
    SyncedQueue,
    selectedFilter,
    renderRangeData,
    isRenderingMode,
    setIsRenderingMode,
  } = useGlobalStore();
  const data = useFilteredPages(selectedFilter); // ← this replaces pages

  // field: keyof User
  const idBodyTemplate = () => ({
    header: "ID",
    size: 50,
    thClassName: "p-2",
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-full h-full">
              <GripVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(item.id);

                  toast.success("Success copy id", {
                    description: item.id,
                  });
                }}
              >
                Copy Id
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpenSidebar(true);
                  setNanoPageId(item.id);
                  setPageTitle(item.title);
                  setPageGuess(item.guess);
                  setPagePriority(item.priority);
                  setPageContent(
                    item.content ??
                      `[{type: "paragraph",content: [{type: "text",text: "",styles: {},},],},]`
                  );
                  setPageClass(item.classId);
                  setPageBook(item.bookId);
                }}
              >
                Open page
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const confirmed = await useDialogStore.getState().show({
                    title: "Delete this post?",
                    description: "This cannot be undone.",
                    actionLabel: "Delete",
                    cancelLabel: "Cancel",
                  });

                  if (confirmed) {
                    db.Items.delete(item.id);
                    await SyncedQueue(item.id, "Items", "delete");

                    toast.success("deleted item", {
                      description: item.id,
                    });

                    // delete logic
                  } else {
                    console.log("User canceled");
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  });
  const titleBodyTemplate = () => ({
    header: "Title",
    size: 250,
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      return (
        <div className="p-2 group font-bold relative cursor-pointer">
          <span className="flex gap-1 items-center">
            <DbIcon keyName={item.bookId} />
            <span
              onClick={(e) => {
                e.currentTarget.classList.toggle("blur-sm");
              }}
              className="blur-sm"
            >
              {item.title}
            </span>
          </span>
        </div>
      );
    },
  });
  const renderRangeBodyTemplate = () => ({
    header: "Range",
    size: 100,
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      return (
        <div className="p-2">
          <AlertDialog>
            <AlertDialogTrigger
              className={`w-full rounded-md text-sm font-medium  bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2`}
            >
              {renderRangeData[item.renderRange || 0].label}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you want to render after given date then ok other wise
                  cancel
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={async () => {
                    if (isRenderingMode) {
                      try {
                        const newRenderRange = 1;

                        await db.Items.update(item.id, {
                          ...item,
                          renderRange: newRenderRange,
                          renderDate:
                            new Date().getTime() +
                            renderRangeData[String(newRenderRange)].time,
                        });
                        await SyncedQueue(item.id, "Items", "update");

                        toast.success(
                          "Page already present successfully updated",
                          {
                            description: item.id,
                          }
                        );
                      } catch (e) {
                        console.error("❌ Failed to update progress:", e);
                      }
                    } else {
                      toast.error("Switch to render Mode For Render Feature");
                    }
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (isRenderingMode) {
                      try {
                        const newRenderRange = Math.min(
                          (item?.renderRange ?? 0) + 1,
                          9
                        );

                        await db.Items.update(item.id, {
                          ...item,
                          renderRange: newRenderRange,
                          renderDate:
                            new Date().getTime() +
                            renderRangeData[String(newRenderRange)].time,
                        });
                        await SyncedQueue(item.id, "Items", "update");

                        toast.success(
                          "Page already present successfully updated",
                          {
                            description: item.id,
                          }
                        );
                      } catch (e) {
                        console.error("❌ Failed to update progress:", e);
                      }
                    } else {
                      toast.error("Switch to render Mode For Render Feature");
                    }
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  });
  const guessBodyTemplate = () => ({
    header: "Guess",
    size: 300,
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      return <div className="p-2">{item.guess}</div>;
    },
  });
  const classBodyTemplate = (field: keyof PageItem) => ({
    header: field === "classId" ? "Class" : "Book",
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      const key =
        field === "classId"
          ? item.classId.trim()
          : item.bookId.trim() || "placeholder";

      return (
        <div className="p-2 text-center flex items-center gap-2">
          <DbIcon keyName={key} />

          <span>
            {field === "classId" ? item.classId.trim() : item.bookId.trim()}
          </span>
        </div>
      );
    },
  });
  const priorityBodyTemplate = () => ({
    header: "Priority",
    tdClassName: "text-center",
    cell: ({ row }: { row: Row<PageItem> }) => {
      const item = row.original; // 👈 full row data

      return (
        // "default |outline | secondary | destructive"
        <span
          className={`${
            item.priority === "high"
              ? "bg-green-200/50 text-green-800"
              : item.priority === "medium"
              ? "bg-yellow-200/50 text-yellow-800"
              : "bg-red-200/50 text-red-800"
          } p-1 rounded-md block mx-2
         `}
        >
          {item.priority}
        </span>
      );
    },
  });

  const columns = useMemo<ColumnDef<PageItem>[]>(
    () => [
      // { header: 'ID', accessorKey: 'id', size: 50 },
      idBodyTemplate(),
      titleBodyTemplate(),
      renderRangeBodyTemplate(),
      guessBodyTemplate(),
      classBodyTemplate("classId"),
      classBodyTemplate("bookId"),
      priorityBodyTemplate(),
    ],
    []
  );

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-scroll table-wrapper">
      <table className="table-fixed border-collapse w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`border bg-gray-100 ${
                    (header as any).column?.columnDef?.className || ""
                  } ${(header as any).column?.columnDef?.thClassName || ""}`}
                  style={{ width: header.column.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`border ${
                    (cell as any).column?.columnDef?.className || ""
                  } ${(cell as any).column?.columnDef?.tdClassName || ""}`}
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <BlockNoteSidebar />
    </div>
  );
}
