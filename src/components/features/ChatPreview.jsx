import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { authenticatedFetch } from "../../config";
import { Card, CardHeader } from "../ui/Card";

export default function ChatPreview() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your AI assistant. Ask me anything about your data." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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
      
      setMessages(prev => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader title="Live Preview" description="Test your chatbot behavior here." icon={MessageSquare} />
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.role === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-green-100 text-green-600'
            }`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
              m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Bot size={16} /></div>
            <div className="bg-white border p-3 rounded-lg"><Loader2 className="animate-spin w-4 h-4 text-gray-400" /></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text" placeholder="Type a message..."
            value={input} onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
          <button 
            type="submit" disabled={loading}
            className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </Card>
  );
}