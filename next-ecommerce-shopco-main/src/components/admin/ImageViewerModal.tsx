import React, { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
  onDelete: () => void;
  productName: string;
}

export default function ImageViewerModal({ imageUrl, onClose, onDelete, productName }: ImageViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-4">
        <div className="absolute right-4 top-4 flex gap-2 z-10">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 text-red-500"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative h-[600px] w-full overflow-auto">
          <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-200">
            <Image
              src={imageUrl}
              alt={`${productName} gallery image`}
              width={800}
              height={800}
              className="object-contain"
            />
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-4">Are you sure you want to delete this image?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 