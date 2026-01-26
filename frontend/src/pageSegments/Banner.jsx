import StatusGood from '../widgets/status/StatusGood.jsx';
import StatusModerate from '../widgets/status/StatusModerate.jsx';
import StatusBad from '../widgets/status/StatusBad.jsx';
import { useWarningLevel } from '../context/WarningLevelContext.jsx';

function Banner() {
  const { warningData } = useWarningLevel();

  // Render appropriate status based on warning level
  const renderStatus = () => {
    switch (warningData.level) {
      case 2:
        return <StatusModerate message={warningData.message} />;
      case 3:
        return <StatusBad message={warningData.message} />;
      case 1:
      default:
        return <StatusGood message={warningData.message} />;
    }
  };

  return (
    <>
      {renderStatus()}
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full max-h-[100px] leading-0">
        <svg viewBox="0 0 1440 100" className="w-full h-40px">
          <path 
            fill="#02060f" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z"
          ></path>
        </svg>
      </div>
    </>
  );
}

export default Banner;
