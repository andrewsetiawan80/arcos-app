import React from "react";

function Stat({label, value, sub}:{label:string; value:string|number; sub?:string}){
  return (
    <div className="rounded-xl border border-white/10 p-5 bg-black/20">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function MixStudio(){
  return (
    <div className="max-w-5xl w-full mx-auto px-4 md:px-0 space-y-6">
      <h1 className="text-2xl font-semibold tracking-wide">Mix Studio</h1>

      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-4">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Your target batch</div>
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Volume (m³)" value={"0.03"} />
          <Stat label="Batch mass (kg)" value={"60"} />
          <Stat label="w/b (derived)" value={"0.19"} />
        </div>
      </section>
    </div>
  );
}
