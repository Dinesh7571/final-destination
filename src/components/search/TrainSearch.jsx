import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function TrainSearch({ trains, loadingTrains, selectedTrain, onSelectTrain }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTrains = React.useMemo(() => {
    if (!query.trim()) return trains.slice(0, 10);
    const q = query.toLowerCase().trim();
    return trains.filter(
      t => t.trainNo.toLowerCase().includes(q) || t.trainName.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [trains, query]);

  const handleSelect = (train) => {
    onSelectTrain(train);
    setQuery(`${train.trainNo} — ${train.trainName}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectTrain(null);
    setQuery('');
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
        Train Number / Name
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <FontAwesomeIcon icon={faTrain} />
        </div>

        <input
          type="text"
          value={selectedTrain ? `${selectedTrain.trainNo} — ${selectedTrain.trainName}` : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedTrain) onSelectTrain(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={loadingTrains ? "Loading train directory..." : "e.g. 12627 or Karnataka Express"}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
        />

        {loadingTrains ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
          </div>
        ) : selectedTrain ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear selection"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        ) : null}
      </div>

      {isOpen && !selectedTrain && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto py-1">
          {filteredTrains.length > 0 ? (
            filteredTrains.map((train) => (
              <button
                key={train.trainNo}
                type="button"
                onClick={() => handleSelect(train)}
                className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-blue-50 flex items-center justify-between border-b border-slate-100 last:border-none cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-blue-700 mr-2">{train.trainNo}</span>
                  <span className="font-medium">{train.trainName}</span>
                </div>
                {train.source && train.destination && (
                  <span className="text-xs text-slate-500 font-mono">
                    {train.source} → {train.destination}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-500 text-center">
              No matching train found. Enter train number manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
