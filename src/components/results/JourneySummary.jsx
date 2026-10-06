import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faRoute,
  faGlobe,
  faStore,
  faUserTie,
  faInfoCircle,
  faChevronDown,
  faChevronUp,
  faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import { formatDateDisplay } from '../../utils/date';

export default function JourneySummary({ results }) {
  const [showChannelExplainer, setShowChannelExplainer] = useState(false);

  if (!results) return null;

  const {
    boardingStation,
    destinationStation,
    searchedDate,
    searchedClass,
    searchedTrainNo,
    options = []
  } = results;

  const bestOption = options.find(o => o.isBestOption) || options[0];
  const canReach = options.length > 0;

  // Calculate booking channel counts across options
  const directOnlineCount = options.filter(o => o.isDirect && o.segments[0]?.bookable).length;
  const multiOnlineCount = options.filter(o => !o.isDirect && o.segments.every(s => s.bookable)).length;
  const tteRequiredCount = options.filter(o => o.segments.some(s => !s.bookable)).length;

  return (
    <div className="space-y-3 mb-6">
      {/* Main Status Banner */}
      <div className={`rounded-lg border p-5 ${
        canReach
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-red-50/70 border-red-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {canReach ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-2xl" />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-2xl" />
              )}
              <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                {canReach
                  ? `You can reach ${destinationStation.name}`
                  : `No complete route found to ${destinationStation.name}`}
              </h2>
            </div>

            <p className="text-sm text-slate-700 mt-1 font-medium">
              Train <span className="font-mono font-bold text-slate-900">{searchedTrainNo}</span> · {formatDateDisplay(searchedDate)} · Class: <span className="font-bold">{searchedClass || 'ALL'}</span>
            </p>

            {canReach && bestOption && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="bg-white border border-emerald-300 text-emerald-900 px-2.5 py-1 rounded font-bold">
                  {bestOption.boardingStation?.code || boardingStation.code} → {bestOption.destinationStation?.code || destinationStation.code}
                </span>
                <span className="text-slate-500">•</span>
                <span className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded">
                  {bestOption.isDirect ? 'Direct Berth (0 changes)' : `${bestOption.berthChangesCount} Berth Change${bestOption.berthChangesCount > 1 ? 's' : ''}`}
                </span>
                <span className="text-slate-500">•</span>
                <span className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded">
                  {bestOption.segmentsCount} Segment{bestOption.segmentsCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {options.length}
            </div>
            <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
              Available Option{options.length !== 1 ? 's' : ''} Found
            </div>
          </div>
        </div>

        {/* Quick Booking Channels Breakdown Pills */}
        {canReach && (
          <div className="mt-4 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                Booking Availability:
              </span>
              {directOnlineCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-200 font-medium">
                  <FontAwesomeIcon icon={faGlobe} className="text-blue-700" />
                  <span><strong>{directOnlineCount}</strong> Direct Online / Counter</span>
                </span>
              )}
              {multiOnlineCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 font-medium">
                  <FontAwesomeIcon icon={faTicketAlt} className="text-indigo-700" />
                  <span><strong>{multiOnlineCount}</strong> Multi-Ticket Online</span>
                </span>
              )}
              {tteRequiredCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                  <FontAwesomeIcon icon={faUserTie} className="text-amber-800" />
                  <span><strong>{tteRequiredCount}</strong> Require TTE Allotment</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowChannelExplainer(v => !v)}
              className="inline-flex items-center gap-1.5 text-blue-800 hover:text-blue-950 font-semibold underline underline-offset-2 cursor-pointer text-xs"
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>How Booking Works (Online / Counter / TTE)</span>
              <FontAwesomeIcon icon={showChannelExplainer ? faChevronUp : faChevronDown} className="text-[10px]" />
            </button>
          </div>
        )}
      </div>

      {/* Explainer Accordion: Indian Railways Booking Modes */}
      {showChannelExplainer && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 m-0 flex items-center gap-2">
              <FontAwesomeIcon icon={faTicketAlt} className="text-blue-600" />
              <span>Indian Railways Vacant Berth Booking Rules & Channels</span>
            </h4>
            <span className="text-slate-400 text-[11px]">Prepared Chart Vacancies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Mode 1: Online Current Booking */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
                <span>1. IRCTC Online (Current Booking)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed m-0">
                Available on <strong>irctc.co.in</strong> or IRCTC Rail Connect App under <strong>Current Booking (CURR_AVBL)</strong> quota after 1st chart is prepared (~4 hours before train departure) until 30 minutes before departure.
              </p>
              <div className="pt-1 text-[11px] text-blue-800 font-semibold">
                • Direct berth: Book 1 e-ticket.<br />
                • Split journey: Book separate Current Booking tickets per segment.
              </div>
            </div>

            {/* Mode 2: PRS Station Counter */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <FontAwesomeIcon icon={faStore} className="text-emerald-700" />
                <span>2. Station PRS Counter</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed m-0">
                Visit the dedicated <strong>Current Reservation Counter</strong> at the railway station PRS booking office. Available up to 30 minutes before scheduled train departure.
              </p>
              <div className="pt-1 text-[11px] text-emerald-800 font-semibold">
                • Paper ticket issued immediately.<br />
                • Accepts Cash, UPI QR code, & Cards.
              </div>
            </div>

            {/* Mode 3: On-board TTE */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <FontAwesomeIcon icon={faUserTie} className="text-amber-800" />
                <span>3. On-Board TTE (HHT Allotment)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed m-0">
                Board the train with a valid minimum ticket (General unreserved UTS ticket or 1st leg confirmed ticket). Find the coach TTE and request berth allotment.
              </p>
              <div className="pt-1 text-[11px] text-amber-900 font-semibold">
                • TTE verifies vacancy on Handheld Terminal (HHT).<br />
                • Official Excess Fare Ticket (EFT) issued on-board.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
