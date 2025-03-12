import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';
import Layout from './components/Layout/Layout';
import HomePage from './components/Home/HomePage';
import ChatInterface from './components/Chat/ChatInterface';
import AboutPage from './components/About/AboutPage';
import Documentation from './components/Documentation/Documentation';
import PrivacyPolicy from './components/Privacy/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
