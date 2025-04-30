"use client"
import { Redo, Undo } from "./icons"
import { useAppContext } from "@/providers/AppStates"

export default function UndoRedo() {
  const { undo, redo } = useAppContext()
  return (
    <section className="undoRedo">
      <button type="button" onClick={undo}>
        <Undo />
      </button>
      <button type="button" onClick={redo}>
        <Redo />
      </button>
    </section>
  )
}
