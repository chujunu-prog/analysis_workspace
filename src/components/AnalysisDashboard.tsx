import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { AnalysisReport } from '../types';
import { ShieldCheck, ShieldX, AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisDashboardProps {
  report: AnalysisReport;
}

export function AnalysisDashboard({ report }: AnalysisDashboardProps) {
  // Generate S-N curve data points
  const snData = Array.from({ length: 10 }, (_, i) => {
    const cycles = Math.pow(10, i + 1);
    const b = (Math.log10(report.material.fatigueLimit) - Math.log10(report.material.tensileStrength)) / 6;
    const stress = report.material.tensileStrength * Math.pow(cycles, b);
    return {
      cycles: cycles.toExponential(0),
      stress: Math.round(stress),
      limit: report.material.fatigueLimit,
      current: report.peakStress
    };
  });

  const getStatusInfo = () => {
    switch (report.status) {
      case 'Use-as-is':
        return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'Repair':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'Reject':
        return { icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div className={cn("rounded-xl border p-6 flex items-center justify-between", status.bg, status.border)}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full bg-white/10", status.color)}>
            <StatusIcon className="h-8 w-8" />
          </div>
          <div>
            <h3 className={cn("text-lg font-bold", status.color)}>
              System Verdict: {report.status}
            </h3>
            <p className="text-slate-400 text-sm">
              Based on Peterson's Stress Concentration and Miner's Cumulative Damage.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase tracking-wider">Remaining Life</div>
          <div className="text-3xl font-mono font-bold text-white">
            {report.remainingLifeDays.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-500">Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Stress Concentration (Kt)</div>
          <div className="text-2xl font-mono font-bold text-orange-500">{report.stressConcentrationFactor}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Peak Stress</div>
          <div className="text-2xl font-mono font-bold text-white">{report.peakStress} <span className="text-sm text-slate-500">MPa</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Cycles</div>
          <div className="text-2xl font-mono font-bold text-white">{report.remainingLifeCycles.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            S-N Curve (Fatigue Life)
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="cycles" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="stress" stroke="#3b82f6" strokeWidth={2} dot={false} name="Design Life" />
                <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Fatigue Limit" />
                <Line type="monotone" dataKey="current" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} name="Current State" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h4 className="text-white font-bold mb-6">Structural Degradation Projection</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snData}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="cycles" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="stress" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStress)" name="Strength Margin" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
