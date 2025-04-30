import { Suspense } from "react"
import WorkSpaceWrapper from "@/components/WorkSpaceWrapper"
import { AppContextProvider } from "@/providers/AppStates"

export default function Home() {
  return (
    <AppContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <WorkSpaceWrapper />
      </Suspense>
    </AppContextProvider>
  )
}
