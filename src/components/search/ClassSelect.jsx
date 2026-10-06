import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair } from '@fortawesome/free-solid-svg-icons';
import { CLASS_NAMES } from '../../utils/station';

export default function ClassSelect({ value, onChange, disabled }) {
  const options = [
    { code: 'ALL', label: 'All Classes' },
    { code: '1A', label: CLASS_NAMES['1A'] },
    { code: '2A', label: CLASS_NAMES['2A'] },
    { code: '3A', label: CLASS_NAMES['3A'] },
    { code: '3E', label: CLASS_NAMES['3E'] },
    { code: 'SL', label: CLASS_NAMES['SL'] }
  ];

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
        Travel Class
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <FontAwesomeIcon icon={faChair} className="text-slate-500" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 shadow-xs appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
