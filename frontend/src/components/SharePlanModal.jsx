import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getMultiStopDirectionsUrl } from '../utils/navigation';

export const SharePlanModal = ({
  isOpen,
  onClose,
  plan,
  getTimeSlotForStop,
  onToast,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedRouteLink, setCopiedRouteLink] = useState(false);

  if (!isOpen) return null;

  const googleMapsMultiStopUrl = getMultiStopDirectionsUrl(
    plan.stops,
    AKKARAIPATTU_CENTER.lat,
    AKKARAIPATTU_CENTER.lng
  );

  // Formatted full message text for sharing
  const formattedItineraryText = `🗺️ *${plan.title || 'DaySpire Akkaraipattu Day Tour'}*
📅 Date: ${plan.date || 'Today'}
📍 Total Stops: ${plan.stops.length} Places
🚗 Estimated Route Travel: ${plan.totalDistanceKm} km (Within 25km Zone)

📋 *Itinerary Timeline:*
${plan.stops
  .map((stop, idx) => {
    const slot = getTimeSlotForStop(idx, plan.stops.length, stop.name);
    return `${idx + 1}. *${stop.name}*\n   🕒 ${slot}\n   📌 ${stop.distanceKm} km from center (${stop.direction})\n   🎟️ ${stop.entryFee?.displayText || 'Free'}`;
  })
  .join('\n\n')}

🚗 *Open Turn-by-Turn Google Maps Route:*
${googleMapsMultiStopUrl}

✨ Planned with DAY SPIRE - Akkaraipattu Day Tour Assistant`;

  // WhatsApp share link
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedItineraryText)}`;

  // Email share link
  const emailSubject = encodeURIComponent(`DaySpire Itinerary: ${plan.title || 'My Akkaraipattu Day Tour'}`);
  const emailBody = encodeURIComponent(formattedItineraryText);
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleCopyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedItineraryText);
      setCopiedText(true);
      onToast('Full itinerary copied to clipboard!', 'success');
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleCopyRouteLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(googleMapsMultiStopUrl);
      setCopiedRouteLink(true);
      onToast('Google Maps multi-stop route link copied!', 'success');
      setTimeout(() => setCopiedRouteLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.title || 'My Akkaraipattu Day Tour',
          text: formattedItineraryText,
          url: googleMapsMultiStopUrl,
        });
        onToast('Shared successfully!', 'success');
      } catch (err) {
        if (err?.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D9] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8E2D9] flex items-center justify-between bg-[#F8F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#084C61] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[#084C61]">
                Share Itinerary
              </h2>
              <p className="text-xs text-[#7D7D7D]">
                Choose how you would like to share this trip plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8E2D9] text-[#7D7D7D] hover:text-[#084C61] flex items-center justify-center transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Quick Sharing Options Grid */}
          <div>
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-3">
              Direct Sharing Options
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* WhatsApp Option */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-5 h-5 fill-white text-[#25D366]" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold block text-[#075E54] group-hover:underline">
                    WhatsApp
                  </span>
                  <span className="text-[11px] text-[#128C7E]/80 block">
                    Send to chat / group
                  </span>
                </div>
              </a>

              {/* Email Option */}
              <a
                href={emailUrl}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#084C61]/5 hover:bg-[#084C61]/10 border border-[#084C61]/20 text-[#084C61] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#084C61] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold block text-[#084C61] group-hover:underline">
                    Email
                  </span>
                  <span className="text-[11px] text-[#7D7D7D] block">
                    Send via mail client
                  </span>
                </div>
              </a>

              {/* Native Device Share (Mobile / Web Share API) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E27D60]/10 hover:bg-[#E27D60]/20 border border-[#E27D60]/30 text-[#C95F43] transition group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E27D60] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-[#C95F43] group-hover:underline">
                      More Apps
                    </span>
                    <span className="text-[11px] text-[#7D7D7D] block">
                      Telegram, Messages, etc.
                    </span>
                  </div>
                </button>
              )}

              {/* Copy Full Itinerary */}
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] transition group text-left shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2EDE4] text-[#084C61] flex items-center justify-center shrink-0">
                  {copiedText ? <Check className="w-5 h-5 text-[#084C61]" /> : <Copy className="w-5 h-5 text-[#084C61]" />}
                </div>
                <div>
                  <span className="text-sm font-bold block text-[#084C61]">
                    {copiedText ? 'Copied Details!' : 'Copy Itinerary'}
                  </span>
                  <span className="text-[11px] text-[#7D7D7D] block">
                    Formatted text with timeline
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* Copy Google Maps Link Section */}
          <div className="bg-[#F8F5F0] p-4 rounded-2xl border border-[#E8E2D9]">
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1.5">
              Google Maps Route Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={googleMapsMultiStopUrl}
                className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-[#084C61] select-all truncate font-mono focus:outline-hidden"
              />
              <button
                onClick={handleCopyRouteLink}
                className="px-3.5 py-2 rounded-xl bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5"
              >
                {copiedRouteLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRouteLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Itinerary Preview Box */}
          <div>
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1.5">
              Message Preview
            </span>
            <div className="bg-[#F8F5F0] p-3.5 rounded-2xl border border-[#E8E2D9] text-xs text-[#4A4A4A] max-h-36 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
              {formattedItineraryText}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8E2D9] bg-[#F8F5F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#E8E2D9] hover:bg-[#F2EDE4] text-xs font-bold text-[#084C61] uppercase tracking-wider transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
