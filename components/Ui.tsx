import { useAppContext } from "@/providers/AppStates";
import Style from "./Style";
import ToolBar from "./ToolBar";
import Zoom from "./Zoom";
import UndoRedo from "./UndoRedo";
import Menu from "./Menu";
import Collaboration from "./Collaboration";
import Credits from "./Credits";
import { useState } from "react";
import { useEffect } from "react";

export default function Ui() {
  const { selectedElement, selectedTool, style } = useAppContext();

  return (
    <main className="ui">
      <header>
        <Menu />
        <ToolBar />
        <div className="text-sm text-gray-500">
          {(() => {
            const [time, setTime] = useState(new Date());

            useEffect(() => {
              const timer = setInterval(() => {
                setTime(new Date());
              }, 1000);

              return () => clearInterval(timer);
            }, []);

            return (
              <div className=" flex flex-col items-center text-md text-gray-500">
                <div> {time.toLocaleTimeString()} </div>{" "}
                <div>{time.toLocaleDateString()}</div>
              </div>
            );
          })()}
        </div>
      </header>
      {(!["selection", "hand"].includes(selectedTool) || selectedElement) && (
        <Style selectedElement={selectedElement || style} />
      )}

      <footer>
        <div>
          <Zoom />
          <UndoRedo />
        </div>
        <div>
          <Credits />
        </div>
      </footer>
    </main>
  );
}
