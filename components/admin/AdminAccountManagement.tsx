
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Select from '../common/Select'; // Added Select
import { UserRole, User } from '../../types'; // Added User

const AdminAccountManagement: React.FC = () => {
  const { loggedInUser, updateUser, users } = useAuth(); // Added users

  // State for Admin's own password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for Management user password change
  const [selectedManagementUserId, setSelectedManagementUserId] = useState<string>('');
  const [newMgmtPassword, setNewMgmtPassword] = useState('');
  const [confirmNewMgmtPassword, setConfirmNewMgmtPassword] = useState('');
  const [mgmtPasswordMessage, setMgmtPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMgmtPasswordLoading, setIsMgmtPasswordLoading] = useState(false);

  const managementUsers = useMemo(() => {
    return users.filter(user => user.role === UserRole.MANAGEMENT);
  }, [users]);

  if (!loggedInUser) return null;

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'Semua field untuk password Admin wajib diisi.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Password baru Admin dan konfirmasi tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru Admin minimal 6 karakter.' });
      return;
    }

    if (loggedInUser.passwordHash !== currentPassword) { 
        setMessage({ type: 'error', text: 'Password Admin saat ini salah.' });
        return;
    }
    
    setIsLoading(true);
    try {
      await updateUser(loggedInUser.id, { newPassword: newPassword });
      setMessage({ type: 'success', text: 'Password Admin berhasil diubah.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah password Admin.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeManagementPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMgmtPasswordMessage(null);
    if (!selectedManagementUserId) {
      setMgmtPasswordMessage({ type: 'error', text: 'Pilih akun Manajemen terlebih dahulu.' });
      return;
    }
    if (!newMgmtPassword || !confirmNewMgmtPassword) {
      setMgmtPasswordMessage({ type: 'error', text: 'Password baru dan konfirmasi untuk akun Manajemen wajib diisi.' });
      return;
    }
    if (newMgmtPassword !== confirmNewMgmtPassword) {
      setMgmtPasswordMessage({ type: 'error', text: 'Password baru akun Manajemen dan konfirmasi tidak cocok.' });
      return;
    }
    if (newMgmtPassword.length < 6) {
      setMgmtPasswordMessage({ type: 'error', text: 'Password baru akun Manajemen minimal 6 karakter.' });
      return;
    }
    
    setIsMgmtPasswordLoading(true);
    try {
      await updateUser(selectedManagementUserId, { newPassword: newMgmtPassword });
      setMgmtPasswordMessage({ type: 'success', text: `Password untuk akun Manajemen '${managementUsers.find(u=>u.id === selectedManagementUserId)?.name}' berhasil diubah.` });
      setNewMgmtPassword('');
      setConfirmNewMgmtPassword('');
      // Optionally deselect user: setSelectedManagementUserId(''); 
    } catch (err: any) {
      setMgmtPasswordMessage({ type: 'error', text: err.message || 'Gagal mengubah password akun Manajemen.' });
    } finally {
      setIsMgmtPasswordLoading(false);
    }
  };


  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Akun Saya (Admin)</h3>
        <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
          <p><span className="font-medium">Nama:</span> {loggedInUser.name}</p>
          <p><span className="font-medium">Username:</span> {loggedInUser.username}</p>
          <p><span className="font-medium">Role:</span> Admin</p>
        </div>

        <h4 className="text-lg font-semibold mb-4 text-gray-700">Ubah Password Saya</h4>
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}
        <form onSubmit={handleChangeAdminPassword} className="space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Simpan Password Saya
          </Button>
        </form>
      </div>

      <hr className="my-8"/>

      <div>
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Kelola Password Akun Manajemen</h3>
        {managementUsers.length > 0 ? (
            <>
            <Select
                label="Pilih Akun Manajemen"
                value={selectedManagementUserId}
                onChange={(e) => {
                    setSelectedManagementUserId(e.target.value);
                    setMgmtPasswordMessage(null); // Clear message when user changes
                    setNewMgmtPassword('');
                    setConfirmNewMgmtPassword('');
                }}
                options={[{ value: '', label: '-- Pilih Akun --' }, ...managementUsers.map(user => ({ value: user.id, label: `${user.name} (${user.username})` }))]}
                containerClassName="mb-4"
            />

            {selectedManagementUserId && (
                <form onSubmit={handleChangeManagementPassword} className="space-y-4 mt-4">
                {mgmtPasswordMessage && <Alert type={mgmtPasswordMessage.type} message={mgmtPasswordMessage.text} onClose={() => setMgmtPasswordMessage(null)} />}
                <p className="text-sm text-gray-600">Mengubah password untuk: <span className="font-semibold">{managementUsers.find(u=>u.id === selectedManagementUserId)?.name}</span></p>
                <Input
                    label="Password Baru untuk Akun Manajemen"
                    type="password"
                    value={newMgmtPassword}
                    onChange={(e) => setNewMgmtPassword(e.target.value)}
                    required
                />
                <Input
                    label="Konfirmasi Password Baru"
                    type="password"
                    value={confirmNewMgmtPassword}
                    onChange={(e) => setConfirmNewMgmtPassword(e.target.value)}
                    required
                />
                <Button type="submit" variant="primary" isLoading={isMgmtPasswordLoading}>
                    Simpan Password Manajemen
                </Button>
                </form>
            )}
            </>
        ) : (
            <p className="text-gray-500">Tidak ada akun Manajemen yang terdaftar.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAccountManagement;
