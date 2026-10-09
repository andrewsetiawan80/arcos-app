import React, { useState } from 'react';

type Variant = 'regular' | 'short' | 'landscape';

/**
 * Lazy wrapper around CompanyProfileDownloadButton.
 * @react-pdf/renderer and all heavy images are only loaded when the user clicks Download.
 */
export default function CompanyProfileDownloadButtonLazy({ className = '' }: { className?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variant, setVariant] = useState<Variant>('regular');

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // Dynamic import — pulls in @react-pdf/renderer + images only on click
      const mod = await import('./CompanyProfilePDF');
      const { CompanyProfileDocument } = mod;
      // Need to also get the short/landscape variants — they're module-level components
      const DocModule = mod as any;
      const Doc =
        variant === 'short'
          ? DocModule.CompanyProfileShortDocument
          : variant === 'landscape'
          ? DocModule.CompanyProfileLandscapeDocument
          : CompanyProfileDocument;

      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(React.createElement(Doc)).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const suffix = variant === 'short' ? '-Short' : variant === 'landscape' ? '-Landscape' : '';
      link.download = `Arcos-Company-Profile-2025${suffix}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="inline-flex rounded-sm overflow-hidden border border-white/20">
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as Variant)}
          className="bg-[#353535] text-white text-sm px-3 py-2 border-r border-white/10 outline-none cursor-pointer"
        >
          <option value="regular">Regular (7 pages)</option>
          <option value="short">Short (3 pages)</option>
          <option value="landscape">Landscape</option>
        </select>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          style={{ pointerEvents: 'auto' }}
          className={`cursor-pointer disabled:opacity-50 disabled:cursor-wait bg-[#232323] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-[#353535] transition-colors ${className}`}
        >
          <span className="inline-flex items-center gap-2">
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
