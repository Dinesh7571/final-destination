import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExchangeAlt,
  faRoute,
  faChevronDown,
  faChevronUp,
  faInfoCircle,
  faExclamationTriangle,
  faSuitcase,
  faClock,
  faGlobe,
  faUserTie,
  faTicketAlt,
  faStore,
  faExternalLinkAlt,
  faCheck,
  faMobileAlt,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import BerthBadge from './BerthBadge';
import { calculateStationDate, calculateDuration } from '../../utils/date';

export default function JourneyOption({ option, isPrimary = false, baseDate }) {
  const [showBookingHelp, setShowBookingHelp] = useState(isPrimary);
  const [activeBookingTab, setActiveBookingTab] = useState('online');

  // Booking feasibility calculations
  const allBookableOnline = option.segments.every(s => s.bookable);
  const someBookableOnline = option.segments.some(s => s.bookable);
  const isDirect = option.isDirect;

  // Determine badge styling and title text based on option type
  const getOptionBadge = () => {
    if (option.isBestOption && option.isDirect) {
      return {
        bg: 'bg-emerald-600 text-white',
        label: 'BEST OPTION — Direct Berth Available',
        accentBorder: 'border-emerald-500'
      };
    }
    if (option.isBestOption) {
      return {
        bg: 'bg-blue-700 text-white',
        label: 'BEST OPTION — Complete Journey Covered',
        accentBorder: 'border-blue-500'
      };
    }
    switch (option.type) {
      case 'EXACT_MULTI':
        return {
          bg: 'bg-slate-700 text-white',
          label: `${option.berthChangesCount} Berth Change${option.berthChangesCount > 1 ? 's' : ''} Required`,
          accentBorder: 'border-slate-400'
        };
      case 'EARLIER_BOARDING':
        return {
          bg: 'bg-amber-700 text-white',
          label: `ALTERNATIVE — Board ${option.extraBoardingStops} station${option.extraBoardingStops > 1 ? 's' : ''} earlier`,
          accentBorder: 'border-amber-500'
        };
      case 'LATER_DESTINATION':
        return {
          bg: 'bg-amber-700 text-white',
          label: `ALTERNATIVE — Travel ${option.extraDestinationStops} station${option.extraDestinationStops > 1 ? 's' : ''} beyond destination`,
          accentBorder: 'border-amber-500'
        };
      case 'COMBINED_ALTERNATIVE':
        return {
          bg: 'bg-purple-800 text-white',
          label: 'COMBINED ALTERNATIVE — Board earlier & travel further',
          accentBorder: 'border-purple-600'
        };
      default:
        return {
          bg: 'bg-slate-600 text-white',
          label: 'Possible Journey Option',
          accentBorder: 'border-slate-300'
        };
    }
  };

  const badge = getOptionBadge();

  return (
    <div className={`bg-white rounded-lg border shadow-xs overflow-hidden transition-all ${
      isPrimary ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
    }`}>
      {/* Option Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 text-white gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded tracking-wide uppercase ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-slate-300">
            {option.segmentsCount} Segment{option.segmentsCount > 1 ? 's' : ''}
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300">
            {option.berthChangesCount === 0 ? '0 Berth Changes' : `${option.berthChangesCount} Berth Change${option.berthChangesCount > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Booking Channels At-A-Glance Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mr-1">
            Where to Book:
          </span>

          {/* Online Channel Pill */}
          {allBookableOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-semibold text-[11px]">
              <FontAwesomeIcon icon={faGlobe} className="text-blue-700" />
              <span>
                {isDirect ? 'Online: 1 IRCTC E-Ticket' : `Online: ${option.segments.length} Separate PNRs`}
              </span>
            </span>
          ) : someBookableOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold text-[11px]">
              <FontAwesomeIcon icon={faGlobe} className="text-indigo-700" />
              <span>Online: 1st Leg + TTE Extension</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium text-[11px]">
              <FontAwesomeIcon icon={faGlobe} className="text-slate-500" />
              <span>Online: Closed / On-Board Only</span>
            </span>
          )}

          {/* Counter Channel Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
            <FontAwesomeIcon icon={faStore} className="text-emerald-700" />
            <span>Station Counter: Available</span>
          </span>

          {/* TTE Channel Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px]">
            <FontAwesomeIcon icon={faUserTie} className="text-amber-800" />
            <span>TTE On-Board: HHT Allotment</span>
          </span>
        </div>

        {/* Quick Action Button to IRCTC */}
        <a
          href="https://www.irctc.co.in/nget/train-search"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors shrink-0 shadow-xs"
        >
          <span>Book on IRCTC</span>
          <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
        </a>
      </div>

      <div className="p-4 sm:p-5">
        {/* Alternative Warning Banner if changed boarding or destination */}
        {(option.suggestedBoarding || option.suggestedDestination) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              {option.suggestedBoarding && (
                <p>
                  Requested boarding was <strong>{option.requestedBoarding.code}</strong>.
                  Suggested boarding: <strong>{option.suggestedBoarding.code} ({option.suggestedBoarding.name})</strong> — {option.extraBoardingStops} stop{option.extraBoardingStops > 1 ? 's' : ''} earlier ({option.extraBoardingDistance} km).
                </p>
              )}
              {option.suggestedDestination && (
                <p className="mt-1">
                  Requested destination was <strong>{option.requestedDestination.code}</strong>.
                  Suggested destination: <strong>{option.suggestedDestination.code} ({option.suggestedDestination.name})</strong> — {option.extraDestinationStops} stop{option.extraDestinationStops > 1 ? 's' : ''} beyond destination ({option.extraDestinationDistance} km).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Vertical Railway Route Visualization */}
        <div className="relative pl-6 py-2 border-l-2 border-blue-500 ml-3 space-y-6">
          {option.segments.map((seg, idx) => {
            const duration = calculateDuration(seg.fromDeparture, seg.fromDay, seg.toArrival, seg.toDay);
            const fromDateFormatted = calculateStationDate(baseDate, seg.fromDay);
            const toDateFormatted = calculateStationDate(baseDate, seg.toDay);

            return (
              <React.Fragment key={idx}>
                {/* Boarding / Intermediate Transfer Station Node */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                        {seg.travelFromCode}
                      </span>
                      <span className="ml-2 text-xs text-slate-700 font-semibold">
                        {seg.travelFromName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Date & Departure Time */}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                        <FontAwesomeIcon icon={faClock} className="text-blue-600 text-[10px]" />
                        <span>Dep: <strong>{seg.fromDeparture || '--'}</strong></span>
                        {fromDateFormatted && (
                          <span className="text-slate-500 font-sans font-medium text-[11px]">
                            · {fromDateFormatted} (Day {seg.fromDay || 1})
                          </span>
                        )}
                      </span>
                      {idx === 0 ? (
                        <span className="text-[11px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                          BOARDING
                        </span>
                      ) : (
                        <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExchangeAlt} className="text-[10px]" />
                          <span>BERTH CHANGE</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Segment Berth Details Card (Vertical Connector) */}
                <div className="my-2 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FontAwesomeIcon icon={faSuitcase} className="text-slate-400 text-xs" />
                      <span className="text-xs text-slate-500 font-medium">Segment #{idx + 1}:</span>
                      <BerthBadge
                        coach={seg.coach}
                        berthNo={seg.berthNo}
                        berthType={seg.berthType}
                        classCode={seg.classCode}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      {seg.distance > 0 && (
                        <span>Distance: {seg.distance} km</span>
                      )}
                      {duration && (
                        <>
                          <span>·</span>
                          <span className="text-blue-700 font-semibold">{duration} run</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Booking Channels Pill Row for this Segment */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500 font-medium text-[10px] uppercase">
                      Segment Booking:
                    </span>

                    {/* Online Pill */}
                    {seg.bookable ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faGlobe} className="text-blue-600 text-[10px]" />
                        <span>Online Current Booking</span>
                        <FontAwesomeIcon icon={faCheck} className="text-blue-700 text-[9px]" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <FontAwesomeIcon icon={faGlobe} className="text-slate-400 text-[10px]" />
                        <span>Online Quota Closed</span>
                      </span>
                    )}

                    {/* PRS Counter Pill */}
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faStore} className="text-emerald-600 text-[10px]" />
                      <span>PRS Station Counter</span>
                      <FontAwesomeIcon icon={faCheck} className="text-emerald-700 text-[9px]" />
                    </span>

                    {/* TTE Pill */}
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faUserTie} className="text-amber-700 text-[10px]" />
                      <span>TTE On-Board (HHT)</span>
                      <FontAwesomeIcon icon={faCheck} className="text-amber-700 text-[9px]" />
                    </span>
                  </div>

                  {/* Timing & Date Sub-strip */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded border border-slate-200 gap-1.5">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="text-blue-600 text-[10px]" />
                      <span>Departs <strong>{seg.fromDeparture || '--'}</strong> ({seg.travelFromCode})</span>
                    </div>
                    <span className="text-slate-400 hidden sm:inline">→</span>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-600 text-[10px]" />
                      <span>Arrives <strong>{seg.toArrival || '--'}</strong> ({seg.travelToCode})</span>
                    </div>
                  </div>
                </div>

                {/* Final Destination Station Node of the last segment */}
                {idx === option.segments.length - 1 && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                          {seg.travelToCode}
                        </span>
                        <span className="ml-2 text-xs text-slate-700 font-semibold">
                          {seg.travelToName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Date & Arrival Time */}
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          <FontAwesomeIcon icon={faClock} className="text-emerald-600 text-[10px]" />
                          <span>Arr: <strong>{seg.toArrival || '--'}</strong></span>
                          {toDateFormatted && (
                            <span className="text-emerald-700 font-sans font-medium text-[11px]">
                              · {toDateFormatted} (Day {seg.toDay || 1})
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded shadow-xs">
                          DESTINATION
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detailed Booking Guide Section (Interactive Channels Tab) */}
        <div className="mt-5 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBookingHelp(v => !v)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTicketAlt} className="text-blue-600 text-xs" />
              <span>Step-by-Step Booking Guide: Online vs Counter vs TTE</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-normal text-[11px]">
              <span>{showBookingHelp ? 'Hide guide' : 'Show booking steps'}</span>
              <FontAwesomeIcon icon={showBookingHelp ? faChevronUp : faChevronDown} className="text-[10px]" />
            </div>
          </button>

          {showBookingHelp && (
            <div className="p-3.5 bg-white border-t border-slate-200 text-xs space-y-3">
              {/* Channel Selector Tabs */}
              <div className="flex border-b border-slate-200 gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveBookingTab('online')}
                  className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 transition-all ${
                    activeBookingTab === 'online'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
                  <span>1. IRCTC Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBookingTab('counter')}
                  className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 transition-all ${
                    activeBookingTab === 'counter'
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faStore} className="text-emerald-700" />
                  <span>2. Station PRS Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBookingTab('tte')}
                  className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 transition-all ${
                    activeBookingTab === 'tte'
                      ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faUserTie} className="text-amber-800" />
                  <span>3. On-Board TTE (HHT)</span>
                </button>
              </div>

              {/* Tab 1 Content: IRCTC Online */}
              {activeBookingTab === 'online' && (
                <div className="space-y-3 pt-1">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md">
                    <h5 className="font-bold text-blue-900 m-0 flex items-center gap-2">
                      <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
                      <span>IRCTC Web & Rail Connect App (Current Booking Quota)</span>
                    </h5>
                    <p className="text-slate-700 m-0 mt-1 text-[11px] leading-relaxed">
                      Vacant berths in prepared charts open under <strong>Current Booking (CURR_AVBL)</strong> quota. Current Booking closes <strong>30 minutes before scheduled train departure</strong> from the charting station.
                    </p>
                  </div>

                  {isDirect ? (
                    <div className="space-y-1.5 text-slate-700">
                      <p className="font-semibold text-slate-900 m-0">How to book this direct berth:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                        <li>Open the IRCTC website (<a href="https://www.irctc.co.in/nget/train-search" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">irctc.co.in</a>) or IRCTC Rail Connect App.</li>
                        <li>Search from <strong>{option.segments[0].travelFromCode}</strong> to <strong>{option.segments[0].travelToCode}</strong>.</li>
                        <li>Look for class <strong>{option.segments[0].classCode}</strong> with <strong>CURR_AVBL</strong> status.</li>
                        <li>Proceed to passenger details and complete payment. IRCTC will allot Coach <strong>{option.segments[0].coach}</strong>, Berth <strong>{option.segments[0].berthNo}</strong> directly on your e-ticket.</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-700">
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                        <strong>Multi-Segment Note:</strong> Indian Railways PRS cannot issue split berths under a single PNR. To complete this journey online, book <strong>{option.segments.length} separate Current Booking tickets</strong>:
                      </div>
                      <div className="space-y-1.5">
                        {option.segments.map((s, i) => (
                          <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] flex items-center justify-between">
                            <span className="font-mono text-slate-800">
                              Ticket #{i + 1}: <strong>{s.travelFromCode}</strong> → <strong>{s.travelToCode}</strong>
                            </span>
                            <span className="font-mono font-bold text-blue-700">
                              Coach {s.coach}, Berth {s.berthNo} ({s.berthType})
                            </span>
                            {s.bookable ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                                Online Bookable
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                                Get from TTE on-board
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href="https://www.irctc.co.in/nget/train-search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-xs"
                    >
                      <span>Open IRCTC Current Booking</span>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Station PRS Counter */}
              {activeBookingTab === 'counter' && (
                <div className="space-y-3 pt-1">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md">
                    <h5 className="font-bold text-emerald-900 m-0 flex items-center gap-2">
                      <FontAwesomeIcon icon={faStore} className="text-emerald-700" />
                      <span>Railway Station Current Reservation Counter</span>
                    </h5>
                    <p className="text-slate-700 m-0 mt-1 text-[11px] leading-relaxed">
                      Every major Indian Railways station has a dedicated <strong>Current Reservation Counter</strong> at the PRS reservation complex where vacant chart berths can be booked across the counter.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <p className="font-semibold text-slate-900 m-0 text-xs">Counter Booking Steps:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to the PRS complex at <strong>{option.segments[0].travelFromName} ({option.segments[0].travelFromCode})</strong>.</li>
                      <li>Find the counter marked <strong>"Current Booking / Current Reservation"</strong>.</li>
                      <li>Request a ticket for Train <strong>{option.segments[0].travelFromCode} → {option.segments[0].travelToCode}</strong> in Class <strong>{option.segments[0].classCode}</strong>.</li>
                      <li>Mention the preferred coach <strong>{option.segments[0].coach}</strong> and berth <strong>{option.segments[0].berthNo}</strong> shown vacant on the chart.</li>
                      <li>Payment can be made via <strong>Cash, UPI (Dynamic QR at counter), or Debit/Credit Card</strong>.</li>
                    </ol>
                    <p className="text-amber-800 font-medium pt-1">
                      ⚠️ Counter booking closes <strong>30 minutes before</strong> scheduled train departure.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3 Content: On-Board TTE */}
              {activeBookingTab === 'tte' && (
                <div className="space-y-3 pt-1">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md">
                    <h5 className="font-bold text-amber-900 m-0 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUserTie} className="text-amber-800" />
                      <span>On-Board Allotment via Travelling Ticket Examiner (TTE)</span>
                    </h5>
                    <p className="text-slate-700 m-0 mt-1 text-[11px] leading-relaxed">
                      If Current Booking has closed or for berths that become vacant midway after an en-route passenger deboards: The coach TTE has live vacant berth data on their official Indian Railways <strong>Handheld Terminal (HHT)</strong> device and can legally allot vacant berths.
                    </p>
                  </div>

                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <p className="font-semibold text-slate-900 m-0 text-xs">How to get allotted on-board by TTE:</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        <strong>Valid Boarding Authority:</strong> Purchase a minimum valid ticket before boarding (such as an Unreserved General UTS ticket for the route, or use your confirmed ticket for the first leg of the journey).
                      </li>
                      <li>
                        <strong>Locate Coach TTE:</strong> Approach the TTE in Coach <strong>{option.segments[0].coach}</strong> or at their designated berth immediately upon boarding.
                      </li>
                      <li>
                        <strong>Quote the Vacancy:</strong> Tell the TTE: <em>"Coach {option.segments[0].coach}, Berth {option.segments[0].berthNo} ({option.segments[0].berthType}) is vacant between {option.segments[0].travelFromCode} and {option.segments[0].travelToCode} as per the prepared chart."</em>
                      </li>
                      <li>
                        <strong>HHT Allotment & EFT:</strong> The TTE verifies the berth on their official Handheld Terminal (HHT) tablet and issues an official <strong>Excess Fare Ticket (EFT)</strong> with digital receipt.
                      </li>
                      <li>
                        <strong>Fare:</strong> You pay the fare difference + standard Indian Railways supplementary reservation surcharge.
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Business Rule Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
            Vacant in prepared chart · Official IRCTC vacant inventory
          </span>
          <span className="italic">
            Booking channels: IRCTC Current Booking · Station Counter · TTE HHT
          </span>
        </div>
      </div>
    </div>
  );
}
