"use client";

import { useState, useEffect } from "react";
import { Delete, Clock } from "./icons/index";
import {
  getSavedCanvases,
  loadCanvas,
  deleteSavedCanvas,
} from "@/utils/savedCanvases";
import type { Element } from "@/types";

interface SavedCanvasesProps {
  setElements: (elements: Element[]) => void;
  setShow: (show: boolean) => void;
}

export default function SavedCanvases({
  setElements,
  setShow,
}: SavedCanvasesProps) {
  const [savedCanvases, setSavedCanvases] = useState<
    Array<{
      id: string;
      name: string;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    const canvases = getSavedCanvases();
    setSavedCanvases(canvases);
  }, []);

  const handleLoad = (id: string) => {
    const elements = loadCanvas(id);
    if (elements) {
      setElements(elements);
      setShow(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedCanvas(id);
    setSavedCanvases((prev) => prev.filter((canvas) => canvas.id !== id));
  };

  if (savedCanvases.length === 0) {
    return (
      <div className="p-3 text-center text-gray-500">No saved canvases</div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto space-y-2 p-2">
      {savedCanvases.map((canvas) => (
        <div
          key={canvas.id}
          className="flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer shadow-sm"
          onClick={() => handleLoad(canvas.id)}
        >
          <div>
            <div className="text-sm font-bold text-gray-800 pb-2">
              {canvas.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock />
              {new Date(canvas.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <button
            className="p-1 rounded-full hover:bg-red-100 text-red-600 transition duration-150"
            onClick={(e) => handleDelete(canvas.id, e)}
            title="Delete canvas"
          >
            <Delete />
          </button>
        </div>
      ))}
    </div>
  );
}
