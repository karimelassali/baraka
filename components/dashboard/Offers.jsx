"use client";

import { useEffect, useState } from 'react';
import { Tag, Calendar, ArrowRight, Clock, Star, Gift, MessageCircle, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const ENCOURAGING_TEXTS = {
  en: [
    { text: "Great Deal!", color: "text-emerald-600" },
    { text: "Limited Time!", color: "text-amber-600" },
    { text: "Don't Miss Out!", color: "text-indigo-600" },
    { text: "Special Offer!", color: "text-purple-600" },
    { text: "Best Value!", color: "text-blue-600" }
  ],
  it: [
    { text: "Ottimo Affare!", color: "text-emerald-600" },
    { text: "Tempo Limitato!", color: "text-amber-600" },
    { text: "Non Perdere l'Occasione!", color: "text-indigo-600" },
    { text: "Offerta Speciale!", color: "text-purple-600" },
    { text: "Miglior Prezzo!", color: "text-blue-600" }
  ],
  ar: [
    { text: "صفقة رائعة!", color: "text-emerald-600" },
    { text: "وقت محدود!", color: "text-amber-600" },
    { text: "لا تفوت الفرصة!", color: "text-indigo-600" },
    { text: "عرض خاص!", color: "text-purple-600" },
    { text: "أفضل قيمة!", color: "text-blue-600" }
  ]
};

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-40 bg-gray-100 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
}

export default function Offers({ limit, user }) {
  const t = useTranslations('Dashboard.Offers');
  const locale = useLocale();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [expandedOffers, setExpandedOffers] = useState(new Set());
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [randomEncouragement, setRandomEncouragement] = useState({ text: "", color: "" });

  // Get texts for current locale, fallback to English
  const currentTexts = ENCOURAGING_TEXTS[locale] || ENCOURAGING_TEXTS['en'];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/offers');
        const data = await response.json();

        if (response.ok) {
          setOffers(data.offers || []);
        } else {
          console.error('Failed to fetch offers:', data.error);
          setOffers([]);
        }
      } catch (error) {
        console.error('An error occurred while fetching offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
    setRandomEncouragement(currentTexts[Math.floor(Math.random() * currentTexts.length)]);
  }, [locale]);

  const toggleReadMore = (e, id) => {
    e.stopPropagation();
    setExpandedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleWhatsApp = (e, offer) => {
    e.stopPropagation();
    const phoneNumber = '393245668944'; // Baraka phone number
    const message = `Salve, vorrei maggiori informazioni su: ${offer.title}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleCardClick = (offer) => {
    setSelectedOffer(offer);
    setRandomEncouragement(currentTexts[Math.floor(Math.random() * currentTexts.length)]);
  };

  const handleCloseModal = () => {
    setSelectedOffer(null);
  };

  const handleNextOffer = (e) => {
    e.stopPropagation();
    if (!selectedOffer) return;
    const currentIndex = offers.findIndex(o => o.id === selectedOffer.id);
    const nextIndex = (currentIndex + 1) % offers.length;
    setSelectedOffer(offers[nextIndex]);
    setRandomEncouragement(currentTexts[Math.floor(Math.random() * currentTexts.length)]);
  };

  const handlePrevOffer = (e) => {
    e.stopPropagation();
    if (!selectedOffer) return;
    const currentIndex = offers.findIndex(o => o.id === selectedOffer.id);
    const prevIndex = (currentIndex - 1 + offers.length) % offers.length;
    setSelectedOffer(offers[prevIndex]);
    setRandomEncouragement(currentTexts[Math.floor(Math.random() * currentTexts.length)]);
  };

  // Helper to check if date is valid and not epoch start
  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    // Check if valid date and year > 1970
    return !isNaN(date.getTime()) && date.getFullYear() > 1970;
  };

  if (loading) {
    return <Skeleton />;
  }

  const displayOffers = limit ? offers.slice(0, limit) : offers.slice(0, visibleCount);

  return (
    <div id="dashboard-offers" className="w-full">
      {!limit && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium border border-red-200">
            {offers.length} {t('active')}
          </span>
        </div>
      )}

      {displayOffers.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className={`grid grid-cols-1 ${limit ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}
          >
            {displayOffers.map((offer, index) => {
              const isExpanded = expandedOffers.has(offer.id);
              const isLongText = offer.description && offer.description.length > 100;

              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => handleCardClick(offer)}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="h-48 relative overflow-hidden">
                    {offer.image_url ? (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                          <Gift className="w-32 h-32 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-colors duration-300"></div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 text-center">
                      {!offer.image_url && (
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full inline-flex mb-3 shadow-lg">
                          <Tag className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white drop-shadow-md px-2 line-clamp-2">{offer.title}</h3>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {offer.offer_type === 'WEEKLY' && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> WEEKLY
                        </span>
                      )}
                      {offer.offer_type === 'SPECIAL' && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-md flex items-center">
                          <Star className="w-3 h-3 mr-1" /> SPECIAL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${offer.offer_type === 'WEEKLY'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-green-50 text-green-700 border-green-100'
                        }`}>
                        {offer.offer_type}
                      </span>
                      {isValidDate(offer.end_date) ? (
                        <span className="flex items-center text-xs text-gray-500 font-medium">
                          <Clock className="w-3 h-3 mr-1 text-red-500" />
                          {Math.ceil((new Date(offer.end_date) - new Date()) / (1000 * 60 * 60 * 24))} {t('days_left')}
                        </span>
                      ) : (
                        <span className={`flex items-center text-xs font-bold ${randomEncouragement.color}`}>
                          <Star className="w-3 h-3 mr-1" />
                          {randomEncouragement.text}
                        </span>
                      )}
                    </div>

                    <div className="mb-6 flex-1">
                      <p className={`text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {offer.description}
                      </p>
                      {isLongText && (
                        <button
                          onClick={(e) => toggleReadMore(e, offer.id)}
                          className="text-xs text-indigo-600 font-medium mt-1 flex items-center hover:text-indigo-800"
                        >
                          {isExpanded ? (
                            <>{t('read_less')} <ChevronUp className="w-3 h-3 ml-1" /></>
                          ) : (
                            <>{t('read_more')} <ChevronDown className="w-3 h-3 ml-1" /></>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      {isValidDate(offer.end_date) ? (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {t('valid_until')} {new Date(offer.end_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className={`text-xs flex items-center font-medium ${randomEncouragement.color}`}>
                          <Gift className="w-3 h-3 mr-1" />
                          {randomEncouragement.text}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleWhatsApp(e, offer)}
                        className="text-green-600 hover:text-green-700 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {!limit && offers.length > visibleCount && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
              >
                {t('load_more') || 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center">
          <div className="w-48 h-48 mb-6 opacity-90">
            <img
              src="/illus/undraw_empty_4zx0.svg"
              alt="No offers"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('no_offers')}</h3>
          <p className="text-gray-500 text-sm">{t('check_back')}</p>
        </div>
      )}

      {/* Offer Details Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              {/* Navigation Buttons - Moved to Top to avoid hiding title */}
              <button
                onClick={handlePrevOffer}
                className="absolute left-4 top-4 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all backdrop-blur-sm hover:scale-110"
                aria-label="Previous Offer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextOffer}
                className="absolute right-4 top-4 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all backdrop-blur-sm hover:scale-110"
                aria-label="Next Offer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="relative h-64 md:h-80 shrink-0">
                {selectedOffer.image_url ? (
                  <img
                    src={selectedOffer.image_url}
                    alt={selectedOffer.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <Gift className="w-32 h-32 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 text-white w-full pr-16">
                  <div className="flex gap-2 mb-2">
                    {selectedOffer.offer_type === 'WEEKLY' && (
                      <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> WEEKLY
                      </span>
                    )}
                    {selectedOffer.offer_type === 'SPECIAL' && (
                      <span className="bg-yellow-400/90 backdrop-blur-sm text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center">
                        <Star className="w-3 h-3 mr-1" /> SPECIAL
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">{selectedOffer.title}</h2>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                    {isValidDate(selectedOffer.end_date) ? (
                      <span>
                        {t('valid_until')} {new Date(selectedOffer.end_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className={`font-bold ${randomEncouragement.color}`}>
                        {randomEncouragement.text}
                      </span>
                    )}
                  </div>
                  {isValidDate(selectedOffer.end_date) && (
                    <div className="flex items-center text-orange-600 font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      {Math.ceil((new Date(selectedOffer.end_date) - new Date()) / (1000 * 60 * 60 * 24))} {t('days_left')}
                    </div>
                  )}
                </div>

                <div className="prose prose-red max-w-none mb-8">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {selectedOffer.description}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={(e) => handleWhatsApp(e, selectedOffer)}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {t('contact_whatsapp')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
