const NavButton = ({ title, isActive, onClick, icon, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200
      ${isActive 
        ? 'bg-sky-600 text-white shadow-inner' 
        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }
      rounded-md ${className}
    `}
  >
    {icon}
    {title}
  </button>
);

export default NavButton;