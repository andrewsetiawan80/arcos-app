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
  showWarning?: boolean;
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
  showWarning = true,
}: Props) {
  const [raw, setRaw] = React.useState<string>(value === undefined ? "" : String(value));
  const [showInvalidWarning, setShowInvalidWarning] = React.useState(false);

  React.useEffect(() => {
    const next = value === undefined ? "" : String(value);
    if (next !== raw) setRaw(next);
  }, [value]); // eslint-disable-line

  // Improved regex that allows decimal numbers like 0.02, .02, etc.
  const isValidNumber = (val: string): boolean => {
    // Allow empty string, negative sign, decimal point, and valid number patterns
    if (val === "" || val === "-" || val === "." || val === "-.") return true;
    
    // Allow patterns like: 123, 123.45, .45, 0.45, -123, -123.45, -.45, -0.45
    return /^-?(?:\d+\.?\d*|\.\d+)$/.test(val);
  };

  function commit(val: string) {
    if (val.trim() === "") { 
      onChange(undefined); 
      setShowInvalidWarning(false);
      return; 
    }
    
    if (isValidNumber(val)) {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        if (min !== undefined && num < min) { 
          onChange(min); 
          setShowInvalidWarning(false);
          return; 
        }
        if (max !== undefined && num > max) { 
          onChange(max); 
          setShowInvalidWarning(false);
          return; 
        }
        onChange(num); 
        setShowInvalidWarning(false);
        return;
      }
    }
    onChange(undefined);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    
    // Prevent alphabetic characters and other invalid input
    if (!/^[0-9.\-]*$/.test(v)) {
      setShowInvalidWarning(true);
      return;
    }
    
    setRaw(v);
    setShowInvalidWarning(false);
    
    if (v === "") {
      onChange(undefined);
    } else if (isValidNumber(v)) {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        onChange(n);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88, 90].includes(e.keyCode)) {
      return;
    }
    
    // Allow: numbers, decimal point, minus sign
    if ((e.key >= '0' && e.key <= '9') || e.key === '.' || e.key === '-') {
      return;
    }
    
    // Block everything else (alphabetic characters, special characters, etc.)
    e.preventDefault();
    setShowInvalidWarning(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode={inputMode}
        step={step as any}
        min={min}
        max={max}
        className={`${className} ${showInvalidWarning ? 'border-red-400 bg-red-50/10' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        value={raw}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          let v = raw.trim();
          if (v === "-" || v === "." || v === "-.") v = "";
          setRaw(v);
          commit(v);
          setShowInvalidWarning(false);
        }}
        onFocus={() => setShowInvalidWarning(false)}
      />
      
      {showWarning && showInvalidWarning && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-400/20 z-10">
          Numbers only (0-9, decimal point, minus sign)
        </div>
      )}
    </div>
  );
}
