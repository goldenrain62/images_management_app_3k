"use client";

import { useEffect, useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ImageViewerProps {
  images: Array<{
    id: string;
    name: string;
    imageUrl: string;
    size: string;
  }>;
  currentIndex: number;
  onClose: () => void;
}

const ImageViewer = ({ images, currentIndex, onClose }: ImageViewerProps) => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentImage = images[index];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // deltaY < 0 means scrolling up (zoom in)
      // deltaY > 0 means scrolling down (zoom out)
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(prev + 0.1, 3));
      } else {
        setZoom((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    const viewer = document.getElementById("image-viewer-container");
    if (viewer) {
      viewer.addEventListener("wheel", handleWheel, { passive: false });
      return () => viewer.removeEventListener("wheel", handleWheel);
    }
  }, []);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleNext = () => {
    if (index < images.length - 1) {
      setIndex(index + 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div
      className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header - Image Info and Controls */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Info */}
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white drop-shadow-lg">
            {currentImage.name}
          </h3>
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-sm">
            {index + 1} / {images.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className={`rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm transition-all ${
              zoom <= 0.5
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-black/50"
            }`}
            title="Zoom Out (-)"
          >
            <ZoomOut size={20} />
          </button>

          {/* Zoom Level */}
          <span className="min-w-[60px] rounded-lg bg-black/30 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur-sm">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className={`rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm transition-all ${
              zoom >= 3
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-black/50"
            }`}
            title="Zoom In (+)"
          >
            <ZoomIn size={20} />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
            title="Rotate"
          >
            <RotateCw size={20} />
          </button>

          {/* Reset View */}
          {(zoom !== 1 || rotation !== 0) && (
            <button
              onClick={resetView}
              className="rounded-lg bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/50"
            >
              Reset
            </button>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            className="rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
            title="Download"
          >
            <Download size={20} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        id="image-viewer-container"
        className="relative flex h-full w-full items-center justify-center p-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {index > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
            title="Previous (←)"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>
        )}

        {/* Image */}
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <img
            src={currentImage.imageUrl}
            alt={currentImage.name}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? "grab" : "default",
            }}
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {index < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
            title="Next (→)"
          >
            <ChevronRight size={32} className="text-white" />
          </button>
        )}
      </div>

      {/* Thumbnail Carousel - Bottom */}
      {images.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 overflow-x-auto px-4 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setIndex(idx);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 backdrop-blur-sm transition-all ${
                  idx === index
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={img.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Helper */}
      <div
        className="absolute bottom-20 left-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <div>
            <kbd className="rounded bg-white/20 px-2 py-1">Esc</kbd> Đóng
          </div>
          <div>
            <kbd className="rounded bg-white/20 px-2 py-1">←</kbd>
            <kbd className="ml-1 rounded bg-white/20 px-2 py-1">→</kbd> Chuyển
            ảnh
          </div>
          <div>
            <kbd className="rounded bg-white/20 px-2 py-1">+</kbd>
            <kbd className="ml-1 rounded bg-white/20 px-2 py-1">-</kbd> Phóng
            to/Thu nhỏ
          </div>
          <div>
            <kbd className="rounded bg-white/20 px-2 py-1">Cuộn chuột</kbd> Zoom
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
