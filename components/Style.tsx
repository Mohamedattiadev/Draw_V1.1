"use client";

import React, { useEffect, useState } from "react";
import {
  deleteElement,
  duplicateElement,
  minmax,
  moveElementLayer,
  updateElement,
} from "@/utils/element";
import { useAppContext } from "@/providers/AppStates";
import {
  BACKGROUND_COLORS,
  STROKE_COLORS,
  STROKE_STYLES,
} from "@/lib/constants";
import {
  Backward,
  Delete,
  Duplicate,
  Forward,
  ToBack,
  ToFront,
} from "./icons/index";
import type { Element, Style as StyleType } from "@/types";

interface StyleProps {
  selectedElement: Element | StyleType | null;
}

interface ExtendedStyle extends StyleType {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export default function Style({ selectedElement }: StyleProps) {
  const { elements, setElements, setSelectedElement, setStyle } =
    useAppContext();
  const [stylesStates, setStylesStates] = useState<ExtendedStyle>({
    strokeColor: (selectedElement as Element)?.strokeColor || "",
    fill: (selectedElement as Element)?.fill || "",
    strokeWidth: (selectedElement as Element)?.strokeWidth || 0,
    strokeStyle: (selectedElement as Element)?.strokeStyle || "solid",
    opacity: (selectedElement as Element)?.opacity || 100,
    fontSize: (selectedElement as Element)?.fontSize || 16,
    fontFamily: (selectedElement as Element)?.fontFamily || "Arial",
    fontWeight: (selectedElement as Element)?.fontWeight || "normal",
  });

  useEffect(() => {
    if (selectedElement && "id" in selectedElement) {
      setStylesStates({
        strokeColor: selectedElement.strokeColor,
        fill: selectedElement.fill,
        strokeWidth: selectedElement.strokeWidth,
        strokeStyle: selectedElement.strokeStyle,
        opacity: selectedElement.opacity,
        fontSize: selectedElement.fontSize,
        fontFamily: selectedElement.fontFamily,
        fontWeight: selectedElement.fontWeight,
      });
    }
  }, [selectedElement]);

  const updateStyles = (styleObject: Partial<ExtendedStyle>) => {
    setStylesStates((prevState) => ({ ...prevState, ...styleObject }));
    setStyle((prevState) => ({ ...prevState, ...styleObject }));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    updateStyles({ fontSize: newSize });
    if (selectedElement && "id" in selectedElement) {
      updateElement(
        selectedElement.id,
        { fontSize: newSize },
        setElements,
        elements,
        true
      );
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFamily = e.target.value;
    updateStyles({ fontFamily: newFamily });
    if (selectedElement && "id" in selectedElement) {
      updateElement(
        selectedElement.id,
        { fontFamily: newFamily },
        setElements,
        elements,
        true
      );
    }
  };

  const handleFontWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWeight = e.target.value;
    updateStyles({ fontWeight: newWeight });
    if (selectedElement && "id" in selectedElement) {
      updateElement(
        selectedElement.id,
        { fontWeight: newWeight },
        setElements,
        elements,
        true
      );
    }
  };

  if (!selectedElement || !("id" in selectedElement)) {
    return null;
  }

  const elementStyle = {
    strokeColor: stylesStates.strokeColor,
    fill: stylesStates.fill,
    strokeWidth: stylesStates.strokeWidth,
    strokeStyle: stylesStates.strokeStyle,
    opacity: stylesStates.opacity,
    fontSize: stylesStates.fontSize,
    fontFamily: stylesStates.fontFamily,
    fontWeight: stylesStates.fontWeight,
  };

  return (
    <section className="styleOptions">
      <div className="group strokeColor">
        <p>Stroke</p>
        <div className="innerGroup">
          {STROKE_COLORS.map((color, index) => (
            <button
              type="button"
              title={color}
              style={{ backgroundColor: color }}
              key={index}
              className={
                "itemButton color" +
                (color === elementStyle.strokeColor ? " selected" : "")
              }
              onClick={() => {
                updateStyles({ strokeColor: color });
                if ("id" in selectedElement) {
                  updateElement(
                    selectedElement.id,
                    {
                      strokeColor: color,
                    },
                    setElements,
                    elements
                  );
                }
              }}
            ></button>
          ))}
        </div>
      </div>
      <div className="group backgroundColor">
        <p>Background</p>
        <div className="innerGroup">
          {BACKGROUND_COLORS.map((fill, index) => (
            <button
              type="button"
              title={fill}
              className={
                "itemButton color" +
                (fill === elementStyle.fill ? " selected" : "")
              }
              style={{ backgroundColor: fill }}
              key={index}
              onClick={() => {
                updateStyles({ fill });
                if ("id" in selectedElement) {
                  updateElement(
                    selectedElement.id,
                    {
                      fill,
                    },
                    setElements,
                    elements
                  );
                }
              }}
            ></button>
          ))}
        </div>
      </div>
      <div className="group strokeWidth">
        <p>Stroke width</p>
        <div className="innerGroup">
          <input
            type="range"
            className="itemRange"
            min={0}
            max={20}
            value={elementStyle.strokeWidth}
            step="1"
            onChange={({ target }) => {
              const value = minmax(+target.value, [0, 20]);
              updateStyles({ strokeWidth: value });
              if ("id" in selectedElement) {
                updateElement(
                  selectedElement.id,
                  {
                    strokeWidth: value,
                  },
                  setElements,
                  elements
                );
              }
            }}
          />
        </div>
      </div>
      <div className="group strokeStyle">
        <p>Stroke style</p>
        <div className="innerGroup">
          {STROKE_STYLES.map((style, index) => (
            <button
              type="button"
              title={style.slug}
              className={
                "itemButton option" +
                (style.slug === elementStyle.strokeStyle ? " selected" : "")
              }
              key={index}
              onClick={() => {
                updateStyles({ strokeStyle: style.slug });
                if ("id" in selectedElement) {
                  updateElement(
                    selectedElement.id,
                    {
                      strokeStyle: style.slug,
                    },
                    setElements,
                    elements
                  );
                }
              }}
            >
              <style.icon />
            </button>
          ))}
        </div>
      </div>
      <div className="group opacity">
        <p>Opacity</p>
        <div className="innerGroup">
          <input
            type="range"
            min={0}
            max={100}
            className="itemRange"
            value={elementStyle.opacity}
            step="10"
            onChange={({ target }) => {
              const value = minmax(+target.value, [0, 100]);
              updateStyles({
                opacity: value,
              });
              if ("id" in selectedElement) {
                updateElement(
                  selectedElement.id,
                  {
                    opacity: value,
                  },
                  setElements,
                  elements
                );
              }
            }}
          />
        </div>
      </div>
      {"id" in selectedElement && (
        <React.Fragment>
          <div className="group layers">
            <p>Layers</p>
            <div className="innerGroup">
              <button
                type="button"
                className="itemButton option"
                title="Send to back"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 0, setElements, elements)
                }
              >
                <ToBack />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Send backward"
                onClick={() =>
                  moveElementLayer(
                    selectedElement.id,
                    -1,
                    setElements,
                    elements
                  )
                }
              >
                <Backward />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Bring forward"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 1, setElements, elements)
                }
              >
                <Forward />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Bring to front"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 2, setElements, elements)
                }
              >
                <ToFront />
              </button>
            </div>
          </div>

          <div className="group actions">
            <p>Actions</p>
            <div className="innerGroup">
              <button
                type="button"
                onClick={() =>
                  deleteElement(
                    selectedElement as Element,
                    setElements,
                    setSelectedElement
                  )
                }
                title="Delete"
                className="itemButton option"
              >
                <Delete />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Duplicate ~ Ctrl + d"
                onClick={() =>
                  duplicateElement(
                    selectedElement as Element,
                    setElements,
                    setSelectedElement,
                    10
                  )
                }
              >
                <Duplicate />
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
      {selectedElement?.tool === "text" && (
        <div className="text-style flex flex-col gap-2">
          <div className="style-group flex gap-2">
            <label>Font Size</label>
            <input
              type="number"
              value={elementStyle.fontSize}
              onChange={handleFontSizeChange}
              min="8"
              max="72"
            />
          </div>
          <div className="style-group flex gap-2">
            <label>Font Family</label>
            <select
              value={elementStyle.fontFamily}
              onChange={handleFontFamilyChange}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="style-group flex gap-2">
            <label>Font Weight</label>
            <select
              value={elementStyle.fontWeight}
              onChange={handleFontWeightChange}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
