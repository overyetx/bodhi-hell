import { BookmarkPlus, CloudAlert, Crop, DatabaseIcon, LucideDatabaseBackup, Move } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clearDatabase, exportDatabaseToJson, importDatabaseFromJson } from "../../db";

export const SettingsView = ({
    cropSettings,
    setCropSettings,
    openCropModal,
    screenStream,
    sharingStatus
}) => {
    const [tempSettings, setTempSettings] = useState(cropSettings);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const [exportLoading, setExportLoading] = useState(false);

    const onChange = (e) => {
        const name = e.target.name;
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;

        setTempSettings((prev) => ({
            ...prev,
            [name]: val
        }));
    };

    useEffect(() => {
        setTempSettings(cropSettings);
    }, [cropSettings]);

    // Live crop preview
    useEffect(() => {
        if (sharingStatus !== "active" || !screenStream) return;

        const track = screenStream.getVideoTracks()[0];
        const video = document.createElement("video");

        videoRef.current = video;
        video.srcObject = new MediaStream([track]);
        video.muted = true;
        video.playsInline = true;

        let raf;
        let isPlaying = false;

        const draw = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");

            const vw = video.videoWidth;
            const vh = video.videoHeight;
            if (!vw || !vh) {
                raf = requestAnimationFrame(draw);
                return;
            }

            const { top, right, bottom, left } = tempSettings;
            let cw = Math.max(1, vw - left - right);
            let ch = Math.max(1, vh - top - bottom);

            // canvas size = crop area
            canvasRef.current.width = cw;
            canvasRef.current.height = ch;

            ctx.drawImage(
                video,
                left,
                top,
                cw,
                ch,
                0,
                0,
                cw,
                ch
            );

            raf = requestAnimationFrame(draw);
        };

        const play = async () => {
            try {
                await video.play();
                isPlaying = true;
                draw();
            } catch (err) {
                console.warn("Video play error", err);
            }
        };

        video.onloadedmetadata = play;

        return () => {
            cancelAnimationFrame(raf);
            if (isPlaying) video.pause();
            video.srcObject = null;
        };
    }, [screenStream, sharingStatus, tempSettings]);

    const save = () => setCropSettings(tempSettings);

    async function downloadDbExport() {
        setExportLoading(true);
        const data = await exportDatabaseToJson();
        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-");   // : ve . yerine -

        const fileName = `bodhihell-export-${timestamp}.json`;

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        setExportLoading(false);
    }

    async function handleImportBackup(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);

            await importDatabaseFromJson(json);

            alert("Backup imported successfully!");
            window.location.reload(); // refresh UI

        } catch (err) {
            console.error("Import error:", err);
            alert("Error while importing backup file!");
        }
    }

    async function eraseData() {
        if (window.confirm(`[!!!!!!!] Are you sure to delete all data? You will have no chance to recover them. [!!!!!!!] `)) {
            await clearDatabase();
            window.location.reload();
        };
    }

    const inputRef = useRef();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-light text-white border-b border-slate-700 pb-4 mb-4 flex items-center">
                <Crop className="mr-2" />
                App Settings
            </h1>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-2xl text-sky-400 mb-4 flex items-center">
                    <Crop className="mr-2" />
                    Default Crop Settings
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    These crop settings will be applied to your screen share by default.
                    Chaning the values in the inputs will update the live crop preview
                </p>

                {sharingStatus !== "active" && (
                    <div className="bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-100 p-4 rounded-lg mb-6">
                        <p className="text-lg">
                            Screen sharing is not active.
                            <br />
                            <span className="font-bold text-yellow-300 mt-2 block"> Start screen sharing to see live crop preview and apply crop settings.</span>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sol: inputlar */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(tempSettings).map(([key, val]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-slate-300 capitalize mb-1">
                                        {key} (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name={key}
                                        value={val}
                                        disabled={sharingStatus !== "active"}
                                        onChange={onChange}
                                        className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-sky-500 focus:border-sky-500 text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex space-x-3">
                            <button
                                onClick={openCropModal}
                                disabled={sharingStatus !== "active"}
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-semibold flex items-center justify-center"
                            >
                                <Move className="w-4 h-4 mr-2" />
                                Edit with Visual Tool
                            </button>

                            <button
                                onClick={save}
                                disabled={
                                    JSON.stringify(tempSettings) ===
                                    JSON.stringify(cropSettings)
                                }
                                className="py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Right: Live preview */}
                    <div className="bg-slate-700 p-4 rounded-lg">
                        <h3 className="text-lg text-white font-medium mb-3">
                            Crop Preview
                        </h3>

                        {sharingStatus === "active" ? (
                            <canvas
                                ref={canvasRef}
                                className="bg-slate-900 rounded-md border border-slate-600"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    maxHeight: "300px"
                                }}
                            />
                        ) : (
                            <div className="w-full h-24 flex items-center justify-center text-slate-500 text-sm bg-slate-900 rounded-md border border-slate-600">
                                Start screen sharing to see live preview.
                            </div>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                            The crop settings will be applied when you start screen sharing.
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-2xl text-sky-400 mb-4 flex items-center">
                    <DatabaseIcon className="mr-2" />
                    Backup/Recovery
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    The app uses browser database to store all data and images. You have to backup and recover your data manually if you don't want to lose them.
                    <br />
                    The data stays in browser as long as you don't change the browser or reset browser data.
                </p>

                <div className="pt-2 border-slate-700 flex space-x-3">
                    <button
                        onClick={downloadDbExport}
                        disabled={exportLoading}
                        className="px-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-semibold flex items-center justify-center"
                    >
                        {exportLoading ? (
                            <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Exporting...
                            </span>
                        ) : (
                            <>
                            <BookmarkPlus className="w-4 h-4 mr-2" />
                            Backup
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="px-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-semibold flex items-center justify-center"
                    >
                        <LucideDatabaseBackup className="w-4 h-4 mr-2" />
                        Recover
                    </button>   

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportBackup}
                    />                
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-2xl text-sky-400 mb-4 flex items-center">
                    <DatabaseIcon className="mr-2" />
                    Reset Data
                </h2>
                <p className="text-slate-400 mb-4 text-sm">
                    You can erase all data and start over.
                </p>

                <div className="border-slate-700 flex space-x-3">
                    <button
                        onClick={eraseData}
                        className="px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-semibold flex items-center justify-center"
                    >
                        <CloudAlert className="mr-2" />
                        Erase All Data
                    </button>              
                </div>
            </div>
        </div>
    );
};