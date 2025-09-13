import React, { useMemo, useState } from "react";
import NumberField from "../components/NumberField";

export default function SlabPlanner(){
  const [length_m, setL] = useState<number|undefined>();
  const [width_m, setW] = useState<number|undefined>();
  const [thickness_m, setT] = useState<number|undefined>(0.02); // default 20 mm

  const volume_m3 = useMemo(()=>{
    if (length_m && width_m && thickness_m) return length_m * width_m * thickness_m;
    return undefined;
  },[length_m, width_m, thickness_m]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-wide">Slab Calculator</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Length (m)</div>
          <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm" value={length_m} onChange={setL} step="0.01" />
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Width (m)</div>
          <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm" value={width_m} onChange={setW} step="0.01" />
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Thickness (m)</div>
          <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm" value={thickness_m} onChange={setT} step="0.001" />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4 bg-black/20">
        <div className="text-xs text-gray-400">Volume</div>
        <div className="text-2xl font-semibold mt-1">{volume_m3 !== undefined ? volume_m3.toFixed(3) : "—"} m³</div>
      </div>
    </div>
  );
}
