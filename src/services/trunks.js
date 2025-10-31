import { dbPromise } from "../db";

// —— trunks ——

export async function fetchTrunksFromDb() {
  const db = await dbPromise;
  return await db.getAll("trunks");
}

export async function saveTrunk(trunk) {
  const db = await dbPromise;
  await db.put("trunks", trunk);
}

export async function deleteTrunk(trunkId) {
  const db = await dbPromise;
  await db.delete("trunks", trunkId);
}

// —— image blobs ——

export async function saveTrunkImage(id, blob) {
  const db = await dbPromise;
  await db.put("images", blob, id);
}

export async function loadTrunkImage(id) {
  const db = await dbPromise;
  const blob = await db.get("images", id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteTrunkImage(id) {
    const db = await dbPromise;
    await db.delete("images", id);
}