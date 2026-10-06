import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle, faTrain, faCalendarAlt, faBed } from '@fortawesome/free-solid-svg-icons';

export default function EmptyState({ results }) {
  const boardingName = results?.boardingStation?.name || results?.boardingStation?.code || 'Boarding Station';
  const destName = results?.destinationStation?.name || results?.destinationStation?.code || 'Destination Station';
  const cls = results?.searchedClass || 'selected class';

  // No coaches with vacant berths at all for this class
  if (results?.noVacancyInClass) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-8 text-center my-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faBed} className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          No vacant berths in {cls} on this train
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
          The prepared chart for train <strong className="font-mono text-slate-900">{results?.searchedTrainNo}</strong> shows <strong>0 vacant berths</strong> in class <strong>{cls}</strong>. All berths are occupied in every coach of this class.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-lg mx-auto text-xs text-blue-900 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-950 mb-2">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
            <span>Try instead:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Change class to <strong>ALL</strong> to check every class on this train.</li>
            <li>Try a different class (e.g. SL, 3A, 2A, 1A).</li>
            <li>Check a later date when chart preparation is complete.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-8 text-center my-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <FontAwesomeIcon icon={faBed} className="text-2xl" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">
        No complete vacant-berth combination found
      </h3>

      <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
        We inspected all available coaches on train <strong className="text-slate-900 font-mono">{results?.searchedTrainNo}</strong> for class <strong className="text-slate-900">{results?.searchedClass || 'selected class'}</strong>, but could not find a continuous single-berth or multi-segment combination from <strong>{boardingName}</strong> to <strong>{destName}</strong>.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-lg mx-auto text-xs text-blue-900 text-left space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-blue-950">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
          <span>Recommended next steps:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Try changing the travel class to <strong>ALL</strong> or another class (e.g. 2A, 3A, SL).</li>
          <li>Check a nearby major junction station along this train route.</li>
          <li>Verify if the chart has been prepared for this train date.</li>
        </ul>
      </div>
    </div>
  );
}
