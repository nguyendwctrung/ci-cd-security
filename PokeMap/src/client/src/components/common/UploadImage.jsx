import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Trash2, Eye, ImageIcon } from "lucide-react";


export default function UploadImage({
  images,
  onImagesChange,
  maxFiles = 10,
}) {
  const [previews, setPreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Create previews when images change
  useEffect(() => {
    // Clean up old previews
    previews.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    if (images.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews= [];
    let loadedCount = 0;

    images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews[index] = e.target.result;
          loadedCount++;

          if (loadedCount === images.length) {
            setPreviews([...newPreviews]);
          }
        }
      };
      reader.onerror = () => {
        console.error(`Error reading file: ${file.name}`);
        loadedCount++;
        if (loadedCount === images.length) {
          setPreviews([...newPreviews.filter((p) => p)]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && imageModalOpen) {
        setImageModalOpen(false);
      }
    };

    if (imageModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [imageModalOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const remainingSlots = maxFiles - images.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      onImagesChange([...images, ...filesToAdd]);
    },
    [images, onImagesChange, maxFiles]
  );

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };



  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      },
      maxFiles: maxFiles - images.length,
      disabled: images.length >= maxFiles,
    });

  return (
    <div className="w-full">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          relative p-6 border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-300 ease-in-out
          ${
            isDragActive && !isDragReject
              ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
              : isDragReject
              ? "border-red-500 bg-red-50"
              : images.length >= maxFiles
              ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-80"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Upload Area - Show when no images or when dragging */}
        {(images.length === 0 || isDragActive) && (
          <div className="text-center py-8">
            <div
              className={`
              w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-4
              ${
                isDragActive && !isDragReject
                  ? "bg-blue-500 text-white"
                  : isDragReject
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }
            `}
            >
              {isDragReject ? (
                <X className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            <div>
              {isDragActive && !isDragReject ? (
                <p className="text-blue-600 font-semibold">
                  Drop the images here...
                </p>
              ) : isDragReject ? (
                <p className="text-red-600 font-semibold">
                  Only image files are accepted
                </p>
              ) : images.length >= maxFiles ? (
                <p className="text-gray-500">
                  Reach limit {maxFiles} images
                </p>
              ) : (
                <>
                  <p className="text-gray-600 font-semibold mb-2">
                    drop image to {" "}
                    <span className="text-blue-500">click to choose</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Support jpeg, jpg, png, gif, webp. Max {maxFiles} images.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Images Grid - Show inside dropzone when there are images */}
        {images.length > 0 && !isDragActive && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium">{images.length}</span>
                <span className="mx-1">/</span>
                <span>{maxFiles} images</span>
                <span className="ml-2 text-gray-400">• Click to add images</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Are you sure to delete ${images.length} images?`
                    )
                  ) {
                    onImagesChange([]);
                  }
                }}
                className="flex items-center cursor-pointer hover:scale-105  space-x-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete all</span>
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer">
                    {previews[index] ? (
                      <>
                        <img
                          src={previews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(previews[index]);
                            setImageModalOpen(true);
                          }}
                        />

                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex flex-col space-y-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedImage(previews[index]);
                              setImageModalOpen(true);
                            }}
                            className="p-1 bg-white bg-opacity-90 cursor-pointer hover:scale-[110%] hover:bg-opacity-100 rounded-full shadow-md transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"
                            title="Xem trước"
                          >
                            <Eye className="w-3 h-3 text-gray-600" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (window.confirm("Xóa hình ảnh này?")) {
                                removeImage(index);
                              }
                            }}
                            className="p-1 bg-red-500 cursor-pointer hover:scale-110  bg-opacity-90 hover:bg-opacity-100 text-white rounded-full shadow-md transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-1 left-1">
                      <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {index + 1}
                      </span>
                    </div>

                    {index === 0 && (
                      <div className="absolute bottom-1 left-1">
                        <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          Main
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File name - compact */}
                  <p
                    className="mt-1 text-xs text-gray-500 truncate text-center"
                    title={images[index]?.name}
                  >
                    {images[index]?.name}
                  </p>
                </div>
              ))}

              {/* Add more button */}
              {images.length < maxFiles && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Add Image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative max-w-6xl max-h-full bg-white rounded-xl shadow-2xl overflow-hidden animate__animated animate__zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-500 to-white text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview Image
              </h3>
              <button
                onClick={() => setImageModalOpen(false)}
                className="p-2 hover:bg-red-200 cursor-pointer hover:bg-opacity-20 rounded-full transition-all duration-200"
                title="Đóng"
              >
                <X className="w-5 h-5 bg-red-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-50">
              <div className="relative bg-white rounded-lg p-4 shadow-inner">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
