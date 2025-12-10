import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth(); // Get user and signOut from context

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <h2>GYMBRO</h2>
            </Link>
            <div className="navbar-links">
                <Link to="/about" className="nav-link">About Us</Link>
                <Link to="/contact" className="nav-link">Contact Us</Link>
                <Link to="/privacy" className="nav-link">Privacy</Link>

                {user ? (
                    <>
                        <Link to="/history" className="nav-link" style={{ marginRight: '1rem' }}>History</Link>
                        <span style={{ color: '#888', marginRight: '1rem', fontSize: '0.9rem' }}>{user.email}</span>
                        <button
                            onClick={() => signOut()}
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <Link to="/auth" className="nav-link" style={{ color: '#fff' }}>Sign In</Link>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-launch"
                >
                    Launch App
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
