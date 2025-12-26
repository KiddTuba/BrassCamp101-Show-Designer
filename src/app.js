import React, { useState, useEffect } from 'react';
import { 
  Music, User, Calendar, AlertTriangle, CheckCircle, 
  ChevronRight, ChevronLeft, Save, Wand2, FileText, Lock 
} from 'lucide-react';

// --- COMPONENTS ---

// 1. Simple Card Component for Layout
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

// 2. The Main Application
export default function App() {
  const [view, setView] = useState('auth'); // 'auth', 'dashboard', 'wizard'
  const [user, setUser] = useState(null);
  const [shows, setShows] = useState([]);
  const [currentShowId, setCurrentShowId] = useState(null);

  // Mock "Database" Load
  useEffect(() => {
    const savedShows = JSON.parse(localStorage.getItem('bandShows')) || [];
    setShows(savedShows);
  }, []);

  // Save to "Database"
  const saveShow = (newShow) => {
    const updatedShows = [...shows.filter(s => s.id !== newShow.id), newShow];
    setShows(updatedShows);
    localStorage.setItem('bandShows', JSON.stringify(updatedShows));
  };

  if (view === 'auth') {
    return <AuthScreen onLogin={(u) => { setUser(u); setView('dashboard'); }} />;
  }

  if (view === 'dashboard') {
    return (
      <Dashboard 
        user={user} 
        shows={shows} 
        onNew={() => setView('wizard')} 
        onEdit={(id) => { setCurrentShowId(id); setView('wizard'); }}
        onLogout={() => setView('auth')}
      />
    );
  }

  if (view === 'wizard') {
    return (
      <ShowDesignWizard 
        user={user}
        initialData={shows.find(s => s.id === currentShowId)}
        onSave={(data) => { saveShow(data); setView('dashboard'); setCurrentShowId(null); }}
        onCancel={() => { setView('dashboard'); setCurrentShowId(null); }}
      />
    );
  }
}

// --- AUTH SCREEN (Login/Signup) ---
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would hit a server. 
    // Here we simulate a login.
    onLogin({ email, name: email.split('@')[0] });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Music className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Show Design Portal</h1>
          <p className="text-slate-400">Design. Arrange. Perform.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
              placeholder="director@school.edu"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded font-bold transition">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-slate-400 hover:text-white">
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </Card>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ user, shows, onNew, onEdit, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <p className="text-slate-400">Manage your show designs</p>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-white">Logout</button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* New Show Button */}
          <button onClick={onNew} className="h-64 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-slate-900 transition group">
            <div className="bg-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-lg">Start New Design</span>
          </button>

          {/* Existing Shows List */}
          {shows.map(show => (
            <Card key={show.id} className="h-64 p-6 flex flex-col justify-between hover:border-indigo-500 transition cursor-pointer" onClick={() => onEdit(show.id)}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-900 text-indigo-200 text-xs px-2 py-1 rounded">{show.year}</span>
                  {show.signed ? 
                    <span className="flex items-center text-green-400 text-xs"><Lock className="w-3 h-3 mr-1"/> Signed</span> : 
                    <span className="text-amber-400 text-xs">Draft</span>
                  }
                </div>
                <h3 className="text-xl font-bold mb-2">{show.title || "Untitled Show"}</h3>
                <p className="text-sm text-slate-400 line-clamp-3">{show.synopsis || "No synopsis yet..."}</p>
              </div>
              <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-700">
                Due: {show.dateNeeded || "Not set"}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- THE WIZARD (Core Logic) ---
function ShowDesignWizard({ user, initialData, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData || {
    id: Date.now(),
    year: new Date().getFullYear(),
    status: 'draft',
    signed: false,
    // Step 1
    bandSize: '',
    instrumentation: '',
    strongestSections: '',
    weakestSections: '',
    // Step 2
    includes: '',
    avoids: '',
    dateNeeded: '',
    // Step 3
    title: '',
    synopsis: '',
    narrative: '',
    mood: '',
    soloists: '',
    // Step 4
    bigMoment: '',
    // Step 5
    scenes: [], // { id, title, description }
    // Step 6
    songs: '',
  });

  const totalSteps = 7;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Mock AI Generator
  const generateAI = (field) => {
    if (field === 'title') {
      const titles = ["Echoes of Tomorrow", "The Golden Horizon", "Velocity", "Urban Myths", "Starlight Revolution"];
      setData({ ...data, title: titles[Math.floor(Math.random() * titles.length)] });
    }
    if (field === 'narrative') {
      const nar = `Act 1 establishes the world of ${data.synopsis || 'the unknown'}. \nAct 2 introduces conflict through the ${data.weakestSections || 'ensemble'}. \nAct 3 resolves in a glorious explosion of sound featuring the ${data.strongestSections || 'full band'}.`;
      setData({ ...data, narrative: nar });
    }
  };

  const addScene = () => setData({ ...data, scenes: [...data.scenes, { id: Date.now(), desc: '' }] });
  const updateScene = (id, txt) => {
    const newScenes = data.scenes.map(s => s.id === id ? { ...s, desc: txt } : s);
    setData({ ...data, scenes: newScenes });
  };
  const removeScene = (id) => setData({ ...data, scenes: data.scenes.filter(s => s.id !== id) });

  // Render Step Content
  const renderStep = () =>
