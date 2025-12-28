import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import '../styles/ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 Welcome to SaveKaro! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getAutomatedResponse(message),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getAutomatedResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you today?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our products have competitive prices with great discounts! Browse our collection to find the best deals.";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return "Shipping information is provided by each brand. You'll see delivery details when you visit the product page.";
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "Return policies vary by brand. Please check the brand's website for their specific return policy.";
    } else if (lowerMessage.includes('brand') || lowerMessage.includes('brands')) {
      return "We feature top Pakistani brands like Limelight, Bonanza, Outfitters, Sapphire, Maria.B, and more!";
    } else if (lowerMessage.includes('discount') || lowerMessage.includes('sale')) {
      return "We showcase the best discounts from Pakistani fashion brands. Check out our homepage for the latest deals!";
    } else {
      return "Thanks for your message! Our team will get back to you soon. In the meantime, feel free to browse our collection!";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          className="chat-widget__button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <FiMessageCircle size={24} />
          <span className="chat-widget__pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-widget ${isMinimized ? 'chat-widget--minimized' : ''}`}>
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-info">
              <div className="chat-widget__avatar">
                <img src="/NewLogo.webp" alt="SaveKaro" />
              </div>
              <div>
                <h3 className="chat-widget__title">SaveKaro Support</h3>
                <p className="chat-widget__status">
                  <span className="chat-widget__status-dot" />
                  Online
                </p>
              </div>
            </div>
            <div className="chat-widget__actions">
              <button
                className="chat-widget__action-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <FiMinimize2 size={18} />
              </button>
              <button
                className="chat-widget__action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="chat-widget__messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-widget__message chat-widget__message--${msg.sender}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="chat-widget__message-avatar">
                        <img src="/NewLogo.webp" alt="Bot" />
                      </div>
                    )}
                    <div className="chat-widget__message-content">
                      <div className="chat-widget__message-bubble">
                        {msg.text}
                      </div>
                      <div className="chat-widget__message-time">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-widget__input" onSubmit={handleSend}>
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="chat-widget__input-field"
                />
                <button
                  type="submit"
                  className="chat-widget__send-btn"
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

