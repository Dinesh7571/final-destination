import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { formatStationLabel } from '../../utils/station';

export function BoardingStationSelect({ schedule, value, onChange, disabled }) {
  // Only stations where boarding is allowed (excluding the very last terminal station)
  const validBoardingStations = React.useMemo(() => {
    if (!Array.isArray(schedule) || schedule.length === 0) return [];
    return schedule.slice(0, schedule.length - 1).filter(stn => stn.boardingAllowed !== false);
  }, [schedule]);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
        Boarding Station
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || validBoardingStations.length === 0}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 shadow-xs appearance-none cursor-pointer"
        >
          <option value="">-- Select Boarding Station --</option>
          {validBoardingStations.map((stn) => (
            <option key={stn.code} value={stn.code}>
              {stn.index + 1}. {formatStationLabel(stn)} ({stn.departure !== '--:--' ? `Dep: ${stn.departure}` : 'Start'})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DestinationStationSelect({ schedule, boardingCode, value, onChange, disabled }) {
  // Destination station MUST occur AFTER the boarding station on the route!
  const validDestinations = React.useMemo(() => {
    if (!Array.isArray(schedule) || schedule.length === 0) return [];
    if (!boardingCode) return schedule.slice(1);

    const boardingStn = schedule.find(s => s.code === boardingCode);
    if (!boardingStn) return schedule.slice(1);

    return schedule.filter(stn => stn.index > boardingStn.index);
  }, [schedule, boardingCode]);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
        Destination Station
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <FontAwesomeIcon icon={faLocationDot} className="text-emerald-600" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || validDestinations.length === 0}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 shadow-xs appearance-none cursor-pointer"
        >
          <option value="">-- Select Destination --</option>
          {validDestinations.map((stn) => (
            <option key={stn.code} value={stn.code}>
              {stn.index + 1}. {formatStationLabel(stn)} ({stn.arrival !== '--:--' ? `Arr: ${stn.arrival}` : 'End'})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
