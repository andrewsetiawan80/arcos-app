import React from "react";
import Card from "./Card";

type SectionProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  /** Show brass accent bar on the card top */
  accent?: boolean;
}>;

/**
 * Section = Card + Header (title / subtitle / actions) with consistent spacing.
 */
export default function Section({ title, subtitle, actions, className, accent = true, children }: SectionProps) {
  return (
    <Card className={className} accent={accent}>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-stone-100">{title}</h2>
          {subtitle ? <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}
