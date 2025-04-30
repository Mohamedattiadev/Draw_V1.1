"use client";

import { socket } from "@/lib/socket";
import type { Element } from "@/types";
import { useState } from "react";

type Action = Element[] | ((prevState: Element[]) => Element[]) | "prevState";

export default function useHistory(
  initialState: Element[],
  session: string | null
) {
  const [history, setHistory] = useState<Element[][]>([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (action: Action, overwrite = false, emit = true) => {
    if (action === "prevState") {
      if (session) return;
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, history[index - 1]]);
      setIndex((prevState) => prevState - 1);
      return;
    }

    const newState =
      typeof action === "function" ? action(history[index]) : action;

    if (session) {
      // Always update local state first
      setHistory([newState]);
      setIndex(0);

      // Then emit to other clients if needed
      if (emit) {
        socket.emit("getElements", { elements: newState, room: session });
      }
      return;
    }

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () =>
    setIndex((prevState) => (prevState > 0 ? prevState - 1 : prevState));

  const redo = () =>
    setIndex((prevState) =>
      prevState < history.length - 1 ? prevState + 1 : prevState
    );

  return [history[index], setState, undo, redo] as const;
}
