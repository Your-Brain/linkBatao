import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Bookmark,
  Eye,
  Globe,
  FileText,
  Music,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Import Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const RecommendationCarousel = ({
  items = [],
  title = "Recommended For You",
  subtitle = "Curated based on your interests and network telemetry",
  loading = false,
  icon = Sparkles,
  onAddToCollection
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const IconComponent = icon;

  // Swiper requires at least 2 * max(slidesPerView) = 8 slides to loop without glitching or stacking.
  // If the collection has fewer items (e.g. 2-7 items), replicate the list so loop mode never stops.
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length < 8) {
      const repetitions = Math.ceil(12 / items.length);
      const expanded = [];
      for (let i = 0; i < repetitions; i++) {
        items.forEach((item, idx) => {
          expanded.push({
            ...item,
            _loopKey: `${item._id || idx}-loop-${i}`
          });
        });
      }
      return expanded;
    }
    return items.map((item, idx) => ({ ...item, _loopKey: item._id || idx }));
  }, [items]);

  if (loading) {
    return (
      <div className="space-y-3.5 my-8 text-left">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-[#0d081e] rounded-xl animate-pulse border border-purple-900/30" />
          <div className="h-8 w-20 bg-[#0d081e] rounded-xl animate-pulse border border-purple-900/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[#0d081e] border border-purple-900/40 animate-pulse overflow-hidden p-3 space-y-3"
            >
              <div className="w-full aspect-video rounded-xl bg-purple-950/40" />
              <div className="h-4 bg-purple-900/40 rounded w-3/4" />
              <div className="h-3 bg-purple-900/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const renderMediaTypeBadge = (type) => {
    switch (type) {
      case 'VIDEO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-semibold text-cyan-300 uppercase tracking-wider">
            <Play className="w-2.5 h-2.5 fill-cyan-300/30" /> Video
          </span>
        );
      case 'ARTICLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono font-semibold text-indigo-300 uppercase tracking-wider">
            <FileText className="w-2.5 h-2.5" /> Reading
          </span>
        );
      case 'AUDIO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-950/80 border border-pink-500/40 text-[10px] font-mono font-semibold text-pink-300 uppercase tracking-wider">
            <Music className="w-2.5 h-2.5" /> Audio
          </span>
        );
      case 'IMAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono font-semibold text-amber-300 uppercase tracking-wider">
            <ImageIcon className="w-2.5 h-2.5" /> Visual
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono font-semibold text-purple-300 uppercase tracking-wider">
            <Globe className="w-2.5 h-2.5" /> Tool / Site
          </span>
        );
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative my-8 space-y-4 text-left"
    >
      {/* Header with Title & Custom Glass Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-purple-glow-sm">
              <IconComponent className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-xs text-purple-300/60 font-sans pl-9 hidden sm:block">
            {subtitle}
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            ref={prevRef}
            aria-label="Previous Slide"
            className="w-8 h-8 rounded-xl bg-[#0d081e] hover:bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 text-purple-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            ref={nextRef}
            aria-label="Next Slide"
            className="w-8 h-8 rounded-xl bg-[#0d081e] hover:bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 text-purple-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swiper Container with Auto-Scroll & Infinite Looping */}
      <div className="relative -mx-2 sm:mx-0">
        <Swiper
          key={`rec-swiper-${displayItems.length}`}
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          loop={displayItems.length >= 4}
          loopPreventsSliding={false}
          loopAdditionalSlides={4}
          grabCursor={true}
          watchSlidesProgress={true}
          autoplay={{
            delay: 3200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          speed={900}
          observer={true}
          observeParents={true}
          spaceBetween={16}
          slidesPerView={1.15}
          touchRatio={1.2}
          resistance={true}
          resistanceRatio={0.85}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            500: {
              slidesPerView: 1.8,
              spaceBetween: 16
            },
            768: {
              slidesPerView: 2.3,
              spaceBetween: 18
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 20
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 20
            }
          }}
          className="pb-8 pt-1 !overflow-visible select-none"
        >
          {displayItems.map((resource) => {
            const isAdult = Boolean(resource.isNsfw || resource.category?.slug === 'sex');

            return (
              <SwiperSlide key={resource._loopKey} className="h-auto">
                <div
                  className={`h-full group flex flex-col justify-between rounded-2xl bg-[#0d081e]/90 hover:bg-[#120a2a] border transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden ${isAdult
                      ? 'border-purple-600/40 hover:border-purple-400/80 shadow-[0_0_15px_rgba(147,51,234,0.12)]'
                      : 'border-purple-900/40 hover:border-purple-500/60'
                    }`}
                >
                  {/* Slide Image Header */}
                  <Link
                    to={`/resources/${resource._id}`}
                    className="relative block aspect-video w-full overflow-hidden bg-[#07040f]"
                  >
                    {resource.thumbnail ? (
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        draggable="false"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 group-hover:opacity-100 pointer-events-none"
                        onError={(e) => {
                          if (!e.target.dataset.triedProxy && resource.thumbnail) {
                            e.target.dataset.triedProxy = 'true';
                            e.target.src = `/api/resources/proxy-image?url=${encodeURIComponent(resource.thumbnail)}`;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#120a2a] via-[#0d081e] to-[#07040f] text-purple-400">
                        {resource.resourceType === 'VIDEO' ? (
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                            <Play className="w-4 h-4 text-purple-300 fill-purple-300/30" />
                          </div>
                        ) : (
                          <Globe className="w-6 h-6 text-purple-400/50" />
                        )}
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      {renderMediaTypeBadge(resource.resourceType)}

                      {isAdult && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-500/50 text-[10px] font-mono font-bold text-purple-300">
                          18+
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Slide Content Body */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300/60">
                        <span className="truncate max-w-[120px]">{resource.domain || 'web'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-purple-400">
                          <Eye className="w-3 h-3" /> {resource.views || 0}
                        </span>
                      </div>

                      <Link to={`/resources/${resource._id}`}>
                        <h3 className="text-xs font-semibold text-white group-hover:text-purple-300 line-clamp-2 leading-snug font-display transition-colors">
                          {resource.title}
                        </h3>
                      </Link>

                      <p className="text-[11px] text-purple-200/60 line-clamp-2 leading-relaxed">
                        {resource.description || 'Explore this signal on AuraLink.'}
                      </p>
                    </div>

                    {/* Slide Footer */}
                    <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/40 text-[10px] font-mono text-purple-300/70 border border-purple-900/40 capitalize">
                          {resource.category?.name || 'General'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {onAddToCollection && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              onAddToCollection(resource);
                            }}
                            title="Save to Collection Vault"
                            className="p-1.5 rounded-lg text-purple-400/70 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open original website"
                          className="p-1.5 rounded-lg text-purple-400/70 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </motion.section>
  );
};
