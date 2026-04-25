import { useState } from "react";

const SUGGESTIONS = [
  "カルディオプレックスの用法・用量を教えてください",
  "グルコスタットの副作用は？",
  "ロスペクタの禁忌について",
  "ネフロガードの適応を詳しく知りたい",
];

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="chat-input-wrapper">
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="suggestion-chip"
            onClick={() => !disabled && onSend(s)}
            disabled={disabled}
          >
            {s}
          </button>
        ))}
      </div>
      <form className="input-form" onSubmit={handleSubmit}>
        <textarea
          className="input-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="製品に関するご質問をどうぞ…（Shift+Enterで改行）"
          rows={2}
          disabled={disabled}
        />
        <button className="send-btn" type="submit" disabled={!text.trim() || disabled}>
          送信
        </button>
      </form>
    </div>
  );
}
