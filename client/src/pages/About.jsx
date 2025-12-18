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

            {/* Founders Section (Merged) */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 6rem' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        letterSpacing: '-2px'
                    }}
                >
                    Founders
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.9) 100%)',
                        borderRadius: '2.5rem',
                        padding: '4rem 2rem',
                        border: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: '6rem',
                        width: '100%',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        {/* Dilraj (Left) */}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 300px' }}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '4px solid #A78BFA',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 0 30px rgba(167, 139, 250, 0.2)',
                                    position: 'relative'
                                }}
                            >
                                <img
                                    src="/team/dilraj.jpg"
                                    alt="Dilraj Singh"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </motion.div>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>Dilraj Singh</h3>
                            <p style={{ color: '#A78BFA', fontWeight: '600', fontSize: '1.2rem', marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>CTO & Co-Founder</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <a href="https://www.linkedin.com/in/dilraj-singh-cos007/" target="_blank" rel="noreferrer" style={{ color: '#ccc', transition: 'color 0.3s' }}><Linkedin /></a>
                                <a href="#" style={{ color: '#ccc' }}><Github /></a>
                            </div>
                        </div>

                        {/* Vertical Divider for desktop */}
                        <div style={{
                            width: '1px',
                            background: 'linear-gradient(to bottom, transparent, #444, transparent)',
                            height: '300px',
                            display: 'none',
                            alignSelf: 'center'
                        }} className="divider"></div>

                        {/* Arya (Right) */}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 300px' }}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '4px solid #FDE047',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 0 30px rgba(253, 224, 71, 0.2)',
                                    position: 'relative'
                                }}
                            >
                                <img
                                    src="/team/arya.jpg"
                                    alt="Arya Wadhwa"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </motion.div>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>Arya Wadhwa</h3>
                            <p style={{ color: '#FDE047', fontWeight: '600', fontSize: '1.2rem', marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>CEO & Co-Founder</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <a href="https://www.linkedin.com/in/aryawadhwa" target="_blank" rel="noreferrer" style={{ color: '#ccc', transition: 'color 0.3s' }}><Linkedin /></a>
                                <a href="#" style={{ color: '#ccc' }}><Github /></a>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <style>{`
                    .divider { display: none; }
                    @media (min-width: 900px) {
                        .divider { display: block; }
                    }
                `}</style>
            </div>

            {/* The Team - New Style */}
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
                    marginBottom: '4rem',
                    fontSize: '1.1rem'
                }}>
                    Engineering the future of fitness.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                }}>
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            style={{
                                backgroundColor: 'rgba(20, 20, 20, 0.6)',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: '1px solid #333',
                                backdropFilter: 'blur(10px)',
                                transition: 'border-color 0.3s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = member.borderColor}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                        >
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                marginBottom: '1.5rem',
                                border: `2px solid ${member.color}`,
                            }}>
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: 'grayscale(30%)'
                                    }}
                                />
                            </div>

                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                margin: '0 0 0.5rem 0',
                                color: '#fff'
                            }}>
                                {member.name}
                            </h3>
                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#888',
                                margin: '0 0 1.5rem 0',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {member.role}
                            </p>

                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    color: '#fff',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = member.color;
                                    e.currentTarget.style.color = '#000';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                            >
                                <Linkedin size={18} />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
