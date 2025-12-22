
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    experience: 'beginner', // beginner, intermediate, advanced
    goal: 'strength', // strength, muscle, endurance, weight_loss
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          experience_level: formData.experience,
          primary_goal: formData.goal,
          updated_at: new Date()
        });

      if (error) throw error;

      // Also initialize empty settings for them
      await supabase.from('user_settings').upsert({ user_id: user.id });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error saving profile!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--color-neon-blue)' }}>WELCOME TO GYMBRO</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Let's customize your experience.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>FULL NAME</label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: '#111', border: '1px solid #333', color: '#fff' }}
              placeholder="Arnold Schwarzen..."
            />
          </div>

          {/* Age */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>AGE</label>
            <input
              required
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: '#111', border: '1px solid #333', color: '#fff' }}
              placeholder="25"
            />
          </div>

          {/* Experience */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>EXPERIENCE LEVEL</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <div
                  key={level}
                  onClick={() => setFormData({ ...formData, experience: level })}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: formData.experience === level ? 'var(--color-neon-green)' : '#111',
                    color: formData.experience === level ? '#000' : '#888',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '1.25rem',
              background: 'var(--color-neon-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Creating Profile...' : 'COMPLETE PROFILE'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
