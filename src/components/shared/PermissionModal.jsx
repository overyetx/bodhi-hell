import { Monitor } from "lucide-react";

const PermissionModal = ({ startSharing, onClose }) => {
    const handleStart = () => {
        startSharing();
        onClose(); 
    };
    
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
            onClick={onClose}
        >
            <div 
                className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-100 p-6 rounded-lg mb-8 text-center">
                    <p className="text-2xl font-semibold mb-3">Screen Sharing Permission Needed</p>
                    <p className="text-lg">
                        Please share your RAGE Multiplayer screen. The app will only request permission for a **single frame screenshot** from your screen.
                        <br/> 
                        <span className="font-bold text-yellow-300 mt-2 block"> Your screen is not shared with anyone, it stays local to your device.</span>
                    </p>
                </div>
                <div className="flex space-x-4 w-full">
                    <button 
                        onClick={onClose} 
                        className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                        Not Now
                    </button>
                    <button 
                        onClick={handleStart} 
                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200 shadow-lg shadow-indigo-500/50 flex items-center justify-center"
                    >
                         <Monitor className="w-4 h-4 mr-2" />
                        Start Sharing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;