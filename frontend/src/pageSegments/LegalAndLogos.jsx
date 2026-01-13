import React from "react";
import boprcLightLogo from "../assets/logos/boprcLight.png";
import tccLightLogo from "../assets/logos/tccLight.png";
import uowLightLogo from "../assets/logos/uowDark.png";

const COLORS = {
  midnight: "#030712",
  border: "#0f1b2f",
  label: "#8fb1d4",
};

function LegalAndLogos() {
  return (
    <div className="h-full w-full bg-[#030712] text-white px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-6">
        {/* Legal disclaimer */}
        <div 
          className="rounded-2xl border px-4 py-4 sm:px-6"
          style={{ 
            backgroundColor: COLORS.midnight,
            borderColor: COLORS.border,
          }}
        >
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: COLORS.label }}>
            <span className="font-semibold text-white">Disclaimer:</span> The information provided on this page is for general guidance only. 
            Conditions can change rapidly. Always exercise caution and use your own judgement before entering the water. 
            We accept no liability for any injuries or incidents that may occur.
          </p>
        </div>

        {/* Logo section */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm" style={{ color: COLORS.label }}>Proudly supported by</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            <div className="flex items-center justify-center h-16 sm:h-20">
              <img 
                src={tccLightLogo} 
                alt="Tauranga City Council logo" 
                className="h-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex items-center justify-center h-16 sm:h-20">
              <img 
                src={uowLightLogo} 
                alt="University of Waikato logo" 
                className="h-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex items-center justify-center h-16 sm:h-20">
              <img 
                src={boprcLightLogo} 
                alt="Bay of Plenty Regional Council logo" 
                className="h-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalAndLogos;
