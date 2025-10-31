import { useEffect, useState, useCallback } from "react";
import {
    fetchProfilesFromDb,
    saveProfilesToDb
} from "../services/profiles";

export function useProfiles() {

    const [profileLoading, setProfileLoading] = useState(true);
    const [profiles, setProfiles] = useState({});
    const [activeProfileId, setActiveProfileId] = useState(null);

    useEffect(() => {
        async function load() {
            const data = await fetchProfilesFromDb();
            setProfiles(data);

            const first = Object.keys(data)[0] ?? null;
            setActiveProfileId(first);
            setProfileLoading(false);
        }
        load();
    }, []);


    const updateProfiles = useCallback(async (updated) => {
        setProfiles(updated);
        await saveProfilesToDb(updated);
    }, []);


    const addProfile = useCallback(async (profile) => {
        const updated = {
            ...profiles,
            [profile.id]: profile
        };
        await updateProfiles(updated);
        setActiveProfileId(profile.id);
    }, [profiles, updateProfiles]);


    const deleteProfile = useCallback(async (profileId) => {
        const updated = { ...profiles };
        delete updated[profileId];

        await updateProfiles(updated);

        const first = Object.keys(updated)[0] ?? null;
        setActiveProfileId(first);
    }, [profiles, updateProfiles]);


    const editProfile = useCallback(
        async (profileId, patch) => {
            const updated = {
                ...profiles,
                [profileId]: {
                    ...profiles[profileId],
                    ...patch,
                },
            };
            await updateProfiles(updated);
        },
        [profiles, updateProfiles]
    );


    return {
        profileLoading,
        profiles,
        setProfiles: updateProfiles,
        activeProfileId,
        setActiveProfileId,

        addProfile,
        deleteProfile,
        editProfile,
    };
}