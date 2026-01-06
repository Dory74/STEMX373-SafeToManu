import React from "react";
import boprcLightLogo from "../assets/logos/boprcLight.png";
import tccLightLogo from "../assets/logos/tccLight.png";
import uowLightLogo from "../assets/logos/uowlight.png";

function LegalAndLogos() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 ">
        Legal and Liabiltiy info
      </div>

      <div className="flex w-full">
        <div className="flex-1 pr-4">
          <img src={tccLightLogo} alt="TCC logo" />
        </div>
        <div className="flex-1 pr-4">
          <img src={uowLightLogo} alt="TCC logo" />
        </div>
        <div className="flex-1 pr-4">
        <img src={boprcLightLogo} alt="TCC logo" />

        </div>
      </div>
    </div>
  );
}

export default LegalAndLogos;
