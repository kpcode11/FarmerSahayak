import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "../../config/api.js";

// Simple markdown parser for bold text (**text**)
function formatMessage(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Namaste! I am your Farmer Sahayak. I can help you verify eligibility, apply for schemes like PM-KISAN, or find subsidies for fertilizers and equipment.\n\nHow can I assist you with your farming needs today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Check PM-KISAN status",
    "Apply for KCC Loan",
    "Soil Health Card",
    "Mandi Prices"
  ]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Scroll to bottom within chat container only when messages are added
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll if new messages were added (not on initial mount)
    if (messages.length > prevMessagesLength.current) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await apiRequest("/chatbot/suggestions");
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const handleSend = async (question = null) => {
    const messageText = question || input.trim();
    
    if (!messageText) return;

    // Add user message
    const userMessage = {
      type: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiRequest("/chatbot/chat", {
        method: "POST",
        body: { question: messageText },
      });

      // Add bot response
      const botMessage = {
        type: "bot",
        text: response.data.answer,
        timestamp: new Date(),
        schemes: response.data.related_schemes || [],
        schemesCount: response.data.schemes_found || 0,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please make sure the chatbot service is running and try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ backgroundColor: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)' }}>
              <span className="text-xl sm:text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-ink)' }}>Farmer Sahayak AI</h1>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs" style={{ color: 'var(--color-ink-mute)' }}>Verified Gov Assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6"
          style={{ backgroundColor: 'var(--color-canvas)' }}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)' }}>
                    <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"} max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl`}>
                  {message.type === "bot" && (
                    <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--color-primary)' }}>Farmer Sahayak</span>
                  )}
                  <div
                    className="px-4 py-3"
                    style={{
                      borderRadius: message.type === "user" ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      ...(message.type === "user"
                        ? {
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                          }
                        : message.error
                        ? {
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                          }
                        : {
                            backgroundColor: 'var(--color-canvas-soft)',
                            color: 'var(--color-ink)',
                            border: '1px solid var(--color-hairline)',
                          }),
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{formatMessage(message.text)}</p>
                  </div>
                  <span className="text-xs mt-1 ml-1" style={{ color: 'var(--color-ink-mute)' }}>{formatTime(message.timestamp)}</span>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)' }}>
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: '12px 12px 12px 0' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-ink-faint)' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-ink-faint)', animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-ink-faint)', animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <div className="px-3 sm:px-6 py-3" style={{ backgroundColor: 'var(--color-canvas-soft)', borderTop: '1px solid var(--color-hairline)' }}>
            <div className="flex flex-nowrap sm:flex-wrap gap-2 justify-start overflow-x-auto pb-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-canvas)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-ink)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-hairline-strong)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-hairline)'}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`px-3 sm:px-6 py-3 flex-shrink-0 ${loading ? 'opacity-75' : 'opacity-100'}`} style={{ backgroundColor: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)' }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 rounded-full transition-colors flex-shrink-0 cursor-not-allowed opacity-40 hidden sm:flex" disabled title="Voice input coming soon" style={{ color: 'var(--color-ink-mute)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about schemes or farming help..."
              className="input-field flex-1"
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'text',
              }}
              disabled={loading}
            />
            
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
          
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-mute)' }}>
            AI can make mistakes. Please verify critical scheme information with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
