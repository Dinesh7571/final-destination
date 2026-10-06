import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendarAlt, faSpinner, faTrain, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import TrainSearch from './TrainSearch';
import { BoardingStationSelect, DestinationStationSelect } from './StationSelect';
import ClassSelect from './ClassSelect';
import { getDefaultJourneyDate, getMinChartDate, getMaxChartDate, formatDateToISO } from '../../utils/date';

export default function JourneySearchForm({
  trains,
  loadingTrains,
  selectedTrain,
  onSelectTrain,
  schedule,
  loadingSchedule,
  onSearch,
  isSearching
}) {
  const [jDate, setJDate] = useState(getDefaultJourneyDate());
  const [boardingCode, setBoardingCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [formError, setFormError] = useState('');

  // Automatically select sensible default stations when train schedule loads
  useEffect(() => {
    if (Array.isArray(schedule) && schedule.length >= 2) {
      // Default boarding = 1st station or origin
      setBoardingCode(schedule[0].code);
      // Default destination = last station or terminal
      setDestinationCode(schedule[schedule.length - 1].code);
      setFormError('');
    } else {
      setBoardingCode('');
      setDestinationCode('');
    }
  }, [schedule]);

  const handleSwapStations = () => {
    if (!boardingCode || !destinationCode) return;
    const bStn = schedule.find(s => s.code === boardingCode);
    const dStn = schedule.find(s => s.code === destinationCode);

    if (bStn && dStn && bStn.index > dStn.index) {
      setBoardingCode(destinationCode);
      setDestinationCode(boardingCode);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTrain) {
      setFormError('Please select a train first.');
      return;
    }
    if (!boardingCode) {
      setFormError('Please select a boarding station.');
      return;
    }
    if (!destinationCode) {
      setFormError('Please select a destination station.');
      return;
    }
    if (boardingCode === destinationCode) {
      setFormError('Boarding and destination stations cannot be the same.');
      return;
    }

    onSearch({
      trainNo: selectedTrain.trainNo,
      jDate,
      boardingCode,
      destinationCode,
      selectedClass,
      schedule
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <FontAwesomeIcon icon={faTrain} className="text-blue-600" />
          <span>Journey Search & Vacant Berth Analyzer</span>
        </h2>
        {selectedTrain && (
          <span className="text-xs bg-blue-50 text-blue-700 font-mono font-semibold px-2.5 py-1 rounded">
            {schedule.length} Stations Route Loaded
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Train & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <TrainSearch
              trains={trains}
              loadingTrains={loadingTrains}
              selectedTrain={selectedTrain}
              onSelectTrain={onSelectTrain}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Journey Date
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Charted dates</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
              </div>
              <input
                type="date"
                value={jDate}
                min={getMinChartDate()}
                max={getMaxChartDate()}
                onChange={(e) => setJDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer font-mono"
              />
            </div>
            {/* Quick Chart Date Buttons */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {[
                { label: 'Yesterday', offset: -1 },
                { label: 'Today', offset: 0 },
                { label: 'Tomorrow', offset: 1 }
              ].map(({ label, offset }) => {
                const targetD = new Date();
                targetD.setDate(targetD.getDate() + offset);
                const iso = formatDateToISO(targetD);
                const isSelected = jDate === iso;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setJDate(iso)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Stations & Class */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div className="md:col-span-3">
            <BoardingStationSelect
              schedule={schedule}
              value={boardingCode}
              onChange={setBoardingCode}
              disabled={!selectedTrain || loadingSchedule}
            />
          </div>

          <div className="hidden md:flex justify-center items-center pb-2">
            <button
              type="button"
              onClick={handleSwapStations}
              disabled={!boardingCode || !destinationCode}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              title="Swap stations if valid"
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="text-xs" />
            </button>
          </div>

          <div className="md:col-span-3">
            <DestinationStationSelect
              schedule={schedule}
              boardingCode={boardingCode}
              value={destinationCode}
              onChange={setDestinationCode}
              disabled={!selectedTrain || loadingSchedule}
            />
          </div>
        </div>

        {/* Row 3: Class & Submit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          <div>
            <ClassSelect
              value={selectedClass}
              onChange={setSelectedClass}
              disabled={!selectedTrain || loadingSchedule}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSearching || loadingSchedule || !selectedTrain}
              className="w-full md:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold text-sm rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-base" />
                  <span>Searching Combinations...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} className="text-sm" />
                  <span>Find a Way</span>
                </>
              )}
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
            {formError}
          </div>
        )}
      </form>
    </div>
  );
}
