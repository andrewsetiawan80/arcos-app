import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import MixDesigner from "../mixlab/MixDesigner";

/** Studio = Mix Lab designer inside Arcos. Mix Lab formulas are catalog bases (no Import). */
export default function Studio() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");

  return (
    <div className="space-y-4 min-w-0">
      <div className="text-xs text-gray-500 flex flex-wrap gap-4 px-0.5 uppercase tracking-wider font-bold leading-normal no-print arcos-no-print">
        <span className="text-gray-400">
          Mix Lab formulas appear as base recipes for Derive / catalog — no import needed
        </span>
        <Link to="/app/mix-projects" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Projects →
        </Link>
        <Link to="/app/mix-log" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Mix log →
        </Link>
        <Link to="/app/recipes" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Base recipes →
        </Link>
        <Link to="/app/derive-recipe" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Derive product recipe →
        </Link>
        <Link to="/app/lab" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Lab notebook →
        </Link>
      </div>

      <MixDesigner shell="arcos" initialProjectId={projectId} />
    </div>
  );
}
