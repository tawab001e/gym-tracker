'use client';
'use client';
import { useState, useEffect } from 'react';
import { Dumbbell, Flame, Timer, TrendingUp, Plus, X, Check, ChevronRight, Calendar, Trophy, Target, History, Play, Pause, RotateCcw, Award, ChevronLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

const workoutTemplates = {
  push: { name: 'Push', emoji: '💪', exercises: ['Bench Press', 'Overhead Press', 'Incline DB Press', 'Lateral Raises', 'Tricep Pushdown', 'Dips'] },
  pull: { name: 'Pull', emoji: '🔙', exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls', 'Hammer Curls'] },
  legs: { name: 'Legs', emoji: '🦵', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Calf Raises'] },
  upper: { name: 'Upper', emoji: '⬆️', exercises: ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-ups', 'Bicep Curls', 'Tricep Pushdown'] },
  lower: { name: 'Lower', emoji: '⬇️', exercises: ['Squat', 'Deadlift', 'Lunges', 'Leg Curl', 'Hip Thrust', 'Calf Raises'] },
  full: { name: 'Full Body', emoji: '🏋️', exercises: ['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Romanian Deadlift', 'Pull-ups'] }
};

const initialHistory = [
  { id: 1, date: '23 Déc', type: 'Push', duration: 58, volume: 4520, exercises: 6 },
  { id: 2, date: '22 Déc', type: 'Pull', duration: 62, volume: 5100, exercises: 6 },
  { id: 3, date: '21 Déc', type: 'Legs', duration: 55, volume: 6200, exercises: 6 },
  { id: 4, date: '19 Déc', type: 'Push', duration: 60, volume: 4680, exercises: 6 },
  { id: 5, date: '18 Déc', type: 'Pull', duration: 58, volume: 4950, exercises: 6 },
];

const progressData = [
  { week: 'S1', volume: 12000, workouts: 3 },
  { week: 'S2', volume: 14500, workouts: 4 },
  { week: 'S3', volume: 13800, workouts: 3 },
  { week: 'S4', volume: 16200, workouts: 5 },
  { week: 'S5', volume: 15800, workouts: 4 },
  { week: 'S6', volume: 18500, workouts: 5 },
];

const initialPRs = [
  { exercise: 'Bench Press', weight: 100, reps: 1, date: '20 Déc' },
  { exercise: 'Squat', weight: 140, reps: 1, date: '21 Déc' },
  { exercise: 'Deadlift', weight: 180, reps: 1, date: '22 Déc' },
  { exercise: 'Overhead Press', weight: 60, reps: 1, date: '19 Déc' },
];

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function GymTracker() {
  const [view, setView] = useState('dashboard');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [completedDays] = useState([0, 1, 2, 4]);
  const [stats] = useState({ workouts: 24, calories: 12400, volume: 45200, streak: 5 });
  const [history] = useState(initialHistory);
  const [prs, setPRs] = useState(initialPRs);
  const [restTime, setRestTime] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showTimer, setShowTimer] = useState(false);
  const [newPR, setNewPR] = useState(null);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startTimer = () => { setTimeLeft(restTime); setTimerActive(true); setShowTimer(true); };
  const resetTimer = () => { setTimeLeft(restTime); setTimerActive(false); };
  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const startWorkout = (type) => {
    const template = workoutTemplates[type];
    setSelectedWorkout(template.name);
    setExercises(template.exercises.map(e => ({ 
      name: e, 
      sets: [{ weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }],
      pr: prs.find(p => p.exercise === e)?.weight || null
    })));
    setView('workout');
  };

  const addSet = (exIdx) => {
    const updated = [...exercises];
    updated[exIdx].sets.push({ weight: '', reps: '', done: false });
    setExercises(updated);
  };

  const toggleSet = (exIdx, setIdx) => {
    const updated = [...exercises];
    const set = updated[exIdx].sets[setIdx];
    set.done = !set.done;
    if (set.done) {
      startTimer();
      const currentPR = prs.find(p => p.exercise === updated[exIdx].name);
      const weight = parseFloat(set.weight) || 0;
      if (weight > 0 && (!currentPR || weight > currentPR.weight)) {
        setNewPR({ exercise: updated[exIdx].name, weight, reps: set.reps });
        setPRs(prev => {
          const filtered = prev.filter(p => p.exercise !== updated[exIdx].name);
          return [...filtered, { exercise: updated[exIdx].name, weight, reps: parseInt(set.reps) || 1, date: 'Auj.' }];
        });
        updated[exIdx].pr = weight;
      }
    }
    setExercises(updated);
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const finishWorkout = () => { setShowTimer(false); setView('dashboard'); };

  if (view === 'workout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pb-32">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white"><X size={24} /></button>
            <h1 className="text-xl font-bold text-white">{selectedWorkout}</h1>
            <button onClick={finishWorkout} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">Terminer</button>
          </div>
          {newPR && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"><Trophy size={24} className="text-white" /></div>
              <div className="flex-1">
                <p className="text-yellow-400 font-bold">Nouveau Record ! 🎉</p>
                <p className="text-white text-sm">{newPR.exercise}: {newPR.weight}kg x {newPR.reps}</p>
              </div>
              <button onClick={() => setNewPR(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
          )}
          <div className="space-y-4">
            {exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2"><Dumbbell size={18} className="text-violet-400" />{ex.name}</h3>
                  {ex.pr && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">PR: {ex.pr}kg</span>}
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 px-1"><span>Set</span><span>Kg</span><span>Reps</span><span></span></div>
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-gray-300 text-sm font-medium">{setIdx + 1}</span>
                      <input type="number" placeholder="0" value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:border-violet-500 focus:outline-none" />
                      <input type="number" placeholder="0" value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:border-violet-500 focus:outline-none" />
                      <button onClick={() => toggleSet(exIdx, setIdx)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${set.done ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}><Check size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => addSet(exIdx)} className="w-full mt-2 py-2 text-sm text-violet-400 hover:text-violet-300 flex items-center justify-center gap-1"><Plus size={16} /> Ajouter série</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showTimer && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-4">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${timeLeft > 0 ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{formatTime(timeLeft)}</div>
                  <div><p className="text-white font-medium">Repos</p><p className="text-gray-400 text-sm">{timeLeft > 0 ? 'En cours...' : 'Terminé !'}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTimerActive(!timerActive)} className="w-12 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white">{timerActive ? <Pause size={20} /> : <Play size={20} />}</button>
                  <button onClick={resetTimer} className="w-12 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white"><RotateCcw size={20} /></button>
                  <button onClick={() => setShowTimer(false)} className="w-12 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white"><X size={20} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-gray-400 text-sm">Durée:</span>
                {[60, 90, 120, 180].map(t => (<button key={t} onClick={() => { setRestTime(t); setTimeLeft(t); }} className={`px-3 py-1 rounded-lg text-sm ${restTime === t ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{t}s</button>))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-6"><button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white"><ChevronLeft size={24} /></button><h1 className="text-xl font-bold text-white">Historique</h1></div>
          <div className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl">{workoutTemplates[h.type.toLowerCase()]?.emoji || '🏋️'}</div>
                    <div><p className="text-white font-semibold">{h.type}</p><p className="text-gray-400 text-sm">{h.date}</p></div>
                  </div>
                  <div className="text-right"><p className="text-white font-medium">{h.volume.toLocaleString()} kg</p><p className="text-gray-400 text-sm">{h.duration} min</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-6"><button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white"><ChevronLeft size={24} /></button><h1 className="text-xl font-bold text-white">Progression</h1></div>
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-700/50 mb-4">
            <h3 className="text-white font-semibold mb-4">Volume hebdomadaire (kg)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs><linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="week" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-700/50 mb-4">
            <h3 className="text-white font-semibold mb-4">Séances par semaine</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}><XAxis dataKey="week" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} domain={[0, 7]} /><Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} /><Line type="monotone" dataKey="workouts" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-4"><Award size={20} className="text-yellow-400" /><h3 className="text-white font-semibold">Records Personnels (PR)</h3></div>
            <div className="space-y-3">
              {prs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm">{i + 1}</div><span className="text-white">{pr.exercise}</span></div>
                  <div className="text-right"><p className="text-white font-bold">{pr.weight} kg</p><p className="text-gray-400 text-xs">{pr.reps} rep · {pr.date}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-gray-400 text-sm">Bienvenue 👋</p><h1 className="text-2xl font-bold text-white">Tableau de bord</h1></div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">A</div>
        </div>
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative"><div className="flex items-center gap-2 mb-2"><Trophy size={20} className="text-yellow-300" /><span className="text-white/80 text-sm">Streak actuel</span></div><div className="text-4xl font-bold text-white mb-1">{stats.streak} jours</div><p className="text-white/70 text-sm">Continue comme ça ! 🔥</p></div>
        </div>
        <div className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3"><span className="text-gray-300 font-medium">Cette semaine</span><Calendar size={18} className="text-gray-400" /></div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => (<div key={i} className="flex flex-col items-center gap-2"><span className="text-xs text-gray-500">{day}</span><div className={`w-8 h-8 rounded-full flex items-center justify-center ${completedDays.includes(i) ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-gray-700/50 text-gray-500'}`}>{completedDays.includes(i) ? <Check size={14} /> : ''}</div></div>))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[{ icon: Dumbbell, label: 'Séances', value: stats.workouts, color: 'from-blue-500 to-cyan-500' },{ icon: Flame, label: 'Calories', value: stats.calories.toLocaleString(), color: 'from-orange-500 to-red-500' },{ icon: TrendingUp, label: 'Volume (kg)', value: stats.volume.toLocaleString(), color: 'from-emerald-500 to-teal-500' },{ icon: Target, label: 'Objectif', value: '80%', color: 'from-violet-500 to-purple-500' }].map((stat, i) => (
            <div key={i} className="bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-700/50"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}><stat.icon size={20} className="text-white" /></div><p className="text-gray-400 text-xs">{stat.label}</p><p className="text-white text-xl font-bold">{stat.value}</p></div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <button onClick={() => setView('history')} className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur rounded-xl p-3 border border-gray-700/50 flex items-center justify-center gap-2 text-gray-300"><History size={18} /> Historique</button>
          <button onClick={() => setView('stats')} className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur rounded-xl p-3 border border-gray-700/50 flex items-center justify-center gap-2 text-gray-300"><TrendingUp size={18} /> Stats & PR</button>
        </div>
        <div className="mb-4">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Dumbbell size={18} className="text-violet-400" />Commencer un entraînement</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(workoutTemplates).map(([key, val]) => (<button key={key} onClick={() => startWorkout(key)} className="bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur rounded-xl p-4 border border-gray-700/50 text-left transition-all group"><div className="flex items-center justify-between"><span className="text-white font-medium">{val.emoji} {val.name}</span><ChevronRight size={18} className="text-gray-500 group-hover:text-violet-400 transition-colors" /></div><p className="text-gray-500 text-xs mt-1">{val.exercises.length} exercices</p></button>))}
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25"><Plus size={20} /> Créer entraînement perso</button>
      </div>
    </div>
  );
}
