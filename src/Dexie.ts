import Dexie from "dexie";

export type PageItem = {
  id: string;
  title: string;
  guess: string;
  content: string;
  renderRange?: number;
  renderDate: number;
  classId: string;
  bookId: string;
  priority: string;
  pageIcon?: string;
};

export type ClassorBook = {
  id: string;
  classId: string;
  bookId: string;
};
export type Icons = {
  value: string;
  url: string;
};
export type SyncQueueItem = {
  id: string; // same as real item’s id
  table: string;
  type: "add" | "update" | "delete";
  status: "pending";
};
export type SyncMeta = {
  key: string;
  value: unknown;
};

export class BSPNoteDatabase extends Dexie {
  Items!: Dexie.Table<PageItem, string>;
  ClassorBook!: Dexie.Table<ClassorBook, string>;
  Icons!: Dexie.Table<Icons, string>;
  SyncedQueue!: Dexie.Table<SyncQueueItem, string>;
  SyncMeta!: Dexie.Table<SyncMeta, string>;

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      Items:
        "id, title,guess,content,renderRange,renderDate,classId, bookId, priority",
      ClassorBook: "id,classId,bookId",
      Icons: "value, url",
      SyncedQueue: "id, table, type, status", // indexable
      SyncMeta: "key", // indexable
    });
    this.Items = this.table("Items");
    this.ClassorBook = this.table("ClassorBook");
    this.Icons = this.table("Icons");
    this.SyncedQueue = this.table("SyncedQueue");
    this.SyncMeta = this.table("SyncMeta");
  }
}

export const db = new BSPNoteDatabase();
