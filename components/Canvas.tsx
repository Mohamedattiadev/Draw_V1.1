"use client";

import { useEffect, useState } from "react";
import useCanvas from "@/hooks/useCanvas";

export default function Canvas() {
  const [isMounted, setIsMounted] = useState(false);
  const {
    canvasRef,
    dimension,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
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
    </>
  );
}
