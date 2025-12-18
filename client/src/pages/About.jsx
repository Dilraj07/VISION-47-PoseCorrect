import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Zap, Target, Users, Shield } from 'lucide-react';

const values = [
    {
        icon: <Users size={32} color="#FDE047" />, // Yellow
        title: "BROCODE",
        desc: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0 }}>Lift honest. Lift hard. Lift together.</p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                    • No fake reps &nbsp; • No dangerous form &nbsp; • No excuses
                </p>
                <p style={{ margin: 0 }}>
                    We respect effort, discipline, and improvement. Whether you’re a beginner or a beast — we hold you to the same standard.
                </p>
            </div>
        ),
        span: "col-span-2",
        color: "rgba(253, 224, 71, 0.1)",
        borderColor: "rgba(253, 224, 71, 0.3)"
    },
    {
        icon: <Shield size={32} color="#A78BFA" />, // Purple
        title: "DATA YOU CAN TRUST",
        desc: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>No fluff. No fake feedback.</p>
                <p style={{ margin: 0 }}>Your posture analysis, performance reviews, and progress tracking are transparent, accurate, and built for real-world lifting — not vanity metrics.</p>
            </div>
        ),
        span: "col-span-1",
        color: "rgba(167, 139, 250, 0.1)",
        borderColor: "rgba(167, 139, 250, 0.3)"
    },
    {
        icon: <Target size={32} color="#4ADE80" />, // Green
        title: "FORM OVER EGO",
        desc: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>Weight doesn’t matter. Execution does.</p>
                <p style={{ margin: 0 }}>We prioritize biomechanics, joint safety, and muscle activation. If your form breaks, we call it out — because gains come from precision, not shortcuts.</p>
            </div>
        ),
        span: "col-span-1",
        color: "rgba(74, 222, 128, 0.1)",
        borderColor: "rgba(74, 222, 128, 0.3)"
    },
    {
        icon: <Zap size={32} color="#FB7185" />, // Red
        title: "PROGRESS, MEASURED",
        desc: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>If it’s not measured, it’s not improved.</p>
                <p style={{ margin: 0 }}>Every rep, angle, and correction feeds real feedback. Track posture accuracy, form improvement, and consistency over weeks — so your progress is visible, earned, and undeniable.</p>
            </div>
        ),
        span: "col-span-2",
        color: "rgba(251, 113, 133, 0.1)",
        borderColor: "rgba(251, 113, 133, 0.3)"
    }
];

const teamMembers = [
    {
        name: 'Arya Wadhwa',
        role: 'CEO & Co-Founder',
        color: 'rgba(253, 224, 71, 0.1)', // Translucent Yellow
        borderColor: 'rgba(253, 224, 71, 0.3)',
        image: '/team/arya.jpg',
        linkedin: 'https://www.linkedin.com/in/aryawadhwa'
    },
    {
        name: 'Dilraj Singh',
        role: 'CTO & Co-Founder',
        color: 'rgba(167, 139, 250, 0.1)', // Translucent Purple
        borderColor: 'rgba(167, 139, 250, 0.3)',
        image: '/team/dilraj.jpg',
        linkedin: 'https://www.linkedin.com/in/dilraj-singh-cos007/'
    },
    {
        name: 'Shlokk Sikka',
        role: 'Co-Founder',
        color: 'rgba(74, 222, 128, 0.1)', // Translucent Green
        borderColor: 'rgba(74, 222, 128, 0.3)',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        linkedin: 'https://www.linkedin.com/in/shlokk-sikka-127334391/'
    },
    {
        name: 'Anirudha M',
        role: 'Co-Founder',
        color: 'rgba(251, 113, 133, 0.1)', // Translucent Red
        borderColor: 'rgba(251, 113, 133, 0.3)',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
        linkedin: 'https://www.linkedin.com/in/anirudha-mahesha-6262a2399/'
    },
    {
        name: 'Ashwin Acharya',
        role: 'Co-Founder',
        color: 'rgba(34, 211, 238, 0.1)', // Translucent Cyan
        borderColor: 'rgba(34, 211, 238, 0.3)',
        image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=400',
        linkedin: 'https://www.linkedin.com/'
    }
];

const About = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            padding: '4rem 2rem',
            overflowX: 'hidden'
        }}>
            <style>{`
                .bento-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                @media (min-width: 900px) {
                    .bento-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .col-span-2 {
                        grid-column: span 2;
                    }
                    .col-span-1 {
                        grid-column: span 1;
                    }
                }
            `}</style>

            {/* Header / Our Story */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto 6rem',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        fontWeight: '800',
                        margin: 0,
                        letterSpacing: '-2px',
                        background: 'linear-gradient(to right, #fff, #888)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Every Rep Counts.
                    </h1>
                    <p style={{
                        marginTop: '2rem',
                        fontSize: '1.25rem',
                        lineHeight: '1.8',
                        color: '#ccc',
                        maxWidth: '800px',
                        margin: '2rem auto 0'
                    }}>
                        Born from a passion for biomechanics and code, GymBro started as a project at
                        <span style={{ color: '#fff', fontWeight: 'bold' }}> RV College of Engineering</span>.
                        We noticed a gap between professional athlete analysis and what's available to
                        the everyday gym-goer. Our mission is to democratize perfection in form, using
                        advanced computer vision to keep you safe and strong.
                    </p>
                </motion.div>
            </div>

            {/* Our Values - Colored Bento Grid */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 8rem' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        fontSize: '2rem',
                        marginBottom: '3rem',
                        textAlign: 'left',
                        fontWeight: '700',
                        paddingLeft: '0.5rem'
                    }}
                >
                    Our Values
                </motion.h2>

                <div className="bento-grid">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            className={value.span}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.01 }}
                            style={{
                                backgroundColor: value.color,
                                border: `1px solid ${value.borderColor}`,
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: 'auto',
                                minHeight: '340px',
                                position: 'relative',
                                overflow: 'hidden',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {value.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{value.title}</h3>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    color: 'rgba(255,255,255,0.9)',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}>
                                    {value.desc}
                                </div>
                            </div>

                            {/* Decorative element: Subtle glow at bottom right */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-20%',
                                right: '-10%',
                                width: '200px',
                                height: '200px',
                                background: `radial-gradient(circle, ${value.borderColor} 0%, transparent 70%)`,
                                opacity: 0.4,
                                borderRadius: '50%',
                                pointerEvents: 'none',
                                filter: 'blur(20px)'
                            }} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* The Team */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        letterSpacing: '-2px'
                    }}
                >
                    The Team
                </motion.h2>
                <p style={{
                    textAlign: 'center',
                    color: '#888',
                    marginBottom: '3rem',
                    fontSize: '1.1rem'
                }}>
                    The engineers behind the algorithms.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            style={{
                                backgroundColor: member.color,
                                borderRadius: '2rem',
                                padding: '1.5rem 1.5rem 0',
                                display: 'flex',
                                flexDirection: 'column',
                                color: '#fff',
                                height: '320px',
                                position: 'relative',
                                overflow: 'hidden',
                                border: `1px solid ${member.borderColor}`,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            {/* Text Content */}
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <h2 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '800',
                                    lineHeight: 1.1,
                                    marginBottom: '0.25rem',
                                    letterSpacing: '-0.5px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    {member.name}
                                </h2>
                                <p style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    opacity: 0.9,
                                    margin: 0,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}>
                                    {member.role}
                                </p>

                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        marginTop: '0.75rem',
                                        color: '#fff',
                                        padding: '0.4rem',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '50%',
                                        transition: 'background 0.2s',
                                        backgroundColor: 'rgba(0,0,0,0.2)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.2)'}
                                >
                                    <Linkedin size={18} />
                                </a>
                            </div>

                            {/* Image at bottom */}
                            <div style={{
                                marginTop: 'auto',
                                width: '120%',
                                marginLeft: '-10%',
                                height: '65%',
                                position: 'relative',
                                userSelect: 'none'
                            }}>
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'top center',
                                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                        transform: 'scale(1.05)',
                                        transformOrigin: 'bottom center',
                                        filter: 'grayscale(20%) contrast(1.1)'
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
