import { ShieldAlert, Info, Database, History } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Safe-Maneuver</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Structural Integrity Unit
            </p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <Database className="h-4 w-4" />
            Materials
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <History className="h-4 w-4" />
            History
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <Info className="h-4 w-4" />
            Docs
          </button>
        </nav>
      </div>
    </header>
  );
}
