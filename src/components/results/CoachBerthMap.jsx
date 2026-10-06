import React, { useState } from 'react';
import { buildCabinMap } from '../../services/vacancyParser';
import { getBerthTypeName } from '../../utils/station';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

/**
 * Berth type codes in real 2A coach:
 *   L = Lower, U = Upper, R = Side Lower, P = Side Upper
 * In 3A:
 *   LB = Lower, MB = Middle, UB = Upper, SL = Side Lower, SU = Side Upper
 * We map all to a friendly label + color.
 */
const BERTH_LABEL = {
  L:  { short: 'L',  full: 'Lower',      color: 'text-blue-700'  },
  U:  { short: 'U',  full: 'Upper',      color: 'text-slate-600' },
  R:  { short: 'R',  full: 'Side Lower', color: 'text-teal-700'  },
  P:  { short: 'P',  full: 'Side Upper', color: 'text-violet-700'},
  LB: { short: 'L',  full: 'Lower',      color: 'text-blue-700'  },
  MB: { short: 'M',  full: 'Middle',     color: 'text-amber-700' },
  UB: { short: 'U',  full: 'Upper',      color: 'text-slate-600' },
  SL: { short: 'SL', full: 'Side Lower', color: 'text-teal-700'  },
  SU: { short: 'SU', full: 'Side Upper', color: 'text-violet-700'},
};

function BerthCell({ berth }) {
  const meta = BERTH_LABEL[berth.berthCode] || { short: berth.berthCode, full: berth.berthCode, color: 'text-slate-600' };
  const isVacant   = berth.isVacantForJourney;
  const isEnabled  = berth.enable;

  return (
    <div
      title={`Berth ${berth.berthNo} (${meta.full}) — ${isVacant ? 'Vacant' : 'Occupied'}${isEnabled ? '' : ' · Not available at boarding station'}`}
      className={`
        flex flex-col items-center justify-center rounded border text-[11px] font-bold w-10 h-10 select-none cursor-default transition-all
        ${isVacant
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300'
          : isEnabled
            ? 'bg-white border-slate-300 text-slate-500'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }
      `}
    >
      <span className="text-[10px] leading-none font-mono">{berth.berthNo}</span>
      <span className={`text-[9px] leading-none mt-0.5 font-bold ${isVacant ? 'text-emerald-700' : 'text-slate-400'}`}>
        {meta.short}
      </span>
    </div>
  );
}

function CabinBlock({ cabinNo, berths }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-slate-500 font-medium mb-1.5 tracking-wide uppercase">
        Cabin {cabinNo}
      </span>
      <div className="border border-slate-200 rounded-md bg-white p-2 shadow-xs">
        <div className="grid grid-cols-2 gap-1.5">
          {berths.map(b => (
            <BerthCell key={b.berthNo} berth={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoachBerthMap({ coachName, bdd, classCode, boardingIdx, destinationIdx, stationMap }) {
  const [expanded, setExpanded] = useState(true);

  if (!bdd || bdd.length === 0) return null;

  const cabinMap = buildCabinMap(bdd, boardingIdx, destinationIdx, stationMap);
  const sortedCabins = [...cabinMap.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));

  const totalVacant = bdd.filter(b => {
    if (!b) return false;
    // Count berths that are vacant for this journey range
    const entry = sortedCabins.flatMap(([, bs]) => bs).find(x => x.berthNo === b.berthNo);
    return entry?.isVacantForJourney;
  }).length;

  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-900 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded text-sm">
            {coachName}
          </span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{classCode}</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs font-medium text-slate-600">{bdd.length} berths</span>
          {totalVacant > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded">
              {totalVacant} vacant for your journey
            </span>
          )}
        </div>
        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="text-slate-400 text-xs" />
      </button>

      {/* Berth Grid */}
      {expanded && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {sortedCabins.map(([cabinNo, berths]) => (
              <CabinBlock key={cabinNo} cabinNo={cabinNo} berths={berths} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-400 ring-1 ring-emerald-300"></div>
              <span>Vacant (covers your boarding→destination range)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
              <span>Not available at boarding stn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
