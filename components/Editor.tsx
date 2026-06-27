"use client";

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import { editorTools } from "@/lib/editorTools";
import ConnectionStatus from "./ConnectionStatus";
import VersionTimeline from "./VersionTimeline";

const LOCAL_KEY = (id: string) => `doc_draft_${id}`;

export default function Editor({ docId }: { docId: string }) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);


  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [ready, setReady] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [tempTitle, setTempTitle] = useState(title);

  const isEditorReadyRef = useRef(false);

  async function destroyEditor() {
    if (!editorRef.current) return;

    try {
      isEditorReadyRef.current = false;
      await editorRef.current.destroy();
    } catch { }
    editorRef.current = null;
  }


  async function initEditor(data: any) {
    if (!holderRef.current) return;

    await destroyEditor();

    editorRef.current = new EditorJS({
      holder: holderRef.current,
      autofocus: true,
      data,
      tools: editorTools,
      onReady() {
        isEditorReadyRef.current = true;
        startLocalAutosave();
      },
    });
  }

useEffect(() => {
  async function loadDocument() {
    try {
      const docRes = await fetch(`/api/documents/${docId}`);
      const doc = await docRes.json();
      setTitle(doc.title);

      const localDraft = localStorage.getItem(LOCAL_KEY(docId));
      let editorData: EditorJS.OutputData = { blocks: [] };

      if (localDraft) {
        editorData = JSON.parse(localDraft);
      } else {
        const versionRes = await fetch(
          `/api/versions?documentId=${docId}&latest=true`
        );
        const versionData = await versionRes.json();

        if (versionData?.version?.snapshot) {
          editorData = JSON.parse(versionData.version.snapshot);
        } else if (doc.content) {
          try {
            editorData = JSON.parse(doc.content);
          } catch {
            editorData = {
              blocks: [{ type: "paragraph", data: { text: doc.content } }],
            };
          }
        }
      }

      await initEditor(editorData);
    } catch (err) {
      console.error("Failed to load document", err);
      setStatus("error");
    }
  }

  loadDocument();
  return () => editorRef.current?.destroy();
}, [docId]);

  function startLocalAutosave() {
    autosaveRef.current && clearInterval(autosaveRef.current);

    autosaveRef.current = setInterval(async () => {
      if (!editorRef.current) return;

      try {
        const data = await editorRef.current.save();
        localStorage.setItem(LOCAL_KEY(docId), JSON.stringify(data));
      } catch { }
    }, 2000);
  }

  async function saveDocument() {
    if (!editorRef.current) return;

    try {
      const output = await editorRef.current.save();

      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: Number(docId),
          content: JSON.stringify(output),
        }),
      });

      await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: Number(docId),
          snapshot: JSON.stringify(output),
          startBlockIndex: 0,
          baseVersion: 0,
        }),
      });

      localStorage.removeItem(LOCAL_KEY(docId));
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }


  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  async function createVersionSnapshot() {
    const editor = editorRef.current;

    if (
      !editor ||
      !isEditorReadyRef.current ||
      typeof editor.save !== "function"
    ) {
      return;
    }

    try {
      const snapshot = await editor.save();

      await fetch("/api/versions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          documentId: Number(docId),
          snapshot: JSON.stringify(snapshot),
          startBlockIndex: snapshot.blocks.length - 1,
        }),
      });
    } catch (err) {
      console.warn("Version snapshot skipped", err);
    }
  }


  useEffect(() => {
    function handleBeforeUnload() {
      createVersionSnapshot(); 
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [docId]);
  const saveTitle = async () => {
    const newTitle = tempTitle.trim();
    if (!newTitle || newTitle === title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/documents`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: Number(docId), 
          title: newTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename");
      }

      setTitle(newTitle);
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setIsEditingTitle(false);
    }
  };


  useEffect(() => {
    const syncOnOnline = () => saveDocument();
    window.addEventListener("online", syncOnOnline);
    return () => window.removeEventListener("online", syncOnOnline);
  }, []);

  async function loadVersion(version: any) {
    if (!version?.snapshot) {
      alert("This version has no snapshot");
      return;
    }

    let snapshot;
    try {
      snapshot = JSON.parse(version.snapshot);
    } catch {
      alert("Invalid snapshot data");
      return;
    }

    await destroyEditor();
    await initEditor(snapshot);

    setTimeout(() => {
      const index = version.start_block_index ?? 0;
      const blocks = editorRef.current?.blocks as any;
      blocks?.focus?.(index);
      blocks?.scrollTo(index);
    }, 300);
  }


  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-3 shadow-md">
        <button onClick={() => window.history.back()} className="flex items-center gap-2">
          {"Back"}
        </button>
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              value={tempTitle}
              autoFocus
              onChange={e => setTempTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="border-b border-gray-400 outline-none px-1 font-semibold bg-transparent"
            />
          ) : (
            <h1
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h1>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {status === "saved" && (
            <span className="text-green-600 text-sm">Saved ✓</span>
          )}
          <ConnectionStatus />

          <button
            onClick={saveDocument}
            className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex overflow-hidden border-r">
        <div className="w-[20%] shadow-xl">
          <VersionTimeline documentId={Number(docId)} onSelectVersion={loadVersion} />
        </div>
        <div
          ref={holderRef}
          className="flex-1 p-6 overflow-auto w-[80%]"
        />
      </div>
    </div>
  );
}
