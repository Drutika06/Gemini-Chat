import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Theme State
  const [theme, setTheme] = useState('light');
  
  // 2. Chat State with Timestamps
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const initialMessage = { 
    role: 'assistant', 
    content: 'Hello! I am your Gemini AI Agent. Ask me about the date, weather, or news!',
    time: getCurrentTime()
  };
  
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Apply the theme to the body so the background color changes globally
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: 'Chat cleared! How can I help you today?',
      time: getCurrentTime()
    }]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, time: getCurrentTime() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error(`Backend returned status code ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, time: getCurrentTime() }]);
      
    } catch (error) {
      console.error("Fetch error details:", error);
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: `⚠️ Connection Error: Failed to fetch from backend.`, time: getCurrentTime() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-info">
          <h1>Gemini AI Agent 🤖</h1>
          <p>Powered by FastAPI Backend</p>
        </div>
        <div className="header-actions">
          <button onClick={toggleTheme} className="icon-button" title="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={clearChat} className="icon-button" title="Clear Chat">
            🗑️
          </button>
        </div>
      </header>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-content">
              <div className="message-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </div>
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message-content">
              <div className="message-bubble loading">
                <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the weather, news, or date..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;