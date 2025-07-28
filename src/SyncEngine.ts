import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./Dexie";
import { Fdb } from "./firebase";
import { toast } from "sonner";

type TableName = "Items" | "ClassorBook" | "Icons";
const getTable = (name: TableName) => {
  return db[name]; // TS knows it's safe now
};

async function DexieToFirestore() {
  const queue = await db.SyncedQueue.toArray();

  for (const item of queue) {
    try {
      const ref = doc(Fdb, item.table, item.id);

      if (item.type === "add" || item.type === "update") {
        console.log(item.table);
        const table = getTable(item.table as TableName);
        const localData = await table.get(item.id);
        if (localData) {
          await setDoc(ref, { ...localData, updatedAt: serverTimestamp() });
        } else {
          console.error("table id not defined");
        }
      } else if (item.type === "delete") {
        await deleteDoc(ref);
        await setDoc(doc(Fdb, "DeletedItems", item.id), {
          id: item.id,
          table: item.table,
          updatedAt: serverTimestamp(),
        });
      }

      // ✅ Remove after syncing
      await db.SyncedQueue.delete(item.id);
      console.log("🔥 Synced with Firestore:", item);
    } catch (err) {
      console.error("❌ Firestore sync failed", err);
    }
  }
}

async function FirestoreToDexie() {
  const meta = await db.SyncMeta.get("lastSyncedAt");
  const lastSyncedAt =
    typeof meta?.value === "string" ? new Date(meta?.value) : new Date(0);

  if (lastSyncedAt instanceof Date && !isNaN(lastSyncedAt.getTime())) {
    const Itemss = query(
      collection(Fdb, "Items"),
      where("updatedAt", ">", Timestamp.fromDate(new Date(lastSyncedAt)))
    );
    const deletedItemss = query(
      collection(Fdb, "DeletedItems"),
      where("updatedAt", ">", Timestamp.fromDate(new Date(lastSyncedAt)))
    );
    const classOrBooks = query(
      collection(Fdb, "ClassorBook"),
      where("updatedAt", ">", Timestamp.fromDate(new Date(lastSyncedAt)))
    );
    const Iconss = query(
      collection(Fdb, "Icons"),
      where("updatedAt", ">", Timestamp.fromDate(new Date(lastSyncedAt)))
    );

    const Items = await getDocs(Itemss);
    if (Items.docs.length !== 0) {
      for (const item of Items.docs) {
        const data = item.data();
        await db.Items.put({
          id: item.id,
          title: data.title || "",
          guess: data.guess || "",
          content: data.content || "",
          renderDate: data.renderDate || Date.now(),
          renderRange: data.renderRange || 0,
          classId: data.classId || "",
          bookId: data.bookId || "",
          priority: data.priority || "low",
        });
        toast.success("Items", {
          description: `${Items.docs.length + 1} Synced`,
        });
      }
    }

    const deletedItems = await getDocs(deletedItemss);
    if (deletedItems.docs.length !== 0) {
      for (const item of deletedItems.docs) {
        const data = item.data();
        const table = getTable(data.table as TableName);

        await table.delete(data.id);
      }
      toast.success("deletedItems", {
        description: `${deletedItems.docs.length + 1} Synced`,
      });
    }

    const classOrBook = await getDocs(classOrBooks);
    if (classOrBook.docs.length !== 0) {
      for (const item of classOrBook.docs) {
        const data = item.data();
        await db.ClassorBook.put({
          id: data.id,
          classId: data.classId,
          bookId: data.bookId,
        });
      }
      toast.success("classorbook", {
        description: `${classOrBook.docs.length + 1} Synced`,
      });
    }

    const Icons = await getDocs(Iconss);
    if (Icons.docs.length !== 0) {
      for (const item of Icons.docs) {
        const data = item.data();
        await db.Icons.put({
          value: data.value,
          url: data.url,
        });
      }
      toast.success("Icons", {
        description: `${classOrBook.docs.length + 1} Synced`,
      });
    }
  }
}

export const lastSyncedCheck = async () => {
  const existing = await db.SyncMeta.get("lastSyncedAt");
  if (!existing) {
    await db.SyncMeta.put({
      key: "lastSyncedAt",
      value: new Date("2025-01-01").toISOString(),
    });
  }
};

let isSyncing: boolean = false;

export async function allSync(setSyncLoading: (val: boolean) => void) {
  if (isSyncing) return;
  try {
    isSyncing = true;
    setSyncLoading(true);
    DexieToFirestore();
    FirestoreToDexie();
    await db.SyncMeta.put({
      key: "lastSyncedAt",
      value: new Date().toISOString(),
    });
    setTimeout(() => {
      setSyncLoading(false);
      isSyncing = false;
    }, 500);
  } catch (err) {
    console.error(err);
  }
}
