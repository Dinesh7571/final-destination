import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faRoute, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function Header({ isCorsBlocked }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
            <FontAwesomeIcon icon={faTrain} className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-tight">
                RailBerth Finder
              </h1>
              <span className="text-xs bg-blue-900/80 text-blue-200 border border-blue-700/60 px-2 py-0.5 rounded font-mono font-medium">
                Chart Vacancy Analyzer
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Indian Railways Prepared-Chart Multi-Segment & Alternative Route Finder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-md">
            <FontAwesomeIcon icon={faRoute} className="text-emerald-400" />
            <span>Live Railway Chart Mode</span>
          </span>
        </div>
      </div>
    </header>
  );
}
