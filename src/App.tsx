import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Ruler, 
  History, 
  Settings, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Download,
  Info,
  Maximize2,
  Triangle as TriangleIcon,
  Square,
  Circle as CircleIcon,
  LayoutGrid
} from 'lucide-react';
import { calculateRegionalUnits, type CalculationResult } from './types';

type Tab = 'calculate' | 'history' | 'converter' | 'settings';
type Shape = 'rectangle' | 'triangle' | 'circle' | 'quadrilateral';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculate');
  const [activeShape, setActiveShape] = useState<Shape>('rectangle');
  const [marlaSize, setMarlaSize] = useState<number>(272.25);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  
  // Rectangle state
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  
  // Triangle state
  const [sideA, setSideA] = useState<string>('');
  const [sideB, setSideB] = useState<string>('');
  const [sideC, setSideC] = useState<string>('');

  // Circle state
  const [radius, setRadius] = useState<string>('');

  // Quadrilateral state (Irregular - 4 sides + 1 diagonal)
  const [qSideA, setQSideA] = useState<string>('');
  const [qSideB, setQSideB] = useState<string>('');
  const [qSideC, setQSideC] = useState<string>('');
  const [qSideD, setQSideD] = useState<string>('');
  const [qDiagonal, setQDiagonal] = useState<string>('');

  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('paimaish_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedMarla = localStorage.getItem('paimaish_marla_size');
    if (savedMarla) setMarlaSize(parseFloat(savedMarla));
  }, []);

  useEffect(() => {
    localStorage.setItem('paimaish_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('paimaish_marla_size', marlaSize.toString());
  }, [marlaSize]);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const calculateArea = (): number => {
    switch (activeShape) {
      case 'rectangle':
        return (parseFloat(length) || 0) * (parseFloat(width) || 0);
      case 'triangle': {
        const a = parseFloat(sideA) || 0;
        const b = parseFloat(sideB) || 0;
        const c = parseFloat(sideC) || 0;
        if (a + b <= c || a + c <= b || b + c <= a) return 0;
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
      }
      case 'circle':
        return Math.PI * Math.pow(parseFloat(radius) || 0, 2);
      case 'quadrilateral': {
        const a = parseFloat(qSideA) || 0;
        const b = parseFloat(qSideB) || 0;
        const c = parseFloat(qSideC) || 0;
        const d = parseFloat(qSideD) || 0;
        const diag = parseFloat(qDiagonal) || 0;
        
        // Split into two triangles: (a, b, diag) and (c, d, diag)
        const calcTriangleArea = (x: number, y: number, z: number) => {
          if (x + y <= z || x + z <= y || y + z <= x) return 0;
          const s = (x + y + z) / 2;
          return Math.sqrt(s * (s - x) * (s - y) * (s - z));
        };
        
        return calcTriangleArea(a, b, diag) + calcTriangleArea(c, d, diag);
      }
      default:
        return 0;
    }
  };

  const currentArea = useMemo(() => calculateArea(), [
    activeShape, length, width, sideA, sideB, sideC, radius, 
    qSideA, qSideB, qSideC, qSideD, qDiagonal
  ]);

  const regionalUnits = useMemo(() => calculateRegionalUnits(currentArea, marlaSize), [currentArea, marlaSize]);

  const handleSave = () => {
    if (currentArea <= 0) return;
    
    const newEntry: CalculationResult = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: label || `Measurement ${history.length + 1}`,
      shape: activeShape === 'quadrilateral' ? 'irregular' : activeShape,
      measurements: {},
      totalSqFt: currentArea,
      units: {
        kanal: regionalUnits.kanal,
        marla: regionalUnits.marla,
        sqft: regionalUnits.sqft
      }
    };

    setHistory([newEntry, ...history]);
    setLabel('');
    // Clear inputs would be too aggressive, maybe just show a successtoast
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Ruler className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-indigo-900">Paimaish Pro</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <SidebarLink 
            icon={<Calculator size={20} />} 
            label="Calculator" 
            active={activeTab === 'calculate'} 
            onClick={() => setActiveTab('calculate')} 
          />
          <SidebarLink 
            icon={<History size={20} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <SidebarLink 
            icon={<LayoutGrid size={20} />} 
            label="Converter" 
            active={activeTab === 'converter'} 
            onClick={() => setActiveTab('converter')} 
          />
          <SidebarLink 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="mt-auto p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-xs text-indigo-700">
          "Accurate land measurements at your fingertips."
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        {/* Header - Mobile */}
        <header className="md:hidden flex items-center justify-between mb-8 px-2">
           <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Ruler className="text-white w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight text-indigo-900">Paimaish Pro</h1>
          </div>
          <button onClick={() => setActiveTab('settings')} className="p-2 text-slate-500 hover:text-indigo-600">
            <Settings size={20} />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'calculate' && (
            <motion.div 
              key="calculate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <header className="mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Land Calculator</h2>
                <p className="text-slate-500">Select a shape and enter measurements to calculate area.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Input & Shape Selection */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shape Switcher */}
                  <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-1 overflow-x-auto no-scrollbar">
                    <ShapeTab active={activeShape === 'rectangle'} onClick={() => setActiveShape('rectangle')} icon={<Square size={18} />} label="Rectangle" />
                    <ShapeTab active={activeShape === 'triangle'} onClick={() => setActiveShape('triangle')} icon={<TriangleIcon size={18} />} label="Triangle" />
                    <ShapeTab active={activeShape === 'quadrilateral'} onClick={() => setActiveShape('quadrilateral')} icon={<Maximize2 size={18} />} label="Irregular" />
                    <ShapeTab active={activeShape === 'circle'} onClick={() => setActiveShape('circle')} icon={<CircleIcon size={18} />} label="Circle" />
                  </div>

                  {/* Inputs */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeShape === 'rectangle' && (
                        <>
                          <InputGroup label="Length (ft)" value={length} onChange={setLength} placeholder="0.00" />
                          <InputGroup label="Width (ft)" value={width} onChange={setWidth} placeholder="0.00" />
                        </>
                      )}
                      {activeShape === 'triangle' && (
                        <>
                          <InputGroup label="Side A (ft)" value={sideA} onChange={setSideA} placeholder="0.00" />
                          <InputGroup label="Side B (ft)" value={sideB} onChange={setSideB} placeholder="0.00" />
                          <InputGroup label="Side C (ft)" value={sideC} onChange={setSideC} placeholder="0.00" />
                        </>
                      )}
                      {activeShape === 'circle' && (
                        <InputGroup label="Radius (ft)" value={radius} onChange={setRadius} placeholder="0.00" />
                      )}
                      {activeShape === 'quadrilateral' && (
                        <>
                          <InputGroup label="Side A (ft)" value={qSideA} onChange={setQSideA} placeholder="0.00" />
                          <InputGroup label="Side B (ft)" value={qSideB} onChange={setQSideB} placeholder="0.00" />
                          <InputGroup label="Side C (ft)" value={qSideC} onChange={setQSideC} placeholder="0.00" />
                          <InputGroup label="Side D (ft)" value={qSideD} onChange={setQSideD} placeholder="0.00" />
                          <div className="md:col-span-2">
                            <InputGroup label="Diagonal (ft)" value={qDiagonal} onChange={setQDiagonal} placeholder="Distance between opposite corners" />
                            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                              <Info size={12} />
                              For irregular plots, measure 4 sides and any one diagonal.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50">
                      <InputGroup 
                        label="Label / Plot Name (Optional)" 
                        value={label} 
                        onChange={setLabel} 
                        placeholder="e.g. Street 4, Plot 12" 
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Results Display */}
                <div className="space-y-6">
                  <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-2xl"></div>
                    
                    <h3 className="text-indigo-200 text-sm font-medium mb-4 uppercase tracking-wider">Total Area</h3>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-display font-bold">{currentArea.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      <span className="text-indigo-300 font-medium">sq.ft</span>
                    </div>

                    <div className="space-y-4">
                      <ResultRow label="Kanal" value={regionalUnits.kanal} />
                      <ResultRow label="Marla" value={regionalUnits.marla} />
                      <ResultRow label="Sq Feet" value={regionalUnits.sqft} />
                      <div className="pt-4 mt-2 border-t border-indigo-800">
                        <ResultRow label="Total Marla" value={regionalUnits.totalMarla} highlight />
                      </div>
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={currentArea <= 0}
                      className="w-full mt-8 bg-white text-indigo-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <Plus className="group-hover:scale-110 transition-transform" />
                      Save to History
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Info className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Unit Note</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Currently using 1 Marla = {marlaSize} sq.ft. You can change this in settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">History</h2>
                  <p className="text-slate-500">View and manage your saved calculations.</p>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold text-sm py-2 px-4 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No history yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Your saved calculations will appear here. Start by measuring some land!
                  </p>
                  <button 
                    onClick={() => setActiveTab('calculate')}
                    className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Go to Calculator
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {history.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow group"
                    >
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {item.shape === 'rectangle' ? <Square size={18} /> : 
                             item.shape === 'triangle' ? <TriangleIcon size={18} /> : 
                             item.shape === 'circle' ? <CircleIcon size={18} /> : <Maximize2 size={18} />}
                          </span>
                          <h4 className="font-bold text-slate-800 text-lg">{item.label}</h4>
                        </div>
                        <div className="text-slate-400 text-xs flex items-center gap-4">
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                          <span className="uppercase tracking-wider font-semibold">{item.shape}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-display font-bold text-2xl text-slate-800">{item.totalSqFt.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq.ft</span></div>
                          <div className="text-indigo-600 font-semibold text-sm">
                            {item.units.kanal}k {item.units.marla}m {item.units.sqft}s
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'converter' && (
             <motion.div 
              key="converter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
               <header className="mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Unit Converter</h2>
                <p className="text-slate-500">Quickly convert between different land measurement units.</p>
              </header>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                 <ConverterTool marlaSize={marlaSize} />
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
               <header className="mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Settings</h2>
                <p className="text-slate-500">Customize regional units and calculation preferences.</p>
              </header>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Ruler size={20} className="text-indigo-600" />
                    Land Unit Definition
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Square Feet per Marla</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <PresetButton active={marlaSize === 272.25} onClick={() => setMarlaSize(272.25)} label="272.25" sub="Standard" />
                      <PresetButton active={marlaSize === 225} onClick={() => setMarlaSize(225)} label="225" sub="Punjab/Lahore" />
                      <PresetButton active={marlaSize === 250} onClick={() => setMarlaSize(250)} label="250" sub="Universal" />
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-50">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Value</label>
                      <div className="flex gap-4">
                        <input 
                          type="number" 
                          value={marlaSize}
                          onChange={(e) => setMarlaSize(parseFloat(e.target.value) || 0)}
                          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                        <div className="bg-slate-100 border border-slate-200 rounded-xl flex items-center px-6 font-semibold text-slate-500">ft²</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Download size={20} className="text-indigo-600" />
                    Data Management
                  </h3>
                  <div className="flex flex-col gap-4">
                    <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-700">Export History (CSV)</span>
                      <ChevronRight size={20} className="text-slate-400" />
                    </button>
                    <button onClick={clearHistory} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors text-red-600">
                      <span className="font-medium">Clear All Saved Data</span>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-20 pb-safe shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
        <MobileNavLink icon={<Calculator size={20} />} label="Calc" active={activeTab === 'calculate'} onClick={() => setActiveTab('calculate')} />
        <MobileNavLink icon={<History size={20} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <MobileNavLink icon={<LayoutGrid size={20} />} label="Convert" active={activeTab === 'converter'} onClick={() => setActiveTab('converter')} />
        <MobileNavLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
}

// Subcomponents
function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-60" />}
    </button>
  );
}

function MobileNavLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
      <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-50' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ShapeTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all font-semibold ${
        active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner-sm"
      />
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string, value: number, highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${highlight ? 'text-indigo-50' : 'opacity-80'}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className={`${highlight ? 'text-2xl font-display font-bold' : 'font-semibold'}`}>
        {value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </span>
    </div>
  );
}

function PresetButton({ active, onClick, label, sub }: { active: boolean, onClick: () => void, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all text-left ${
        active 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
      }`}
    >
      <div className="font-bold text-lg">{label}</div>
      <div className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${active ? 'text-indigo-200' : 'text-slate-400'}`}>{sub}</div>
    </button>
  );
}

function ConverterTool({ marlaSize }: { marlaSize: number }) {
  const [amount, setAmount] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<'sqft' | 'marla' | 'kanal' | 'acre'>('sqft');
  
  const toSqFt = useMemo(() => {
    const val = parseFloat(amount) || 0;
    switch (fromUnit) {
      case 'sqft': return val;
      case 'marla': return val * marlaSize;
      case 'kanal': return val * 20 * marlaSize;
      case 'acre': return val * 8 * 20 * marlaSize;
    }
  }, [amount, fromUnit, marlaSize]);

  const units = useMemo(() => {
    return {
      sqft: toSqFt,
      marla: toSqFt / marlaSize,
      kanal: toSqFt / (20 * marlaSize),
      acre: toSqFt / (8 * 20 * marlaSize),
      gaj: toSqFt / 9 // Yard
    };
  }, [toSqFt, marlaSize]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <InputGroup label="Amount" value={amount} onChange={setAmount} placeholder="Enter value..." />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 ml-1">From Unit</label>
          <select 
            value={fromUnit} 
            onChange={(e) => setFromUnit(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner-sm appearance-none"
          >
            <option value="sqft">Square Feet</option>
            <option value="marla">Marla</option>
            <option value="kanal">Kanal</option>
            <option value="acre">Acre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <ConvertResult label="Sq Feet" value={units.sqft} unit="ft²" />
        <ConvertResult label="Sq Yards" value={units.gaj} unit="Gaj" />
        <ConvertResult label="Marla" value={units.marla} unit="m" />
        <ConvertResult label="Kanal" value={units.kanal} unit="k" />
        <ConvertResult label="Acre" value={units.acre} unit="ac" />
      </div>
    </div>
  );
}

function ConvertResult({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-display font-bold text-xl text-indigo-900 truncate">
        {value.toLocaleString(undefined, { maximumFractionDigits: 3 })}
      </div>
      <div className="text-[10px] text-slate-400 font-medium">approx {unit}</div>
    </div>
  );
}
