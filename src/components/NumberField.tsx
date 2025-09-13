import React from "react";

type Props = {
  value?: number;
  onChange: (v: number | undefined) => void;
  step?: number | string;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: "numeric" | "decimal";
};

export default function NumberField({
  value,
  onChange,
  step = "any",
  min,
  max,
  className,
  placeholder,
  disabled,
  inputMode = "decimal",
}: Props) {
  const [raw, setRaw] = React.useState<string>(value === undefined ? "" : String(value));

  React.useEffect(() => {
    const next = value === undefined ? "" : String(value);
    if (next !== raw) setRaw(next);
  }, [value]); // eslint-disable-line

  function commit(val: string) {
    if (val.trim() === "") { onChange(undefined); return; }
    if (/^-?\d*\.?\d*$/.test(val)) {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        if (min !== undefined && num < min) { onChange(min); return; }
        if (max !== undefined && num > max) { onChange(max); return; }
        onChange(num); return;
      }
    }
    onChange(undefined);
  }

  return (
    <input
      type="text"
      inputMode={inputMode}
      step={step as any}
      min={min}
      max={max}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      value={raw}
      onChange={(e) => {
        const v = e.target.value;
        setRaw(v);
        if (v === "") onChange(undefined);
        else if (/^-?\d*\.?\d*$/.test(v)) {
          const n = Number(v);
          if (!Number.isNaN(n)) onChange(n);
        }
      }}
      onBlur={() => {
        let v = raw.trim();
        if (v === "-" || v === "." || v === "-.") v = "";
        setRaw(v);
        commit(v);
      }}
    />
  );
}
