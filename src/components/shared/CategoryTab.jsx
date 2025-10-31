import { getIconComponent } from "../../utils/iconChoices";

const CategoryTab = ({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center p-3 text-left transition-colors duration-150 rounded-lg
      ${isActive
        ? 'bg-sky-600 text-white shadow-lg' 
        : 'text-slate-300 hover:bg-slate-700'
      }
      focus:outline-none focus:ring-2 focus:ring-sky-500 mb-1
    `}
  >
    {getIconComponent(category.iconId)} 
    <span className="truncate ml-1">{category.name}</span>
  </button>
);

export default CategoryTab;