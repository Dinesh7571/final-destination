import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';

export default function SearchProgress({ progressMessage, step }) {
  const steps = [
    { num: 1, label: 'Fetching train chart metadata' },
    { num: 2, label: 'Filtering available coaches' },
    { num: 3, label: 'Inspecting coach berth occupancy' },
    { num: 4, label: 'Extracting vacant berth segments' },
    { num: 5, label: 'Computing optimal journey paths' }
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-xl" />
        <h3 className="text-base font-bold text-slate-800 m-0">
          {progressMessage || 'Analyzing Train Vacancy Data...'}
        </h3>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4">
        {steps.map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;

          return (
            <div
              key={s.num}
              className={`p-2.5 rounded-md border text-center text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {isDone ? (
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-xs" />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.num}
                  </span>
                )}
              </div>
              <div className="line-clamp-2 leading-tight">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
