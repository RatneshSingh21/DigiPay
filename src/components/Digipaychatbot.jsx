import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import { buildSystemPrompt } from "./Chatbotconfig.js";
import assets from "../assets/assets.js";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 512;
const STORAGE_KEY = (userId) => `digipay_chat_${userId}`;

const QUICK_PROMPTS = {
    admin: [
        "How do I add a new employee?",
        "Where can I see today's attendance punches?",
        "How to run salary calculation?",
        "Show me pending employee leave",
    ],
    employee: [
        "How do I apply for leave?",
        "Where is my salary slip?",
        "How do I mark attendance?",
        "Show my pending approvals",
    ],
};

const makeWelcome = (name, role) => {
    const isAdmin = role === "Admin" || role === "SuperAdmin";
    return {
        id: "welcome",
        role: "bot",
        type: "answer",
        message: isAdmin
            ? `Hi ${name}! 👋 I'm your DigiPay assistant. Ask me anything — how to add employees, run payroll, manage attendance, or navigate to any page.`
            : `Hi ${name}! 👋 I'm your DigiPay assistant. Ask me about leave, attendance, salary slips, or anything else you need help with.`,
    };
};

// ─── All styles — 100% inline, zero Tailwind dependency ───
const S = {
    fab: {
        position: "fixed",
        bottom: "28px",
        right: "28px",
        width: "54px",
        height: "54px",
        borderRadius: "50%",
        background: "rgb(var(--color-primary))",      // ← change this to match your primary color
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        transition: "transform 0.2s",
        color: "#fff",
    },
    badge: {
        position: "absolute",
        top: "-2px", right: "-2px",
        width: "14px", height: "14px",
        background: "#ef4444",
        borderRadius: "50%",
        border: "2px solid #fff",
    },
    window: {
        position: "fixed",
        bottom: "92px",
        right: "28px",
        width: "360px",
        height: "520px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 99998,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)",
        animation: "chatSlideIn 0.3s cubic-bezier(0.22,1,0.36,1)",
        transform: "scale(1)",
    },
    header: {
        padding: "14px 16px",
        backgroundColor: "rgb(var(--color-primary))",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexShrink: 0,
    },
    headerAvatar: {
        width: "36px", height: "36px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },
    headerInfo: { flex: 1 },
    headerName: {
        margin: 0, fontSize: "14px", fontWeight: 600,
        color: "rgb(var(--color-text))", lineHeight: 1.3,
    },
    headerSub: {
        margin: 0,
        fontSize: "11px",
        color: "rgba(255,255,255,0.85)",
    },
    headerBtn: {
        background: "none", border: "none", cursor: "pointer",
        color: "rgba(255,255,255,0.7)", padding: "5px",
        borderRadius: "6px", display: "flex",
        alignItems: "center", justifyContent: "center",
    },
    clearBanner: {
        margin: "8px 14px 0",
        padding: "10px 14px",
        borderRadius: "12px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "8px",
        flexShrink: 0,
    },
    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "16px 14px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "#ffffff",
    },
    quickRow: {
        padding: "0 14px 10px",
        display: "flex", flexWrap: "wrap", gap: "6px",
        flexShrink: 0, background: "#ffffff",
    },
    quickBtn: {
        fontSize: "11px", padding: "5px 10px",
        borderRadius: "20px",
        background: "rgb(var(--color-primary))",   // ← same as primary
        color: "#fff",
        border: "none", cursor: "pointer",
        whiteSpace: "nowrap", opacity: 0.85,
    },
    inputRow: {
        padding: "10px 12px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", gap: "8px", alignItems: "flex-end",
        flexShrink: 0, background: "#f8fafc",
    },
    textarea: {
        flex: 1, resize: "none",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "9px 12px",
        fontSize: "13px", lineHeight: 1.5,
        outline: "none", fontFamily: "inherit",
        background: "#ffffff", color: "#1e293b",
        maxHeight: "80px", overflowY: "auto",
    },
    sendBtn: {
        width: "36px", height: "36px",
        borderRadius: "10px",
        background: "rgb(var(--color-primary))",  // ← same as primary
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#fff",
    },
};

// ─── Bubble ───
const Bubble = ({ msg, onNavigate }) => {
    const isBot = msg.role === "bot";

    if (msg.type === "loading") {
        return (
            <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "4px 14px 14px 14px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                }}>
                    {[0, 1, 2].map((i) => (
                        <span key={i} style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#94a3b8",
                            display: "inline-block",
                            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                    ))}

                    <span style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginLeft: "6px"
                    }}>
                        DigiPay is typing...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "85%",
            alignSelf: isBot ? "flex-start" : "flex-end",
            display: "flex", flexDirection: "column", gap: "4px",
        }}>
            <div style={{
                padding: "10px 13px",
                borderRadius: isBot ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                fontSize: "13px", lineHeight: 1.55,
                background: isBot
                    ? "rgba(var(--color-secondary), 0.08)"
                    : "rgb(var(--color-primary))",
                color: isBot
                    ? "rgb(var(--color-text))"
                    : "#fff",
                border: isBot
                    ? "1px solid rgba(var(--color-secondary), 0.15)"
                    : "none",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
                {msg.message}
            </div>
            <span style={{
                fontSize: "10px",
                color: "#94a3b8",
                marginTop: "2px",
                alignSelf: isBot ? "flex-start" : "flex-end"
            }}>
                {typeof msg.id === "number"
                    ? new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ""}
            </span>
            {msg.type === "navigate" && msg.path && (
                <button
                    onClick={() => onNavigate(msg.path, msg.label)}
                    style={{
                        alignSelf: "flex-start", marginTop: "2px",
                        padding: "6px 14px", borderRadius: "20px",
                        background: "rgb(var(--color-primary))", color: "#fff",   // ← primary
                        border: "none", fontSize: "12px",
                        fontWeight: 500, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "5px",
                    }}
                >
                    <span>{msg.label || "Take me there"}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// ─── Main ───
const DigiPayChatbot = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const role = user?.role || "Employee";
    const name = user?.name || "there";
    const userId = user?.userId || "guest";
    const isAdmin = role === "Admin" || role === "SuperAdmin";
    const storageKey = STORAGE_KEY(userId);

    const loadMessages = () => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { }
        return [makeWelcome(name, role)];
    };

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(loadMessages);
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [chatVersion, setChatVersion] = useState(0);
    const [showSuggestionCard, setShowSuggestionCard] = useState(true);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const conversationRef = useRef(
        loadMessages()
            .filter((m) => m.id !== "welcome" && m.type !== "loading")
            .map((m) => ({
                role: m.role === "bot" ? "assistant" : "user",
                content: m.message,
            }))
    );

    // Persist messages
    useEffect(() => {
        try {
            const toSave = messages.filter((m) => m.type !== "loading");
            localStorage.setItem(storageKey, JSON.stringify(toSave));
        } catch { }
    }, [messages, storageKey]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus on open
    useEffect(() => {
        if (open) {
            setHasNew(false);
            setShowClearConfirm(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [open]);

    const systemPrompt = useMemo(() => buildSystemPrompt(role), [role]);
    const clearChat = () => {
        const fresh = [makeWelcome(name, role)];

        // 1. Reset messages
        setMessages(fresh);

        // 2. Reset conversation memory
        conversationRef.current = [];

        // 3. Clear storage properly
        try {
            localStorage.removeItem(storageKey);
        } catch { }

        // 4. Force re-save clean state (IMPORTANT)
        setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(fresh));
            } catch { }
        }, 0);

        // 5. Close confirm UI
        setShowClearConfirm(false);

        // 6. Chat Version Increase
        setChatVersion(v => v + 1);
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: "user", type: "user", message: trimmed },
            { id: "loading", role: "bot", type: "loading", message: "" },
        ]);
        setInput("");
        setLoading(true);
        conversationRef.current = [...conversationRef.current, { role: "user", content: trimmed }];

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: MODEL,
                    max_tokens: MAX_TOKENS,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...conversationRef.current,
                    ],
                }),
            });

            const data = await response.json();
            const rawText = data?.choices?.[0]?.message?.content ||
                '{"type":"answer","message":"Sorry, I could not process that. Please try again."}';

            let parsed;
            try {
                parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
            } catch {
                parsed = { type: "answer", message: rawText };
            }

            const botMsg = {
                id: Date.now() + 1,
                role: "bot",
                type: parsed.type || "answer",
                message: parsed.message || "I didn't quite get that.",
                path: parsed.path || null,
                label: parsed.label || null,
            };

            conversationRef.current = [...conversationRef.current, { role: "assistant", content: rawText }];
            setMessages((prev) => prev.filter((m) => m.id !== "loading").concat(botMsg));
            if (!open) setHasNew(true);
        } catch {
            setMessages((prev) =>
                prev.filter((m) => m.id !== "loading").concat({
                    id: Date.now() + 1, role: "bot", type: "answer",
                    message: "Something went wrong. Please check your connection and try again.",
                })
            );
        } finally {
            setLoading(false);
        }
    };

    const normalize = (text) =>
        text?.toLowerCase().replace(/\s+/g, "");

    const findRouteByLabel = (label, routes) => {
        const norm = normalize(label);
        return routes.find(r => normalize(r.label) === norm);
    };

    const handleNavigate = (path, label) => {
        if (!path && label) {
            const routes = role === "Admin" || role === "SuperAdmin"
                ? ADMIN_ROUTES
                : EMPLOYEE_ROUTES;

            const match = findRouteByLabel(label, routes);
            if (match) path = match.path;
        }

        if (path) {
            navigate(path);
            setOpen(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    const quickPrompts = isAdmin ? QUICK_PROMPTS.admin : QUICK_PROMPTS.employee;
    const showQuickPrompts = messages.filter((m) => m.id !== "welcome").length === 0;

    return (
        <>
            <style>{`
        @keyframes chatSlideIn {
          from { opacity:0; transform:translateY(16px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
          @keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
  70% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
  100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
}
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40% { transform:translateY(-5px); opacity:1; }
        }
        .dp-fab:hover { transform: scale(1.08) !important; }
        .dp-fab:active { transform: scale(0.96) !important; }
        .dp-hbtn:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }
        .dp-send:hover { opacity: 0.85 !important; }
        .dp-quick:hover { opacity: 1 !important; }
        .dp-messages::-webkit-scrollbar { width: 4px; }
        .dp-messages::-webkit-scrollbar-track { background: transparent; }
        .dp-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>


            {!open && showSuggestionCard && (
                <div style={{
                    position: "fixed",
                    bottom: "95px",
                    right: "28px",
                    width: "240px",
                    background: "#ffffff",
                    padding: "12px",
                    borderRadius: "16px",
                    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    color: "#1e293b",
                    animation: "chatSlideIn 0.25s ease"
                }}>
                    {/* Title */}
                    {/* Header with icon */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px"
                    }}>
                        <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgb(var(--color-primary))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <img
                                src={assets.Chatbot}
                                alt="bot"
                                style={{
                                    width: "14px",
                                    height: "14px",
                                    objectFit: "contain"
                                }}
                            />
                        </div>

                        <div>
                            <div style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#1e293b"
                            }}>
                                DigiPay Assistant
                            </div>
                            <div style={{
                                fontSize: "10px",
                                color: "#64748b"
                            }}>
                                Try asking 👇
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuggestionCard(false)}
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#94a3b8",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f1f5f9";
                                e.currentTarget.style.color = "#1e293b";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Pills */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}>
                        {quickPrompts.slice(0, 2).map(q => (
                            <div
                                key={q}
                                onClick={() => {
                                    setOpen(true);
                                    setTimeout(() => sendMessage(q), 200);
                                }}
                                style={{
                                    padding: "8px 10px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#eef2ff";
                                    e.currentTarget.style.borderColor = "rgb(var(--color-primary))";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#f8fafc";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                {q}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                className="dp-fab"
                style={{
                    ...S.fab,
                    animation: hasNew ? "pulseGlow 2s infinite" : "none"
                }}
                onClick={() => setOpen((o) => !o)}
                title="DigiPay Assistant"
            >
                {open ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <img
                        src={assets.Chatbot}
                        alt="chatbot"
                        style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain"
                        }}
                    />
                )}
                {hasNew && !open && <span style={S.badge} />}
            </button>

            {/* Chat window */}
            {open && (
                <div style={S.window}>

                    {/* Header */}
                    <div style={S.header}>
                        <div style={S.headerAvatar}>
                            <img
                                src={assets.Chatbot}
                                alt="bot"
                                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                            />
                        </div>
                        <div style={S.headerInfo}>
                            <p style={S.headerName}>DigiPay Assistant</p>
                            <p style={S.headerSub}>{role} · Always here to help</p>
                        </div>
                        <button
                            className="dp-hbtn"
                            style={S.headerBtn}
                            onClick={() => setShowClearConfirm((s) => !s)}
                            title="Clear chat"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                        </button>
                        <button
                            className="dp-hbtn"
                            style={S.headerBtn}
                            onClick={() => setOpen(false)}
                            title="Close"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Clear confirm */}
                    {showClearConfirm && (
                        <div style={S.clearBanner}>
                            <p style={{ margin: 0, fontSize: "12px", color: "#dc2626", flex: 1 }}>
                                Clear all chat history?
                            </p>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    style={{
                                        fontSize: "11px", padding: "4px 10px", borderRadius: "8px",
                                        background: "white", color: "#64748b",
                                        border: "1px solid #e2e8f0", cursor: "pointer",
                                    }}
                                >Cancel</button>
                                <button
                                    onClick={clearChat}
                                    style={{
                                        fontSize: "11px", padding: "4px 10px", borderRadius: "8px",
                                        background: "rgb(var(--color-primary))", color: "#fff",
                                        border: "none", cursor: "pointer", fontWeight: 500,
                                    }}
                                >Clear</button>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div key={chatVersion} className="dp-messages" style={S.messages}>                        {messages.map((msg) => (
                        <Bubble key={msg.id} msg={msg} onNavigate={handleNavigate} />
                    ))}
                        <div ref={messagesEndRef} />
                    </div>


                    {/* Quick prompts */}
                    {showQuickPrompts && (
                        <div style={{
                            padding: "10px 14px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                            background: "#ffffff"
                        }}>
                            {quickPrompts.map((q) => (
                                <div
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        background: "#f8fafc",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#eef2ff"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}
                                >
                                    {q}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={S.inputRow}>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder={
                                isAdmin
                                    ? "Try: Add employee, Run payroll..."
                                    : "Try: Apply leave, View salary..."
                            } value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            style={{
                                ...S.textarea,
                                opacity: loading ? 0.5 : 1,
                            }}
                        />
                        <button
                            className="dp-send"
                            style={{
                                ...S.sendBtn,
                                opacity: !input.trim() || loading ? 0.45 : 1,
                                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                            }}
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>

                </div>
            )}
        </>
    );
};

export default DigiPayChatbot;