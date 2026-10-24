import React, { useState, useEffect } from 'react';
import {
  X,
  Info,
  Phone,
  HelpCircle,
  ShieldCheck,
  FileText,
  Send,
  CheckCircle,
  MapPin,
  Mail,
  Clock,
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Flame,
  AlertCircle,
  Building2,
  UserCheck,
  Zap,
  Droplets,
  Radio,
} from 'lucide-react';
import { Logo } from './Logo';

export const SupportModal = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setMessageSent(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      onToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setMessageSent(true);
      onToast('Thank you! Your message has been sent to the Akkaraipattu Tourism team.', 'success');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 600);
  };

  const faqs = [
    {
      q: 'What is DaySpire?',
      a: 'DaySpire is a smart one-day travel planner specifically built for Akkaraipattu and the surrounding 25km radius in the Ampara District of Sri Lanka. It helps locals and tourists discover verified coastal, cultural, religious, and dining spots.',
    },
    {
      q: 'How does the 25km Radius Filter work?',
      a: 'All distance calculations originate from the Akkaraipattu Clock Tower & Central Junction (0 km reference). Every place includes accurate road distances, directions (North, South, East, West), and travel estimates.',
    },
    {
      q: 'What should I wear when visiting religious and historic sites?',
      a: 'When visiting historic mosques (such as Grand Jummah Mosque) or temples (such as Sri Mamangam or Okanda), please wear modest clothing covering shoulders and knees. Footwear must be removed before entering sacred premises.',
    },
    {
      q: 'Is transport readily available around Akkaraipattu?',
      a: 'Yes, three-wheelers (tuks), local buses along the A4 highway, and rental scooters are readily accessible in town center. Our planner provides optimal route sequencing to minimize backtracking.',
    },
    {
      q: 'Can I export or share my custom Day Plan?',
      a: 'Yes! After adding places to your plan, open the One-Day Planner tab and click "Generate One-Day Plan". You can view summary timetables, export to PDF, or print your travel itinerary.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FDFBF7] w-full max-w-3xl rounded-[32px] shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#084C61] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" badge="25km" />
            <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200 hidden sm:inline">
              Information & Support Center
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-[#E8E2D9] px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#084C61] text-white'
                : 'text-[#4A4A4A] hover:bg-[#F2EDE4]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-sm text-[#4A4A4A] space-y-4">
          
          {/* TAB: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  About DaySpire Akkaraipattu
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Eastern Sri Lanka's dedicated local tourism & day planner initiative
                </p>
              </div>

              <p className="leading-relaxed">
                <strong>DaySpire</strong> was created to showcase the rich cultural heritage, pristine coastlines, historic mosques and temples, natural lagoons, and vibrant culinary traditions of <strong>Akkaraipattu</strong> and nearby eastern communities (Addalaichenai, Oluvil, Thirukkovil, Pottuvil, and Ampara).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9]">
                  <div className="w-8 h-8 rounded-xl bg-[#084C61]/10 text-[#084C61] flex items-center justify-center font-bold text-xs mb-2">
                    25km
                  </div>
                  <h4 className="font-bold text-xs text-[#084C61]">Strict 25km Radius</h4>
                  <p className="text-[11px] text-[#7D7D7D] mt-1">
                    Every attraction is verified within a single day's comfortable round-trip.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9]">
                  <div className="w-8 h-8 rounded-xl bg-[#127e75]/10 text-[#127e75] flex items-center justify-center font-bold text-xs mb-2">
                    100%
                  </div>
                  <h4 className="font-bold text-xs text-[#084C61]">Verified Details</h4>
                  <p className="text-[11px] text-[#7D7D7D] mt-1">
                    Authentic opening times, accurate entrance fees, and family guidelines.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9]">
                  <div className="w-8 h-8 rounded-xl bg-[#E27D60]/10 text-[#E27D60] flex items-center justify-center font-bold text-xs mb-2">
                    FREE
                  </div>
                  <h4 className="font-bold text-xs text-[#084C61]">Local Travel Tools</h4>
                  <p className="text-[11px] text-[#7D7D7D] mt-1">
                    Free customizable itineraries, printable summaries, and map navigation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  Contact DaySpire Team
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Have questions, new place recommendations, or tourism partnership inquiries?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#127e75] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#084C61]">Office Location</span>
                        <p className="text-[#7D7D7D] mt-0.5">
                          Main Street, Akkaraipattu Central, Ampara District, Eastern Province, Sri Lanka.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#127e75] shrink-0" />
                      <div>
                        <span className="font-bold text-[#084C61]">Email Address</span>
                        <p className="text-[#7D7D7D]">support@dayspire.lk</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#127e75] shrink-0" />
                      <div>
                        <span className="font-bold text-[#084C61]">Regional Hotline</span>
                        <p className="text-[#7D7D7D]">063 222 2321 (General Enquiries)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#127e75] shrink-0" />
                      <div>
                        <span className="font-bold text-[#084C61]">Support Hours</span>
                        <p className="text-[#7D7D7D]">Daily: 08:00 AM - 06:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9]">
                  {messageSent ? (
                    <div className="py-6 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#084C61]">Message Sent Successfully!</h4>
                      <p className="text-xs text-[#7D7D7D]">
                        Our Akkaraipattu travel team will respond to your email within 24 hours.
                      </p>
                      <button
                        onClick={() => setMessageSent(false)}
                        className="mt-2 text-xs font-bold text-[#127e75] underline cursor-pointer"
                      >
                        Send another inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#084C61] mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Suhail Ahmed"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#127e75] bg-[#FDFBF7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#084C61] mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#127e75] bg-[#FDFBF7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#084C61] mb-1">
                          Subject / Place Name
                        </label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="Place suggestion or travel query"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#127e75] bg-[#FDFBF7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#084C61] mb-1">
                          Your Message *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="How can we help your visit to Akkaraipattu?"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#127e75] bg-[#FDFBF7]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY CONTACTS */}
          {activeTab === 'emergency' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white border border-[#E8E2D9] p-4 sm:p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#084C61] text-white flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-[#084C61]">
                      Emergency & Assistance Hotline Directory
                    </h3>
                    <p className="text-xs text-[#7D7D7D] mt-0.5 leading-relaxed">
                      Essential emergency numbers for visitors and residents in Akkaraipattu and across Sri Lanka. Click or tap any service to dial directly on your phone.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. National Emergency Services */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#084C61]" />
                  <h4 className="font-bold text-xs sm:text-sm text-[#084C61] uppercase tracking-wider">
                    National Emergency Services (24/7 Hotline)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="tel:119"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-[#084C61]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Police Emergency Hotline
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          National Police Dispatch
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-[#084C61] block">
                        119 / 118
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>

                  <a
                    href="tel:1990"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-emerald-500 hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700 transition">
                          Suwaseriya Ambulance Service
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Free Emergency Paramedic
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-emerald-600 block">
                        1990
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        Toll-Free
                      </span>
                    </div>
                  </a>

                  <a
                    href="tel:110"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Fire & Rescue Service
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Disaster Response & Fire
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-amber-700 block">
                        110
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>

                  <a
                    href="tel:117"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Disaster Management Centre (DMC)
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Severe Weather & Floods
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-sky-700 block">
                        117
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              {/* 2. Regional & Local Akkaraipattu Numbers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#084C61]" />
                  <h4 className="font-bold text-xs sm:text-sm text-[#084C61] uppercase tracking-wider">
                    Regional & Local Akkaraipattu Assistance
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="tel:0632222321"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Ampara Regional Police HQ
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          District Police Operations
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-indigo-700 block">
                        063 222 2321
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>

                  <a
                    href="tel:0672277261"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Akkaraipattu Base Hospital
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Main General Hospital & OPD
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-teal-700 block">
                        067 227 7261
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>

                  <a
                    href="tel:109"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex items-center justify-between group sm:col-span-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-[#084C61] transition">
                          Child & Women Abuse Protection Bureau
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Confidential Support Hotline
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-purple-700 block">
                        109
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                        <PhoneCall className="w-2.5 h-2.5" /> Call
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              {/* 3. Public Utilities */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#084C61]" />
                  <h4 className="font-bold text-xs sm:text-sm text-[#084C61] uppercase tracking-wider">
                    Public Utility Services
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="tel:1987"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold text-slate-800">1987</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">CEB Electricity Breakdown</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Power Outages & Grid</span>
                  </a>

                  <a
                    href="tel:1939"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Droplets className="w-4 h-4 text-sky-500" />
                      <span className="text-xs font-mono font-bold text-slate-800">1939</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">National Water Supply</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Water Supply & Leakages</span>
                  </a>

                  <a
                    href="tel:1919"
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#084C61] hover:shadow-xs transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Radio className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-mono font-bold text-slate-800">1919</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">Government Info Centre</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">National Citizen Queries</span>
                  </a>
                </div>
              </div>

              <div className="bg-[#F2EDE4] p-3.5 rounded-2xl text-xs text-[#4A4A4A] leading-relaxed border border-[#E8E2D9]">
                💡 <strong>Note:</strong> The 3-digit and 4-digit shortcode numbers above can be dialed <strong>toll-free</strong> from any local mobile network or landline in Sri Lanka.
              </div>
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Helpful answers for planning your Akkaraipattu one-day trip
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-[#E8E2D9] space-y-1.5"
                  >
                    <h4 className="font-bold text-xs sm:text-sm text-[#084C61] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#127e75]/15 text-[#127e75] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-[#4A4A4A] pl-7 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-[#4A4A4A] leading-relaxed">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  Privacy Policy
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Last updated: 2026 • DaySpire Sri Lanka
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] space-y-3">
                <p>
                  <strong>1. Local Data Storage:</strong> DaySpire operates with privacy-first principles. Your custom saved day plans, filter preferences, and itinerary re-orderings are stored locally within your device’s browser storage (LocalStorage). We do not transmit or sell personal itinerary plans to third-party advertisers.
                </p>
                <p>
                  <strong>2. Newsletter Communications:</strong> When you subscribe to our newsletter, your email is kept strictly confidential to provide travel tips and verified eastern district updates. You may opt out anytime.
                </p>
                <p>
                  <strong>3. Location Services:</strong> When viewing interactive maps, location coordinates are utilized solely to calculate local distance from the Akkaraipattu reference point (0km). No continuous background tracking is performed.
                </p>
              </div>
            </div>
          )}

          {/* TAB: TERMS OF USE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-[#4A4A4A] leading-relaxed">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  Terms of Use & Visitor Guidelines
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Responsible tourism for Akkaraipattu & Eastern Province
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] space-y-3">
                <p>
                  <strong>1. Cultural Respect & Dress Codes:</strong> Akkaraipattu and surrounding regions are rich with sacred Islamic, Hindu, Buddhist, and Christian heritage sites. Visitors are requested to dress modestly, respect active prayer hours, and adhere to posted photography rules.
                </p>
                <p>
                  <strong>2. Environmental Preservation:</strong> Please do not litter on coastal beaches (Akkaraipattu Beach, Oluvil Coast, Pottuvil Point) or around natural lagoons. Help protect coastal turtle nesting areas and lagoon bird sanctuaries.
                </p>
                <p>
                  <strong>3. Verification of Hours:</strong> While DaySpire continuously verifies entrance charges and operational hours through community feedback, certain festival dates or weather conditions may cause occasional schedule changes.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-[#F2EDE4] px-6 py-3.5 border-t border-[#E8E2D9] flex items-center justify-between">
          <span className="text-[11px] text-[#7D7D7D]">
            © 2026 DaySpire • Akkaraipattu 25km Day Tour
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
