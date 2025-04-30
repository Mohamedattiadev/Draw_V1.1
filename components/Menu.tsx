"use client"

import { useState } from "react"
import { Delete, Download, Folder, MenuIcon, Xmark } from "./icons"
import { useAppContext } from "@/providers/AppStates"
import { saveElements, uploadElements } from "@/utils/element"

export default function Menu() {
  const { elements, setElements } = useAppContext()
  const [show, setShow] = useState(false)

  return (
    <div className="menu">
      <button className="menuBtn" type="button" onClick={() => setShow((prev) => !prev)}>
        {show ? <Xmark /> : <MenuIcon />}
      </button>

      {show && <MenuBox elements={elements} setElements={setElements} setShow={setShow} />}
    </div>
  )
}

interface MenuBoxProps {
  elements: any[]
  setElements: (elements: any[]) => void
  setShow: (show: boolean) => void
}

function MenuBox({ elements, setElements, setShow }: MenuBoxProps) {
  const uploadJson = () => uploadElements(setElements)
  const downloadJson = () => saveElements(elements)
  const reset = () => setElements([])

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
        <button className="menuItem" type="button" onClick={reset}>
          <Delete /> <span>Reset the canvas</span>
        </button>
      </section>
    </>
  )
}
