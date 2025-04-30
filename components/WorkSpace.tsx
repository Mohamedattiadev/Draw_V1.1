"use client"

import { useEffect } from "react"
import Canvas from "./Canvas"
import Ui from "./Ui"
import { useSearchParams } from "next/navigation"
import { useAppContext } from "@/providers/AppStates"
import { socket } from "@/lib/socket"

export default function WorkSpace() {
  const { setSession } = useAppContext()
  const searchParams = useSearchParams()

  useEffect(() => {
    const room = searchParams.get("room")

    if (room) {
      setSession(room)
      socket.emit("join", room)
    }
  }, [searchParams, setSession])

  return (
    <>
      <Ui />
      <Canvas />
    </>
  )
}
