import React from 'react';
import BerthBadge from './BerthBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function JourneySegment({ segment, index }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-sans">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div>
          <span className="font-bold text-slate-900">{segment.travelFromName || segment.travelFromCode}</span>
          <FontAwesomeIcon icon={faArrowRight} className="mx-2 text-slate-400 text-[10px]" />
          <span className="font-bold text-slate-900">{segment.travelToName || segment.travelToCode}</span>
          {segment.distance > 0 && (
            <span className="ml-2 text-slate-500 font-mono">({segment.distance} km)</span>
          )}
        </div>
      </div>

      <BerthBadge
        coach={segment.coach}
        berthNo={segment.berthNo}
        berthType={segment.berthType}
        classCode={segment.classCode}
      />
    </div>
  );
}
