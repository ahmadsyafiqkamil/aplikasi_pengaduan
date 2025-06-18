
import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AllComplaintsManagement from '../components/management/AllComplaintsManagement';
import StatisticsDashboard from '../components/admin/StatisticsDashboard'; // Reusing admin's stats view
import Button from '../components/common/Button'; // Added import

type ManagementTab = "allcomplaints" | "stats";

const ManagementDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ManagementTab>("allcomplaints");
  
  // State to force refresh on StatisticsDashboard if needed, passed as key
  const [statsKey, setStatsKey] = useState(Date.now()); 

  const renderTabContent = () => {
    switch (activeTab) {
      case "allcomplaints":
        return <AllComplaintsManagement />;
      case "stats":
        return <StatisticsDashboard key={statsKey} />; // Key forces re-mount and re-fetch if changed
      default:
        return null;
    }
  };
  
  const handleRefresh = () => {
    if(activeTab === 'stats'){
        setStatsKey(Date.now()); // Change key to force re-render/re-fetch of stats
    }
    // For allcomplaints, data is usually live from context, but can add specific refresh logic if needed
  };

  const TabButton: React.FC<{tabId: ManagementTab, label: string}> = ({tabId, label}) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors
            ${activeTab === tabId 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-200 hover:text-primary'
            }`}
    >
        {label}
    </button>
  );


  return (
    <PageWrapper title="Dashboard Manajemen" actions={ <Button onClick={handleRefresh} variant="secondary" size="sm">Refresh Data</Button>}>
      <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-2">
        <TabButton tabId="allcomplaints" label="Daftar Semua Pengaduan" />
        <TabButton tabId="stats" label="Statistik Visual" />
      </div>
      <div>
        {renderTabContent()}
      </div>
    </PageWrapper>
  );
};

export default ManagementDashboardPage;
