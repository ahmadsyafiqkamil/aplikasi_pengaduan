
import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AssignedComplaintsAgent from '../components/agent/AssignedComplaintsAgent';
import { useAuth } from '../hooks/useAuth';

const AgentDashboardPage: React.FC = () => {
  const { loggedInUser } = useAuth();
  return (
    <PageWrapper title={`Dashboard Agent: ${loggedInUser?.name || ''}`}>
      <AssignedComplaintsAgent />
    </PageWrapper>
  );
};

export default AgentDashboardPage;
