import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Lock, Bell, Shield, LogOut } from 'lucide-react';

const SettingsSection = ({ title, children }) => (
    <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
            color: '#888',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            fontFamily: "'Outfit', sans-serif"
        }}>
            {title}
        </h3>
        <div style={{
            backgroundColor: '#111',
            borderRadius: '1rem',
            border: '1px solid #222',
            overflow: 'hidden'
        }}>
            {children}
        </div>
    </div>
);

const SettingsItem = ({ icon: Icon, label, value, type = 'arrow', onClick, danger = false }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem',
            borderBottom: '1px solid #222',
            cursor: onClick ? 'pointer' : 'default',
            color: danger ? '#ff3333' : 'white'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {Icon && <Icon size={20} color={danger ? '#ff3333' : '#666'} />}
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{label}</span>
        </div>

        {type === 'arrow' && <div style={{ color: '#444' }}>›</div>}
        {type === 'toggle' && (
            <div style={{
                width: '40px',
                height: '24px',
                backgroundColor: value ? 'var(--color-neon-green)' : '#333',
                borderRadius: '12px',
                position: 'relative'
            }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: value ? '18px' : '2px',
                    transition: 'all 0.2s'
                }} />
            </div>
        )}
        {type === 'text' && <span style={{ color: '#888' }}>{value}</span>}
    </div>
);

const Settings = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    <ChevronLeft size={28} />
                </button>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '900',
                    margin: 0,
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    SETTINGS
                </h1>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* Account Section - Login Info */}
                <SettingsSection title="Account">
                    <SettingsItem icon={User} label="Profile" value="Edit" onClick={() => navigate('/profile')} />
                    <SettingsItem icon={Lock} label="Security" type="arrow" />
                    <SettingsItem
                        icon={Shield}
                        label="Login Information"
                        type="text"
                        value="demo@gymbro.app"
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title="Preferences">
                    <SettingsItem
                        icon={Bell}
                        label="Push Notifications"
                        type="toggle"
                        value={notifications}
                        onClick={() => setNotifications(!notifications)}
                    />
                    <SettingsItem icon={User} label="Language" type="text" value="English" />
                </SettingsSection>

                {/* Login/Logout Section */}
                <SettingsSection title="Session">
                    <SettingsItem
                        icon={LogOut}
                        label="Log Out"
                        type="arrow"
                        danger={true}
                        onClick={() => navigate('/')}
                    />
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #222' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#888' }}>Login to another account</h4>
                        <input
                            type="email"
                            placeholder="Email"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: '#222',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                marginBottom: '0.5rem'
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: '#222',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        />
                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--color-neon-blue)',
                            color: 'black',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            Log In
                        </button>
                    </div>
                </SettingsSection>

            </div>
        </div>
    );
};

export default Settings;
