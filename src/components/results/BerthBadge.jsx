import React from 'react';
import { getBerthTypeName } from '../../utils/station';

export default function BerthBadge({ coach, berthNo, berthType, classCode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs font-mono">
      <span className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">
        {coach}
      </span>
      <span className="text-slate-400">·</span>
      <span className="font-bold text-slate-800">
        Berth {berthNo}
      </span>
      {berthType && (
        <>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-sans font-medium">
            {getBerthTypeName(berthType)}
          </span>
        </>
      )}
      {classCode && (
        <span className="ml-1 text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-sans font-bold">
          {classCode}
        </span>
      )}
    </div>
  );
}
