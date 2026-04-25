export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const lines = message.content.split("\n");

  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="avatar">AI</div>}
      <div className="bubble">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {message.usage && (
          <div className="usage-info">
            {message.usage.cacheRead > 0 && (
              <span className="cache-hit" title="プロンプトキャッシュから読み込み">
                ⚡ キャッシュ {message.usage.cacheRead.toLocaleString()} tokens
              </span>
            )}
          </div>
        )}
      </div>
      {isUser && <div className="avatar user-avatar">Dr</div>}
    </div>
  );
}
