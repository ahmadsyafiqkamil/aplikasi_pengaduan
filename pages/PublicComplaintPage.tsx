
import React from 'react';
import ComplaintForm from '../components/public/ComplaintForm';
import PageWrapper from '../components/layout/PageWrapper';

const PublicComplaintPage: React.FC = () => {
  return (
    <PageWrapper title="Buat Laporan Pengaduan Baru">
      <ComplaintForm />
    </PageWrapper>
  );
};

export default PublicComplaintPage;
