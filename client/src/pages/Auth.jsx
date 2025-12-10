import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/dashboard');
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            color: '#fff',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', backgroundColor: 'var(--color-neon-blue)', filter: 'blur(200px)', opacity: 0.1 }}></div>
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', backgroundColor: 'var(--color-neon-green)', filter: 'blur(200px)', opacity: 0.1 }}></div>

            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 10,
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#888'}
            >
                <ArrowLeft size={20} /> Back to Home
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '3rem',
                    backgroundColor: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                        {isLogin ? 'Welcome Back' : 'Join GymBro'}
                    </h2>
                    <p style={{ color: '#888' }}>
                        {isLogin ? 'Enter your details to access your account' : 'Start your fitness journey today'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            backgroundColor: 'rgba(255, 59, 48, 0.1)',
                            color: '#ff3b30',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255, 59, 48, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem', fontWeight: '600', marginLeft: '0.5rem' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '1rem',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem', fontWeight: '600', marginLeft: '0.5rem' }}>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '1rem',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-neon-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1.25rem',
                            backgroundColor: isLogin ? 'var(--color-neon-blue)' : 'var(--color-neon-green)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'transform 0.2s',
                            boxShadow: isLogin ? '0 0 20px rgba(0, 243, 255, 0.3)' : '0 0 20px rgba(0, 255, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>
                        {isLogin ? "New to GymBro?" : "Already fit?"}
                    </p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '0.8rem 2rem',
                            borderRadius: '2rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fff';
                            e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#fff';
                        }}
                    >
                        {isLogin ? 'Create an Account' : 'Log In Instead'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
