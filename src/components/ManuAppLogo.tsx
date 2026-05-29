import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * High-fidelity representation of the original attached "ManuApp" logo.
 * It strictly preserves the "originality of the photo without removing the background"
 * by encapsulating the emblem and wordmark inside a soft, clean off-white canvas/card
 * with a subtle gradient, resembling the original uploaded image file.
 */
export const ManuAppLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md"
}) => {
  // Dimensions based on selected size
  let containerClasses = "w-full";
  let cardHeight = "h-36"; // default md layout
  let iconScale = "scale-100";

  if (size === "sm") {
    cardHeight = "h-28";
    iconScale = "scale-75";
  } else if (size === "lg") {
    cardHeight = "h-48";
    iconScale = "scale-125";
  }

  return (
    <div className={`relative flex flex-col justify-center items-center select-none overflow-hidden rounded-xl border border-slate-200/45 shadow-sm bg-radial from-slate-50 to-slate-100/90 ${cardHeight} ${containerClasses} ${className}`}>
      
      {/* Dynamic graphic area mimicking the attached photograph */}
      <div className={`flex flex-col items-center justify-center transform transition-transform ${iconScale}`}>
        
        {/* Vector SVG duplicating the emblem with exact proportions */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 160 110"
          className="w-32 h-22"
          fill="none"
        >
          {/* Subtle glow / drop shadow filters if needed */}
          <defs>
            <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#091e42" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* BACKGROUND LAYER ELEMENTS - GEAR WHEEL (DEEP NAVY BLUE) */}
          <g filter="url(#subtle-shadow)">
            {/* Gear circle & internal cutouts to resemble background cog */}
            <path
              d="M 64.5 17.5 C 50.1 20.3 38.4 31.9 35.6 46.3 L 31.8 44.5 M 39.5 28.5 L 36.5 21.0 M 52.0 16.5 L 52.0 8.0"
              stroke="#0b335e"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main Gear Segment Body */}
            <path
              d="M 65 14 A 36 36 0 0 0 35 60 C 35.5 64.5 37 68.5 39 72 L 35 77 L 41 83 L 46 80 C 51.5 84 58.5 86 66 85 C 70.5 84.5 74.5 83 78 81"
              stroke="#0b335e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Gear teeth/cogs left-side details */}
            <path d="M 33 40 L 25 38" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 32 54 L 24 55" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 36.5 67 L 30 71" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 44.5 78.5 L 39 85" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 57 85 L 55 93" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 71 85.5 L 72.5 93.5" stroke="#0b335e" strokeWidth="5.5" strokeLinecap="round" />
          </g>

          {/* FRONT-RIGHT ELEMENT - LIGHT BLUE CIRCULAR SWEEP & ARROW (ELECTRIC BLUE) */}
          <g>
            {/* Sweeping circle arc ending in top-right arrow */}
            <path
              d="M 103 82 C 114.5 68.5 112 47.5 96.5 36.5 C 81.5 25.5 59.5 27 49.5 41 C 41.5 52 42.5 67.5 51 77"
              stroke="#3ca9e2"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* The sweeping circle outer border */}
            <path
              d="M 100 81 C 111 67.5 109 46.5 94.5 35.5 C 80 24.5 58.5 26 48.5 39.5"
              stroke="#3ca9e2"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Ascending Arrowhead (↗) pointing towards high-growth/speed and modern look */}
            <path
              d="M 94.5 34.5 L 111.5 34 L 103 49.5 Z"
              fill="#3ca9e2"
              stroke="#3ca9e2"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>

          {/* MID-LAYER INTEGRATION - THE CENTRAL DIAGONAL WRENCH (NAVY BLUE) */}
          <g filter="url(#subtle-shadow)">
            {/* Angled Wrench Handle */}
            <path
              d="M 45 83 L 78 51.5"
              stroke="#0b335e"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Open Wrench Claw at the bottom-left */}
            <path
              d="M 48 81 C 45.1 83.5 39.2 81.5 35 77 C 30.5 72.5 29.5 66.5 32 63 C 34.5 59.5 40 60 45 64.5 L 43.5 66.5 C 40 63.3 37.2 63 35.5 65.5 C 33.8 68 34.5 71.5 38 75 C 41.5 78.5 45.2 78.8 46.8 76.5 L 48 81 Z"
              fill="#0b335e"
            />
            {/* Highlights inside wrench head */}
            <path
              d="M 33.5 76 L 44.5 65"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* FOREGROUND - REAL-TIME CHECKMARK OF COMPLETION/QUALITY (ELECTRIC BLUE) */}
          <g>
            <path
              d="M 68 64 L 79.5 75.5 L 104 46"
              stroke="#3ca9e2"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>

        {/* Wordmark precisely matching both wording and custom dual-tone */}
        <div className="flex items-center mt-1.5 font-sans">
          <span className="font-extrabold text-2xl tracking-tight text-[#0b335e]">
            Manu
          </span>
          <span className="font-extrabold text-2xl tracking-tight text-[#3ca9e2] ml-0.5">
            App
          </span>
        </div>
      </div>
      
    </div>
  );
};
