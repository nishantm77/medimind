import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaImage } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayText, setDisplayText] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Format text into paragraphs
  const formatText = (text) => {
    return text.split('\n').filter(para => para.trim() !== '').map(para => para.trim());
  };

  // Typewriter effect function
  const typewriterEffect = (text, callback) => {
    let index = 0;
    const words = text.split(' ');
    const interval = setInterval(() => {
      if (index < words.length) {
        setDisplayText(prev => prev + words[index] + ' ');
        index++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 50); // Adjust speed here
    return () => clearInterval(interval);
  };

  // Send message to API and get response
  const sendMessageToAPI = async (query, imageUrl = null) => {
    setIsTyping(true);
    setDisplayText('');
    try {
      const messageData = {
        question: query
      };

      const response = await fetch('https://care-connect-delta.vercel.app/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedParagraphs = formatText(data.answer);
      
      // Add empty AI message first
      const aiMessage = {
        id: Date.now(),
        text: '',
        sender: 'ai',
        paragraphs: formattedParagraphs
      };
      setMessages(prev => [...prev, aiMessage]);

      // Start typewriter effect
      typewriterEffect(formattedParagraphs.join(' '), () => {
        setIsTyping(false);
      });

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai'
      }]);
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setSelectedImage(imageUrl);
        
        // Add image message
        const imageMessage = {
          id: Date.now(),
          text: 'Image uploaded',
          sender: 'user',
          image: imageUrl
        };
        
        setMessages(prev => [...prev, imageMessage]);
        simulateResponse('', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      image: selectedImage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    
    // Get AI response
    sendMessageToAPI(input, selectedImage);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <motion.div 
          className="chat-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaRobot className="chat-icon" />
          <h2>MediMind AI Assistant</h2>
        </motion.div>
        <p className="chat-subtitle">Ask me about medical symptoms, clinical guidelines, or treatments</p>
      </div>
      
      <div className="messages-container">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              className="empty-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5 }}
            >
              <FaRobot className="empty-icon" />
              <p>Start a conversation with MediMind AI</p>
            </motion.div>
          ) : (
            messages.map(message => (
              <motion.div
                key={message.id}
                className={`message ${message.sender}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="message-avatar">
                  {message.sender === 'ai' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-bubble">
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded content" 
                      className="message-image"
                      style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px' }}
                    />
                  )}
                  {message.sender === 'ai' && message.paragraphs ? (
                    message.paragraphs.map((para, index) => (
                      <div key={index} className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {index === message.paragraphs.length - 1 ? displayText : para}
                        </ReactMarkdown>
                      </div>
                    ))
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
          
          {isTyping && (
            <motion.div 
              className="typing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      <motion.div 
        className="disclaimer-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="disclaimer-content">
          <p><strong>Disclaimer:</strong> This AI tool is for educational purposes only. The medical information provided is subjective and should not be used for self-diagnosis. For actual diagnosis and treatment, please consult a registered doctor or physician.</p>
        </div>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="chat-input-container">
        <motion.div 
          className="chat-input-wrapper"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <button 
            type="button" 
            className="input-button mic-button"
            aria-label="Voice input"
          >
            <FaMicrophone />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, treatments, or guidelines..."
            className="chat-input"
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <button 
            type="button" 
            className="input-button attachment-button"
            aria-label="Attach image"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaImage />
          </button>
          
          <motion.button
            type="submit"
            className="send-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() && !selectedImage}
          >
            <FaPaperPlane />
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default ChatInterface;