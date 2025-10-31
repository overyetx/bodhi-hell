import { useEffect, useState, useCallback, useMemo } from "react";
import {
    fetchTrunksFromDb,
    saveTrunk,
    deleteTrunk as deleteTrunkDb,
    deleteTrunkImage,
    saveTrunkImage,
    loadTrunkImage
} from "../services/trunks";

const urlsToRevoke = new Set();

export function useTrunks(activeProfileId, activeCategoryId) {

    const [allTrunks, setAllTrunks] = useState([]);
    const [loading, setLoading] = useState(true);


    // ---- LOAD FROM DB ----
    const loadTrunks = useCallback(async () => {
        urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
        urlsToRevoke.clear();

        setLoading(true);

        const items = await fetchTrunksFromDb(); // <-- all trunks
        for(let i = 0; i < items.length; i++) {
            const blobUrl = await loadTrunkImage(items[i].id);
            if (blobUrl) {
                items[i].imageUrl = blobUrl;
                urlsToRevoke.add(items[i].imageUrl);
            }
        }
        setAllTrunks(items);

        setLoading(false);
    }, []);


    // INITIAL LOAD
    useEffect(() => {
        loadTrunks();
    }, [loadTrunks]);


    // ---- FILTERED VIEW ----
    const trunks = useMemo(() => {
        if (!activeProfileId) return [];
        return allTrunks.filter(
            t => t.profileId === activeProfileId && t.categoryId === activeCategoryId
        );
    }, [allTrunks, activeProfileId, activeCategoryId]);


    // ---- ADD ----
    const addTrunk = useCallback(async (itemData) => {
        const trunk = {
            id: Date.now(),
            profileId: activeProfileId,
            categoryId: activeCategoryId,
            model: itemData.model,
            plate: itemData.plate
        };

        await saveTrunk(trunk);

        if (itemData.imageBlob) {
            await saveTrunkImage(trunk.id, itemData.imageBlob);
        }

        await loadTrunks();
    }, [activeProfileId, activeCategoryId, loadTrunks]);


    // ---- UPDATE ----
    const updateTrunk = useCallback(async (updated) => {
        await saveTrunk(updated);
        await loadTrunks();
    }, [loadTrunks]);


    // ---- DELETE ----
    const deleteTrunk = useCallback(async (id) => {
        await deleteTrunkDb(id);
        await deleteTrunkImage(id);

        await loadTrunks();
    }, [loadTrunks]);
    const deleteTrunkByProfileId = useCallback(async (profileId) => {
        const trunksToDelete = allTrunks.filter(t => t.profileId === profileId);
        for (const trunk of trunksToDelete) {
            await deleteTrunkDb(trunk.id);
            await deleteTrunkImage(trunk.id);
        }
        await loadTrunks();
    }, [allTrunks, loadTrunks]);
    const deleteTrunkByCategoryId = useCallback(async (profileId, categoryId) => {
        const trunksToDelete = allTrunks.filter(t => t.profileId === profileId && t.categoryId === categoryId);
        for (const trunk of trunksToDelete) {
            await deleteTrunkDb(trunk.id);
            await deleteTrunkImage(trunk.id);
        }
        await loadTrunks();
    }, [allTrunks, loadTrunks]);


    // ---- IMAGE UPDATE ----
    const updateTrunkImage = useCallback(async (id, blob) => {
        await saveTrunkImage(id, blob);
        await loadTrunks();
    }, [loadTrunks]);


    // ---- IMAGE READ ----
    const fetchTrunkImageUrl = useCallback(async (id) => {
        return await loadTrunkImage(id);
    }, []);


    return {
        trunks,
        loading,

        addTrunk,
        updateTrunk,
        deleteTrunk,
        deleteTrunkByProfileId,
        deleteTrunkByCategoryId,

        updateTrunkImage,
        fetchTrunkImageUrl,

        reload: loadTrunks
    };
}