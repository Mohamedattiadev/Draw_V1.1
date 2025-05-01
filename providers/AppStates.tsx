"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  Circle,
  Line,
  Rectangle,
  Diamond,
  Arrow,
  TextIcon,
  Hand,
  Lock,
  Selection,
} from "../client/src/assets/icons";
import {
  BACKGROUND_COLORS,
  STROKE_COLORS,
  STROKE_STYLES,
} from "@/lib/constants";
import { getElementById, minmax } from "@/utils/element";
import useHistory from "@/hooks/useHistory";
import { socket } from "@/lib/socket";
import type {
  AppContextProviderProps,
  AppContextType,
  Element,
  ScaleOffset,
  Style,
  Tool,
  ToolType,
  Translate,
} from "@/types";

const AppContext = createContext<AppContextType>({} as AppContextType);

const isElementsInLocal = (): Element[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedElements = localStorage.getItem("elements");
    if (!storedElements) return [];

    const parsedElements = JSON.parse(storedElements);
    if (Array.isArray(parsedElements)) {
      return parsedElements;
    }
    return [];
  } catch (err) {
    return [];
  }
};

const initialElements = isElementsInLocal();

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [session, setSession] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [elements, setElements, undo, redo] = useHistory(
    initialElements,
    session
  );
  const [action, setAction] = useState("none");
  const [selectedTool, setSelectedTool] = useState<ToolType>("selection");
  const [translate, setTranslate] = useState<Translate>({
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
  });
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState<ScaleOffset>({ x: 0, y: 0 });
  const [lockTool, setLockTool] = useState(false);
  const [style, setStyle] = useState<Style>({
    strokeWidth: 3,
    strokeColor: STROKE_COLORS[0],
    strokeStyle: STROKE_STYLES[0].slug,
    fill: BACKGROUND_COLORS[0],
    opacity: 100,
  });
  const [currentSavedCanvasId, setCurrentSavedCanvasId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (session === null && typeof window !== "undefined") {
      localStorage.setItem("elements", JSON.stringify(elements));
    }

    if (!getElementById(selectedElement?.id || "", elements)) {
      setSelectedElement(null);
    }
  }, [elements, session, selectedElement]);

  const onZoom = (delta: number | "default") => {
    if (delta === "default") {
      setScale(1);
      return;
    }
    setScale((prevState) => minmax(prevState + delta, [0.1, 20]));
  };

  const toolAction = (slug: ToolType) => {
    if (slug === "lock") {
      setLockTool((prevState) => !prevState);
      return;
    }
    setSelectedTool(slug);
  };

  const tools: Tool[][] = [
    [
      {
        slug: "lock",
        icon: Lock,
        title: "Keep selected tool active after drawing",
        toolAction,
      },
    ],
    [
      {
        slug: "hand",
        icon: Hand,
        title: "Hand",
        toolAction,
      },
      {
        slug: "selection",
        icon: Selection,
        title: "Selection",
        toolAction,
      },
      {
        slug: "rectangle",
        icon: Rectangle,
        title: "Rectangle",
        toolAction,
      },
      {
        slug: "diamond",
        icon: Diamond,
        title: "Diamond",
        toolAction,
      },
      {
        slug: "circle",
        icon: Circle,
        title: "Circle",
        toolAction,
      },
      {
        slug: "arrow",
        icon: Arrow,
        title: "Arrow",
        toolAction,
      },
      {
        slug: "line",
        icon: Line,
        title: "Line",
        toolAction,
      },
      {
        slug: "text",
        icon: TextIcon,
        title: "Text",
        toolAction,
      },
    ],
  ];

  useEffect(() => {
    if (session) {
      socket.on("setElements", (data: Element[]) => {
        setElements(data, true, false);
      });
    }

    return () => {
      socket.off("setElements");
    };
  }, [session, setElements]);

  return (
    <AppContext.Provider
      value={{
        action,
        setAction,
        tools,
        selectedTool,
        setSelectedTool,
        elements,
        setElements,
        translate,
        setTranslate,
        scale,
        setScale,
        onZoom,
        scaleOffset,
        setScaleOffset,
        lockTool,
        setLockTool,
        style,
        setStyle,
        selectedElement,
        setSelectedElement,
        undo,
        redo,
        session,
        setSession,
        currentSavedCanvasId,
        setCurrentSavedCanvasId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
