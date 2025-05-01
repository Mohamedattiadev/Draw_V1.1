"use client";

import type React from "react";

import { motion } from "framer-motion";
import { Xmark } from "./icons/index";
import { useState } from "react";
import { useAppContext } from "@/providers/AppStates";
import { v4 as uuid } from "uuid";
import { useSearchParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

export default function Collaboration() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, setSession } = useAppContext();
  const [open, setOpen] = useState(false);
  const users = 0;

  const startSession = () => {
    const sessionId = uuid();
    const params = new URLSearchParams(searchParams.toString());
    params.set("room", sessionId);
    router.push(`/?${params.toString()}`);
    setSession(sessionId);
    socket.emit("join", sessionId);
  };

  const endSession = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("room");
    router.push(`/?${params.toString()}`);
    if (session) {
      socket.emit("leave", session);
    }
    setSession(null);
    setOpen(false);
  };

  return (
    <div className="collaboration">
      <button
        data-users={users > 99 ? "99+" : users}
        type="button"
        className={"collaborateButton" + `${session ? " active" : ""}`}
        onClick={() => setOpen(true)}
      >
        Share
      </button>

      {open && (
        <CollabBox collabState={[open, setOpen]}>
          {session ? (
            <SessionInfo endSession={endSession} />
          ) : (
            <CreateSession startSession={startSession} />
          )}
        </CollabBox>
      )}
    </div>
  );
}

interface CreateSessionProps {
  startSession: () => void;
}

function CreateSession({ startSession }: CreateSessionProps) {
  return (
    <div className="collabCreate">
      <h2>Live collaboration</h2>
      <div>
        <p>Invite people to collaborate on your drawing.</p>
        <p>
          Don't worry, the session is end-to-end encrypted, and fully private.
          Not even our server can see what you draw.
        </p>
      </div>
      <button onClick={startSession}>Start session</button>
    </div>
  );
}

interface SessionInfoProps {
  endSession: () => void;
}

function SessionInfo({ endSession }: SessionInfoProps) {
  const copy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="collabInfo">
      <h2>Live collaboration</h2>

      <div className="collabGroup">
        <label htmlFor="collabUrl">Link</label>
        <div className="collabLink">
          <input
            id="collabUrl"
            type="url"
            value={typeof window !== "undefined" ? window.location.href : ""}
            disabled
          />
          <button type="button" onClick={copy}>
            Copy link
          </button>
        </div>
      </div>
      <div className="endCollab">
        <button type="button" onClick={endSession}>
          Stop session
        </button>
      </div>
    </div>
  );
}

interface CollabBoxProps {
  collabState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  children: React.ReactNode;
}

function CollabBox({ collabState, children }: CollabBoxProps) {
  const [, setOpen] = collabState;
  const exit = () => setOpen(false);

  return (
    <div className="collaborationContainer">
      <motion.div
        className="collaborationBoxBack"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={exit}
      ></motion.div>
      <motion.section
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
        className="collaborationBox"
      >
        <button onClick={exit} type="button" className="closeCollbBox">
          <Xmark />
        </button>

        {children}
      </motion.section>
    </div>
  );
}
