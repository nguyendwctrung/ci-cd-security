import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Share } from "lucide-react";

export default function ImageDetailModal({ images, currentIndex, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
    const [animationClass, setAnimationClass] = useState('animate__fadeInUp');

    useEffect(() => {
        setCurrentImageIndex(currentIndex);
    }, [currentIndex]);


    const goToPrevious = () => {
        setAnimationClass('animate__fadeOutRight');
        setTimeout (() => {
            setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
            setAnimationClass('animate__fadeInLeft');
        }, 300);
        
    };

    const goToNext = () => {
        setAnimationClass('animate__fadeOutLeft');
        setTimeout (() => {
            setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
            setAnimationClass('animate__fadeInRight');
        }, 300);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-white/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Click outside to close */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />  
            <div className="bg-gray-900/80 rounded-2xl shadow-2xl max-w-[90vw] h-[90vh] w-full overflow-hidden relative z-10 animate__animated animate__zoomIn animate__fast">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Navigation buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute cursor-pointer left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all z-10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all z-10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Main image */}
                <div className="p-4 flex justify-center items-center h-[70%]">
                    <img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        alt={"Image " + (currentImageIndex + 1)}
                        className={`max-w-full h-full object-contain rounded-lg shadow-lg animate__animated ${animationClass}`}

                    />
                </div>

                {/* Image counter and actions */}
                <div className="px-4 pb-4 flex justify-between items-center">
                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex space-x-2 ml-auto">
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = images[currentImageIndex];
                                link.download = `image-${currentImageIndex + 1}.jpg`;
                                link.click();
                            }}
                            className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Check out this image',
                                        url: images[currentImageIndex]
                                    });
                                } else {
                                    navigator.clipboard.writeText(images[currentImageIndex]);
                                    // You could show a toast notification here
                                }
                            }}
                            className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                            title="Share"
                        >
                            <Share className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Thumbnail strip for multiple images */}
                {images.length > 1 && (
                    <div className="px-4 pb-4 flex justify-center space-x-2 overflow-x-auto bg-gray-800/80">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex
                                        ? 'border-blue-500 opacity-100'
                                        : 'border-gray-600 opacity-60 hover:opacity-80 cursor-pointer'
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}