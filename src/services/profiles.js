import { dbPromise } from "../db";

export async function fetchProfilesFromDb() {
  const db = await dbPromise;
  const all = await db.getAll("profiles");
  
  // store keyPath = "id"
  let mapped = {};
  all.forEach((p) => {
    mapped[p.id] = p;
  });

  return mapped;
}

export async function saveProfileToDb(profile) {
    const db = await dbPromise;
    await db.put("profiles", profile);
}

export async function deleteProfileFromDb(profileId) {
    const db = await dbPromise;
    await db.delete("profiles", profileId);
}

export async function saveProfilesToDb(profiles) {
    const db = await dbPromise;
    const tx = db.transaction("profiles", "readwrite");
    const store = tx.objectStore("profiles");
    await store.clear();
    for (const id in profiles) {
        await store.put(profiles[id]);
    }
    await tx.done;
}
