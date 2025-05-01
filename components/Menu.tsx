"use client";

import { useState, useEffect } from "react";
import { Delete, Download, Folder, MenuIcon, Xmark, Save } from "./icons/index";
import { useAppContext } from "@/providers/AppStates";
import { saveElements, uploadElements } from "@/utils/element";
import { saveCanvas, updateSavedCanvas } from "@/utils/savedCanvases";
import SavedCanvases from "./SavedCanvases";

export default function Menu() {
  const { elements, setElements, currentSavedCanvasId } = useAppContext();
  const [show, setShow] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (currentSavedCanvasId) {
          updateSavedCanvas(currentSavedCanvasId, elements);
        } else {
          // fallback to normal save
          saveElements(elements);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSavedCanvasId, elements]);

  return (
    <div className="menu">
      <button
        className="menuBtn"
        type="button"
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? <Xmark /> : <MenuIcon />}
      </button>

      {show && (
        <MenuBox
          elements={elements}
          setElements={setElements}
          setShow={setShow}
          setShowSaved={setShowSaved}
        />
      )}
      {/* {showSaved && (
        <SavedCanvases setElements={setElements} setShow={setShowSaved} />
      )} */}
    </div>
  );
}

interface MenuBoxProps {
  elements: any[];
  setElements: (elements: any[]) => void;
  setShow: (show: boolean) => void;
  setShowSaved: (show: boolean) => void;
}

function MenuBox({
  elements,
  setElements,
  setShow,
  setShowSaved,
}: MenuBoxProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const uploadJson = () => uploadElements(setElements);
  const downloadJson = () => saveElements(elements);
  const reset = () => setElements([]);
  const saveToStorage = () => {
    const name = prompt("Enter a name for this canvas:", "Untitled");
    if (name !== null) {
      saveCanvas(elements, name);
      setShowSaved(true);
    }
  };

  return (
    <>
      <div className="menuBlur" onClick={() => setShow(false)}></div>
      <section className="menuItems">
        <button className="menuItem" type="button" onClick={uploadJson}>
          <Folder /> <span>Open</span>
        </button>
        <button className="menuItem" type="button" onClick={downloadJson}>
          <Download /> <span>Save</span>
        </button>
        <button className="menuItem" type="button" onClick={saveToStorage}>
          <Save /> <span>Save to Library</span>
        </button>
        {/* My Canvases Dropdown */}
        <div
          className="relative"
          style={{ position: "relative", display: "inline-block" }}
        >
          <button
            className="menuItem"
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <Folder />
            <span>My Canvases</span>
          </button>

          {showDropdown && (
            <div className="savedCanvasesDropdown">
              <SavedCanvases
                setElements={setElements}
                setShow={setShowDropdown}
              />
            </div>
          )}
        </div>

        <button className="menuItem" type="button" onClick={reset}>
          <Delete /> <span>Reset the canvas</span>
        </button>
      </section>
    </>
  );
}
