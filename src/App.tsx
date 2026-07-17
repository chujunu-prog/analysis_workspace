/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Box, 
  Layers, 
  Activity, 
  ChevronRight, 
  Play,
  Save,
  RotateCcw,
  PlusCircle,
  Cpu,
  Database,
  Info
} from 'lucide-react';

import { 
  GeometryType, 
  DefectType, 
  Material, 
  LoadCondition, 
  Defect, 
  AnalysisReport 
} from './types';
import { MATERIALS } from './data/materials';
import { calculateKt, calculateRemainingLife } from './lib/analysis';
import { Header } from './components/Header';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { cn } from './lib/utils';

export default function App() {
  // State
  const [geometry, setGeometry] = useState<GeometryType>(GeometryType.PLATE);
  const [material, setMaterial] = useState<Material>(MATERIALS[0]);
  const [load, setLoad] = useState<LoadCondition>({ type: 'Tension', value: 200, cyclesPerDay: 500 });
  const [defect, setDefect] = useState<Defect>({
    type: DefectType.CRACK,
    x: 0, y: 0, z: 0,
    length: 5, width: 1, depth: 2
  });
  const [activeTab, setActiveTab] = useState<'setup' | 'results'>('setup');
  const [report, setReport] = useState<AnalysisReport | null>(null);

  // Analysis Trigger
  const handleRunAnalysis = () => {
    const Kt = calculateKt(geometry, defect);
    const cycles = calculateRemainingLife(material, load, Kt);
    const peakStress = load.value * Kt;
    const days = Math.round(cycles / load.cyclesPerDay);
    
    // Status Logic
    let status: AnalysisReport['status'] = 'Use-as-is';
    if (peakStress > material.tensileStrength * 0.8) status = 'Reject';
    else if (peakStress > material.tensileStrength * 0.5 || days < 365) status = 'Repair';

    const newReport: AnalysisReport = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      projectName: 'Prototype Analysis',
      geometry,
      material,
      load,
      defect,
      stressConcentrationFactor: Kt,
      peakStress,
      remainingLifeCycles: cycles,
      remainingLifeDays: days,
      status
    };

    setReport(newReport);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis Workspace</h2>
            <p className="text-slate-400">Configure parameters for local defect evaluation.</p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('setup')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'setup' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Configuration
            </button>
            <button 
              onClick={() => report && setActiveTab('results')}
              disabled={!report}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'results' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200",
                !report && "opacity-50 cursor-not-allowed"
              )}
            >
              Analysis Results
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Geometry & Material */}
              <div className="space-y-6">
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Box className="h-4 w-4 text-orange-500" />
                    Base Geometry
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(GeometryType).map((type) => (
                      <button
                        key={type}
                        onClick={() => setGeometry(type)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2",
                          geometry === type 
                            ? "bg-orange-500/10 border-orange-500 text-orange-500" 
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                        <Layers className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">{type}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    Material Selection
                  </h3>
                  <div className="space-y-3">
                    {MATERIALS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMaterial(m)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border transition-all",
                          material.id === m.id
                            ? "bg-blue-500/10 border-blue-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-bold text-sm", material.id === m.id ? "text-blue-400" : "text-slate-300")}>
                            {m.name}
                          </span>
                          {material.id === m.id && <ChevronRight className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                          <span>E: {m.elasticModulus} GPa</span>
                          <span>Su: {m.tensileStrength} MPa</span>
                        </div>
                      </button>
                    ))}
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all text-xs font-medium">
                      <PlusCircle className="h-3 w-3" />
                      Add Custom Material
                    </button>
                  </div>
                </section>
              </div>

              {/* Middle Column: Load & Defect */}
              <div className="space-y-6">
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Load Conditions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Nominal Stress (MPa)</label>
                      <input 
                        type="range" min="10" max="800" step="10"
                        value={load.value}
                        onChange={(e) => setLoad({ ...load, value: Number(e.target.value) })}
                        className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                      />
                      <div className="flex justify-between mt-2 font-mono text-sm">
                        <span className="text-slate-500">10</span>
                        <span className="text-emerald-400 font-bold">{load.value} MPa</span>
                        <span className="text-slate-500">800</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Cycles Per Day</label>
                      <input 
                        type="number"
                        value={load.cyclesPerDay}
                        onChange={(e) => setLoad({ ...load, cyclesPerDay: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-red-500" />
                    Defect Parameters
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Defect Type</label>
                      <select 
                        value={defect.type}
                        onChange={(e) => setDefect({ ...defect, type: e.target.value as DefectType })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      >
                        {Object.values(DefectType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase text-center">Length (mm)</label>
                        <input 
                          type="number" value={defect.length}
                          onChange={(e) => setDefect({ ...defect, length: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-center focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase text-center">Width (mm)</label>
                        <input 
                          type="number" value={defect.width}
                          onChange={(e) => setDefect({ ...defect, width: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-center focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase text-center">Depth (mm)</label>
                        <input 
                          type="number" value={defect.depth}
                          onChange={(e) => setDefect({ ...defect, depth: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-center focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="space-y-6">
                <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Cpu className="h-24 w-24" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Execution Summary</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Geometry</span>
                      <span className="text-white font-mono">{geometry}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Material</span>
                      <span className="text-white font-mono">{material.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Load Factor</span>
                      <span className="text-white font-mono">{load.value} MPa</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Defect Intensity</span>
                      <span className="text-red-400 font-mono font-bold">{defect.length}mm {defect.type}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleRunAnalysis}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      RUN STRUCTURAL ANALYSIS
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-sm font-medium">
                        <Save className="h-4 w-4" />
                        Save Draft
                      </button>
                      <button 
                        onClick={() => {
                          setGeometry(GeometryType.PLATE);
                          setMaterial(MATERIALS[0]);
                          setLoad({ type: 'Tension', value: 200, cyclesPerDay: 500 });
                          setDefect({ type: DefectType.CRACK, x: 0, y: 0, z: 0, length: 5, width: 1, depth: 2 });
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-sm font-medium"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                </section>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    This tool uses theoretical stress concentration formulas and Basquin's equation for life prediction. Always cross-verify critical components with full FEA models.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              {report && <AnalysisDashboard report={report} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-slate-900 bg-slate-950/50 py-6 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
        &copy; 2026 Hanwha Aerospace - Maneuver Systems Division // Structural Integrity Unit // Project Safe-Maneuver
      </footer>
    </div>
  );
}
