import { create } from "zustand";
import { db, type PageItem } from "./Dexie";
import { useLiveQuery } from "dexie-react-hooks";

type GlobalStore = {
  selectedFilter: string;
  setSelectedFilter: (val: string) => void;

  openCommandSearch: boolean;
  setOpenCommandSearch: (val: boolean) => void;
  openQuiz: boolean;
  setOpenQuiz: (val: boolean) => void;

  isReadingMode: boolean;
  setIsReadingMode: (val: boolean) => void;
  isRenderingMode: boolean;
  setIsRenderingMode: (val: boolean) => void;

  openIcon: boolean;
  setOpenIcon: (val: boolean) => void;

  openSidebar: boolean;
  setOpenSidebar: (val: boolean) => void;
  nanoPageId: string;
  setNanoPageId: (val: string) => void;

  pageTitle: string;
  setPageTitle: (val: string) => void;
  pageGuess: string;
  setPageGuess: (val: string) => void;
  pageContent: string;
  setPageContent: (val: string) => void;
  pageClass: string;
  setPageClass: (val: string) => void;
  pageBook: string;
  setPageBook: (val: string) => void;
  pagePriority: string;
  setPagePriority: (val: string) => void;

  SyncedQueue: (
    id: string,
    table: "Items" | "ClassorBook" | "Icons",
    type?: "add" | "update" | "delete"
  ) => Promise<void>;

  syncLoading: boolean;
  setSyncLoading: (val: boolean) => void;

  // icons: Icon[];

  renderRangeData: Record<string, { time: number; label: string }>;
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  selectedFilter: "all",
  setSelectedFilter: (val) => set({ selectedFilter: val }),

  openCommandSearch: false,
  setOpenCommandSearch: (val) => set({ openCommandSearch: val }),
  openQuiz: false,
  setOpenQuiz: (val) => set({ openQuiz: val }),

  isReadingMode: true,
  setIsReadingMode: (val) => set({ isReadingMode: val }),
  isRenderingMode: true,
  setIsRenderingMode: (val) => set({ isRenderingMode: val }),

  openIcon: false,
  setOpenIcon: (val) => set({ openIcon: val }),

  openSidebar: false,
  setOpenSidebar: (val) => set({ openSidebar: val }),
  nanoPageId: "",
  setNanoPageId: (val) => set({ nanoPageId: val }),

  pageTitle: "",
  setPageTitle: (val) => set({ pageTitle: val }),
  pageGuess: "",
  setPageGuess: (val) => set({ pageGuess: val }),
  pageContent: "",
  setPageContent: (val) => set({ pageContent: val }),
  pageClass: "",
  setPageClass: (val) => set({ pageClass: val }),
  pageBook: "",
  setPageBook: (val) => set({ pageBook: val }),
  pagePriority: "",
  setPagePriority: (val) => set({ pagePriority: val }),

  // 💾 Save + queue
  SyncedQueue: async (id, table, type = "add") => {
    console.log("work");
    await db.SyncedQueue.put({
      id,
      table,
      type,
      status: "pending",
    });
    console.log("✅ Saved + synced:", id);
  },

  syncLoading: false,
  setSyncLoading: (val) => set({ syncLoading: val }),

  // icons: [
  //   { value: "Code", url: "https://img.icons8.com/color/48/code.png" },
  //   { value: "study", url: "https://img.icons8.com/color/48/teaching.png" },
  //   { value: "JS", url: "https://img.icons8.com/color/48/javascript--v1.png" },
  //   {
  //     value: "placeholder",
  //     url: "https://img.icons8.com/fluency-systems-regular/48/image--v1.png",
  //   },
  //   {
  //     value: "vocabulary",
  //     url: "https://img.icons8.com/pieces/64/dictionary.png",
  //   },
  //   {
  //     value: "Islam",
  //     url: "https://img.icons8.com/external-bzzricon-outline-bzzricon-studio/64/external-decoration-ramadan-bzzricon-outline-bzzricon-outline-bzzricon-studio.png",
  //   },
  //   {
  //     value: "Personalities",
  //     url: "https://img.icons8.com/parakeet-line/48/person-male.png",
  //   },
  //   {
  //     value: "Quran",
  //     url: "https://img.icons8.com/external-bzzricon-flat-bzzricon-studio/64/external-quran-ramadan-bzzricon-flat-bzzricon-flat-bzzricon-studio-2.png",
  //   },
  // ],

  renderRangeData: {
    // 0: { time: 6000, label: "1h" },
    0: { time: 1 * 60 * 60 * 1000, label: "1h" },
    // 1: { time: 6000, label: "3h" },
    1: { time: 3 * 60 * 60 * 1000, label: "3h" },
    2: { time: 24 * 60 * 60 * 1000, label: "24h" },
    3: { time: 3 * 24 * 60 * 60 * 1000, label: "3d" },
    4: { time: 6 * 24 * 60 * 60 * 1000, label: "6d" },
    5: { time: 30 * 24 * 60 * 60 * 1000, label: "30d" },
    6: { time: 3 * 30 * 24 * 60 * 60 * 1000, label: "3m" },
    7: { time: 6 * 30 * 24 * 60 * 60 * 1000, label: "6m" },
    8: { time: 12 * 30 * 24 * 60 * 60 * 1000, label: "12m" },
  },
}));

export function useFilteredPages(filter: string): PageItem[] {
  const { isRenderingMode } = useGlobalStore();
  const data = useLiveQuery(() => {
    if (filter === "all")
      return db.Items.filter(
        (item) => item.renderDate <= new Date().getTime()
      ).toArray();
    if (isRenderingMode) {
      return db.Items.where("bookId")
        .equals(filter)
        .filter((item) => item.renderDate <= new Date().getTime())
        .toArray(); // change field as needed
    } else {
      return db.Items.where("bookId").equals(filter).toArray(); // change field as needed
    }
  }, [filter, isRenderingMode]);

  return data ?? [];
}
