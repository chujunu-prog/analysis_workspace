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

  // Reactive Analysis
  const report = useMemo<AnalysisReport>(() => {
    const Kt = calculateKt(geometry, defect);
    const cycles = calculateRemainingLife(material, load, Kt);
    const peakStress = load.value * Kt;
    const days = Math.round(cycles / load.cyclesPerDay);
    
    // Status Logic
    let status: AnalysisReport['status'] = 'Use-as-is';
    if (peakStress > material.tensileStrength * 0.8) status = 'Reject';
    else if (peakStress > material.tensileStrength * 0.5 || days < 365) status = 'Repair';

    return {
      id: 'active-session',
      createdAt: new Date().toISOString(),
      projectName: 'Live Analysis',
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
  }, [geometry, material, load, defect]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Analysis Workspace</h2>
          <p className="text-slate-400">Configure parameters for real-time local defect evaluation.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration (4 cols) */}
          <div className="xl:col-span-4 space-y-6">
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
              </div>
            </section>

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

            <button 
              onClick={() => {
                setGeometry(GeometryType.PLATE);
                setMaterial(MATERIALS[0]);
                setLoad({ type: 'Tension', value: 200, cyclesPerDay: 500 });
                setDefect({ type: DefectType.CRACK, x: 0, y: 0, z: 0, length: 5, width: 1, depth: 2 });
              }}
              className="w-full flex items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold uppercase tracking-wider"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Parameters
            </button>
          </div>

          {/* Right Column: Analysis Results (8 cols) */}
          <div className="xl:col-span-8">
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AnalysisDashboard report={report} />
            </motion.div>

            <div className="mt-8 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300 leading-relaxed">
                Live Data Link Active. Analysis updates automatically upon parameter adjustment. 
                Results based on theoretical stress concentration (Peterson's) and life prediction (Basquin's).
              </p>
            </div>
          </div>
        </div>
      </main>


      <footer className="mt-auto border-t border-slate-900 bg-slate-950/50 py-6 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
        &copy; 2026 Hanwha Aerospace - Maneuver Systems Division // Structural Integrity Unit // Project Safe-Maneuver
      </footer>
    </div>
  );
}
