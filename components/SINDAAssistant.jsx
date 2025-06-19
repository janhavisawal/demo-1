import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageCircle, BookOpen, Heart, Users, Globe, 
  Phone, Mail, MapPin, Loader, X, Menu, Settings,
  Clock, AlertTriangle, CheckCircle, ArrowRight
} from "lucide-react";

const SINDAAssistant = () => {
  // Core state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('welcome'); // welcome, chat
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  
  // Refs
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Languages
  const languages = {
    english: { 
      name: 'English', 
      native: 'English',
      greeting: 'Welcome to SINDA! 🙏 I\'m here to help you discover our programs and guide you through your journey with us. How can I assist you today?',
      flag: '🇬🇧'
    },
    tamil: { 
      name: 'Tamil', 
      native: 'தமிழ்',
      greeting: 'SINDA வில் உங்களை வரவேற்கிறோம்! 🙏 நான் உங்கள் பயணத்தில் உதவ இங்கே இருக்கிறேன். இன்று நான் எப்படி உதவ முடியும்?',
      flag: '🇮🇳'
    },
    hindi: { 
      name: 'Hindi', 
      native: 'हिंदी',
      greeting: 'SINDA में आपका स्वागत है! 🙏 मैं आपकी यात्रा में सहायता के लिए यहाँ हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
      flag: '🇮🇳'
    },
    malayalam: {
      name: 'Malayalam',
      native: 'മലയാളം',
      greeting: 'SINDA യിലേക്ക് സ്വാഗതം! 🙏 നിങ്ങളുടെ യാത്രയിൽ സഹായിക്കാൻ ഞാനിവിടെയുണ്ട്. ഇന്ന് എങ്ങനെ സഹായിക്കാം?',
      flag: '🇮🇳'
    }
  };

  // Quick help options
  const quickHelp = [
    { text: 'Apply for STEP tuition', icon: '🎓', category: 'education' },
    { text: 'Financial assistance eligibility', icon: '💰', category: 'financial' },
    { text: 'Join Youth Club', icon: '🎯', category: 'youth' },
    { text: 'Emergency support needed', icon: '🚨', category: 'emergency' },
    { text: 'Family counselling services', icon: '👨‍👩‍👧‍👦', category: 'family' },
    { text: 'Community events near me', icon: '🌍', category: 'community' }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when in chat mode
  useEffect(() => {
    if (currentView === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentView, messages]);

  // Send message function
  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: messageText.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          messages: messages.slice(-5), // Send last 5 messages for context
          userInfo: { language: selectedLanguage }
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        content: data.message || 'I apologize, but I\'m having trouble processing your request. Please call SINDA at 1800 295 3333 for immediate assistance.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisis: data.isCrisis || false
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'I\'m experiencing technical difficulties. For immediate help, please call SINDA at 1800 295 3333 or visit 1 Beatty Road, Singapore 209943.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Start chat with language
  const startChat = (language) => {
    setSelectedLanguage(language);
    setCurrentView('chat');
    
    // Add welcome message
    setTimeout(() => {
      setMessages([{
        id: Date.now(),
        content: languages[language].greeting,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWelcome: true
      }]);
    }, 500);
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          {/* Logo and Title */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl">
              <BookOpen className="text-white" size={40} />
            </div>
            
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SINDA</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your AI-powered guide to Singapore Indian Development Association programs and services. 
              Building stronger communities together since 1991.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { value: '30+', label: 'Years Serving', icon: Clock },
              { value: '12K+', label: 'Families Helped', icon: Heart },
              { value: '25+', label: 'Programs', icon: BookOpen },
              { value: '24/7', label: 'Support', icon: Phone }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="text-blue-600" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Language Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Language</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(languages).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => startChat(key)}
                  className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  <div className="text-3xl mb-3">{lang.flag}</div>
                  <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                    {lang.native}
                  </div>
                  <div className="text-sm text-gray-500">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Need immediate help?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:18002953333" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2">
                <Phone size={18} />
                Call 1800 295 3333
              </a>
              <button
                onClick={() => startChat('english')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SINDA Assistant</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>AI Online • {languages[selectedLanguage].native}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentView('welcome')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-blue-200 overflow-hidden shadow-2xl">
          
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-white/50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-blue-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">How can I help you today?</h4>
                <p className="text-gray-500 mb-6">Ask me about SINDA programs, eligibility, or application processes</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickHelp.map((help, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(help.text)}
                      className="bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 text-sm transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{help.icon}</span>
                        <span className="font-medium text-gray-800">{help.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md' 
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-md'
                    : message.isCrisis
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-bl-md'
                    : 'bg-white border border-blue-200 text-gray-800 rounded-bl-md'
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-blue-200 rounded-2xl rounded-bl-md px-6 py-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">SINDA Assistant is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-blue-200">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full resize-none bg-blue-50/50 border border-blue-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm"
                  rows="2"
                  disabled={isLoading}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {inputMessage.length}/1000 characters
                </div>
              </div>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => sendMessage("I need emergency financial help")}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                disabled={isLoading}
              >
                🚨 Emergency Help
              </button>
              <button
                onClick={() => sendMessage("I want to apply for STEP tuition")}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                🎓 Apply STEP
              </button>
              <button
                onClick={() => sendMessage("How do I join youth programs?")}
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                🎯 Youth Programs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-blue-200 mt-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm py-4 px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-gray-600">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-blue-500" />
              <span className="text-gray-600">1800 295 3333</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={14} className="text-blue-500" />
              <span className="text-gray-600">1 Beatty Road, Singapore</span>
            </div>
          </div>
          <div className="text-gray-500">
            Messages: {messages.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SINDAAssistant;
