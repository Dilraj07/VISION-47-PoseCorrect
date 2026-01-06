import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { subDays, format } from 'date-fns';
import {
  ArrowLeft,
  Flame,
  Calendar as CalIcon,
  X,
  Check,
  Dumbbell,
  Activity,
  Footprints,
  Timer,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const WORKOUT_TYPES = [
  { id: 'rest', label: 'Rest Day', color: '#333333', icon: <Timer size={32} /> },
  { id: 'push', label: 'Push', color: '#ff0099', icon: <Dumbbell size={32} /> },
  { id: 'pull', label: 'Pull', color: '#9900ff', icon: <Activity size={32} /> },
  { id: 'legs', label: 'Legs', color: '#ccff00', icon: <Footprints size={32} /> },
  { id: 'cardio', label: 'Cardio', color: '#00ccff', icon: <Zap size={32} /> },
  { id: 'full', label: 'Full Body', color: '#ff6600', icon: <Flame size={32} /> },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SelectionModal = ({ isOpen, onClose, onSelect, currentType }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a', padding: '2rem', borderRadius: '2rem',
          border: '1px solid #333', maxWidth: '450px', width: '90%', textAlign: 'center'
        }}
      >
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Choose Focus</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {WORKOUT_TYPES.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(type.id)}
              style={{
                aspectRatio: '1', borderRadius: '50%',
                backgroundColor: '#222',
                border: currentType === type.id ? `2px solid ${type.color}` : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: currentType === type.id ? `0 0 15px ${type.color}40` : 'none',
                position: 'relative',
                color: type.color
              }}
            >
              <div style={{ transform: 'scale(1.2)', marginBottom: '5px' }}>{type.icon}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff' }}>
                {type.label}
              </span>
              {currentType === type.id && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: type.color, borderRadius: '50%', padding: '2px', color: '#000' }}>
                  <Check size={12} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem auto 0' }}
        >
          <X size={16} /> Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState({});
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Load Schedule
  useEffect(() => {
    const savedSchedule = localStorage.getItem('gymbro_schedule');
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    } else {
      const initial = {};
      DAYS.forEach(day => initial[day] = 'rest');
      setSchedule(initial);
    }
  }, []);

  // Load Activity Data (Last 7 Days)
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('created_at, reps')
          .eq('user_id', user.id)
          .gte('created_at', subDays(new Date(), 7).toISOString());

        if (error) throw error;

        // Initialize last 7 days with 0
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i);
          return {
            dateStr: format(d, 'yyyy-MM-dd'),
            dayName: format(d, 'EEE'), // Mon, Tue...
            workouts: 0
          };
        });

        // Fill with actual data
        data.forEach(workout => {
          const wDate = workout.created_at.split('T')[0];
          const dayEntry = last7Days.find(d => d.dateStr === wDate);
          if (dayEntry) {
            dayEntry.workouts += 1;
          }
        });

        setActivityData(last7Days);
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const openSelection = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSelectType = (typeId) => {
    if (!selectedDay) return;

    const newSchedule = { ...schedule, [selectedDay]: typeId };
    setSchedule(newSchedule);
    localStorage.setItem('gymbro_schedule', JSON.stringify(newSchedule));
    setIsModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-black)', color: '#fff', paddingBottom: '4rem' }}>
      <style>{`
        .schedule-header {
            padding: 1rem !important;
        }
        .schedule-main {
            padding: 1rem !important;
        }
        @media (min-width: 768px) {
            .schedule-header {
                padding: 2rem !important;
            }
            .schedule-main {
                padding: 2rem !important;
            }
        }
      `}</style>
      <header className="schedule-header" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #333' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.1em' }}>SCHEDULE & ACTIVITY</h1>
      </header>

      <main className="schedule-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>

        {/* Weekly Planner */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ mb: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CalIcon color="var(--color-neon-blue, #00ccff)" />
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Weekly Planner</h2>
          </div>
          <p style={{ color: '#888', marginBottom: '2rem' }}>Tap a day to choose your focus.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem' }}>
            {DAYS.map((day, index) => {
              const typeId = schedule[day] || 'rest';
              const typeConfig = WORKOUT_TYPES.find(t => t.id === typeId);
              const isToday = (new Date().getDay() + 6) % 7 === index;

              return (
                <motion.div
                  key={day}
                  whileHover={{ y: -5 }}
                  onClick={() => openSelection(day)}
                  style={{
                    backgroundColor: '#111',
                    border: isToday ? `1px solid #fff` : '1px solid #333',
                    borderRadius: '1rem',
                    padding: '1.5rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isToday && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}

                  <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {day.substring(0, 3)}
                  </span>

                  <div style={{
                    color: typeConfig.color,
                    transform: 'scale(1.2)',
                    filter: `drop-shadow(0 0 10px ${typeConfig.color}60)`
                  }}>
                    {typeConfig.icon}
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
                    {typeConfig.label}
                  </div>

                  {/* Bottom Stripe */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                    background: typeConfig.color
                  }} />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Activity Graph */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Flame color="var(--color-neon-pink, #ff0099)" />
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Last 7 Days Activity</h2>
          </div>

          <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '2rem', border: '1px solid #333', height: '400px' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                Loading activity...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', marginBottom: '0.5rem' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey="workouts"
                    fill="var(--color-neon-green, #ccff00)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        <SelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectType}
          currentType={selectedDay ? schedule[selectedDay] : null}
        />
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
