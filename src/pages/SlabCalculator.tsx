import React, { useMemo, useState } from "react";
import NumberField from "../components/NumberField";

export default function SlabCalculator(){
  const [length_m, setL] = useState<number|undefined>();
  const [width_m, setW] = useState<number|undefined>();
  const [thickness_m, setT] = useState<number|undefined>(0.02); // default 20 mm

  const volume_m3 = useMemo(()=>{
    if (length_m && width_m && thickness_m) return length_m * width_m * thickness_m;
    return undefined;
  },[length_m, width_m, thickness_m]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Volume Calculator</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Slab Calculator
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Calculate concrete volume for slabs by entering length, width, and thickness dimensions.
            </p>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-black text-white">Dimensions</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Length (m)</label>
              <NumberField 
                className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300" 
                value={length_m} 
                onChange={setL} 
                step="0.01" 
                placeholder="Enter length"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Width (m)</label>
              <NumberField 
                className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300" 
                value={width_m} 
                onChange={setW} 
                step="0.01" 
                placeholder="Enter width"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Thickness (m)</label>
              <NumberField 
                className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300" 
                value={thickness_m} 
                onChange={setT} 
                step="0.001" 
                placeholder="Enter thickness"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h2 className="text-lg font-black text-white">Volume Result</h2>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl font-black text-white mb-2">
              {volume_m3 !== undefined ? volume_m3.toFixed(3) : "—"} m³
            </div>
            <div className="text-sm text-gray-400">Concrete Volume Required</div>
          </div>
        </div>
      </section>
    </div>
  );
}
