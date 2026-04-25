import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import MeetingForm from "./components/MeetingForm";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "こんにちは、ファルマジャパンのMRアシスタントです。\n弊社製品（カルディオプレックス、グルコスタット、ロスペクタ、ネフロガード）に関するご質問にお答えします。\nどのようなことでもお気軽にお尋ねください。",
  suggestMeeting: false,
};

export default function App() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [meetingState, setMeetingState] = useState("idle"); // idle | prompted | form | submitted
  const [meetingMessageIdx, setMeetingMessageIdx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, meetingState]);

  async function sendMessage(text) {
    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    const apiMessages = nextMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.message,
        suggestMeeting: data.suggestMeeting,
        usage: data.usage,
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        if (data.suggestMeeting && meetingState === "idle") {
          setMeetingState("prompted");
          setMeetingMessageIdx(updated.length - 1);
        }
        return updated;
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "申し訳ありません。エラーが発生しました。しばらくしてから再度お試しください。",
          suggestMeeting: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleMeetingResponse(wants) {
    if (wants) {
      setMeetingState("form");
    } else {
      setMeetingState("idle");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "承知しました。他にご質問がございましたら、お気軽にどうぞ。",
          suggestMeeting: false,
        },
      ]);
    }
  }

  async function handleMeetingSubmit(formData) {
    try {
      const res = await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMeetingState("submitted");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `面談のご依頼を承りました（受付番号: ${data.id}）。\n担当MRより2営業日以内にご連絡差し上げます。\n引き続き何かご質問がございましたらお気軽にどうぞ。`,
            suggestMeeting: false,
          },
        ]);
      }
    } catch {
      alert("送信に失敗しました。もう一度お試しください。");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">💊</span>
            <div>
              <div className="logo-title">MRアシスタント</div>
              <div className="logo-sub">ファルマジャパン株式会社</div>
            </div>
          </div>
          <div className="header-badge">AI powered by Claude</div>
        </div>
      </header>

      <main className="chat-area">
        <div className="messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}

          {meetingState === "prompted" && (
            <div className="meeting-prompt">
              <div className="meeting-prompt-icon">📅</div>
              <p>この件につきましては、担当MRが直接ご説明させていただくことが最適です。面談をご希望されますか？</p>
              <div className="meeting-prompt-actions">
                <button className="btn-primary" onClick={() => handleMeetingResponse(true)}>
                  面談を希望する
                </button>
                <button className="btn-secondary" onClick={() => handleMeetingResponse(false)}>
                  今は不要です
                </button>
              </div>
            </div>
          )}

          {meetingState === "form" && (
            <MeetingForm
              onSubmit={handleMeetingSubmit}
              onCancel={() => {
                setMeetingState("idle");
              }}
            />
          )}

          {loading && (
            <div className="message assistant">
              <div className="avatar">AI</div>
              <div className="bubble loading">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="input-area">
        <ChatInput
          onSend={sendMessage}
          disabled={loading || meetingState === "form"}
        />
        <p className="disclaimer">
          ※ 本AIは製品情報の提供を目的としています。個々の患者への投与判断は医師の判断に委ねられます。
        </p>
      </footer>
    </div>
  );
}
