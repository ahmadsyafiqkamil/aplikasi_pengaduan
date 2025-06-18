
import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import NewAssignmentSupervisor from '../components/supervisor/NewAssignmentSupervisor';
import StatusApprovalSupervisor from '../components/supervisor/StatusApprovalSupervisor';
import AgentMonitoringSupervisor from '../components/supervisor/AgentMonitoringSupervisor';
import AllServiceCasesSupervisor from '../components/supervisor/AllServiceCasesSupervisor';

type SupervisorTab = "assignment" | "approval" | "monitoring" | "allcases";

const SupervisorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SupervisorTab>("assignment");

  const renderTabContent = () => {
    switch (activeTab) {
      case "assignment":
        return <NewAssignmentSupervisor />;
      case "approval":
        return <StatusApprovalSupervisor />;
      case "monitoring":
        return <AgentMonitoringSupervisor />;
      case "allcases":
        return <AllServiceCasesSupervisor />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabId: SupervisorTab, label: string}> = ({tabId, label}) => (
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
    <PageWrapper title="Dashboard Supervisor">
      <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-2">
        <TabButton tabId="assignment" label="Penugasan Baru" />
        <TabButton tabId="approval" label="Persetujuan Status" />
        <TabButton tabId="monitoring" label="Monitoring Agent" />
        <TabButton tabId="allcases" label="Semua Kasus Layanan" />
      </div>
      <div>
        {renderTabContent()}
      </div>
    </PageWrapper>
  );
};

export default SupervisorDashboardPage;
