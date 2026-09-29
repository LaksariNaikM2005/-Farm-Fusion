import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaUserCircle, FaImage, FaComments } from 'react-icons/fa';
import { format } from 'date-fns';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeConv, setActiveConv] = useState(null);
  const socketRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    // Connect Socket
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('register', user._id);

    socketRef.current.on('receive_message', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      } else {
        // Update unread count or move conversation to top
        fetchConversations();
      }
    });

    return () => socketRef.current.disconnect();
  }, [user._id, conversationId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      socketRef.current.emit('join_room', conversationId);
      fetchMessages(conversationId);
      const conv = conversations.find(c => c.conversationId === conversationId);
      if (conv) setActiveConv(conv);
    }
  }, [conversationId, conversations]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (cId) => {
    try {
      const { data } = await api.get(`/chat/${cId}`);
      setMessages(data.messages);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    
    const receiverId = activeConv.participant._id;
    
    // Emit via socket
    socketRef.current.emit('send_message', {
      senderId: user._id,
      receiverId,
      content: input,
      conversationId
    });

    // Optimistic UI update
    const optimisticMsg = {
      _id: Date.now().toString(),
      sender: user,
      content: input,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    scrollToBottom();
  };

  return (
    <div className="flex h-[calc(100vh-120px)] border border-border rounded-xl overflow-hidden bg-bg-card">
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-80 border-r border-border bg-bg-elevated flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-text-muted text-center mt-10">No conversations yet.</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.conversationId}
                className={`p-4 border-b border-border/50 cursor-pointer transition hover:bg-bg-hover flex items-center gap-3 ${conversationId === conv.conversationId ? 'bg-bg-hover border-l-4 border-l-primary' : ''}`}
                onClick={() => navigate(`/farmer/chat/${conv.conversationId}`)}
              >
                <div className="relative">
                  <img src={conv.participant?.profileImage || 'https://via.placeholder.com/40'} alt="" className="avatar" />
                  {conv.participant?.isAvailable && <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg-elevated"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-sm truncate">{conv.participant?.name}</span>
                    <span className="text-[10px] text-text-muted">{format(new Date(conv.lastMessage.createdAt), 'HH:mm')}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{conv.lastMessage.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conv.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <FaComments className="text-6xl mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-bg-elevated flex items-center gap-3">
              <button className="md:hidden text-text-secondary p-2" onClick={() => navigate('/farmer/chat')}>←</button>
              <img src={activeConv?.participant?.profileImage || 'https://via.placeholder.com/40'} alt="" className="avatar" />
              <div>
                <h3 className="font-bold text-sm">{activeConv?.participant?.name}</h3>
                <span className="text-xs text-primary-light capitalize">{activeConv?.participant?.role}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0a0d13]">
              {messages.map((msg, i) => {
                const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id || i} className={`flex max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <img src={msg.sender?.profileImage || 'https://via.placeholder.com/30'} alt="" className="w-6 h-6 rounded-full mx-2 self-end mb-1 opacity-80" />
                    <div className="flex flex-col">
                      <div className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-bg-elevated border border-border text-text-primary rounded-bl-sm'}`}>
                        <p className="text-sm break-words">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] text-text-muted mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-bg-elevated">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <button type="button" className="p-3 text-text-muted hover:text-primary transition bg-bg-card border border-border rounded-lg">
                  <FaImage />
                </button>
                <textarea 
                  className="form-input flex-1 min-h-[44px] max-h-[120px] resize-none py-3" 
                  placeholder="Type a message..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                ></textarea>
                <button type="submit" className="btn btn-primary h-[44px] px-6" disabled={!input.trim()}>
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
