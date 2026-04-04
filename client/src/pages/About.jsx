import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Zap, Target, Users, Shield, Github } from 'lucide-react';

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
        role: 'Co-Founder',
        color: '#FDE047', // Bright Yellow
        borderColor: 'rgba(253, 224, 71, 0.3)',
        image: '/team/arya.jpeg',
        linkedin: 'https://www.linkedin.com/in/aryawadhwa',
        description: 'Focuses on scalable architecture and driving the mission of making biomechanics accessible to all athletes.'
    },
    {
        name: 'Dilraj Singh',
        role: 'Co-Founder',
        color: '#A78BFA', // Bright Purple
        borderColor: 'rgba(167, 139, 250, 0.3)',
        image: '/team/dilraj.jpg',
        linkedin: 'https://www.linkedin.com/in/dilraj-singh-cos007/',
        description: 'Lead CV Architect mapping raw pixels to precision joint angles, ensuring every posture correction is flawless.'
    },
    {
        name: 'Shlokk Sikka',
        role: 'Co-Founder',
        color: '#4ADE80', // Bright Green
        borderColor: 'rgba(74, 222, 128, 0.3)',
        image: '/team/shlokk.jpg',
        linkedin: 'https://www.linkedin.com/in/shlokk-sikka-127334391/',
        description: 'Pioneering real-time feedback loops and backend integration to maintain sub-second pose response rates.'
    },
    {
        name: 'Anirudha M',
        role: 'Co-Founder',
        color: '#FB7185', // Bright Red
        borderColor: 'rgba(251, 113, 133, 0.3)',
        image: '/team/anirudh.jpeg',
        linkedin: 'https://www.linkedin.com/in/anirudha-mahesha-6262a2399/',
        description: 'Ensuring seamless UX and frontend integration, bridging the gap between heavy math and beautiful interfaces.'
    },
    {
        name: 'Ashwin Acharya',
        role: 'Co-Founder',
        color: '#22D3EE', // Bright Cyan
        borderColor: 'rgba(34, 211, 238, 0.3)',
        image: '/team/ashwin.jpeg',
        linkedin: 'https://www.linkedin.com/',
        description: 'Data analytics expert focusing on tracking real-world lifting patterns and improving AI threshold accuracies over time.'
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

            {/* The Team - Unified */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '4rem',
                        letterSpacing: '-2px'
                    }}
                >
                    The Team
                </motion.h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '2rem',
                }}>
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{
                                position: 'relative',
                                height: '350px',
                                borderRadius: '1.5rem',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer'
                            }}
                        >
                            {/* Background Image */}
                            <motion.div
                                variants={{
                                    rest: { scale: 1 },
                                    hover: { scale: 1.05 }
                                }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${member.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center top',
                                    zIndex: 0
                                }}
                            />

                            {/* Base Gradient - always present */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '60%',
                                background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
                                zIndex: 1
                            }} />

                            {/* Default Text Container */}
                            <motion.div 
                                variants={{
                                    rest: { opacity: 1, y: 0 },
                                    hover: { opacity: 0, y: 20 }
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: '1.5rem',
                                    left: '1.5rem',
                                    zIndex: 2
                                }}
                            >
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{member.name}</h3>
                                <p style={{ fontSize: '1rem', fontWeight: '600', color: member.color, margin: '0.2rem 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</p>
                            </motion.div>

                            {/* Hover Overlay with Blur and Black Gradient */}
                            <motion.div
                                variants={{
                                    rest: { opacity: 0, y: '20%' },
                                    hover: { opacity: 1, y: 0 }
                                }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: `
                                        linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%),
                                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '100% 100%, 25px 25px, 25px 25px',
                                    backdropFilter: 'blur(8px)',
                                    zIndex: 3,
                                    padding: '2rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <motion.div
                                    variants={{
                                        rest: { opacity: 0, y: 10 },
                                        hover: { opacity: 1, y: 0, transition: { delay: 0.1 } }
                                    }}
                                    style={{ position: 'relative', zIndex: 4 }}
                                >
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{member.name}</h3>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: member.color, margin: '0.2rem 0 1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</p>
                                    
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#eaeaea', marginBottom: '1.5rem', opacity: 0.9 }}>
                                        {member.description}
                                    </p>

                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            color: '#fff',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '2rem',
                                            width: 'fit-content',
                                            transition: 'background-color 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = member.color;
                                            e.currentTarget.style.color = '#000';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                    >
                                        <Linkedin size={16} /> Link Up
                                    </a>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default About;
