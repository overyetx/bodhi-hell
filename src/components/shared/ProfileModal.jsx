import { Delete01Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus, User, X } from "lucide-react";
import { useState } from "react";

const ProfileModal = ({ profiles, activeProfileId, onSwitchProfile, onAddProfile, onEditProfile, onDeleteProfile, onClose }) => {
    // ... (ProfileModal) ...
    const [newProfileName, setNewProfileName] = useState('');

    const handleCreateNewProfile = () => {
        if (!newProfileName.trim()) return;
        
        const newId = 'p_' + newProfileName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const uniqueId = newId in profiles ? `${newId}_${Object.keys(profiles).length}` : newId;

        const newProfile = {
            id: uniqueId,
            name: newProfileName.trim(),
            categories: [
                { id: 1, name: 'Items', iconId: 'Folder' },
            ]
        };
        onAddProfile(newProfile);
        setNewProfileName('');
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center"><User className="mr-2" /> Profile Selection</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={20} /></button>
                </div>
                
                {/* Mevcut Profiller */}
                <div className="mb-6 max-h-60 overflow-y-auto pr-2 space-y-2">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Current Profiles</h3>
                    {Object.values(profiles).map(profile => (
                      <div 
                        key={profile.id}
                        className={(activeProfileId === profile.id ? "!bg-slate-900" : "") + " flex items-center justify-between p-3 bg-slate-700 rounded-lg mb-2"}
                      >
                        <button
                          onClick={() => onSwitchProfile(profile.id)}
                          className="text-left flex-1 text-white hover:text-sky-400"
                        >
                          {profile.name} {activeProfileId === profile.id ? <span className="text-sm text-sky-400 ml-2 bg-slate-800 px-2 py-1 rounded-full">Active</span> : null}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditProfile(profile)}
                          className="text-blue-400 hover:text-blue-300 mx-2"
                          title="Rename"
                        >
                          <HugeiconsIcon icon={Edit03Icon} className="w-4 h-4" strokeWidth={2} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteProfile(profile)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Delete"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                    {Object.keys(profiles).length === 0 && (
                        <p className="text-sm text-slate-400">No profiles available. Please create a new profile to get started.</p>
                    )}
                </div>

                {/* Yeni Profil Ekleme */}
                <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">New Profile</h3>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="New profile name..."
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="flex-1 p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-sm"
                        />
                        <button
                            onClick={handleCreateNewProfile}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-50"
                            disabled={!newProfileName.trim()}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileModal;