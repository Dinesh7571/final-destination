import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faTrain, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import CoachBerthMap from './CoachBerthMap';

export default function CoachBerthMapSection({ results }) {
  const coachBddMap = results?.coachBddMap;
  if (!coachBddMap || Object.keys(coachBddMap).length === 0) return null;

  const coachNames = Object.keys(coachBddMap);
  const [activeCoach, setActiveCoach] = useState(coachNames[0]);

  const currentCoachData = coachBddMap[activeCoach] || coachBddMap[coachNames[0]];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTh} className="text-blue-400 text-sm" />
          <h3 className="text-sm font-bold tracking-wide uppercase m-0">
            Coach Berth Layout & Chart Visualizer
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Inspecting {coachNames.length} coach{coachNames.length > 1 ? 'es' : ''} with vacancies
        </span>
      </div>

      {/* Coach Selection Tabs */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
          Select Coach:
        </span>
        {coachNames.map(name => {
          const cData = coachBddMap[name];
          const isSelected = activeCoach === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setActiveCoach(name)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-700 text-white shadow-xs font-bold ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <FontAwesomeIcon icon={faTrain} className={isSelected ? 'text-blue-200' : 'text-slate-400'} />
              <span>{name}</span>
              {cData?.classCode && (
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cData.classCode}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Coach Map */}
      <div className="p-4">
        {currentCoachData && (
          <CoachBerthMap
            coachName={activeCoach}
            bdd={currentCoachData.bdd}
            classCode={currentCoachData.classCode}
            boardingIdx={results.boardingStation?.index}
            destinationIdx={results.destinationStation?.index}
            stationMap={results.stationMap}
          />
        )}
      </div>
    </div>
  );
}
