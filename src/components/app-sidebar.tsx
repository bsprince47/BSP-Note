import {
  Search,
  FilePlus,
  ArrowBigRight,
  ArrowBigDownDash,
  PackageOpen,
  User2,
  Database,
  Loader2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { nanoid } from "nanoid";
import { useGlobalStore } from "@/GlobalProvider";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/Dexie";
import { useEffect, useState } from "react";
import { allSync } from "@/SyncEngine";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { DbIcon } from "./dbIcon";

export function AppSidebar() {
  const [user, setUser] = useState(null);
  const {
    setOpenSidebar,
    setPageTitle,
    setPageGuess,
    setOpenCommandSearch,
    setNanoPageId,
    setPageContent,
    setPagePriority,
    setSelectedFilter,
    syncLoading,
    setSyncLoading,
    setOpenIcon,
  } = useGlobalStore();
  const itemList = useLiveQuery(() => db.ClassorBook.toArray(), [], []);

  // Menu items.
  const items = [
    {
      title: "Sync",
      icon: syncLoading ? Loader2 : Database,
      onclick: () => {
        allSync(setSyncLoading);
      },
    },
    {
      title: "Search",
      icon: Search,
      onclick: () => {
        setOpenCommandSearch(true);
      },
      shortcutKey: "s",
    },
    {
      title: "Icons",
      icon: Search,
      onclick: () => {
        setOpenIcon(true);
      },
    },
    {
      title: "All Items",
      icon: PackageOpen,
      onclick: () => {
        setSelectedFilter("all");
      },
    },
    {
      title: "Add Item",
      icon: FilePlus,
      onclick: () => {
        setOpenSidebar(true);
        setPageTitle("");
        setPageGuess("");
        setPageContent(
          `[{type: "paragraph",content: [{type: "text",text: "",styles: {},},],},]`
        );
        setPagePriority("low"), setNanoPageId(nanoid());
      },
      shortcutKey: "a",
    },
  ];

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      allSync(setSyncLoading);
    });
    return () => unsub();
  }, []);

  const [isOpen, setOpenMap] = useState<Record<string, boolean>>({});

  const toggleOpen = (val: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [val]: !prev[val],
    }));
  };
  const classIds = Array.from(new Set(itemList?.map((item) => item.classId)));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>BSP Note</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div onClick={item.onclick} data-key={item?.shortcutKey}>
                      {syncLoading && item.title === "Sync" ? (
                        <item.icon className="animate-spin" />
                      ) : (
                        <item.icon />
                      )}
                      <span className="select-none">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <hr className="my-5" />
            <SidebarGroupLabel>Pages</SidebarGroupLabel>

            <SidebarMenu className="select-none">
              {classIds?.map((item) => {
                return (
                  <div key={item} className="mb-1">
                    <div
                      onClick={() => toggleOpen(item)}
                      className="flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex gap-2 items-center">
                        <DbIcon keyName={item} />
                        <span className="font-bold">{item}</span>
                      </div>
                      {true && (
                        <span className="text-sm tracking-wider">
                          {isOpen[item] ? (
                            <ArrowBigDownDash />
                          ) : (
                            <ArrowBigRight />
                          )}
                        </span>
                      )}
                    </div>

                    {true && isOpen[item] && (
                      <div className="ml-4 mt-1 pl-2">
                        {itemList
                          .filter((subItem) => subItem.classId === item)
                          ?.map((child) => (
                            <div
                              key={child.bookId}
                              onClick={() => {
                                setSelectedFilter(child.bookId);
                              }}
                              className="cursor-pointer px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <div className="flex gap-2 items-center">
                                <DbIcon keyName={child.bookId} />
                                <span className="font-bold tracking-wide">
                                  {child.bookId}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              onClick={() => handleGoogleLogin()}
              className="flex gap-2 hover:bg-neutral-400/30 p-2 rounded-md"
            >
              <User2 />
              {user ? "Process Done" : "Login In"}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
