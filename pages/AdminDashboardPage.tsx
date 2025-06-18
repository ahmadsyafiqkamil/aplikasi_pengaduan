
import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ContentFormManagement from '../components/admin/ContentFormManagement';
import UserManagement from '../components/admin/UserManagement';
import ComplaintManagementAdmin from '../components/admin/ComplaintManagementAdmin';
import StatisticsDashboard from '../components/admin/StatisticsDashboard';
import AdminAccountManagement from '../components/admin/AdminAccountManagement';

type AdminTab = "content" | "users" | "complaints" | "stats" | "account";

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("content");

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <ContentFormManagement />;
      case "users":
        return <UserManagement />;
      case "complaints":
        return <ComplaintManagementAdmin />;
      case "stats":
        return <StatisticsDashboard />;
      case "account":
        return <AdminAccountManagement />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabId: AdminTab, label: string}> = ({tabId, label}) => (
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
    <PageWrapper title="Dashboard Admin">
      <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-2">
        <TabButton tabId="content" label="Konten & Form" />
        <TabButton tabId="users" label="Kelola User" />
        <TabButton tabId="complaints" label="Kelola Pengaduan" />
        <TabButton tabId="stats" label="Statistik" />
        <TabButton tabId="account" label="Akun Saya" />
      </div>
      <div>
        {renderTabContent()}
      </div>
    </PageWrapper>
  );
};

export default AdminDashboardPage;
