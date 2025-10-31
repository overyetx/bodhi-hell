import { TShirtIcon, JoggerPantsIcon, GunIcon, Briefcase01Icon, Car04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder, Zap, LayoutList, Gem, Footprints, HardHat, Monitor } from 'lucide-react'; 

const iconChoices = [
  { id: 'Zap', name: 'Zap', icon: <Zap className="w-4 h-4" /> },
  { id: 'Folder', name: 'Folder', icon: <Folder className="w-4 h-4" /> },
  { id: 'LayoutList', name: 'List', icon: <LayoutList className="w-4 h-4" /> },
  { id: 'Car', name: 'Car', icon: <HugeiconsIcon icon={Car04Icon} className="w-4 h-4" strokeWidth={2} /> },
  { id: 'Briefcase', name: 'Briefcase', icon: <HugeiconsIcon icon={Briefcase01Icon} className="w-4 h-4" strokeWidth={2}  /> },
  { id: 'Crosshair', name: 'Weapons', icon: <HugeiconsIcon icon={GunIcon} className="w-4 h-4" strokeWidth={2} /> },
  { id: 'Shirt', name: 'Outerwear', icon: <HugeiconsIcon icon={TShirtIcon} className="w-4 h-4" strokeWidth={2} /> },
  { id: 'Trousers', name: 'Underwear', icon: <HugeiconsIcon icon={JoggerPantsIcon} className="w-4 h-4" strokeWidth={2} /> },
  { id: 'Gem', name: 'Accessories', icon: <Gem className="w-4 h-4" /> },
  { id: 'HardHat', name: 'Hats', icon: <HardHat className="w-4 h-4" /> },
  { id: 'Footprints', name: 'Shoes', icon: <Footprints className="w-4 h-4" /> },
  { id: 'Monitor', name: 'Monitor', icon: <Monitor className="w-4 h-4" /> },
];

const getIconComponent = (iconId) => {
    const choice = iconChoices.find(c => c.id === iconId);
    return choice ? choice.icon : <Folder className="w-4 h-4" />;
};

export { iconChoices, getIconComponent };