"use client";

import { useEffect, useState, useRef } from "react";
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
    setTextInput,
    selectedElement,
    handleDoubleClick,
  } = useCanvas();

  // Store the editing position when editing starts
  const editingPosRef = useRef<{
    left: number;
    top: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
  } | null>(null);
  useEffect(() => {
    if (isEditing && selectedElement) {
      const fontSize = selectedElement.fontSize || 16;
      editingPosRef.current = {
        left: selectedElement.x1,
        top: selectedElement.y1 + fontSize,
        fontSize,
        fontFamily: selectedElement.fontFamily || "Arial",
        fontWeight: selectedElement.fontWeight || "normal",
      };
    }
    if (!isEditing) {
      editingPosRef.current = null;
    }
  }, [isEditing, selectedElement]);

  // AutoWidthInput component for fitting text
  type AutoWidthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    value: string;
    style?: React.CSSProperties;
  };
  const spanRef = useRef<HTMLSpanElement>(null);
  function AutoWidthInput({ value, style, ...props }: AutoWidthInputProps) {
    const [inputWidth, setInputWidth] = useState(100);

    useEffect(() => {
      if (spanRef.current) {
        setInputWidth(spanRef.current.offsetWidth + 20); // 20px for padding/cursor
      }
    }, [value, style?.fontSize, style?.fontFamily, style?.fontWeight]);

    return (
      <>
        <input
          {...props}
          value={value}
          style={{
            width: inputWidth,
            border: "none",
            background: "transparent",
            outline: "none",
            caretColor: "#211C6A",
            fontSize: style?.fontSize || 16,
            fontFamily: style?.fontFamily || "Arial",
            fontWeight: style?.fontWeight || "normal",
            ...style,
          }}
        />
        <span
          ref={spanRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "pre",
            fontSize: style?.fontSize || 16,
            fontFamily: style?.fontFamily || "Arial",
            fontWeight: style?.fontWeight || "normal",
            padding: 0,
          }}
        >
          {value || " "}
        </span>
      </>
    );
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Calculate input position
  const pos = editingPosRef.current
    ? { left: editingPosRef.current.left, top: editingPosRef.current.top }
    : { left: 0, top: 0 };
  const fontSize = editingPosRef.current?.fontSize || 16;
  const fontFamily = editingPosRef.current?.fontFamily || "Arial";
  const fontWeight = editingPosRef.current?.fontWeight || "normal";

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
        onDoubleClick={handleDoubleClick}
      />
      {isEditing && (
        <AutoWidthInput
          type="text"
          value={textInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextInput(e.target.value)
          }
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            zIndex: 1000,
            fontSize,
            fontFamily,
            fontWeight,
          }}
          autoFocus
        />
      )}
    </>
  );
}
