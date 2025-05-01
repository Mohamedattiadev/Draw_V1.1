import { Suspense } from "react";
import { AppContextProvider } from "@/providers/AppStates";
import WorkSpaceWrapper from "@/components/WorkSpaceWrapper";

export default function DrawingApp() {
  return (
    <AppContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <WorkSpaceWrapper />
      </Suspense>
    </AppContextProvider>
  );
}
