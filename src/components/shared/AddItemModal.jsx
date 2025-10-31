import { Camera, Monitor, Plus, X, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { applyCropToImage } from "../../utils/image";

const AddItemModal = ({ activeCategory, onSave, onClose, screenStream, sharingStatus, openPermissionModal, cropSettings }) => {
    const [modelName, setModelName] = useState('Bodhi');
    const [plateDetail, setPlateDetail] = useState('');
    const [capturedImageUrl, setCapturedImageUrl] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle', 'capturing', 'captured', 'error'
    
    const captureFrame = useCallback(async () => {
        if (!screenStream) {
            setStatus('error');
            console.error("Error: Screen stream not active");
            return;
        }
        
        setStatus('capturing'); 
        
        try {
            const track = screenStream.getVideoTracks()[0];
            const settings = track.getSettings();
            
            const video = document.createElement('video');
            video.srcObject = new MediaStream([track]);
            
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve);
                };
            });
            
            await new Promise(r => setTimeout(r, 100));

            const canvas = document.createElement('canvas');
            canvas.width = settings.width || 1280; 
            canvas.height = settings.height || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const tempFullImageUrl = canvas.toDataURL('image/webp');
            
            // Cropping
            const croppedImageUrl = await applyCropToImage(tempFullImageUrl, cropSettings);
            setCapturedImageUrl(croppedImageUrl);
            setStatus('captured');
            
        } catch(err) {
            console.error("Screenshot capture error:", err);
            setStatus('error');
        }
    }, [screenStream, cropSettings]);

    useEffect(() => {
        if (sharingStatus !== "active" || !screenStream) return;

        const run = async () => {
            await captureFrame();
        };

        run();
    }, [sharingStatus, screenStream, captureFrame]);

    
    const handleSave = () => {
        if (!modelName.trim() || !plateDetail.trim() || !capturedImageUrl) {
            console.error("Fill all inputs.");
            return;
        }

        onSave({
            model: modelName.trim(),
            plate: plateDetail.trim(),
            imageBlob: capturedImageUrl,
        });
        onClose();
    };

    const isSaveDisabled = !modelName.trim() || !plateDetail.trim() || !capturedImageUrl;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center"><Plus className="mr-2" /> Add New Trunk ({activeCategory})</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Car Model Name</label>
                        <input
                            type="text"
                            placeholder="Eg: Bodhi"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Licensing plate or something</label>
                        <input
                            type="text"
                            placeholder="Eg: 0ABC123"
                            value={plateDetail}
                            onChange={(e) => setPlateDetail(e.target.value)}
                            className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-sm"
                        />
                    </div>

                    {/* Screenshot */}
                    <div className="pt-4 border-t border-slate-700">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Trunk Image (Auto Screenshot)</label>
                        
                        {sharingStatus !== 'active' && (
                            <p className="text-sm font-medium text-red-400 mb-2 p-2 bg-red-900/50 rounded flex items-center justify-between">
                                <span className="flex items-center">
                                    <Monitor className="w-4 h-4 mr-2" /> 
                                    **ERROR:** Screen sharing is not active.
                                </span>
                                <button
                                    onClick={openPermissionModal}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-xs font-semibold"
                                >
                                    Start Sharing
                                </button>
                            </p>
                        )}

                        <p className="text-sm font-medium text-amber-400 mb-2 p-2 bg-amber-900/50 rounded">
                            Please make sure to select the **RAGE Multiplayer screen** in your active screen sharing.
                        </p>
                        
                        <button
                            onClick={captureFrame}
                            disabled={sharingStatus !== 'active' || status === 'capturing'}
                            className={`w-full flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-colors duration-200 
                                ${sharingStatus === 'active' 
                                    ? (status === 'capturing' ? 'bg-amber-600 text-white opacity-75' : 'bg-green-600 text-white hover:bg-green-700')
                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {status === 'capturing' ? (
                                <>
                                    <Camera className="w-4 h-4 mr-2 animate-pulse" />
                                    Frame Capturing and Cropping
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Get Screenshot and Crop from Active Stream
                                </>
                            )}
                        </button>
                        
                        {/* Show Captured Screenshot */}
                        {capturedImageUrl && (
                            <div className="mt-4 p-3 bg-slate-700 rounded-lg border border-green-600 relative">
                                <p className="text-sm font-medium text-green-400 mb-2 flex items-center"><Zap className="w-4 h-4 mr-1"/> Screenshot Captured Successfully!</p>
                                <img src={URL.createObjectURL(capturedImageUrl)} alt="Captured Screenshot" className="w-full h-auto max-h-64 object-contain rounded-md" />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="pt-6 border-t border-slate-700 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className="w-full py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5 mr-2 inline-block" />
                        Save New Trunk
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddItemModal;