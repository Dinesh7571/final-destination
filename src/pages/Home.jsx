import React from 'react';
import Header from '../components/layout/Header';
import Container from '../components/layout/Container';
import JourneySearchForm from '../components/search/JourneySearchForm';
import SearchProgress from '../components/results/SearchProgress';
import JourneySummary from '../components/results/JourneySummary';
import JourneyOption from '../components/results/JourneyOption';
import CoachBerthMapSection from '../components/results/CoachBerthMapSection';
import EmptyState from '../components/results/EmptyState';

import { useTrainSearch } from '../hooks/useTrainSearch';
import { useJourneySearch } from '../hooks/useJourneySearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faLightbulb, faRoute, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const {
    trains,
    loadingTrains,
    selectedTrain,
    setSelectedTrain,
    schedule,
    loadingSchedule
  } = useTrainSearch();

  const {
    executeSearch,
    isSearching,
    searchProgress,
    searchStep,
    results,
    error,
    isCorsBlocked
  } = useJourneySearch();

  // Quick Preset Sample Journeys for immediate testing
  const handleQuickPreset = (trainNo, boardingCode, destCode, cls = '3A') => {
    const foundTrain = trains.find(t => t.trainNo === trainNo) || { trainNo, trainName: 'EXPRESS' };
    setSelectedTrain(foundTrain);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header isCorsBlocked={isCorsBlocked} />

      <main className="flex-1">
        <Container>
          {/* Quick Demo Presets Bar */}
          <div className="mb-4 bg-white border border-slate-200 rounded-lg p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
              <span>Quick Sample Queries:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('12627', 'SBC', 'NDLS', '1A')}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-mono rounded border border-slate-300 transition-colors cursor-pointer"
              >
                12627 Karnataka Exp (SBC → NDLS)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('15017', 'PRYJ', 'GKP', '3A')}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-mono rounded border border-slate-300 transition-colors cursor-pointer"
              >
                15017 Kashi Exp (PRYJ → GKP)
              </button>
            </div>
          </div>

          {/* Main Search Form */}
          <JourneySearchForm
            trains={trains}
            loadingTrains={loadingTrains}
            selectedTrain={selectedTrain}
            onSelectTrain={setSelectedTrain}
            schedule={schedule}
            loadingSchedule={loadingSchedule}
            onSearch={executeSearch}
            isSearching={isSearching}
          />

          {/* Search Error Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800 font-medium">
              {error}
            </div>
          )}

          {/* Loading Progress State */}
          {isSearching && (
            <SearchProgress progressMessage={searchProgress} step={searchStep} />
          )}

          {/* Results Display */}
          {results && !isSearching && (
            <div className="space-y-6">
              <JourneySummary results={results} />

              {/* Coach Cabin & Berth Layout Visualization */}
              {results.coachBddMap && Object.keys(results.coachBddMap).length > 0 && (
                <CoachBerthMapSection results={results} />
              )}

              {results.options && results.options.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0 flex items-center gap-2">
                      <FontAwesomeIcon icon={faRoute} className="text-blue-600" />
                      <span>Ranked Journey Options ({results.options.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      Ranked by convenience & minimal berth changes
                    </span>
                  </div>

                  {results.options.map((option, idx) => (
                    <JourneyOption
                      key={option.id || idx}
                      option={option}
                      isPrimary={idx === 0}
                      baseDate={results.searchedDate}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState results={results} />
              )}
            </div>
          )}
        </Container>
      </main>

      {/* Railway Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <p className="m-0">
            RailBerth Finder — Indian Railways Prepared Chart Vacancy Analyzer & Alternative Route Grapher
          </p>
          <p className="m-0 text-slate-500 mt-1">
            Data sourced from official IRCTC prepared chart vacancy APIs. Always verify final booking status before travel.
          </p>
        </div>
      </footer>
    </div>
  );
}
