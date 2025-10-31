import { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, Plus, LayoutList, X, User, Monitor, Camera } from 'lucide-react'; 
import { TrunksView } from './components/trunk/TrunksView';
import { iconChoices } from './utils/iconChoices';
import { applyCropToImage, defaultCropSettings } from './utils/image';
import useLocalStorage from './hooks/useLocalStorage';
import ProfileModal from './components/shared/ProfileModal';
import AddItemModal from './components/shared/AddItemModal';
import PermissionModal from './components/shared/PermissionModal';
import ImageModal from './components/shared/ImageModal';
import CropEditorModal from './components/shared/CropEditorModal';
import { SettingsView } from './components/settings/SettingsView';
import NavButton from './components/shared/NavButton';
import CategoryTab from './components/shared/CategoryTab';
import { useProfiles } from './hooks/useProfiles';
import { useTrunks } from './hooks/useTrunks';


export default function App() {
  const [activeCategoryId, setActiveCategoryId] = useState([]);

  const {
    profileLoading,
    profiles,
    setProfiles,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    deleteProfile,
    editProfile,
  } = useProfiles();

  const {
    trunks,
    loading,
    addTrunk,
    updateTrunk,
    deleteTrunk,
    deleteTrunkByProfileId,
    deleteTrunkByCategoryId,
    updateTrunkImage,
    fetchTrunkImageUrl,
    reload
  } = useTrunks(activeProfileId, activeCategoryId);


  const [cropSettings, setCropSettings] = useLocalStorage('bodhi_crop_settings', defaultCropSettings);

  // Screen Sharing State
  const [screenStream, setScreenStream] = useState(null);
  const [sharingStatus, setSharingStatus] = useState('idle'); // 'idle', 'requesting', 'active', 'error'
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false); // Crop modal state


  const [activeView, setActiveView] = useState('trunks');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState(null);

  // if profile loaded, no profiles exist, open profile modal
  useEffect(() => {
    if (!profileLoading && Object.keys(profiles).length === 0) {
      setIsProfileModalOpen(true);
    }
  } , [profileLoading, profiles]);

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };
  
  const stopScreenSharing = useCallback(() => {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setSharingStatus('idle');
        console.log("Screen sharing stopped by user.");
    }
  }, [screenStream]);


  const startScreenSharing = useCallback(async () => {
    if (screenStream || sharingStatus === 'requesting') return;
    
    setSharingStatus('requesting');
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false 
      });
      
      setScreenStream(stream);
      setSharingStatus('active');
      
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing stopped by user.");
        setScreenStream(null);
        setSharingStatus('idle');
      };

    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setSharingStatus('error');
        console.error("Screen sharing permission denied by user.");
      } else {
        setSharingStatus('error');
        console.error("Screen sharing error:", err);
      }
    }
  }, [screenStream, sharingStatus]);

  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]); 

  const activeProfile = useMemo(() => profiles[activeProfileId], [profiles, activeProfileId]);

  useEffect(() => {
    if (activeProfile && activeProfile.categories.length > 0) {
        if (!activeProfile.categories.some(c => c.id === activeCategoryId)) {
            setActiveCategoryId(activeProfile.categories[0].id);
        }
    }
  }, [activeProfile, activeCategoryId]);
  
  const filteredTrunks = useMemo(() => {
     if (!activeProfileId) return [];

    const trunksArr = trunks.filter(t => t.profileId === activeProfileId);

    const categoryTrunks = trunksArr.filter(
      trunk => trunk.categoryId === activeCategoryId
    );

    if (!searchTerm) return categoryTrunks;

    const q = searchTerm.toLowerCase();
    return categoryTrunks.filter(
      t =>
        t.model?.toLowerCase?.().includes(q) ||
        t.plate?.toLowerCase?.().includes(q)
    );
  }, [trunks, activeProfileId, activeCategoryId, searchTerm]);

  const removeTrunk = (id) => {
    deleteTrunk(id);
  };

  const updateTrunkScreenshot = async (item) => {
    // Screenshot updating only works when screen sharing is active
    if (screenStream && sharingStatus === 'active') {
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
          
          await new Promise(r => setTimeout(r, 100)); // Wait for sync

          const canvas = document.createElement('canvas');
          canvas.width = settings.width || 1280; 
          canvas.height = settings.height || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // webp
          const tempFullImageUrl = canvas.toDataURL('image/webp');
          
          // Cropping
          const croppedImageBlob = await applyCropToImage(tempFullImageUrl, cropSettings);
          item.imageUrl = URL.createObjectURL(croppedImageBlob);
          updateTrunkImage(item.id, croppedImageBlob);
          // update trunks
          updateTrunk(item);
      } catch(err) {
          console.error("Screen capture error:", err);
      }
    } else {
      window.alert("Screen sharing is not active. Cannot update screenshot.");
    }
  };

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIconId, setNewCategoryIconId] = useState('Folder'); 

  const handleEditCategory = (category) => {
    const name = prompt("New category name:", category.name);
    if (!name?.trim()) return;
    const updatedCategory = { ...category, name: name.trim() };
    const updatedProfile = {
        ...activeProfile,
        categories: activeProfile.categories.map(c => 
            c.id === category.id ? updatedCategory : c
        )
    };

    editProfile(activeProfileId, updatedProfile);
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Category "${category.name}" will be deleted along with all its trunks. Proceed?`)) {
      const updatedProfile = {
          ...activeProfile,
          categories: activeProfile.categories.filter(c => c.id !== category.id)
      };
      editProfile(activeProfileId, updatedProfile);

      deleteTrunkByCategoryId(activeProfileId, category.id);
    };
  };


  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !activeProfile) {
      console.error("Category name is required or no active profile.");
      return;
    }

    const currentCategories = activeProfile.categories;
    const newId = Math.max(...currentCategories.map(c => c.id), 0) + 1;
    
    const newCategory = { 
      id: newId, 
      name: newCategoryName.trim(), 
      iconId: newCategoryIconId
    };

    const updatedProfile = {
        ...activeProfile,
        categories: [...currentCategories, newCategory]
    };

    editProfile(activeProfileId, updatedProfile);

    setActiveCategoryId(newId);
    
    setNewCategoryName('');
    setNewCategoryIconId('Folder');
    setIsAddingCategory(false);
  };
  
  const handleSwitchProfile = (profileId) => {
    if (profiles[profileId]) {
        setActiveProfileId(profileId);
        setSearchTerm('');
    }
  };

  const handleAddProfile = (newProfile) => {
    addProfile(newProfile);
    setActiveProfileId(newProfile.id);
  };

  const handleEditProfile = (profile) => {
    const name = prompt("Enter new profile name:", profile.name);
    if (!name?.trim()) return;
    profile.name = name.trim();
    editProfile(profile.id, { name: name.trim() });
  };

  const handleDeleteProfile = (profile) => {
    if (!window.confirm(`Profile "${profile.name}" and all its data will be deleted. Proceed?`)) return;

    deleteProfile(profile.id);

    deleteTrunkByProfileId(profile.id)

    // Eğer aktif profil silinirse fallback
    if (activeProfileId === profile.id) {
      const ids = Object.keys(profiles);
      setActiveProfileId(ids[0] ?? null);
    }
  };

  const openImageModal = useCallback((imageUrl) => {
    setModalImageUrl(imageUrl);
  }, []);

  const closeImageModal = useCallback(() => {
    setModalImageUrl(null);
  }, []);

  const renderSharingStatusButton = () => {
    let title, icon, color, action, isDisabled;
    
    switch(sharingStatus) {
        case 'active':
            title = 'Screen Sharing Active';
            icon = <Monitor className="w-4 h-4 mr-1"/>;
            color = 'bg-green-600 text-white hover:bg-red-700 bg-opacity-90';
            action = stopScreenSharing;
            isDisabled = false; 
            break;
        case 'requesting':
            title = 'Waiting for Permission...';
            icon = <Camera className="w-4 h-4 mr-1 animate-pulse"/>;
            color = 'bg-amber-600 text-white opacity-75';
            action = () => {}; 
            isDisabled = true;
            break;
        case 'error':
            title = 'Permission Denied - Retry';
            icon = <X className="w-4 h-4 mr-1"/>;
            color = 'bg-red-600 text-white hover:bg-indigo-700';
            action = () => setIsPermissionModalOpen(true);
            isDisabled = false;
            break;
        case 'idle':
        default:
            title = 'Start Screen Sharing';
            icon = <Monitor className="w-4 h-4 mr-1"/>;
            color = 'bg-indigo-600 text-white hover:bg-indigo-700';
            action = () => setIsPermissionModalOpen(true);
            isDisabled = false;
            break;
    }
    
    return (
        <button
            onClick={action}
            className={`
                flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200
                ${color}
                rounded-md
                ${isDisabled ? 'opacity-75 cursor-default' : ''}
            `}
            disabled={isDisabled}
        >
            {icon}
            {title}
        </button>
    );
  };
  const categories = activeProfile ? activeProfile.categories : [];
  
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* --- Header --- */}
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-800 shadow-xl border-b border-slate-700/50">
        <div className="text-xl font-bold text-sky-400 tracking-wider mb-3 sm:mb-0">
          <span className="text-white">Bodhi</span>HELL
        </div>
        <nav className="flex flex-wrap justify-center sm:space-x-2 space-x-0 space-y-2 sm:space-y-0 w-full sm:w-auto">
          
          {/* Screen Sharing Button */}
          {renderSharingStatusButton()}

          <NavButton 
            title="Trunks" 
            isActive={activeView === 'trunks'} 
            onClick={() => setActiveView('trunks')} 
            icon={<LayoutList className="w-4 h-4 mr-1"/>}
          />
          <NavButton 
            title="Settings" 
            isActive={activeView === 'settings'} 
            onClick={() => setActiveView('settings')} 
            icon={<Settings className="w-4 h-4 mr-1"/>}
          />

          <NavButton 
            title={activeProfile?.name || "Profiles"} 
            isActive={isProfileModalOpen} 
            onClick={() => setIsProfileModalOpen(true)} 
            icon={<User className="w-4 h-4 mr-1"/>}
          />         
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Category Tabs */}
        {activeView === 'trunks' && (
          <aside className="w-64 h-vh flex-shrink-0 p-4 bg-slate-800 border-r border-slate-700 overflow-y-auto hidden md:flex flex-col"> 
            <h3 className="text-sm font-semibold uppercase text-slate-500 mb-4 tracking-wider border-b border-slate-700 pb-2">
              Categories ({activeProfile?.name})
            </h3>

            {/* Add Category Section */}
            {!isAddingCategory ? (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="w-full mb-4 flex items-center justify-center p-2 text-sm text-sky-400 border border-sky-600 rounded-lg hover:bg-sky-600 hover:text-white transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Category
              </button>
            ) : (
              <div className="p-3 mb-4 bg-slate-700 rounded-lg shadow-inner border border-slate-600">
                <h4 className="text-sm font-medium text-white mb-2">Add New Category</h4>
                
                <input 
                  type="text" 
                  placeholder="Category Name" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2 mb-2 bg-slate-800 text-white rounded-md text-sm border border-slate-700 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500"
                />
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Select Icon:
                  </label>

                  <div className="grid grid-cols-4 gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
                    {iconChoices.map(choice => {
                      const selected = newCategoryIconId === choice.id;
                      return (
                        <button
                          key={choice.id}
                          onClick={() => setNewCategoryIconId(choice.id)}
                          className={`
                            flex items-center justify-center p-2 rounded-md
                            transition-colors duration-150
                            ${selected ? "bg-sky-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"}
                          `}
                        >
                          {choice.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 flex items-center justify-center py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-50"
                    disabled={!newCategoryName.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                      setNewCategoryIconId('Folder');
                    }}
                    className="py-2 px-3 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}            
            
            {/* Category Tabs List */}
            <div className="space-y-1 mb-6 flex-1">
              {categories.map(category => (
                <CategoryTab
                  key={category.id}
                  category={category}
                  isActive={category.id === activeCategoryId}
                  onClick={() => setActiveCategoryId(category.id)}
                />
              ))}
              {categories.length === 0 && (
                <p className="text-slate-500 text-sm p-2">No category</p>
              )}
            </div>
          </aside>
        )}

        {/* Right Panel: Active View */}
        <section className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900">
          <div className="max-w-full mx-auto">
           {activeView === 'trunks' && (
              <TrunksView
                activeProfile={activeProfile}
                activeCategoryId={activeCategoryId}
                filteredTrunks={filteredTrunks}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setIsAddItemModalOpen={setIsAddItemModalOpen}
                onCategoryEdit={handleEditCategory}
                onCategoryDelete={handleDeleteCategory}
                onDelete={removeTrunk}
                onEdit={updateTrunk}
                onRefresh={updateTrunkScreenshot}
                openImageModal={openImageModal}
              />
            )}
            {activeView === 'settings' && (
                <SettingsView
                  cropSettings={cropSettings}
                  setCropSettings={setCropSettings}
                  openCropModal={() => setIsCropModalOpen(true)}
                  screenStream={screenStream}        // ✅ EKLENMELİ
                  sharingStatus={sharingStatus}      // ✅ EKLENMELİ
                />
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={closeImageModal} />
      )}
      {isProfileModalOpen && (
        <ProfileModal 
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchProfile={handleSwitchProfile}
            onAddProfile={handleAddProfile}
            onEditProfile={handleEditProfile}
            onDeleteProfile={handleDeleteProfile}
            onClose={closeProfileModal}
        />
      )}
      {isAddItemModalOpen && activeProfile && (
        <AddItemModal
            activeCategory={activeProfile.categories.find(c => c.id === activeCategoryId)?.name || 'Genel'}
            onSave={addTrunk}
            onClose={() => setIsAddItemModalOpen(false)}
            screenStream={screenStream}
            sharingStatus={sharingStatus}
            openPermissionModal={() => { setIsPermissionModalOpen(true); }}
            cropSettings={cropSettings}
        />
      )}
      
      {/* Permission Modal */}
      {isPermissionModalOpen && (
        <PermissionModal 
            startSharing={startScreenSharing} 
            onClose={() => setIsPermissionModalOpen(false)} 
        />
      )}
      
      {/* Crop Editor Modal */}
      {isCropModalOpen && (
        <CropEditorModal 
            currentSettings={cropSettings}
            onSave={setCropSettings}
            screenStream={screenStream}
            startSharing={startScreenSharing}
            sharingStatus={sharingStatus}
            onClose={() => setIsCropModalOpen(false)}
        />
      )}
    </div>
  );
}
