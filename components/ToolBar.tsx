"use client"

import { useAppContext } from "@/providers/AppStates"

export default function ToolBar() {
  const { tools, selectedTool, lockTool } = useAppContext()

  return (
    <section className="toolbar">
      {tools.map((toolGroup, index) => (
        <div key={index}>
          {toolGroup.map((tool, index_) => (
            <button
              key={index_}
              className={"toolbutton" + ` ${tool.slug}` + (selectedTool === tool.slug ? " selected" : "")}
              data-lock={lockTool}
              onClick={() => tool.toolAction(tool.slug)}
              title={tool.title}
            >
              <tool.icon />
            </button>
          ))}
        </div>
      ))}
    </section>
  )
}
