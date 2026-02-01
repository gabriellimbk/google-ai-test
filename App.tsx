
import React, { useState, useMemo, useEffect } from 'react';
import { SALTS, MOLAR_MASSES } from './constants';
import { SimulationState, CalculationResult, ChatMessage } from './types';
import BeakerSimulation from './components/BeakerSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FlaskConical, BookOpen, Calculator, MessageSquare, Info, RefreshCw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const AI_TUTOR_ENABLED = false;
  const [state, setState] = useState<SimulationState>({
    selectedSalt: SALTS[0],
    volumeL: 1.0,
    addedMassMg: 10,
    commonIonCation: 0,
    commonIonAnion: 0
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Solubility Equilibrium tutor. Ask me anything about Ksp, precipitation, or the common ion effect.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const results = useMemo((): CalculationResult => {
    const salt = state.selectedSalt;
    const molarMass = MOLAR_MASSES[salt.formula];
    const totalMolesAdded = (state.addedMassMg / 1000) / molarMass;
    
    // Initial molar concentrations if fully dissolved
    const [coeffCation, coeffAnion] = salt.stoichiometry;
    
    // Solubility calculation (Simplified assuming ideal behavior)
    // We solve for 's' where (coeffCation*s + commonCation)^coeffCation * (coeffAnion*s + commonAnion)^coeffAnion = Ksp
    // For simplicity, we'll use an iterative approach or handle common cases (1:1, 1:2)
    
    let solubility = 0;
    // Basic solver for molar solubility s
    if (coeffCation === 1 && coeffAnion === 1) {
      // (s + c1) * (s + c2) = Ksp
      // s^2 + (c1+c2)s + (c1c2 - Ksp) = 0
      const c1 = state.commonIonCation;
      const c2 = state.commonIonAnion;
      const b = c1 + c2;
      const c = (c1 * c2) - salt.ksp;
      solubility = (-b + Math.sqrt(b * b - 4 * c)) / 2;
    } else {
      // Simple approximation for non 1:1 if common ions are 0
      if (state.commonIonAnion === 0 && state.commonIonCation === 0) {
        solubility = Math.pow(salt.ksp / (Math.pow(coeffCation, coeffCation) * Math.pow(coeffAnion, coeffAnion)), 1 / (coeffCation + coeffAnion));
      } else {
        // Fallback or more complex solver needed - here we use zero common ion approximation for non 1:1 
        solubility = Math.pow(salt.ksp / (Math.pow(coeffCation, coeffCation) * Math.pow(coeffAnion, coeffAnion)), 1 / (coeffCation + coeffAnion));
      }
    }

    const maxMolesDissolvable = solubility * state.volumeL;
    const dissolvedMoles = Math.min(totalMolesAdded, maxMolesDissolvable);
    const precipitatedMoles = Math.max(0, totalMolesAdded - maxMolesDissolvable);
    
    const cationConc = (dissolvedMoles * coeffCation / state.volumeL) + state.commonIonCation;
    const anionConc = (dissolvedMoles * coeffAnion / state.volumeL) + state.commonIonAnion;
    
    const qsp = Math.pow(cationConc, coeffCation) * Math.pow(anionConc, coeffAnion);
    const isSaturated = qsp >= salt.ksp * 0.99; // Floating point buffer

    return {
      dissolvedMoles,
      precipitatedMoles,
      cationConc,
      anionConc,
      qsp,
      isSaturated
    };
  }, [state]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessage: ChatMessage = { role: 'user', text: userInput };
    setChatHistory(prev => [...prev, newMessage]);
    setUserInput('');
    setIsTyping(true);

    if (!AI_TUTOR_ENABLED) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'AI tutor is disabled for this GitHub Pages deployment.' }]);
      setIsTyping(false);
      return;
    }

    const context = `The student is looking at ${state.selectedSalt.name} (${state.selectedSalt.formula}). Current Volume: ${state.volumeL}L. Added Mass: ${state.addedMassMg}mg. Ksp: ${state.selectedSalt.ksp}. Result: ${results.isSaturated ? 'Saturated' : 'Unsaturated'}. Cation Conc: ${results.cationConc.toExponential(2)}M. Anion Conc: ${results.anionConc.toExponential(2)}M.`;
    
    try {
      const response = await import('./services/geminiService').then((mod) => mod.getTutorResponse(userInput, context));
      setChatHistory(prev => [...prev, { role: 'model', text: response || 'Sorry, I encountered an error.' }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Error connecting to the AI tutor. Please check your API key.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">EquiliSolve <span className="text-blue-500 font-medium text-sm">v1.0</span></h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <button className="hover:text-blue-600 flex items-center gap-1"><BookOpen size={16}/> Theory</button>
          <button className="hover:text-blue-600 flex items-center gap-1"><Calculator size={16}/> Calculator</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">Grade 12 Mode</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Simulation */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Info size={20} className="text-blue-500"/> Virtual Laboratory</h2>
              <button 
                onClick={() => setState({...state, addedMassMg: 0})}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Select Insoluble Salt</label>
                  <select 
                    className="w-full p-3 bg-slate-100 rounded-xl border border-transparent focus:border-blue-500 transition outline-none"
                    value={state.selectedSalt.id}
                    onChange={(e) => setState({...state, selectedSalt: SALTS.find(s => s.id === e.target.value)!})}
                  >
                    {SALTS.map(salt => (
                      <option key={salt.id} value={salt.id}>{salt.name} ({salt.formula})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Volume of Water: {state.volumeL} L</label>
                  <input 
                    type="range" min="0.1" max="5.0" step="0.1" 
                    className="w-full accent-blue-600"
                    value={state.volumeL}
                    onChange={(e) => setState({...state, volumeL: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Add Solid: {state.addedMassMg} mg</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" min="0" max="500" step="5" 
                      className="w-full accent-blue-600"
                      value={state.addedMassMg}
                      onChange={(e) => setState({...state, addedMassMg: parseFloat(e.target.value)})}
                    />
                    <button 
                      onClick={() => setState({...state, addedMassMg: Math.min(state.addedMassMg + 50, 1000)})}
                      className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-bold"
                    >+50mg</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Common Ion Effect</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{state.selectedSalt.cations} (M)</label>
                      <input 
                        type="number" step="0.001"
                        className="w-full p-2 text-sm bg-slate-50 rounded-lg border border-slate-200"
                        value={state.commonIonCation}
                        onChange={(e) => setState({...state, commonIonCation: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{state.selectedSalt.anions} (M)</label>
                      <input 
                        type="number" step="0.001"
                        className="w-full p-2 text-sm bg-slate-50 rounded-lg border border-slate-200"
                        value={state.commonIonAnion}
                        onChange={(e) => setState({...state, commonIonAnion: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Simulation */}
              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <BeakerSimulation salt={state.selectedSalt} result={results} />
                
                <div className={`mt-4 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${results.isSaturated ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {results.isSaturated ? <AlertCircle size={16}/> : <RefreshCw size={16} className="animate-spin-slow"/>}
                  {results.isSaturated ? 'Saturated Solution' : 'Unsaturated Solution'}
                </div>
              </div>
            </div>
          </div>

          {/* Data Readout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Qsp Value</span>
              <span className="text-2xl font-mono font-bold text-blue-600">{results.qsp.toExponential(3)}</span>
              <span className="text-[10px] text-slate-400 mt-1 italic">Ksp = {state.selectedSalt.ksp.toExponential(2)}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Molar Solubility</span>
              <span className="text-2xl font-mono font-bold text-slate-800">
                {(results.dissolvedMoles / state.volumeL).toExponential(3)} M
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Precipitate Mass</span>
              <span className="text-2xl font-mono font-bold text-slate-800">
                {(results.precipitatedMoles * MOLAR_MASSES[state.selectedSalt.formula] * 1000).toFixed(1)} mg
              </span>
            </div>
          </div>

          {/* Educational Formula Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen size={20}/> Equilibrium Expression
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-xl math-font bg-white/10 p-4 rounded-xl backdrop-blur-md">
                {state.selectedSalt.formula} (s) ⇌ {state.selectedSalt.stoichiometry[0] > 1 ? state.selectedSalt.stoichiometry[0] : ''}{state.selectedSalt.cations} (aq) + {state.selectedSalt.stoichiometry[1] > 1 ? state.selectedSalt.stoichiometry[1] : ''}{state.selectedSalt.anions} (aq)
              </div>
              <div className="text-xl math-font bg-white/10 p-4 rounded-xl backdrop-blur-md">
                K<sub>sp</sub> = [{state.selectedSalt.cations}]<sup>{state.selectedSalt.stoichiometry[0]}</sup>[{state.selectedSalt.anions}]<sup>{state.selectedSalt.stoichiometry[1]}</sup>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Tutor Chat */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-140px)] sticky top-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <MessageSquare className="text-blue-500" size={20}/>
              <h2 className="font-bold text-slate-700">AI Chemistry Tutor</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <MessageSquare size={18}/>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">Powered by Gemini AI • Grade 12 Curriculum Guided</p>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 p-4 text-center text-slate-400 text-xs">
        &copy; 2024 EquiliSolve Interactive • Designed for Educational Excellence
      </footer>
    </div>
  );
};

export default App;
