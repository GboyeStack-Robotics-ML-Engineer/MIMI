import { HospitalAlert } from '../components/HospitalAlert';
import { useDemoData } from '../hooks/useDemoData';

export const HospitalPage = () => {
  const { alerts, acknowledgeAlert, dismissAlert } = useDemoData();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50">
      <HospitalAlert
        alerts={alerts}
        hospitalName="Lagos University Teaching Hospital (LUTH)"
        onAcknowledge={acknowledgeAlert}
        onDismiss={dismissAlert}
        enableSound={true}
      />
    </div>
  );
};
