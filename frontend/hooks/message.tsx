import React, { createContext, useState, useContext, useEffect } from "react";

interface Message {
  id: number;
  type: "success" | "error" | "info" | "warning";
  content: string;
  title?: string;
  duration?: number;
}

interface MessageOptions {
  content: string;
  duration?: number;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (
    type: Message["type"],
    content: string,
    title?: string,
    duration?: number,
  ) => void;
}

const MessageContext = createContext<MessageContextType>({
  messages: [],
  addMessage: () => {},
});

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const removeMessage = (id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const addMessage = (
    type: Message["type"],
    content: string,
    title?: string,
    duration = 3000,
  ) => {
    const id = Date.now();

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, { id, type, content, title }];
      return newMessages;
    });

    if (duration > 0) {
      setTimeout(() => removeMessage(id), duration);
    }
  };

  return (
    <>
      <MessageContext.Provider value={{ messages, addMessage }}>
        {children}
      </MessageContext.Provider>
      <div
        id="message-container"
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
          zIndex: 999999,
          maxWidth: "90vw",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              backgroundColor:
                msg.type === "success"
                  ? "rgba(34, 197, 94, 0.95)"
                  : msg.type === "error"
                    ? "rgba(239, 68, 68, 0.95)"
                    : msg.type === "warning"
                      ? "rgba(234, 179, 8, 0.95)"
                      : "rgba(59, 130, 246, 0.95)",
              color: "white",
              width: "320px",
              borderRadius: "4px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              animation: "slideInRight 0.3s ease-out forwards",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                {msg.title && (
                  <div style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}>
                    {msg.title}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </span>
              </div>
              <button
                onClick={() => removeMessage(msg.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  padding: "4px",
                  fontSize: "16px",
                  lineHeight: 1,
                  transition: "color 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                ✕
              </button>
            </div>
            <div
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                  animation: `progress ${msg.duration || 3000}ms linear`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
};

// 修改全局消息实例的实现
let globalAddMessage:
  | ((type: Message["type"], content: string, title?: string, duration?: number) => void)
  | null = null;

export const MessageContainer: React.FC = () => {
  const { addMessage } = useContext(MessageContext);

  useEffect(() => {
    globalAddMessage = addMessage;
    return () => {
      globalAddMessage = null;
    };
  }, [addMessage]);

  return null;
};

// 修改消息方法的实现
export const message = {
  success: (content: string, title?: string) => {
    if (!globalAddMessage) {
      console.warn("Message system not initialized");
      return;
    }
    globalAddMessage("success", content, title);
  },
  error: (content: string, title?: string) => {
    if (!globalAddMessage) {
      console.warn("Message system not initialized");
      return;
    }
    globalAddMessage("error", content, title);
  },
  warning: (content: string, title?: string) => {
    if (!globalAddMessage) {
      console.warn("Message system not initialized");
      return;
    }
    globalAddMessage("warning", content, title);
  },
  info: (content: string, title?: string) => {
    if (!globalAddMessage) {
      console.warn("Message system not initialized");
      return;
    }
    globalAddMessage("info", content, title);
  },
};
