import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ArrowRight, Activity, Video, Calendar, ChevronDown, Trophy, Smartphone, Brain, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../components/GlowButton';

const LandingPage = ({ onStart }) => {
    const { loginDemo } = useAuth();
    const navigate = useNavigate();

    // Scroll Controls
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothScroll = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

    const handleDemo = async () => {
        await loginDemo();
        navigate('/dashboard');
    };

    return (
        <div ref={containerRef} style={{
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: "var(--font-primary)",
            overflowX: 'hidden'
        }}>
            <style>{`
                .section-padding {
                    padding: 4rem 1.5rem !important;
                }
                .hero-title {
                    font-size: 15vw !important;
                    line-height: 0.9 !important;
                }
                .cta-container {
                    flex-direction: column !important;
                    width: 100% !important;
                    gap: 1rem !important;
                    padding: 0 1rem;
                }
                .cta-btn {
                    width: 100% !important;
                    justify-content: center !important;
                    padding: 1.2rem !important;
                    font-size: 1.1rem !important;
                }
                
                @media (min-width: 768px) {
                    .section-padding {
                        padding: 8rem 2rem !important;
                    }
                    .hero-title {
                        font-size: 10rem !important;
                    }
                    .cta-container {
                        flex-direction: row !important;
                        width: auto !important;
                        gap: 2rem !important;
                    }
                    .cta-btn {
                        width: auto !important;
                        padding: 1rem 3rem !important;
                        font-size: 1rem !important;
                    }
                }
            `}</style>

            {/* HERO SECTION */}
            <HeroSection onStart={onStart} handleDemo={handleDemo} scrollProgress={scrollYProgress} />

            {/* ECOSYSTEM SECTION */}
            <EcosystemSection />

            {/* PROTOCOL SECTION */}
            <ProtocolSection />

            {/* CTA SECTION */}
            <CTASection onStart={onStart} />

            {/* FOOTER */}
            <Footer navigate={navigate} />
        </div>
    );
};

// --- SUB-SECTIONS ---

const HeroSection = ({ onStart, handleDemo, scrollProgress }) => {
    const yText = useTransform(scrollProgress, [0, 0.3], [0, -100]);
    const opacityText = useTransform(scrollProgress, [0, 0.2], [1, 0]);
    const scaleText = useTransform(scrollProgress, [0, 0.2], [1, 0.9]);

    return (
        <section style={{
            height: '65vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Marquee */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                transform: 'translateY(-50%) rotate(-5deg)',
                opacity: 0.05,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 0
            }}>
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    style={{ fontSize: '15vw', fontWeight: 900, fontFamily: "var(--font-display)" }}
                >
                    PUSH PULL LEGS PUSH PULL LEGS PUSH PULL LEGS
                </motion.div>
            </div>

            <motion.div style={{
                y: yText,
                opacity: opacityText,
                scale: scaleText,
                zIndex: 1,
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <h1 className="hero-title" style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    fontFamily: "var(--font-display)",
                    fontWeight: '900',
                    letterSpacing: '-2px',
                    marginBottom: '3rem'
                }}>
                    <span style={{ display: 'block', color: 'var(--color-white)' }}>TRAIN</span>
                    <span style={{
                        display: 'block',
                        color: 'transparent',
                        WebkitTextStroke: '2px var(--color-neon-pink)',
                        textShadow: '0 0 30px rgba(255, 0, 153, 0.3)'
                    }}>SMARTER</span>
                </h1>

                <div className="cta-container" style={{
                    marginTop: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <GlowButton onClick={onStart} className="cta-btn">
                        START TRAINING <ArrowRight size={20} />
                    </GlowButton>

                    <motion.button
                        onClick={handleDemo}
                        className="cta-btn"
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            background: 'transparent',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontWeight: '700',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '0', /* Brutalist sharp edges */
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            fontFamily: "var(--font-display)",
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        whileHover={{
                            borderColor: '#fff',
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                        whileFocus={{
                            borderColor: '#fff',
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        TRY DEMO
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                style={{ position: 'absolute', bottom: '2rem', opacity: opacityText }}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <ChevronDown color="#444" size={32} />
            </motion.div>
        </section>
    );
};

const EcosystemSection = () => {
    return (
        <section className="section-padding" style={{ position: 'relative' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <SectionHeader title="THE ECOSYSTEM" subtitle="YOUR PERSONAL PERFORMANCE LAB" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <FeatureCard
                        icon={Brain}
                        color="var(--color-neon-pink)"
                        title="REAL-TIME COACH"
                        desc="Precision targeting algorithms analyze your weak points and adjust volume automatically."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Activity}
                        color="var(--color-neon-green)"
                        title="METRICS"
                        desc="30FPS computer vision tracks bar path, velocity, and range of motion in real-time."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Calendar}
                        color="var(--color-neon-blue)"
                        title="SCHEDULE"
                        desc="Dynamic periodization that adapts to your recovery state and training history."
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
};

const ProtocolSection = () => {
    return (
        <section className="section-padding" style={{ backgroundColor: '#0a0a0a' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <SectionHeader title="THE PROTOCOL" subtitle="SYSTEMATIC OPTIMIZATION" center />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingLeft: '2rem', position: 'relative' }}>
                    {/* Timeline Line */}
                    <div style={{ position: 'absolute', left: '2.9rem', top: 0, bottom: 0, width: '2px', background: '#222', zIndex: 0 }} />

                    <TimelineItem step="01" title="RECORD" desc="Capture your sets using any smartphone camera. No wearables required." icon={Smartphone} />
                    <TimelineItem step="02" title="ANALYZE" desc="Our engine breaks down form, tempo, and RPE instantly." icon={Zap} />
                    <TimelineItem step="03" title="OPTIMIZE" desc="Receive actionable insights to add 5-10lbs to your lifts weekly." icon={Trophy} />
                </div>
            </div>
        </section>
    );
};

const CTASection = ({ onStart }) => {
    return (
        <section style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: "var(--font-display)", marginBottom: '2rem' }}>
                READY TO <span style={{ color: 'var(--color-neon-green)' }}>ASCEND?</span>
            </h2>
            <GlowButton onClick={onStart} style={{ padding: '1.5rem 4rem', fontSize: '1.5rem' }}>
                START TRAINING
            </GlowButton>
        </section>
    );
};

const Footer = ({ navigate }) => (
    <footer style={{ padding: '4rem 2rem 0rem 2rem', borderTop: '1px solid #222', backgroundColor: '#000', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>GYMBRO</h2>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>BETA v1.6</p>
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>aryawadhwa2@gmail.com</p>
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' }}>cosdilraj07@gmail.com</p>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
                <a onClick={() => navigate('/about')} style={{ color: '#888', cursor: 'pointer' }}>About</a>
                <a onClick={() => navigate('/privacy')} style={{ color: '#888', cursor: 'pointer' }}>Privacy</a>
                <a onClick={() => navigate('/contact')} style={{ color: '#888', cursor: 'pointer' }}>Contact</a>
            </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '-2%' }}>
            <h1 style={{
                margin: 0,
                fontSize: 'clamp(4rem, 21vw, 20rem)',
                fontFamily: 'var(--font-display)',
                color: 'transparent',
                lineHeight: 0.8,
                WebkitTextStroke: '2px #222',
                textTransform: 'uppercase'
            }}>
                GYMBRO
            </h1>
        </div>
    </footer>
);

// --- HELPERS ---

const SectionHeader = ({ title, subtitle, center }) => (
    <div style={{ marginBottom: '4rem', textAlign: center ? 'center' : 'left' }}>
        <h2 style={{ fontSize: '1rem', color: '#666', letterSpacing: '4px', marginBottom: '0.5rem' }}>{title}</h2>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--color-white)', margin: 0, fontFamily: "var(--font-display)", textTransform: 'uppercase' }}>{subtitle}</h3>
    </div>
);

const FeatureCard = ({ icon: Icon, color, title, desc, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            style={{
                backgroundColor: 'rgba(20, 20, 20, 0.5)',
                padding: '2rem',
                border: '1px solid #222',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}
            whileHover={{ y: -10, borderColor: color }}
        >
            <Icon color={color} size={40} />
            <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: "var(--font-display)" }}>{title}</h4>
                <p style={{ color: '#888', lineHeight: 1.6 }}>{desc}</p>
            </div>
        </motion.div>
    );
};

const TimelineItem = ({ step, title, desc, icon: Icon }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ display: 'flex', gap: '2rem', alignItems: 'center', zIndex: 1 }}
        >
            <div style={{
                background: '#000',
                border: '1px solid #333',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={24} color="var(--color-white)" />
            </div>
            <div>
                <span style={{ color: 'var(--color-neon-purple)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>STEP {step}</span>
                <h4 style={{ fontSize: '2rem', margin: 0, fontFamily: "var(--font-display)" }}>{title}</h4>
                <p style={{ color: '#888', marginTop: '0.5rem', maxWidth: '400px' }}>{desc}</p>
            </div>
        </motion.div>
    );
}

export default LandingPage;
