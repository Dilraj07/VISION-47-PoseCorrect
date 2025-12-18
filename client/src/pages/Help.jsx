import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, FileText, Mail } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: "How do I upload a video?",
      answer: "Go to the 'Video Analysis' tab, click 'Select File', choose your workout video, and hit 'Analyze'. We currently support MP4, MOV, and AVI formats."
    },
    {
      question: "What exercises are supported?",
      answer: "We support Squats, Deadlifts, Pushups, Pullups, Bench Press, Shoulder Press, Lunges, Plank, and Bicep Curls."
    },
    {
      question: "Is my data private?",
      answer: "Yes. Your videos are processed for analysis and then immediately discarded or stored securely only if you choose to save them to your history."
    },
    {
      question: "How does the AI Coach work?",
      answer: "The AI Coach uses advanced computer vision to track your joints in real-time. It compares your angles to biomechanical gold standards to give you instant feedback."
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#fff',
      fontFamily: "'Outfit', sans-serif",
      padding: '4rem 2rem',
      paddingTop: '6rem' // Account for navbar
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <HelpCircle size={48} color="var(--color-neon-blue)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>How can we help?</h1>
          <p style={{ color: '#888', fontSize: '1.2rem' }}>Answers to common questions and support resources.</p>
        </motion.div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '1rem',
                padding: '2rem',
                cursor: 'default'
              }}
              whileHover={{ borderColor: 'var(--color-neon-blue)', backgroundColor: '#161616' }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>
                {faq.question}
              </h3>
              <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            padding: '2rem',
            borderTop: '1px solid #222'
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Still need help?</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="mailto:support@gymbro.ai" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#fff', textDecoration: 'none',
              padding: '1rem 2rem', border: '1px solid #333', borderRadius: '2rem',
              transition: 'all 0.3s'
            }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--color-neon-green)'; e.target.style.color = 'var(--color-neon-green)'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#333'; e.target.style.color = '#fff'; }}
            >
              <Mail size={20} /> Email Support
            </a>
            <a href="/contact" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#fff', textDecoration: 'none',
              padding: '1rem 2rem', border: '1px solid #333', borderRadius: '2rem',
              transition: 'all 0.3s'
            }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--color-neon-pink)'; e.target.style.color = 'var(--color-neon-pink)'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#333'; e.target.style.color = '#fff'; }}
            >
              <MessageCircle size={20} /> Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
