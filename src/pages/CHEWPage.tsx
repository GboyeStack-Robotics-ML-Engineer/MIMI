import { CHEWDashboard } from '../components/CHEWDashboard';
import { useDemoData } from '../hooks/useDemoData';

export const CHEWPage = () => {
  const { chewPatients } = useDemoData();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50">
      <CHEWDashboard patients={chewPatients} chewName="Nurse Adaeze Nwankwo" />
    </div>
  );
};
