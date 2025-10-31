import { X } from "lucide-react";
import { useEffect } from "react";

const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose} 
    >
      <div 
        className="relative max-w-4xl max-h-full rounded-lg overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10 p-2 bg-black bg-opacity-50 rounded-full"
          aria-label="Kapat"
        >
          <X size={24} />
        </button>
        <img 
          src={imageUrl} 
          alt="Big Size Image" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg" 
        />
      </div>
    </div>
  );
};

export default ImageModal;