import { useState, useRef, useEffect, useCallback } from "react";
import { sendChatMessage, parseFieldsBlock, cleanAiText, buildSystemPrompt } from "../api/chat";
import { resolveChatFieldAction } from "../api/chatFlow";
import { useVoice } from "../hooks/useVoice";

const MIN_HEIGHT = 160;
const MAX_HEIGHT = 400;
const DEFAULT_HEIGHT = 220;

export default function ChatPanel({ activeIndex, currentEntry, shiftType, coordinatorName, totalEntries, onFieldsFilled, onAddAndFill }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);

  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const system = buildSystemPrompt(activeIndex, currentEntry, shiftType, coordinatorName, totalEntries);
      const aiText = await sendChatMessage(
        history.map(m => ({ role: m.role, content: m.content })),
        system
      );

      const fields = parseFieldsBlock(aiText);
      const clean = cleanAiText(aiText);
      const filledKeys = fields ? Object.keys(fields).filter(k => fields[k] !== "") : [];

      let newRowNote = "";
      if (fields) {
        const action = resolveChatFieldAction(currentEntry, fields);
        if (action.type === "addNewRow") {
          const newIndex = onAddAndFill(action.fields);
          newRowNote = ` -> A/C mismatch - added as new Row ${newIndex + 1}.`;
        } else {
          onFieldsFilled(activeIndex, action.fields);
        }
      }

      setMessages([
        ...history,
        { role: "assistant", content: clean + newRowNote, filledKeys, newRow: !!newRowNote },
      ]);
    } catch (e) {
      setError(e.message || "AI unavailable - check API connection.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activeIndex, currentEntry, shiftType, coordinatorName, totalEntries, onFieldsFilled, onAddAndFill]);

  const { listening, supported, toggle } = useVoice(
    useCallback((transcript, err) => {
      if (err) { setError(err); return; }
      if (transcript) handleSend(transcript);
    }, [handleSend])
  );

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function onDragStart(e) {
    const startY = e.clientY;
    const startH = panelHeight;

    function onMove(ev) {
      const delta = startY - ev.clientY;
      setPanelHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startH + delta)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="chat-panel no-print" style={{ height: panelHeight }}>
      <div className="drag-handle" onMouseDown={onDragStart} ref={dragRef}>
        <span className="drag-dots">...</span>
      </div>

      <div className="chat-header">
        <span className="chat-title">AI Gate Agent</span>
        <span className="chat-row-indicator">Row {activeIndex + 1}</span>
        {listening && <span className="rec-indicator">REC</span>}
      </div>

      <div className="message-thread" ref={threadRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            Describe a gate call or say a field value - AI will fill the active row.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message message-${m.role}`}>
            <div className="message-content">{m.content}</div>
            {m.filledKeys && m.filledKeys.length > 0 && (
              <div className="filled-tags">
                {m.filledKeys.map(k => (
                  <span key={k} className="filled-tag">{k}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <span className="typing-dots">...</span>
          </div>
        )}
        {error && <div className="chat-error">{error}</div>}
      </div>

      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe gate call or say field values..."
          rows={2}
          disabled={loading}
        />
        {supported && (
          <button
            className={`mic-btn${listening ? " mic-active" : ""}`}
            onClick={() => toggle(() => input, setInput)}
            title={listening ? "Stop recording" : "Start voice dictation"}
          >
            Mic
          </button>
        )}
        <button
          className="send-btn"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
