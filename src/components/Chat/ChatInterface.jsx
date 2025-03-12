import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaImage } from 'react-icons/fa';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Simulate AI response
  const simulateResponse = (query, imageUrl = null) => {
    setIsTyping(true);
    
    // Simulate network delay
    setTimeout(() => {
      let response = '';
      
      if (imageUrl) {
        response = 'I have received your image. Based on the visual information provided, I can assist you better. What specific aspects would you like me to analyze?';
      } else if (query.toLowerCase().includes('symptom')) {
        response = 'Based on the symptoms you described, this could be related to several conditions. Would you like me to analyze further or provide information about specific treatments?';
      } else if (query.toLowerCase().includes('guideline')) {
        response = 'The latest clinical guidelines recommend a step-wise approach for this condition. First-line treatments include lifestyle modifications and monitoring. Would you like me to elaborate on specific protocols?';
      } else {
        response = 'I understand your query about medical information. As an AI assistant, I can provide general information, but please consult with a healthcare professional for personalized medical advice.';
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: response,
        sender: 'ai'
      }]);
      
      setIsTyping(false);
    }, 1500);
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
    simulateResponse(input, selectedImage);
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
                  <p>{message.text}</p>
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