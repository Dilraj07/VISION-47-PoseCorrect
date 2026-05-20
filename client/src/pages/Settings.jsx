import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Lock, Bell, Shield, LogOut, Globe, Smartphone, Download, Trash2, Eye, HelpCircle, MessageSquare, Info } from 'lucide-react';

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
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
            }
        } : undefined}
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

import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [units, setUnits] = useState('imperial'); // imperial | metric
    const [theme, setTheme] = useState('dark');
    const [dataSaver, setDataSaver] = useState(false);

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
                    aria-label="Go Back"
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
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

                {/* Account Section */}
                <SettingsSection title="Account">
                    <SettingsItem icon={User} label="Profile Details" value="Edit" onClick={() => navigate('/profile')} />
                    <SettingsItem icon={Shield} label="Subscription" type="text" value="PRO PLAN" />
                    <SettingsItem icon={Lock} label="Password & Security" type="arrow" />
                </SettingsSection>

                {/* App Preferences */}
                <SettingsSection title="Preferences">
                    {/* Demo mode removed */}
                    <SettingsItem
                        icon={Bell}
                        label="Push Notifications"
                        type="toggle"
                        value={notifications}
                        onClick={() => setNotifications(!notifications)}
                    />
                    <SettingsItem
                        icon={Globe}
                        label="Units System"
                        type="text"
                        value={units === 'imperial' ? 'LBS / FT' : 'KG / M'}
                        onClick={() => setUnits(units === 'imperial' ? 'metric' : 'imperial')}
                    />
                    <SettingsItem
                        icon={Smartphone}
                        label="Data Saver Mode"
                        type="toggle"
                        value={dataSaver}
                        onClick={() => setDataSaver(!dataSaver)}
                    />
                </SettingsSection>

                {/* Data & Privacy */}
                <SettingsSection title="Data & Privacy">
                    <SettingsItem icon={Download} label="Export Workout Data" type="arrow" />
                    <SettingsItem icon={Trash2} label="Clear Cache" type="arrow" />
                    <SettingsItem icon={Eye} label="Privacy Policy" type="arrow" onClick={() => navigate('/privacy')} />
                </SettingsSection>

                {/* Support */}
                <SettingsSection title="Support">
                    <SettingsItem icon={HelpCircle} label="Help Center" type="arrow" onClick={() => navigate('/help')} />
                    <SettingsItem icon={MessageSquare} label="Contact Support" type="arrow" onClick={() => navigate('/contact')} />
                    <SettingsItem icon={Info} label="About GymBro" type="text" value="v1.4.0 (Beta)" onClick={() => navigate('/about')} />
                </SettingsSection>

                {/* Session */}
                <SettingsSection title="Session">
                    <SettingsItem
                        icon={LogOut}
                        label="Log Out"
                        type="arrow"
                        danger={true}
                        onClick={() => { signOut(); navigate('/'); }}
                    />
                </SettingsSection>

                <div style={{ textAlign: 'center', marginTop: '2rem', color: '#444', fontSize: '0.8rem' }}>
                    User ID: {user?.id || 'N/A'}<br />
                    © 2024 GYMBRO Inc.
                </div>

            </div>
        </div>
    );
};

export default Settings;
