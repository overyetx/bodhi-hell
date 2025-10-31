import { Delete01Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

export const TrunksView = ({
  activeProfile,
  activeCategoryId,
  filteredTrunks,
  searchTerm,
  setSearchTerm,
  setIsAddItemModalOpen,
  onCategoryEdit,
  onCategoryDelete,
  onDelete,
  onEdit,
  onRefresh,
  openImageModal,
}) => {
  const [editItem, setEditItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const handleRefresh = (trunk) => {
    onRefresh(trunk);
  };

  const handleEdit = (trunk) => {
    setEditItem(trunk);
    setIsEditModalOpen(true);
  };

  const saveEdit = (updated) => {
    onEdit(updated);
  };

  const handleDelete = (trunk) => {
    setDeleteItem(trunk);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDelete(deleteItem.id);
    setIsDeleteModalOpen(false);
    setDeleteItem(null);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-light text-white mb-4 sm:mb-0">
          {activeProfile?.categories.find((c) => c.id === activeCategoryId)?.name ||
            "All Trunks"}
        </h1>
        {/* delete and edit category buttons */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-0 ml-4">
          {activeCategoryId !== "all" && (
            <>
              <button
                onClick={() => onCategoryEdit(activeProfile?.categories.find((c) => c.id === activeCategoryId))}
                className="text-blue-400 hover:text-blue-300"
              >
                <HugeiconsIcon icon={Edit03Icon} className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={() => onCategoryDelete(activeProfile?.categories.find((c) => c.id === activeCategoryId))}
                className="text-red-400 hover:text-red-300"
              >
                <HugeiconsIcon icon={Delete01Icon} className="w-5 h-5" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
        <div className="grow flex-1" />
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search model or plate..."
              className="w-full pl-9 pr-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center px-5 py-2 bg-sky-600 text-white rounded-lg shadow-lg hover:bg-sky-700 transition-colors duration-200 text-sm font-semibold w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trunk
          </button>
        </div>
      </div>
      {/* Trunk List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrunks?.length > 0 ? (
          filteredTrunks.map((trunk) => (
            <div
              key={trunk.id}
              className="bg-slate-700 rounded-xl shadow-md border border-slate-600 hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group"
            >
              <div
                  className="relative w-full pt-[83%] overflow-hidden cursor-pointer"
                  onClick={() => openImageModal?.(trunk.imageUrl)}
                >        
                {!trunk.imageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-200 text-center p-4">
                    <div>
                      <div className="text-base font-semibold">{trunk.model || "No image"}</div>
                      {trunk.plate ? (
                        <div className="text-xs text-slate-400 mt-1">{trunk.plate}</div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <img
                    src={trunk.imageUrl}
                    alt={trunk.model}
                    className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{trunk.model}</h2>
                  <p className="text-sm text-slate-400">
                    <span className="font-medium text-slate-300">{trunk.plate}</span>
                  </p>
                </div>

                <div className="mt-4 flex justify-between gap-2">
                  <button
                    onClick={() => handleRefresh(trunk)}
                    className="flex items-center gap-2 text-white text-sm font-medium py-2 px-3 rounded-lg shadow bg-blue-600 hover:bg-blue-500"
                  >
                    <RefreshCw size={16} />
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(trunk)}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium py-2 px-3 rounded-lg shadow"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(trunk)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 px-3 rounded-lg shadow"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-10 bg-slate-700/50 rounded-xl text-slate-400">
            <p>No items found in this category.</p>
          </div>
        )}
      </div>

      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-white text-xl mb-4">Edit</h2>

            <label className="text-slate-300 text-sm">Model</label>
            <input
              value={editItem.model}
              onChange={(e) => setEditItem({ ...editItem, model: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white mb-4"
            />

            <label className="text-slate-300 text-sm">License Plate or description</label>
            <input
              value={editItem.plate}
              onChange={(e) => setEditItem({ ...editItem, plate: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveEdit(editItem);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deleteItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-white text-lg mb-4">Are you sure you want to delete this item?</h2>
            <p className="text-slate-300 mb-6">
              {deleteItem.model} — {deleteItem.plate}

              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
