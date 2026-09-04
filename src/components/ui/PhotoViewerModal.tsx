"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';

export interface PhotoDetailItem {
 id: string;
 title: string;
 image: string;
 location?: string | null;
 date?: string | null;
 category?: string | null;
 description?: string | null;
}

interface PhotoViewerModalProps {
 photos: PhotoDetailItem[];
 currentIndex: number | null;
 onClose: () => void;
 onNext?: () => void;
 onPrev?: () => void;
 onSelectIndex?: (index: number) => void;
}

export default function PhotoViewerModal({
 photos,
 currentIndex,
 onClose,
 onNext,
 onPrev,
 onSelectIndex,
}: PhotoViewerModalProps) {
 const isOpen = currentIndex !== null && photos[currentIndex] !== undefined;
 const currentPhoto = isOpen ? photos[currentIndex] : null;

 const handleKeyDown = useCallback(
 (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 if (e.key === 'ArrowRight' && onNext) onNext();
 if (e.key === 'ArrowLeft' && onPrev) onPrev();
 },
 [onClose, onNext, onPrev]
 );

 useEffect(() => {
 if (!isOpen) return;
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, handleKeyDown]);

 if (!isOpen || !currentPhoto) return null;

 const displayTitle = currentPhoto.title?.trim() || 'Photographic Story';
 const displayLocation = currentPhoto.location?.trim() || null;
 const displayDate = currentPhoto.date?.trim() || null;
 const displayCategory = currentPhoto.category?.trim() || null;
 const displayDescription = currentPhoto.description?.trim() || null;

 return (
 <AnimatePresence>
 <div
 className='lightbox-overlay z-[200] flex flex-col items-center justify-between p-3 sm:p-6 select-none'
 onClick={onClose}
 >
 <div
 className='w-full flex items-center justify-between px-3 py-2 z-20 max-w-6xl'
 onClick={(e) => e.stopPropagation()}
 >
 <div className='flex items-center gap-2 text-xs font-mono text-stone-dim'>
 <span className='text-cyan-glow font-bold'>{currentIndex + 1}</span>
 <span>/</span>
 <span>{photos.length}</span>
 </div>

 <button
 onClick={onClose}
 className='text-stone hover:text-ivory transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer'
 title='Close'
 >
 <X size={24} />
 </button>
 </div>

 <div
 className='relative flex-1 flex items-center justify-center w-full max-h-[72vh] my-auto'
 onClick={(e) => e.stopPropagation()}
 >
 {photos.length > 1 && onPrev && (
 <button
 onClick={onPrev}
 className='absolute left-1 sm:left-4 text-stone hover:text-yellow transition-colors p-3 rounded-full hover:bg-white/10 z-20 cursor-pointer'
 title='Previous photo'
 >
 <ChevronLeft size={36} />
 </button>
 )}

 <motion.div
 key={currentPhoto.id}
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.96 }}
 transition={{ duration: 0.25 }}
 className='max-h-[72vh] max-w-[90vw] flex items-center justify-center'
 >
 <SafeImage
 src={currentPhoto.image}
 alt={displayTitle}
 className='max-h-[72vh] max-w-[90vw] object-contain shadow-2xl rounded-lg'
 />
 </motion.div>

 {photos.length > 1 && onNext && (
 <button
 onClick={onNext}
 className='absolute right-1 sm:right-4 text-stone hover:text-yellow transition-colors p-3 rounded-full hover:bg-white/10 z-20 cursor-pointer'
 title='Next photo'
 >
 <ChevronRight size={36} />
 </button>
 )}
 </div>

 <div
 className='w-full max-w-4xl bg-ink/95 border border-border/80 p-4 rounded-xl backdrop-blur-xl flex flex-col items-center gap-3 z-20 mt-2 shadow-2xl'
 onClick={(e) => e.stopPropagation()}
 >
 <div className='text-center max-w-2xl'>
 <h3 className='font-display text-xl sm:text-2xl text-ivory mb-1'>
 {displayTitle}
 </h3>

 <div className='flex flex-wrap items-center justify-center gap-3 text-xs text-stone-dim mt-1 font-mono'>
 {displayCategory && (
 <span className='inline-flex items-center gap-1 text-yellow font-medium'>
 <Tag size={12} /> {displayCategory}
 </span>
 )}
 {displayLocation && (
 <span className='inline-flex items-center gap-1 text-ivory/80'>
 <MapPin size={12} className='text-yellow' /> {displayLocation}
 </span>
 )}
 {displayDate && (
 <span className='inline-flex items-center gap-1 text-ivory/80'>
 <Calendar size={12} className='text-yellow' /> {displayDate}
 </span>
 )}
 </div>

 {displayDescription && (
 <p className='text-xs sm:text-sm text-stone mt-2 line-clamp-2 leading-relaxed'>
 {displayDescription}
 </p>
 )}
 </div>

 {photos.length > 1 && onSelectIndex && (
 <div className='flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-thin'>
 {photos.map((thumb, idx) => (
 <button
 key={thumb.id}
 type="button"
 onClick={() => onSelectIndex(idx)}
 className={`relative w-12 h-12 rounded overflow-hidden shrink-0 border transition-all cursor-pointer ${
 idx === currentIndex
 ? "border-yellow ring-2 ring-yellow/40 scale-105"
 : "border-border/40 opacity-60 hover:opacity-100"
 }`}
 >
 <SafeImage src={thumb.image} alt={thumb.title} className='w-full h-full object-cover' />
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
 </AnimatePresence>
 );
}
