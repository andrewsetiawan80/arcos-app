import React from "react";

type CardProps = React.PropsWithChildren<{
  className?: string;
  /** Show a thin brass accent bar on the top edge */
  accent?: boolean;
}>;

export default function Card({ children, className, accent = false }: CardProps) {
  return (
    <div
      className={[
        "relative",
        "rounded-2xl border border-white/10",
        "bg-stone-900/50 backdrop-blur-sm",
        "shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
        "p-4 md:p-6 transition",
        "hover:shadow-[0_4px_14px_rgba(0,0,0,0.55)]",
        className ?? ""
      ].join(" ")}
    >
      {accent && (
        <div
          aria-hidden
          className="absolute left-3 right-3 top-0 h-[3px] rounded-b-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(214,163,98,0) 0%, rgba(214,163,98,0.9) 20%, rgba(214,163,98,0.9) 80%, rgba(214,163,98,0) 100%)"
          }}
        />
      )}
      {children}
    </div>
  );
}
