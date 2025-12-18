import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Twitter, Linkedin, Send, CheckCircle, Github } from 'lucide-react';

const Contact = () => {
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('success');
            e.target.reset();
            // Reset status after 3 seconds
            setTimeout(() => setFormStatus('idle'), 3000);
        }, 1500);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid #333',
        borderRadius: '0.5rem',
        color: 'var(--color-white)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease'
    };

    return (
        <div className="page-container" style={{ 
            padding: '6rem 2rem', 
            minHeight: '100vh', 
            backgroundColor: 'var(--color-black)', 
            color: 'var(--color-white)',
            background: 'radial-gradient(circle at 10% 20%, rgba(255, 0, 150, 0.05) 0%, transparent 20%)'
        }}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6rem'
                }}
            >
                {/* Top Section: Contact Info & Form */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4rem', 
                    justifyContent: 'center' 
                }}>
                    <motion.div variants={itemVariants} style={{ flex: '1 1 400px', minWidth: '300px' }}>
                        <h1 style={{ 
                            fontSize: '3.5rem', 
                            marginBottom: '1.5rem', 
                            color: 'var(--color-white)',
                            lineHeight: 1.1,
                            letterSpacing: '-1px'
                        }}>
                            Let's <span style={{ color: 'var(--color-neon-pink)' }}>connect.</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '3rem', lineHeight: 1.6 }}>
                            We're here to help you achieve your fitness goals. Whether you have a question about our AI features, need technical support, or just want to say hi, drop us a line.
                        </p>

                        <div className="contact-details" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '1rem', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'rgba(255, 0, 150, 0.1)',
                                    color: 'var(--color-neon-pink)'
                                }}>
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Email Us</h3>
                                    <p style={{ margin: 0, color: '#aaa' }}>support@gymbro.ai</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '1rem', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'rgba(255, 0, 150, 0.1)',
                                    color: 'var(--color-neon-pink)'
                                }}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Visit Us</h3>
                                    <p style={{ margin: 0, color: '#aaa' }}>123 Fitness Blvd, Gym City</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '1rem', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'rgba(255, 0, 150, 0.1)',
                                    color: 'var(--color-neon-pink)'
                                }}>
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Call Us</h3>
                                    <p style={{ margin: 0, color: '#aaa' }}>+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                        
                         <div style={{ marginTop: '4rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>Follow Us</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {[Instagram, Twitter, Linkedin].map((Icon, index) => (
                                    <motion.a
                                        key={index}
                                        href="#"
                                        whileHover={{ y: -5, color: 'var(--color-neon-pink)' }}
                                        style={{ 
                                            color: '#aaa', 
                                            padding: '0.5rem',
                                            border: '1px solid #333',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'colors 0.3s'
                                        }}
                                    >
                                        <Icon size={20} />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                    </motion.div>

                    <motion.div variants={itemVariants} style={{ flex: '1 1 500px', minWidth: '300px' }}>
                        <div style={{ 
                            backgroundColor: 'var(--color-dark-gray)', 
                            padding: '3rem', 
                            borderRadius: '1.5rem', 
                            border: '1px solid #333',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-pink)'}
                                            onBlur={(e) => e.target.style.borderColor = '#333'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-pink)'}
                                        onBlur={(e) => e.target.style.borderColor = '#333'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Message</label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        required
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-pink)'}
                                        onBlur={(e) => e.target.style.borderColor = '#333'}
                                    ></textarea>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={formStatus === 'submitting'}
                                    style={{
                                        padding: '1rem 2rem',
                                        backgroundColor: formStatus === 'success' ? '#22c55e' : 'var(--color-neon-pink)',
                                        color: 'var(--color-black)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: formStatus === 'submitting' ? 'not-allowed' : 'pointer',
                                        marginTop: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: formStatus === 'submitting' ? 0.7 : 1
                                    }}
                                >
                                    {formStatus === 'submitting' ? (
                                        'Sending...'
                                    ) : formStatus === 'success' ? (
                                        <>Message Sent <CheckCircle size={20} /></>
                                    ) : (
                                        <>Send Message <Send size={20} /></>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section: The Team */}
                <motion.div variants={itemVariants}>
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        textAlign: 'center', 
                        marginBottom: '3rem',
                        color: 'var(--color-white)' 
                    }}>
                        Meet the <span style={{ color: 'var(--color-neon-pink)' }}>Creators</span>
                    </h2>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '3rem', 
                        flexWrap: 'wrap' 
                    }}>
                        {/* Arya Card */}
                        <div className="team-card" style={{ 
                            background: 'var(--color-dark-gray)', 
                            borderRadius: '1.5rem', 
                            overflow: 'hidden', 
                            width: '350px',
                            border: '1px solid #333'
                        }}>
                            <div style={{ 
                                height: '350px', 
                                overflow: 'hidden', 
                                backgroundColor: '#222',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src="/team/arya.jpg" 
                                    alt="Arya Wadhwa"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }} 
                                />
                                <div style={{ 
                                    display: 'none', 
                                    width: '100%', 
                                    height: '100%', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#555',
                                    flexDirection: 'column'
                                }}>
                                    <span>Photo not found</span>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Arya Wadhwa</h3>
                                <p style={{ color: 'var(--color-neon-pink)', margin: '0 0 1rem 0', fontWeight: 'bold' }}>Co-Founder & Developer</p>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Passionate about building AI-driven solutions that transform how we approach fitness and health.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <a href="#" style={{ color: '#fff' }}><Github size={20} /></a>
                                    <a href="#" style={{ color: '#fff' }}><Linkedin size={20} /></a>
                                    <a href="#" style={{ color: '#fff' }}><Twitter size={20} /></a>
                                </div>
                            </div>
                        </div>

                        {/* Dilraj Card */}
                        <div className="team-card" style={{ 
                            background: 'var(--color-dark-gray)', 
                            borderRadius: '1.5rem', 
                            overflow: 'hidden', 
                            width: '350px',
                            border: '1px solid #333'
                        }}>
                             <div style={{ 
                                height: '350px', 
                                overflow: 'hidden', 
                                backgroundColor: '#222',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src="/team/dilraj.jpg" 
                                    alt="Dilraj Singh" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div style={{ 
                                    display: 'none', 
                                    width: '100%', 
                                    height: '100%', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#555',
                                    flexDirection: 'column'
                                }}>
                                    <span>Photo not found</span>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Dilraj Singh</h3>
                                <p style={{ color: 'var(--color-neon-pink)', margin: '0 0 1rem 0', fontWeight: 'bold' }}>Co-Founder & Developer</p>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Dedicated to creating intuitive user experiences and powerful backend architectures.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <a href="#" style={{ color: '#fff' }}><Github size={20} /></a>
                                    <a href="#" style={{ color: '#fff' }}><Linkedin size={20} /></a>
                                    <a href="#" style={{ color: '#fff' }}><Twitter size={20} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Contact;
