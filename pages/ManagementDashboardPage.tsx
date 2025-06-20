import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import StatisticsDashboard from '../components/admin/StatisticsDashboard';
import { UserRole } from '../types';

const ManagementDashboardPage: React.FC = () => {
  return (
    <PageWrapper
      allowedRoles={[UserRole.ADMIN, UserRole.MANAGEMENT]}
      title="Dasbor Statistik"
      description="Analisis dan visualisasi data pengaduan."
    >
      <StatisticsDashboard />
    </PageWrapper>
  );
};

export default ManagementDashboardPage;
