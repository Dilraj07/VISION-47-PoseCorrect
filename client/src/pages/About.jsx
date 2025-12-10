import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

const teamMembers = [
    { name: 'Arya Wadhwa', role: 'Student', linkedin: 'https://www.linkedin.com/in/aryawadhwa' },
    { name: 'Dilraj Singh', role: 'Student', linkedin: 'https://www.linkedin.com/in/dilraj-singh-cos007/' },
    { name: 'Shlokk Sikka', role: 'Student', linkedin: 'https://www.linkedin.com/in/shlokk-sikka-127334391/' },
    { name: 'Anirudha M', role: 'Student', linkedin: 'https://www.linkedin.com/in/anirudha-mahesha-6262a2399/' },
    { name: 'Ashwin Acharya', role: 'Student', linkedin: 'https://www.linkedin.com/' },
];

const About = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            {/* Background Gradients */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', backgroundColor: 'var(--color-neon-blue)', filter: 'blur(150px)', opacity: 0.15 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', backgroundColor: 'var(--color-neon-pink)', filter: 'blur(150px)', opacity: 0.15 }}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', position: 'relative', zIndex: 1 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #fff, var(--color-neon-blue))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textTransform: 'uppercase',
                        letterSpacing: '-2px'
                    }}>
                        Meet The Team
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#888', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        We are a group of passionate students from <span style={{ color: '#fff', fontWeight: 'bold' }}>RV College of Engineering</span> building the future of fitness technology.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                    {teamMembers.map((member, index) => (
                        <motion.a
                            key={index}
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -10 }}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                position: 'relative'
                            }}
                        >
                            <motion.div
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    padding: '3rem 2rem',
                                    borderRadius: '1.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    backdropFilter: 'blur(10px)',
                                    height: '100%',
                                    transition: 'all 0.3s ease'
                                }}
                                whileHover={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'var(--color-neon-purple)',
                                    boxShadow: '0 10px 30px -10px rgba(184, 41, 233, 0.2)'
                                }}
                            >
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%', // Circle
                                    background: 'linear-gradient(135deg, #222, #111)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                                }}>
                                    <Linkedin size={48} color="var(--color-neon-purple)" />
                                </div>

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700', color: '#fff' }}>{member.name}</h3>
                                <p style={{ color: 'var(--color-neon-blue)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{member.role}</p>

                                <div style={{
                                    marginTop: '2rem',
                                    opacity: 0,
                                    transform: 'translateY(10px)',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }} className="connect-text">
                                    Connect on LinkedIn →
                                </div>
                            </motion.div>
                        </motion.a>
                    ))}
                </div>
            </motion.div>
            <style>{`
                .connect-text { opacity: 0; }
                a:hover .connect-text { opacity: 1; transform: translateY(0); }
            `}</style>
        </div>
    );
};

export default About;
