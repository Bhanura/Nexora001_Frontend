import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import { authenticatedFetch } from "../../config";
import { Card } from "../ui/Card";

export default function ChatPreview() {
  const [chatbotConfig, setChatbotConfig] = useState({
    chatbot_name: "AI Assistant",
    chatbot_greeting: "Hi! How can I help with your data today?"
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load chatbot configuration
  useEffect(() => {
    loadChatbotConfig();
  }, []);

  const loadChatbotConfig = async () => {
    try {
      const res = await authenticatedFetch("/chat/settings/chatbot");
      if (res.ok) {
        const data = await res.json();
        setChatbotConfig(data);
        // Set initial greeting message from config
        setMessages([{ role: "assistant", content: data.chatbot_greeting }]);
      } else {
        // Use defaults
        setMessages([{ role: "assistant", content: chatbotConfig.chatbot_greeting }]);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
      setMessages([{ role: "assistant", content: chatbotConfig.chatbot_greeting }]);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await authenticatedFetch("/chat/", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, use_history: true })
      });
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: res.answer, 
        sources: res.sources // Store sources to display later
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col shadow-md border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg"><Bot size={18} /></div>
          <span className="font-semibold text-sm text-gray-900">
            {configLoading ? "Loading..." : chatbotConfig.chatbot_name}
          </span>
        </div>
        <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-xs ${
              m.role === 'user' ? 'bg-white text-gray-600 border' : 'bg-gradient-to-br from-brand-600 to-brand-700 text-white'
            }`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`max-w-[85%] space-y-2`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-none' 
                  : 'bg-brand-600 text-white rounded-tl-none'
              }`}>
                {m.content}
              </div>

              {/* Collapsible Sources */}
              {m.sources && m.sources.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer list-none text-xs text-gray-500 flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                    <BookOpen size={12} /> 
                    <span>{m.sources.length} Sources Used</span>
                  </summary>
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg text-xs space-y-2 shadow-sm animate-fade-in">
                    {m.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-gray-600 hover:text-brand-600 hover:underline truncate"
                      >
                        {idx + 1}. {s.title || s.url} <span className="text-gray-400">({Math.round(s.score * 100)}%)</span>
                      </a>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0"><Bot size={14} /></div>
             <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
             </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text" placeholder="Ask something..."
            value={input} onChange={(e) => setInput(e.target.value)}
            className="flex-1 pl-4 pr-12 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm shadow-sm transition-all"
          />
          <button 
            type="submit" disabled={loading || !input.trim()}
            className="absolute right-1 top-1 p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all"
          >
            <Send size={16} className={loading ? "opacity-0" : "ml-0.5"} />
          </button>
        </form>
      </div>
    </Card>
  );
}