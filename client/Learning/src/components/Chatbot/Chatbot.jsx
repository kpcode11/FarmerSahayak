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
  const [suggestions, setSuggestions] = useState([]);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Farmer Sahayak AI</h1>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-500">Verified Gov Assistant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"} max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl`}>
                  {message.type === "bot" && (
                    <span className="text-xs font-semibold text-gray-700 mb-1 ml-1">FARMER SAHAYAK</span>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.type === "user"
                        ? "bg-emerald-700 text-white"
                        : message.error
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{formatMessage(message.text)}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 ml-1">{formatTime(message.timestamp)}</span>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 justify-start">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-full text-gray-700 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>        )}
        {/* Input Area */}
        <div className={`bg-white border-t border-gray-200 px-6 py-4 transition-opacity ${loading ? 'opacity-75' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 cursor-not-allowed opacity-40" disabled title="Voice input coming soon">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about schemes... (Press Enter to send)"
              className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 ${
                loading ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={loading}
            />

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 cursor-not-allowed opacity-40" disabled title="Attachments coming soon">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Please verify critical scheme information with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
