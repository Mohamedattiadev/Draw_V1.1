"use client";

import { useEffect, useState } from "react";
import useCanvas from "@/hooks/useCanvas";
import { Input } from "@/components/ui/input";

export default function Canvas() {
  const [isMounted, setIsMounted] = useState(false);
  const {
    canvasRef,
    dimension,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    isEditing,
    textInput,
    selectedElement,
  } = useCanvas();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={dimension.width}
        height={dimension.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
      {isEditing && (
        <Input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={{
            position: "absolute",
            left: selectedElement?.x1,
            top: selectedElement?.y1,
            width: "100px",
            height: "30px",
            zIndex: 1000,
          }}
          autoFocus
        />
      )}
    </>
  );
}
