import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import MarkdownMessage from "./MarkdownMessage";

// Helper: Generate a random session ID for visitors
const getSessionId = () => {
  let id = localStorage.getItem("nexora_visitor_id");
  if (!id) {
    id = "vis_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("nexora_visitor_id", id);
  }
  return id;
};

export default function ChatWidget({ apiKey, apiUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState({
    chatbot_name: "AI Assistant",
    chatbot_greeting: "Hello! How can I help you today?",
    chatbot_personality: "friendly and helpful"
  });
  
  // Feature 2: Data collection state
  const [dataCollectionConfig, setDataCollectionConfig] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
  const scrollRef = useRef(null);
  
  // Use a ref for session ID so it doesn't change
  const sessionId = useRef(getSessionId()).current;

  // Fetch chatbot configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${apiUrl}/chat/widget-config`, {
          headers: { "X-API-KEY": apiKey }
        });
        if (res.ok) {
          const config = await res.json();
          setChatbotConfig(config);
          // Set initial greeting
          setMessages([{ role: "assistant", content: config.chatbot_greeting }]);
        } else {
          // Use defaults
          setMessages([{ role: "assistant", content: "Hello! How can I help you today?" }]);
        }
      } catch (err) {
        console.error("Failed to load config:", err);
        // Use defaults
        setMessages([{ role: "assistant", content: "Hello! How can I help you today?" }]);
      }
    };
    fetchConfig();
  }, [apiKey, apiUrl]);

  // Fetch data collection config
  useEffect(() => {
    const fetchDataCollectionConfig = async () => {
      try {
        const res = await fetch(`${apiUrl}/chat/widget-data-collection-config`, {
          headers: { "X-API-KEY": apiKey }
        });
        if (res.ok) {
          const config = await res.json();
          setDataCollectionConfig(config);
          
          // If timing is "immediately", show form right away
          if (config.enabled && config.data_collection_timing === "immediately") {
            setShowForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load data collection config:", err);
      }
    };
    fetchDataCollectionConfig();
  }, [apiKey, apiUrl]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // Direct fetch because authenticatedFetch uses localStorage 'token' (which visitors don't have)
      const res = await fetch(`${apiUrl}/chat/widget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey // <--- Authenticate via Key
        },
        body: JSON.stringify({
          message: userMsg,
          session_id: sessionId
        })
      });

      if (!res.ok) throw new Error("Failed to connect");
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      
      // Check if we should show form after first message
      setMessageCount(prev => prev + 1);
      if (
        dataCollectionConfig?.enabled &&
        dataCollectionConfig?.data_collection_timing === "after_first_message" &&
        messageCount === 0 &&
        !formSubmitted
      ) {
        setShowForm(true);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = dataCollectionConfig.custom_fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.field_id] || formData[field.field_id].trim() === "") {
        alert(`Please fill in: ${field.label}`);
        return;
      }
    }

    try {
      const res = await fetch(`${apiUrl}/user-data/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
          session_id: sessionId,
          submitted_data: formData
        })
      });

      if (res.ok) {
        setFormSubmitted(true);
        setShowForm(false);
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Thank you for sharing your details! I'll make sure the right person gets back to you." 
        }]);
      } else {
        alert("Failed to submit form. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased">
      
      {/* CHAT WINDOW */}
      <div 
        className={`bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right border border-gray-100 overflow-hidden mb-4 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none absolute bottom-0 right-0"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <div>
              <h3 className="font-bold text-sm">{chatbotConfig.chatbot_name}</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                 m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white'
               }`}>
                 {m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
               </div>
               <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] shadow-sm ${
                 m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-800'
               }`}>
                 {m.role === 'user' ? (
                   <p>{m.content}</p>
                 ) : (
                   <MarkdownMessage content={m.content} />
                 )}
               </div>
            </div>
          ))}
          {loading && <div className="ml-10"><Loader2 className="w-5 h-5 animate-spin text-gray-400"/></div>}
          
          {/* Data Collection Form */}
          {showForm && dataCollectionConfig?.enabled && !formSubmitted && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-md">
              <h4 className="font-semibold text-sm mb-2 text-gray-800">
                {dataCollectionConfig.data_collection_message}
              </h4>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                {dataCollectionConfig.custom_fields
                  .sort((a, b) => a.order - b.order)
                  .map(field => (
                    <div key={field.field_id}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.field_type === "textarea" ? (
                        <textarea
                          value={formData[field.field_id] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.field_id]: e.target.value })}
                          placeholder={field.placeholder || ""}
                          required={field.required}
                          className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.field_type}
                          value={formData[field.field_id] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.field_id]: e.target.value })}
                          placeholder={field.placeholder || ""}
                          required={field.required}
                          className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      )}
                    </div>
                  ))}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                  Submit
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button disabled={loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      >
        <MessageSquare size={28} />
      </button>
    </div>
  );
}