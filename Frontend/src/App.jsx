import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
function App() {
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);
  const editorRef = useRef();

  const Ydoc = useMemo(() => new Y.Doc(), []);
  const YText = useMemo(() => Ydoc.getText("monaco"), [Ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    const monacoBinding = new MonacoBinding(
      YText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  const handleJion = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };
  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider(
        "/",
        "monaco",
        Ydoc,
        {
          autoConnect: true,
        },
      );
      provider.awareness.setLocalStateField("user", { username });
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(
        states
          .filter((state) => state.user && state.user.username)
          .map((state) => state.user),
      );
      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .filter((state) => state.user && state.user.username)
            .map((state) => state.user),
        );
      });

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        provider.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [username]);
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form className="flex flex-col gap-4" onSubmit={handleJion}>
          <input
            type="text"
            placeholder="Enter Your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }
  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="w-1/4 bg-neutral-900 rounded-lg p-4 text-white">
  <h2 className="font-bold mb-3">Online Users</h2>

  {users.map((user, index) => (
    <div
      key={index}
      className="p-2 rounded bg-neutral-800 mb-2"
    >
      {user.username}
    </div>
  ))}
</aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Some Comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
