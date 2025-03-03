import React, { useState } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableGalleryProps {
  images: string[];
  onImageClick: (image: string) => void;
  onReorder: (images: string[]) => void;
  onDeleteMultiple: (images: string[]) => void;
}

export default function DraggableGallery({ 
  images, 
  onImageClick, 
  onReorder,
  onDeleteMultiple 
}: DraggableGalleryProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const toggleSelection = (imageUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelectionMode) return;

    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(img => img !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteMultiple(selectedImages);
    setSelectedImages([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={isSelectionMode ? "default" : "outline"}
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedImages([]);
          }}
        >
          Select Multiple
        </Button>
        {isSelectionMode && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedImages.length === 0}
          >
            Delete Selected ({selectedImages.length})
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="gallery" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-3 gap-4 mb-4"
            >
              {images?.map((img, index) => (
                <Draggable 
                  key={img} 
                  draggableId={img} 
                  index={index}
                  isDragDisabled={isSelectionMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative h-[100px] rounded-lg overflow-hidden 
                        ${isSelectionMode ? 'cursor-pointer' : 'cursor-move'}
                        ${snapshot.isDragging ? 'ring-2 ring-primary shadow-lg' : ''}
                        ${selectedImages.includes(img) ? 'ring-2 ring-primary' : ''}`}
                      onClick={(e) => isSelectionMode ? toggleSelection(img, e) : onImageClick(img)}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {isSelectionMode && selectedImages.includes(img) && (
                        <div className="absolute inset-0 bg-primary bg-opacity-30 flex items-center justify-center">
                          <Check className="text-white w-8 h-8" />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-2">Are you sure you want to delete {selectedImages.length} selected images?</p>
            <p className="mb-4 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete {selectedImages.length} Images
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 