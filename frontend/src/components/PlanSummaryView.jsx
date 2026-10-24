import React, { useState } from 'react';
import {
  Route,
  Clock,
  CircleDollarSign,
  Compass,
  Navigation,
  ExternalLink,
  Share2,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Utensils,
  BookOpen,
  CalendarDays,
  Copy,
  Check,
  Pencil,
  FileText,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getGoogleMapsDirectionsUrl, getMultiStopDirectionsUrl } from '../utils/navigation';
import { exportPlanToPdf } from '../utils/pdfExport';
import { SharePlanModal } from './SharePlanModal';
import { getVerifiedPlaceImage } from '../utils/placeImages';

export const PlanSummaryView = () => {
  const { generatedPlan, setActiveTab, setSelectedPlaceForModal, showToast } = usePlanner();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!generatedPlan || generatedPlan.stops.length === 0) {
    return (
      <div className="bg-[#F2EDE4] rounded-[32px] p-8 sm:p-12 text-center border border-[#E8E2D9] shadow-xs max-w-xl mx-auto my-12">
        <Route className="w-12 h-12 text-[#E27D60] mx-auto mb-3" />
        <h2 className="font-heading font-bold text-xl text-[#084C61]">
          No Generated Plan Yet
        </h2>
        <p className="text-sm text-[#4A4A4A] mt-2">
          Head over to the One-Day Planner to choose your stops and generate your day trip schedule.
        </p>
        <button
          onClick={() => setActiveTab('planner')}
          className="mt-6 px-6 py-3 rounded-full bg-[#E27D60] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E27D6033] hover:bg-[#C95F43] transition"
        >
          Open One-Day Planner
        </button>
      </div>
    );
  }

  const { stops, totalDistanceKm, totalEstimatedFeeLkr, title, date } = generatedPlan;

  const getTimeSlotForStop = (index, total, stopName) => {
    const isSunrise = stopName.toLowerCase().includes('beach') || stopName.toLowerCase().includes('sunrise');
    const isEvening = stopName.toLowerCase().includes('elephant') || stopName.toLowerCase().includes('lighthouse');
    
    if (isSunrise && index === 0) return '06:00 AM – 08:00 AM (Sunrise & Morning Walk)';
    if (isEvening && index === total - 1) return '04:30 PM – 06:30 PM (Golden Hour / Sunset)';

    const defaultSlots = [
      '08:30 AM – 10:30 AM',
      '10:45 AM – 12:30 PM',
      '02:00 PM – 03:45 PM',
      '04:00 PM – 05:45 PM',
      '06:00 PM – 07:30 PM',
      '07:45 PM – 09:00 PM',
    ];
    return defaultSlots[index] || `Stop ${index + 1} Visit Slot`;
  };

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      showToast('Generating itinerary PDF...', 'info');
      exportPlanToPdf(generatedPlan, getTimeSlotForStop);
      showToast('Itinerary PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to export PDF. Opening print dialog...', 'warning');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const googleMapsMultiStopUrl = getMultiStopDirectionsUrl(
    stops,
    AKKARAIPATTU_CENTER.lat,
    AKKARAIPATTU_CENTER.lng
  );

  return (
    <div id="plan-summary-view" className="space-y-6 sm:space-y-8 pb-14">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#084C61] mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#E27D60]" />
            <span>Generated One-Day Itinerary</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#084C61] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7D7D] mt-1">
            Scheduled for <strong>{date}</strong> • Starting from Akkaraipattu Reference Origin
          </p>
        </div>

        {/* Share, Export PDF & Edit Planner Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            id="edit-planner-btn"
            onClick={() => setActiveTab('planner')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#084C61]/30 hover:border-[#084C61] text-[#084C61] hover:bg-[#F2EDE4] text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Pencil className="w-4 h-4 text-[#084C61]" />
            <span>Edit Planner</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#084C61]/30 hover:border-[#084C61] text-[#084C61] hover:bg-[#F2EDE4] text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-[#084C61]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <button
            id="share-plan-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#084C61] hover:bg-[#063b4b] text-white text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Share Plan</span>
          </button>
        </div>
      </div>

      {/* Advisory Planning Notice */}
      <div className="bg-[#F2EDE4] border border-[#E8E2D9] p-4 sm:p-5 rounded-[24px] flex items-start gap-3.5 text-[#4A4A4A] shadow-xs">
        <AlertCircle className="w-5 h-5 text-[#E27D60] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <strong className="font-bold text-[#084C61]">Planning Advisory Note:</strong> This is a suggested route, not a guaranteed fastest path or absolute travel time. Actual road conditions, wildlife movements, weather, and opening hours may vary locally.
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#E8E2D9] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D9]">
          <div className="p-2">
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">Total Stops</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#084C61]">{stops.length} Places</span>
          </div>
          <div className="p-2 sm:pl-6">
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">Estimated Travel</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#084C61]">{totalDistanceKm} km</span>
          </div>
          <div className="p-2 sm:pl-6">
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">Study Radius</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#084C61]">Within 25 km</span>
          </div>
        </div>

        {/* Open All in Google Maps Route Button */}
        <div className="mt-5 pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#7D7D7D]">
            Launch multi-stop driving or tuk-tuk turn-by-turn navigation in Google Maps
          </span>

          <a
            id="open-full-route-btn"
            href={googleMapsMultiStopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Navigation className="w-4 h-4 text-[#E27D60]" />
            <span>Open Full Route in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Vertical Timeline / Stepper Itinerary */}
      <div className="space-y-6">
        <h2 className="font-heading font-bold text-xl text-[#084C61] tracking-tight">
          Day Visit Timeline & Guidance
        </h2>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E27D60]/40 space-y-8 ml-3 sm:ml-4">
          
          {/* Start Origin Pin */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-[#084C61] border-2 border-white text-white flex items-center justify-center text-[10px]">
              🏠
            </div>
            <div className="bg-[#F2EDE4] p-3.5 rounded-[20px] border border-[#E8E2D9] text-xs">
              <span className="font-bold text-[#084C61]">Trip Departure Origin</span> — Akkaraipattu Home Origin (7.231289, 81.845351)
            </div>
          </div>

          {/* Ordered Stops */}
          {stops.map((stop, index) => {
            const timeSlot = getTimeSlotForStop(index, stops.length, stop.name);
            const singleStopDirectionsUrl = getGoogleMapsDirectionsUrl(stop);

            return (
              <div key={stop.id} id={`timeline-stop-${stop.id}`} className="relative group">
                
                {/* Stepper Node Icon */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-[#E27D60] text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>

                {/* Stop Card */}
                <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#E8E2D9] shadow-xs hover:border-[#E27D60]/40 transition space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={getVerifiedPlaceImage(stop)}
                        alt={stop.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 cursor-pointer shadow-xs"
                        onClick={() => setSelectedPlaceForModal(stop)}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F2EDE4] text-[#084C61] border border-[#E8E2D9]">
                            Stop {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#7D7D7D]">
                            {stop.category}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedPlaceForModal(stop)}
                          className="font-heading font-bold text-lg sm:text-xl text-[#084C61] hover:text-[#E27D60] cursor-pointer mt-1"
                        >
                          {stop.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#084C61] bg-[#F2EDE4] px-3 py-1 rounded-full border border-[#E8E2D9] mt-2 w-fit">
                          <Clock className="w-3.5 h-3.5 text-[#E27D60]" />
                          <span>Suggested Timing: {timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      id={`timeline-dir-${stop.id}`}
                      href={singleStopDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#F2EDE4] hover:bg-[#E27D60] hover:text-white text-[#084C61] border border-[#E8E2D9] text-xs font-bold uppercase tracking-wider transition shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#E27D60] group-hover:text-white" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                    {stop.description}
                  </p>

                  {/* Practical Stop Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-[#F2EDE4] p-3.5 rounded-[20px] border border-[#E8E2D9]">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#E27D60] shrink-0" />
                      <span><strong>Distance:</strong> {stop.distanceKm} km ({stop.direction})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#7D7D7D] shrink-0" />
                      <span className="truncate"><strong>Hours:</strong> {stop.openingHours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4 text-[#084C61] shrink-0" />
                      <span><strong>Fee:</strong> {stop.entryFee.displayText}</span>
                    </div>
                  </div>

                  {/* Cultural Guidance / Family / Safety Notes for Stop */}
                  {stop.culturalEtiquette && (
                    <div className="text-xs text-[#084C61] bg-[#F2EDE4] p-3.5 rounded-[20px] border border-[#E8E2D9] flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-[#084C61] shrink-0 mt-0.5" />
                      <div>
                        <strong>Etiquette Guidance:</strong> {stop.culturalEtiquette}
                      </div>
                    </div>
                  )}

                  {stop.nearbyFoodRest && (
                    <div className="text-xs text-[#4A4A4A] bg-[#F2EDE4] p-3.5 rounded-[20px] border border-[#E8E2D9] flex items-start gap-2">
                      <Utensils className="w-4 h-4 text-[#E27D60] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#084C61]">Nearby Food Recommendation:</strong> {stop.nearbyFoodRest}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* End of Itinerary Return */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-[#084C61] border-2 border-white text-white flex items-center justify-center text-[10px]">
              🏁
            </div>
            <div className="bg-[#F2EDE4] p-3.5 rounded-[20px] border border-[#E8E2D9] text-xs text-[#084C61]">
              <span className="font-bold">End of Day Tour</span> — Return safely to Akkaraipattu or proceed to evening dining at Kings Restaurant.
            </div>
          </div>

        </div>
      </div>

      {/* Share Plan Modal */}
      <SharePlanModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        plan={generatedPlan}
        getTimeSlotForStop={getTimeSlotForStop}
        onToast={showToast}
      />

    </div>
  );
};