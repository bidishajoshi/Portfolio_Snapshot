"use client";

import { useState } from "react";
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Tag, Eye } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import PhotoViewerModal, { PhotoDetailItem } from '@/components/ui/PhotoViewerModal';

interface StoryDetailClientProps {
 story: {
 id: string;
 title: string;
 introduction?: string | null;
 location?: string | null;
 story_date?: string | null;
 category?: string | null;
 coverImage?: string;
 };
 galleryItems: Array<{
 id: string;
 title: string;
 cloudinary_public_id: string;
 kind: string;
 url: string;
 videoUrl?: string;
 }>;
}

export default function StoryDetailClient({ story, galleryItems }: StoryDetailClientProps) {
 const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

 const allPhotos: PhotoDetailItem[] = [];
 if (story.coverImage) {
 allPhotos.push({
 id: 'cover',
 title: story.title,
 image: story.coverImage,
 location: story.location,
 date: story.story_date,
 category: story.category,
 description: story.introduction,
 });
 }

 for (const item of galleryItems) {
 if (item.kind !== 'video') {
 allPhotos.push({
 id: item.id || item.cloudinary_public_id,
 title: item.title || story.title,
 image: item.url,
 location: story.location,
 date: story.story_date,
 category: story.category,
 });
 }
 }

 return (
 <main className='min-h-screen bg-ink px-6 py-12 md:px-16 md:py-20 text-ivory relative overflow-hidden'>
 <div className='max-w-5xl mx-auto'>
 <Link
 href='/#stories'
 className='inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-yellow hover:text-ivory transition-colors mb-10 cursor-pointer'
 >
 <ArrowLeft size={16} />
 <span>Back to Visual Stories</span>
 </Link>

 {/* Story Metadata Header */}
 <div className='max-w-3xl mb-12'>
 <div className='flex flex-wrap items-center gap-3 text-xs font-mono text-stone-dim mb-4'>
 {story.category && (
 <span className='inline-flex items-center gap-1 text-yellow bg-yellow/10 border border-yellow/30 px-2.5 py-0.5 rounded-full uppercase font-bold text-[10px]'>
 <Tag size={11} />
 <span>{story.category}</span>
 </span>
 )}
 {story.location && (
 <span className='inline-flex items-center gap-1.5 text-ivory/90'>
 <MapPin size={13} className='text-yellow' />
 <span>{story.location}</span>
 </span>
 )}
 {story.location && story.story_date && <span>•</span>}
 {story.story_date && (
 <span className='inline-flex items-center gap-1.5 text-stone'>
 <Calendar size={13} className='text-yellow' />
 <span>{story.story_date}</span>
 </span>
 )}
 </div>

 <h1 className='font-display text-4xl sm:text-5xl md:text-6xl text-ivory leading-tight mb-6'>
 {story.title}
 </h1>

 {story.introduction && (
 <p className='text-stone text-base sm:text-lg leading-relaxed font-light'>
 {story.introduction}
 </p>
 )}
 </div>

 {/* Featured Cover Photo */}
 {story.coverImage && (
 <div
 onClick={() => setActiveModalIndex(0)}
 className='mb-14 rounded-2xl overflow-hidden border border-border/60 shadow-2xl relative group cursor-pointer bg-surface'
 >
 <SafeImage
 src={story.coverImage}
 alt={story.title}
 className='w-full max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-105'
 />
 <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6'>
 <div>
 <p className='text-xs uppercase font-mono tracking-widest text-cyan-glow'>Lead Cover Frame</p>
 <p className='font-display text-xl text-ivory'>{story.title}</p>
 </div>
 <span className='p-3 rounded-full bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow'>
 <Eye size={20} />
 </span>
 </div>
 </div>
 )}

 {/* Story Gallery Grid */}
 {galleryItems.length > 0 && (
 <div className='space-y-6'>
 <h2 className='font-display text-2xl text-ivory border-b border-border/50 pb-3'>
 Frames from this story ({galleryItems.length})
 </h2>

 <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
 {galleryItems.map((item, idx) => {
 const photoIdx = story.coverImage ? idx + 1 : idx;
 return item.kind === 'video' ? (
 <div
 key={item.cloudinary_public_id}
 className='rounded-xl overflow-hidden border border-border/60 bg-surface shadow-lg aspect-[4/3]'
 >
 <video
 controls
 className='w-full h-full object-cover'
 src={item.videoUrl}
 />
 </div>
 ) : (
 <div
 key={item.cloudinary_public_id}
 onClick={() => setActiveModalIndex(photoIdx)}
 className='rounded-xl overflow-hidden border border-border/60 bg-surface shadow-lg aspect-[4/3] relative group cursor-pointer'
 >
 <SafeImage
 src={item.url}
 alt={item.title || story.title}
 className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
 />
 <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4'>
 <p className='text-xs font-semibold text-ivory truncate'>{item.title || story.title}</p>
 {story.location && (
 <p className='text-[11px] text-stone-dim flex items-center gap-1 mt-0.5'>
 <MapPin size={10} /> {story.location}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* Lightbox Modal */}
 <PhotoViewerModal
 photos={allPhotos}
 currentIndex={activeModalIndex}
 onClose={() => setActiveModalIndex(null)}
 onNext={() =>
 setActiveModalIndex((prev) =>
 prev !== null ? (prev + 1) % allPhotos.length : null
 )
 }
 onPrev={() =>
 setActiveModalIndex((prev) =>
 prev !== null ? (prev - 1 + allPhotos.length) % allPhotos.length : null
 )
 }
 onSelectIndex={(index) => setActiveModalIndex(index)}
 />
 </main>
 );
}