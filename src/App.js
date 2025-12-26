import React, { useState, useEffect } from 'react';
import { 
  Music, Calendar, AlertTriangle, 
  ChevronRight, ChevronLeft, Save, Wand2, Lock 
} from 'lucide-react';

// --- STYLES ---
const INPUT_CLASS = "w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white outline-none transition duration-200";
const LABEL_CLASS = "block text-sm font-medium mb-2 text-slate-300";

// --- COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('auth'); 
  const [user, setUser] = useState(null);
  const [shows, setShows] = useState([]);
  const [currentShowId, setCurrentShowId] = useState(null);

  useEffect(() => {
    const savedShows = JSON.parse(localStorage.getItem('bandShows')) || [];
    setShows(savedShows);
  }, []);

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
  return null;
}

// --- AUTH SCREEN ---
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
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
              className={INPUT_CLASS}
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
          <button onClick={onNew} className="h-64 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-slate-900 transition group">
            <div className="bg-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-lg">Start New Design</span>
          </button>

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

// --- WIZARD ---
function ShowDesignWizard({ user, initialData, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData || {
    id: Date.now(),
    year: new Date().getFullYear(),
    status: 'draft',
    signed: false,
    bandSize: '',
    instrumentation: '',
    strongestSections: '',
    weakestSections: '',
    includes: '',
    avoids: '',
    dateNeeded: '',
    title: '',
    synopsis: '',
    narrative: '',
    mood: '',
    soloists: '',
    bigMoment: '',
    scenes: [],
    songs: '',
  });

  const totalSteps = 7;
  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">The Ensemble</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Total Band Size</label>
                <input type="number" className={INPUT_CLASS} value={data.bandSize} onChange={e => setData({...data, bandSize: e.target.value})} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Season Year</label>
                <input type="number" className={INPUT_CLASS} value={data.year} onChange={e => setData({...data, year: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Projected Instrumentation</label>
              <textarea className={`${INPUT_CLASS} h-24`} placeholder="e.g. 12 Flutes, 24 Clarinets, 4 Tubas..." value={data.instrumentation} onChange={e => setData({...data, instrumentation: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${LABEL_CLASS} text-green-400`}>Strongest Sections</label>
                <textarea className={`${INPUT_CLASS} h-24`} value={data.strongestSections} onChange={e => setData({...data, strongestSections: e.target.value})} />
              </div>
              <div>
                <label className={`${LABEL_CLASS} text-red-400`}>Weakest Sections</label>
                <textarea className={`${INPUT_CLASS} h-24`} value={data.weakestSections} onChange={e => setData({...data, weakestSections: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Parameters</h2>
            <div>
              <label className={LABEL_CLASS}>Date Music Needed By</label>
              <input type="date" className={INPUT_CLASS} value={data.dateNeeded} onChange={e => setData({...data, dateNeeded: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${LABEL_CLASS} text-green-400`}>Things to Include</label>
                <textarea className={`${INPUT_CLASS} h-32`} placeholder="Specific quotes, visual ideas, props..." value={data.includes} onChange={e => setData({...data, includes: e.target.value})} />
              </div>
              <div>
                <label className={`${LABEL_CLASS} text-red-400`}>Things to Avoid</label>
                <textarea className={`${INPUT_CLASS} h-32`} placeholder="Certain keys, difficult techniques, clichés..." value={data.avoids} onChange={e => setData({...data, avoids: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">The Concept</h2>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className={LABEL_CLASS}>Show Name</label>
                <button type="button" onClick={() => generateAI('title')} className="text-xs text-indigo-400 flex items-center hover:text-indigo-300"><Wand2 className="w-3 h-3 mr-1"/> AI Suggest</button>
              </div>
              <input type="text" className={INPUT_CLASS} value={data.title} onChange={e => setData({...data, title: e.target.value})} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Synopsis</label>
              <textarea className={`${INPUT_CLASS} h-24`} placeholder="Brief summary of the show's theme..." value={data.synopsis} onChange={e => setData({...data, synopsis: e.target.value})} />
            </div>
             <div>
              <div className="flex justify-between items-end mb-1">
                <label className={LABEL_CLASS}>Narrative (Story Flow)</label>
                <button type="button" onClick={() => generateAI('narrative')} className="text-xs text-indigo-400 flex items-center hover:text-indigo-300"><Wand2 className="w-3 h-3 mr-1"/> AI Generate</button>
              </div>
              <textarea className={`${INPUT_CLASS} h-32`} value={data.narrative} onChange={e => setData({...data, narrative: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Overall Mood (Emotion)</label>
                <input type="text" className={INPUT_CLASS} value={data.mood} onChange={e => setData({...data, mood: e.target.value})} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Featured Soloists</label>
                <input type="text" className={INPUT_CLASS} value={data.soloists} onChange={e => setData({...data, soloists: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-amber-500 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">THE Big Moment</h2>
            </div>
            <div className="bg-amber-900/20 border border-amber-500/50 p-4 rounded text-amber-200 text-sm mb-4">
              This HAS to be well thought out. The ENTIRE show revolves around this point. We build to, and around this point. What is the "WOW" factor?
            </div>
            <textarea 
              className="w-full bg-slate-900 border-2 border-amber-500 rounded p-4 text-lg text-white h-64 focus:outline-none focus:ring-4 focus:ring-amber-500/20" 
              placeholder="Describe the climax/anchor of the show here..." 
              value={data.bigMoment} 
              onChange={e => setData({...data, bigMoment: e.target.value})} 
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Scene Breakdown</h2>
              <button onClick={addScene} className="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-sm">+ Add Scene</button>
            </div>
            <p className="text-slate-400 text-sm">Describe the action page-by-page or movement-by-movement.</p>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {data.scenes.map((scene, idx) => (
                <div key={scene.id} className="bg-slate-900 p-4 rounded border border-slate-700 relative group">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-indigo-400">Scene {idx + 1}</span>
                    <button onClick={() => removeScene(scene.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                  </div>
                  <textarea 
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" 
                    placeholder="What happens in this scene?"
                    value={scene.desc}
                    onChange={(e) => updateScene(scene.id, e.target.value)}
                  />
                </div>
              ))}
              {data.scenes.length === 0 && <div className="text-center text-slate-500 py-10">No scenes added yet.</div>}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Soundtrack Selection</h2>
            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-200 text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <strong>Warning:</strong> Anything not listed here will not be used. Any request to add songs after the draft is presented will be charged a rewrite fee.
              </div>
            </div>
            <textarea 
              className={`${INPUT_CLASS} h-64`}
              placeholder="List all desired songs, specific arrangements, or public domain works..." 
              value={data.songs} 
              onChange={e => setData({...data, songs: e.target.value})} 
            />
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-white">Agreement & Submission</h2>
             
             <div className="bg-slate-900 p-6 rounded border border-slate-700 space-y-4 text-slate-300">
                <h3 className="text-white font-bold text-lg border-b border-slate-700 pb-2">The Rewrite Policy</h3>
                <p>
                  I will work diligently to design the show to your wants and needs based on the information provided in this form. However, to maintain workflow and fairness:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white">
                  <li>Once you have agreed to the arrangements and signed below, the design is <strong>locked</strong>.</li>
                  <li>All subsequent rewrites will be charged at <strong>$100 per movement, per rewrite</strong>.</li>
                  <li>I will <strong>NOT</strong> accept pressure for immediate turnarounds on rewrites. They are handled in the order received.</li>
                  <li>Songs not listed in the previous step constitute a new design request.</li>
                </ul>
             </div>

             <div className="flex items-start space-x-3 p-4 bg-indigo-900/20 border border-indigo-500/50 rounded">
                <input 
                  type="checkbox" 
                  id="agree" 
                  className="mt-1 w-5 h-5" 
                  checked={data.signed} 
                  onChange={e => setData({...data, signed: e.target.checked})}
                />
                <label htmlFor="agree" className="text-sm cursor-pointer select-none">
                  <strong>I HAVE READ AND AGREE.</strong> I understand that my form submission acts as the foundational document for this project. I accept the fee structure for changes requested after the initial agreement is signed.
                </label>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <div>
            <h1 className="text-xl font-bold">{data.title || "New Show Design"}</h1>
            <span className="text-slate-400 text-sm">Step {step} of {totalSteps}</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">Exit</button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2">
          <div className="bg-indigo-600 h-2 transition-all duration-300" style={{width: `${(step/totalSteps)*100}%`}}></div>
        </div>

        {/* Body */}
        <div className="p-8 flex-grow">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-between bg-slate-900">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className={`flex items-center px-4 py-2 rounded ${step === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-200 hover:bg-slate-800'}`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </button>

          {step === totalSteps ? (
            <button 
              onClick={() => data.signed ? onSave(data) : alert("You must agree to the rewrite policy to submit.")}
              className={`flex items-center px-6 py-2 rounded font-bold transition ${data.signed ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            >
              <Save className="w-5 h-5 mr-2" /> Submit Design
            </button>
          ) : (
            <button 
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
            >
              Next Step <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
