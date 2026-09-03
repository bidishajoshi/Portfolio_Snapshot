"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/data/site";

export default function Experience() {
  return (
    <section id="experience" className="section-padding bg-surface-raised relative">
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-label mb-4">Process</h2>
          <h3 className="heading-section mb-6">How I Work</h3>
          <div className="gold-line mx-auto" />
        </motion.div>

        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-border -translate-x-1/2 z-0" />
          
          <div className="space-y-12 md:space-y-0">
            {processSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative z-10 flex flex-col md:flex-row items-center md:items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Content Box */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'} mb-8 md:mb-0 pb-12`}>
                    <div className="glass-card p-8 rounded-lg relative overflow-hidden group hover:border-gold/30 transition-colors">
                      <div className="text-gold/10 font-display text-8xl absolute -right-4 -top-8 font-black select-none pointer-events-none group-hover:text-gold/20 transition-colors duration-500">
                        {step.number}
                      </div>
                      <h4 className="font-display text-2xl text-ivory mb-4 relative z-10">{step.title}</h4>
                      <p className="text-stone leading-relaxed relative z-10">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-gold bg-surface-raised items-center justify-center mt-8 z-20">
                     <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
