import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, ArrowUpRight } from 'lucide-react';

const teamMembers = [
    { name: 'Arya Wadhwa', role: 'Student', linkedin: 'https://www.linkedin.com/in/aryawadhwa' },
    { name: 'Dilraj Singh', role: 'Student', linkedin: 'https://www.linkedin.com/in/dilraj-singh-cos007/' },
    { name: 'Shlokk Sikka', role: 'Student', linkedin: 'https://www.linkedin.com/in/shlokk-sikka-127334391/' },
    { name: 'Anirudha M', role: 'Student', linkedin: 'https://www.linkedin.com/in/anirudha-mahesha-6262a2399/' },
    { name: 'Ashwin Acharya', role: 'Student', linkedin: 'https://www.linkedin.com/' },
];

const About = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden', fontFamily: "'Anton', sans-serif" }}>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem' }}>
                {/* Header */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '6rem', borderBottom: '2px solid #333', paddingBottom: '2rem' }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '2rem',
                        fontFamily: "'Outfit', sans-serif"
                    }}>
                        <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '400px' }}>
                            Engineers from <span style={{ color: '#fff', textDecoration: 'underline' }}>RV College of Engineering</span> designing the future of biomechanics.
                        </p>
                        <div style={{ fontSize: '1rem', color: '#666' }}>EST. 2024</div>
                    </div>
                </motion.div>

                {/* Team Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', backgroundColor: '#333', border: '2px solid #333' }}>
                    {teamMembers.map((member, index) => (
                        <motion.a
                            key={index}
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                position: 'relative',
                                backgroundColor: '#000',
                                padding: '3rem 2rem',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '400px',
                                overflow: 'hidden'
                            }}
                            initial="initial"
                            whileHover="hover"
                            variants={{ hover: { backgroundColor: '#111' } }}
                        >
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                <ArrowUpRight size={32} color="var(--color-neon-pink)" />
                            </div>

                            <motion.div
                                variants={{ hover: { scale: 1.1 } }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    backgroundColor: '#222',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #333'
                                }}
                            >
                                <Linkedin size={40} color="#fff" />
                            </motion.div>

                            <div>
                                <h3 style={{
                                    fontSize: '3rem',
                                    marginBottom: '0.5rem',
                                    fontWeight: '400',
                                    color: '#fff',
                                    lineHeight: 0.9
                                }}>
                                    {member.name.split(' ')[0]}<br />
                                    <span style={{ color: '#555' }}>{member.name.split(' ')[1]}</span>
                                </h3>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid var(--color-neon-purple)',
                                    color: 'var(--color-neon-purple)',
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: '0.9rem',
                                    marginTop: '1rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {member.role}
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
