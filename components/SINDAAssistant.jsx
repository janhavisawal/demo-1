import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageCircle, BookOpen, Heart, Users, BarChart3, 
  Phone, Mail, MapPin, Loader, Menu, Settings, Clock,
  TrendingUp, Target, Calendar, ArrowRight, Home, MessageSquare
} from "lucide-react";

const SINDAAssistant = () => {
  // Core state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('welcome'); // welcome, chat, dashboard
  
  // Refs
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dashboard data (mock data for demonstration)
  const dashboardStats = {
    totalUsers: 1247,
    activeChats: 23,
    programsOffered: 25,
    familiesHelped: 12000,
    monthlyGrowth: 15.8,
    responseTime: "2.3s",
    satisfactionRate: 94.5,
    emergencySupport: 8
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

  // Send message function with OpenAI API integration
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
          userInfo: { language: 'english' }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  // Start chat
  const startChat = () => {
    setCurrentView('chat');
    
    // Add welcome message
    setTimeout(() => {
      setMessages([{
        id: Date.now(),
        content: 'Welcome to SINDA! 🙏 I\'m here to help you discover our programs and guide you through your journey with us. How can I assist you today?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWelcome: true
      }]);
    }, 500);
  };

  // Navigation Header
  const renderHeader = () => (
    <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">SINDA Assistant</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>AI Online • English</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('welcome')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'welcome' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <BarChart3 size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('chat')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'chat' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <MessageSquare size={16} />
            Chat
          </button>
        </div>
      </div>
    </div>
  );

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
        {renderHeader()}
        
        <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
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

            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Get Started</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:18002953333" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 justify-center">
                  <Phone size={18} />
                  Call 1800 295 3333
                </a>
                <button
                  onClick={() => startChat()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <MessageCircle size={18} />
                  Start Chat Assistant
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <BarChart3 size={18} />
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
        {renderHeader()}
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">SINDA Assistant Dashboard</h2>
            <p className="text-gray-600">Monitor system performance and community engagement</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  +{dashboardStats.monthlyGrowth}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="text-green-600" size={24} />
                </div>
                <div className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Live
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.activeChats}</div>
              <div className="text-sm text-gray-600">Active Chats</div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="text-purple-600" size={24} />
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {dashboardStats.satisfactionRate}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.responseTime}</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-red-600" size={24} />
                </div>
                <div className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  Priority
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.emergencySupport}</div>
              <div className="text-sm text-gray-600">Emergency Cases</div>
            </div>
          </div>

          {/* Program Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Program Engagement</h3>
              <div className="space-y-4">
                {[
                  { name: 'STEP Tuition', percentage: 85, count: 1456 },
                  { name: 'Family Services', percentage: 72, count: 892 },
                  { name: 'Youth Programs', percentage: 64, count: 634 },
                  { name: 'Financial Aid', percentage: 78, count: 423 },
                ].map((program, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{program.name}</span>
                      <span className="text-sm text-gray-500">{program.count} users</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${program.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', action: 'New STEP application submitted', type: 'success' },
                  { time: '5 min ago', action: 'Emergency support request', type: 'urgent' },
                  { time: '12 min ago', action: 'Youth Club inquiry', type: 'info' },
                  { time: '18 min ago', action: 'Family counselling booking', type: 'success' },
                  { time: '25 min ago', action: 'Financial aid assessment', type: 'info' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'urgent' ? 'bg-red-500' : 
                      activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Chat System: Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">OpenAI API: Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Database: Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      {renderHeader()}

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
