import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { StatsData, ComplaintStatus, ServiceType, AgentStat } from '../../types';
import Button from '../common/Button';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants';

const StatisticsDashboard: React.FC = () => {
  const { getStats } = useComplaints();
  const { users } = useAuth(); // Need users to identify agents
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = () => {
    setIsLoading(true);
    // Simulate API call delay for realism if needed
    setTimeout(() => {
      const currentStats = getStats(users);
      setStats(currentStats);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]); // Reload if users list changes (e.g. new agent added)

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

  if (isLoading && !stats) {
    return <div className="text-center py-10">Memuat statistik...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p>Tidak ada data statistik untuk ditampilkan.</p>
        <Button onClick={loadStats} isLoading={isLoading} className="mt-4">Muat Ulang Statistik</Button>
      </div>
    );
  }
  
  const statusChartData = stats.statusDistribution.filter(s => s.count > 0).map(s => ({
      name: COMPLAINT_STATUS_OPTIONS.find(opt => opt.value === s.status)?.label || s.status,
      value: s.count
  }));

  const serviceTypeChartData = stats.serviceTypeDistribution.filter(s => s.count > 0).map(s => ({
      name: s.serviceType,
      value: s.count
  }));

  const agentCompletedChartData = stats.agentPerformance.map(ap => ({
      name: ap.agentName,
      "Kasus Diselesaikan": ap.totalCompleted
  }));
  
  const agentTimeChartData = stats.agentPerformance.map(ap => ({
      name: ap.agentName,
      "Rata-Rata Waktu (Hari)": parseFloat(ap.avgResolutionTimeDays.toFixed(1)) // Changed to Days
  }));


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Statistik Pengaduan</h2>
        <Button onClick={loadStats} isLoading={isLoading} variant="secondary">
          Refresh Statistik
        </Button>
      </div>
      <p className="text-sm text-gray-500">Statistik terakhir dihitung pada: {stats.lastCalculated}</p>

      {/* Ringkasan Umum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-700">Total Pengaduan</h3>
          <p className="text-3xl font-bold text-blue-900">{stats.totalComplaints}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-700">Tingkat Penyelesaian</h3>
          <p className="text-3xl font-bold text-green-900">{stats.completionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-700">Rata-rata Waktu Penyelesaian</h3>
          <p className="text-3xl font-bold text-yellow-900">{stats.averageResolutionTimeDays.toFixed(1)} Hari</p> {/* Changed to Hari */}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribusi Pengaduan per Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10">Tidak ada data untuk chart status.</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribusi Pengaduan per Jenis Layanan</h3>
           {serviceTypeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie data={serviceTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                    {serviceTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
           ): <p className="text-gray-500 text-center py-10">Tidak ada data untuk chart jenis layanan.</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Jumlah Pengaduan Diselesaikan per Agent</h3>
          {agentCompletedChartData.filter(d => d["Kasus Diselesaikan"] > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentCompletedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Kasus Diselesaikan" fill="#82Ca9D" />
                </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10">Belum ada kasus yang diselesaikan oleh agent.</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Rata-Rata Waktu Penyelesaian per Agent (Hari)</h3> {/* Changed to Hari */}
          {agentTimeChartData.filter(d => d["Rata-Rata Waktu (Hari)"] > 0).length > 0 ? ( // Changed to Hari
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentTimeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Rata-Rata Waktu (Hari)" fill="#8884d8" /> {/* Changed to Hari */}
                </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10">Belum ada data waktu penyelesaian oleh agent.</p>}
        </div>
      </div>

      {/* Detail Performa Agent */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Detail Performa Agent</h3>
        {stats.agentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ditugaskan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diselesaikan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dalam Proses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata Waktu (Hari)</th> {/* Changed to Hari */}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {stats.agentPerformance.map(ap => (
                    <tr key={ap.agentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ap.agentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ap.totalAssigned}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ap.totalCompleted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ap.totalInProgress}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ap.avgResolutionTimeDays.toFixed(1)}</td> {/* Changed to Days */}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        ) : <p className="text-gray-500 text-center py-10">Tidak ada data performa agent.</p>}
      </div>
    </div>
  );
};

export default StatisticsDashboard;