"use client";

import type React from "react";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppContext } from "@/providers/AppStates";
import useDimension from "./useDimension";
import { lockUI } from "@/utils/ui";
import {
  draw,
  drawFocuse,
  cornerCursor,
  inSelectedCorner,
} from "@/utils/canvas";
import {
  adjustCoordinates,
  arrowMove,
  createElement,
  deleteElement,
  duplicateElement,
  getElementById,
  getElementPosition,
  minmax,
  resizeValue,
  saveElements,
  updateElement,
  uploadElements,
} from "@/utils/element";
import useKeys from "./useKeys";
import type { Corner, Element, Translate } from "@/types";
import { socket } from "@/lib/socket";

export default function useCanvas() {
  const {
    selectedTool,
    setSelectedTool,
    action,
    setAction,
    elements,
    setElements,
    scale,
    onZoom,
    translate,
    setTranslate,
    scaleOffset,
    setScaleOffset,
    lockTool,
    style,
    selectedElement,
    setSelectedElement,
    undo,
    redo,
    session,
  } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useKeys();
  const dimension = useDimension();
  const [isInElement, setIsInElement] = useState(false);
  const [inCorner, setInCorner] = useState<Corner | undefined>(undefined);
  const [padding, setPadding] = useState(minmax(10 / scale, [0.5, 50]));
  const [cursor, setCursor] = useState("default");
  const [mouseAction, setMouseAction] = useState({ x: 0, y: 0 });
  const [resizeOldDementions, setResizeOldDementions] =
    useState<Element | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const mousePosition = ({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) => {
    clientX = (clientX - translate.x * scale + scaleOffset.x) / scale;
    clientY = (clientY - translate.y * scale + scaleOffset.y) / scale;
    return { clientX, clientY };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent context menu on right click
    if (event.button === 2) {
      event.preventDefault();
    }

    const { clientX, clientY } = mousePosition(event);
    lockUI(true);

    if (selectedTool === "text") {
      const element = createElement(
        clientX,
        clientY,
        clientX + 100,
        clientY + 30,
        style,
        "text"
      );
      element.text = "";
      element.fontSize = 16;
      element.fontFamily = "Arial";
      element.fontWeight = "normal";
      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);
      setIsEditing(true);
      setTextInput("");
      return;
    }

    if (inCorner) {
      const element = getElementById(selectedElement?.id || "", elements);
      if (element) {
        setResizeOldDementions(element);
        setElements((prevState) => prevState);
        setMouseAction({ x: event.clientX, y: event.clientY });
        setCursor(cornerCursor(inCorner.slug));
        setAction(
          "resize-" + inCorner.slug + (event.shiftKey ? "-shiftkey" : "")
        );
      }
      return;
    }

    // Handle right-click or hand tool
    if (keys.has(" ") || selectedTool === "hand" || event.button === 2) {
      setTranslate((prevState) => ({
        ...prevState,
        sx: clientX,
        sy: clientY,
      }));
      setAction("translate");
      // Temporarily set cursor to grabbing
      document.documentElement.style.setProperty("--canvas-cursor", "grabbing");
      return;
    }

    if (selectedTool === "selection") {
      const element = getElementPosition(clientX, clientY, elements);

      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;

        if (event.altKey) {
          duplicateElement(element, setElements, setSelectedElement, 0, {
            offsetX,
            offsetY,
          });
        } else {
          setElements((prevState) => prevState);
          setMouseAction({ x: event.clientX, y: event.clientY });
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setAction("move");
      } else {
        setSelectedElement(null);
      }

      return;
    }

    if (!["selection", "hand", "lock"].includes(selectedTool)) {
      setAction("draw");
      const element = createElement(
        clientX,
        clientY,
        clientX,
        clientY,
        style,
        selectedTool as Exclude<
          typeof selectedTool,
          "selection" | "hand" | "lock"
        >
      );
      setElements((prevState) => [...prevState, element]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = mousePosition(event);

    if (selectedElement) {
      const element = getElementById(selectedElement.id, elements);
      if (element) {
        setInCorner(
          inSelectedCorner(element, clientX, clientY, padding, scale)
        );
      }
    }

    if (getElementPosition(clientX, clientY, elements)) {
      setIsInElement(true);
    } else {
      setIsInElement(false);
    }

    if (action === "draw") {
      const lastElement = elements.at(-1);
      if (lastElement) {
        updateElement(
          lastElement.id,
          { x2: clientX, y2: clientY },
          setElements,
          elements,
          true
        );
      }
    } else if (action === "move") {
      if (!selectedElement) return;
      const { id, x1, y1, x2, y2, offsetX, offsetY } = selectedElement;

      const width = x2 - x1;
      const height = y2 - y1;

      const nx = clientX - (offsetX || 0);
      const ny = clientY - (offsetY || 0);

      updateElement(
        id,
        { x1: nx, y1: ny, x2: nx + width, y2: ny + height },
        setElements,
        elements,
        true
      );
    } else if (action === "translate") {
      const x = clientX - translate.sx;
      const y = clientY - translate.sy;

      setTranslate((prevState) => ({
        ...prevState,
        x: prevState.x + x,
        y: prevState.y + y,
      }));
    } else if (action.startsWith("resize")) {
      if (!selectedElement || !resizeOldDementions) return;
      const resizeCorner = action.slice(7, 9);
      const resizeType = action.slice(10) || "default";
      const s_element = getElementById(selectedElement.id, elements);
      if (!s_element) return;

      updateElement(
        s_element.id,
        resizeValue(
          resizeCorner,
          resizeType,
          clientX,
          clientY,
          padding,
          s_element,
          mouseAction,
          resizeOldDementions
        ),
        setElements,
        elements,
        true
      );
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setAction("none");
    lockUI(false);

    if (event.clientX === mouseAction.x && event.clientY === mouseAction.y) {
      // Undo to previous state if mouse up without movement
      undo();
      return;
    }

    if (action === "draw") {
      const lastElement = elements.at(-1);
      if (lastElement) {
        const { id, x1, y1, x2, y2 } = adjustCoordinates(lastElement);
        updateElement(id, { x1, x2, y1, y2 }, setElements, elements, true);
        if (!lockTool) {
          setSelectedTool("selection");
          setSelectedElement(lastElement);
        }
      }
    }

    if (action.startsWith("resize") && selectedElement) {
      const element = getElementById(selectedElement.id, elements);
      if (element) {
        const { id, x1, y1, x2, y2 } = adjustCoordinates(element);
        updateElement(id, { x1, x2, y1, y2 }, setElements, elements, true);
      }
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY * -0.01;
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Calculate mouse position relative to canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseXRelative = mouseX - rect.left;
      const mouseYRelative = mouseY - rect.top;

      // Calculate mouse position in canvas coordinates
      const mouseXCanvas =
        (mouseXRelative - translate.x * scale + scaleOffset.x) / scale;
      const mouseYCanvas =
        (mouseYRelative - translate.y * scale + scaleOffset.y) / scale;

      // Apply zoom
      const newScale = minmax(scale + delta, [0.1, 20]);
      const scaleFactor = newScale / scale;

      // Adjust translation to keep mouse position fixed
      setTranslate((prevState) => ({
        ...prevState,
        x: prevState.x - mouseXCanvas * (scaleFactor - 1),
        y: prevState.y - mouseYCanvas * (scaleFactor - 1),
      }));

      onZoom(delta);
      return;
    }

    setTranslate((prevState) => ({
      ...prevState,
      x: prevState.x - event.deltaX,
      y: prevState.y - event.deltaY,
    }));
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const zoomPositionX = 2;
    const zoomPositionY = 2;

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    const scaleOffsetX = (scaledWidth - canvas.width) / zoomPositionX;
    const scaleOffsetY = (scaledHeight - canvas.height) / zoomPositionY;

    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(
      translate.x * scale - scaleOffsetX,
      translate.y * scale - scaleOffsetY
    );
    context.scale(scale, scale);

    let focusedElement: Element | undefined;
    elements.forEach((element) => {
      draw(element, context);
      if (element.id === selectedElement?.id) focusedElement = element;
    });

    const pd = minmax(10 / scale, [0.5, 50]);
    if (focusedElement) {
      drawFocuse(focusedElement, context, pd, scale);
    }
    setPadding(pd);

    context.restore();
  }, [elements, selectedElement, scale, translate, dimension]);

  useEffect(() => {
    const keyDownFunction = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const prevent = () => event.preventDefault();
      if (selectedElement) {
        if (key === "Delete") {
          prevent();
          deleteElement(selectedElement, setElements, setSelectedElement);
        }

        if (ctrlKey && key.toLowerCase() === "d") {
          prevent();
          duplicateElement(
            selectedElement,
            setElements,
            setSelectedElement,
            10
          );
        }

        if (key === "ArrowLeft") {
          prevent();
          arrowMove(selectedElement, -1, 0, setElements);
        }
        if (key === "ArrowUp") {
          prevent();
          arrowMove(selectedElement, 0, -1, setElements);
        }
        if (key === "ArrowRight") {
          prevent();
          arrowMove(selectedElement, 1, 0, setElements);
        }
        if (key === "ArrowDown") {
          prevent();
          arrowMove(selectedElement, 0, 1, setElements);
        }
      }

      if (ctrlKey || metaKey) {
        if (
          key.toLowerCase() === "y" ||
          (key.toLowerCase() === "z" && shiftKey)
        ) {
          prevent();
          redo();
        } else if (key.toLowerCase() === "z") {
          prevent();
          undo();
        } else if (key.toLowerCase() === "s") {
          prevent();
          // saveElements(elements);
        } else if (key.toLowerCase() === "o") {
          prevent();
          uploadElements(setElements);
        }
      }
    };

    window.addEventListener("keydown", keyDownFunction, { passive: false });
    return () => {
      window.removeEventListener("keydown", keyDownFunction);
    };
  }, [undo, redo, selectedElement, elements, setElements, setSelectedElement]);

  useEffect(() => {
    if (selectedTool !== "selection") {
      setSelectedElement(null);
    }
  }, [selectedTool, setSelectedElement]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (action === "translate") {
      document.documentElement.style.setProperty("--canvas-cursor", "grabbing");
    } else if (action.startsWith("resize")) {
      document.documentElement.style.setProperty("--canvas-cursor", cursor);
    } else if (
      (keys.has(" ") || selectedTool === "hand") &&
      action !== "move" &&
      !action.startsWith("resize")
    ) {
      document.documentElement.style.setProperty("--canvas-cursor", "grab");
    } else if (selectedTool !== "selection") {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        "crosshair"
      );
    } else if (inCorner) {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        cornerCursor(inCorner.slug)
      );
    } else if (isInElement) {
      document.documentElement.style.setProperty("--canvas-cursor", "move");
    } else {
      document.documentElement.style.setProperty("--canvas-cursor", "default");
    }
  }, [keys, selectedTool, action, isInElement, inCorner, cursor]);

  useEffect(() => {
    const fakeWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", fakeWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", fakeWheel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing && selectedElement?.tool === "text") {
        if (event.key === "Enter") {
          setIsEditing(false);
          setSelectedTool("selection");
          if (textInput.trim() === "") {
            deleteElement(selectedElement, setElements, setSelectedElement);
            setSelectedElement(null);
          } else {
            updateElement(
              selectedElement.id,
              { text: textInput },
              setElements,
              elements,
              true
            );
            setSelectedElement(selectedElement);
          }
        } else if (event.key === "Escape") {
          setIsEditing(false);
          setTextInput("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, selectedElement, textInput, elements, setElements]);

  // Add double-click handler for editing text
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = mousePosition(event);
    const element = getElementPosition(clientX, clientY, elements);
    if (element && element.tool === "text") {
      setSelectedElement(element);
      setIsEditing(true);
      setTextInput(element.text || "");
    }
  };

  // Add canvas state synchronization
  useEffect(() => {
    if (!session) return;

    const handleCanvasState = (state: {
      scale: number;
      translate: Translate;
    }) => {
      onZoom(state.scale - scale);
      setTranslate((prevState) => ({
        ...prevState,
        x: state.translate.x,
        y: state.translate.y,
      }));
    };

    socket.on("setCanvasState", handleCanvasState);

    return () => {
      socket.off("setCanvasState", handleCanvasState);
    };
  }, [session, scale, translate, onZoom, setTranslate]);

  // Emit canvas state changes
  useEffect(() => {
    if (!session) return;

    const state = {
      scale,
      translate: {
        x: translate.x,
        y: translate.y,
      },
    };
    socket.emit("updateCanvasState", { state, room: session });
  }, [session, scale, translate]);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    dimension,
    isEditing,
    textInput,
    setTextInput,
    selectedElement,
    handleDoubleClick,
  };
}
