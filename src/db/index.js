import { openDB } from "idb";
import { base64ToBlob, blobToBase64 } from "../utils/base64";

export const dbPromise = openDB("bodhi-hell", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("profiles")) {
      db.createObjectStore("profiles", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("trunks")) {
      db.createObjectStore("trunks", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images");
    }
  },
});

export async function exportDatabaseToJson() {
  const db = await dbPromise;

  const stores = ["profiles", "trunks", "images"];

  const exportObj = {};

  for (const storeName of stores) {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    
    if (storeName === "images") {
      const all = await store.getAll();
      const keys = await store.getAllKeys();

      exportObj[storeName] = {};

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const blob = all[i];
        const base64 = await blobToBase64(blob);
        exportObj[storeName][key] = base64;
      }
    } else {
      // Normal JSON store
      exportObj[storeName] = await store.getAll();
    }

    await tx.done;
  }

  return exportObj;
}


export async function importDatabaseFromJson(jsonData) {
  const db = await dbPromise;

  const { profiles = [], trunks = [], images = {} } = jsonData;

  // ✅ Profiles
  const tx1 = db.transaction("profiles", "readwrite");
  for (const p of profiles) {
    await tx1.store.put(p);
  }
  await tx1.done;

  // ✅ Trunks
  const tx2 = db.transaction("trunks", "readwrite");
  for (const t of trunks) {
    await tx2.store.put(t);
  }
  await tx2.done;

  // ✅ Images (key/value)
  const tx3 = db.transaction("images", "readwrite");
  for (const key of Object.keys(images)) {
    const base64 = images[key];
    const blob = base64ToBlob(base64);
    await tx3.store.put(blob, Number(key));
  }
  await tx3.done;

  return true;
}

export async function clearDatabase() {
  const db = await dbPromise;

  await db.clear("profiles");
  await db.clear("trunks");
  await db.clear("images");
}