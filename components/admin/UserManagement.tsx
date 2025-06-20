import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, UserRole, ServiceType, CreateUserRequest, UpdateUserRequest } from '../../types';
import { SERVICE_TYPES_AVAILABLE, ROLES_CONFIG } from '../../constants';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Alert from '../common/Alert';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, loggedInUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password?: string;
    role: UserRole.SUPERVISOR | UserRole.AGENT | UserRole.MANAGEMENT;
    serviceTypesHandled: ServiceType[];
  }>({
    name: '',
    username: '',
    role: UserRole.AGENT,
    serviceTypesHandled: [],
  });
  const [error, setError] = useState<string | null>(null);

  const internalUsers = users.filter(u =>
    u.role?.toLowerCase() === 'supervisor' ||
    u.role?.toLowerCase() === 'agent' ||
    u.role?.toLowerCase() === 'admin' ||
    u.role?.toLowerCase() === 'management'
  );

  const openModalForNew = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', role: UserRole.AGENT, serviceTypesHandled: [] });
    setError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role as UserRole.SUPERVISOR | UserRole.AGENT | UserRole.MANAGEMENT, 
      serviceTypesHandled: user.serviceTypesHandled || [],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'role' && value === UserRole.MANAGEMENT) {
        setFormData(prev => ({ ...prev, serviceTypesHandled: [] }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (selectedOptions: ServiceType[]) => {
    setFormData(prev => ({ ...prev, serviceTypesHandled: selectedOptions }));
  };
  
  const handleSubmit = async () => {
    setError(null);
    if (!formData.name.trim() || !formData.username.trim() || (!editingUser && !formData.password) || (formData.password && formData.password.length < 6)) {
      setError('Nama, Username wajib diisi. Password baru minimal 6 karakter jika diisi.');
      return;
    }
    if ((formData.role === UserRole.SUPERVISOR || formData.role === UserRole.AGENT) && formData.serviceTypesHandled.length === 0) {
      setError('Jenis Layanan yang ditangani wajib dipilih untuk Supervisor/Agent.');
      return;
    }

    try {
      if (editingUser) {
        const updates: UpdateUserRequest = {
          name: formData.name,
          username: formData.username,
          role: formData.role.toLowerCase(),
          service_types_handled: (formData.role === UserRole.SUPERVISOR || formData.role === UserRole.AGENT) ? formData.serviceTypesHandled : [],
        };
        if(formData.password) updates.newPassword = formData.password;
        await updateUser(editingUser.id, updates);
      } else {
        const newUser: CreateUserRequest = {
          name: formData.name,
          username: formData.username,
          password: formData.password!,
          role: formData.role.toLowerCase(),
          service_types_handled: (formData.role === UserRole.SUPERVISOR || formData.role === UserRole.AGENT) ? formData.serviceTypesHandled : [],
        };
        await addUser(newUser);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan user.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Yakin ingin menghapus user ini? Ini akan melepaskan mereka dari pengaduan yang ditangani.')) {
      if(loggedInUser && loggedInUser.id === userId) {
        alert("Tidak dapat menghapus akun sendiri dari daftar ini.");
        return;
      }
      try {
        await deleteUser(userId);
      } catch (err: any) {
        setError(err.message || 'Gagal menghapus user.');
      }
    }
  };

  const userModalFooter = (
    <>
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
      <Button variant="primary" onClick={handleSubmit}>Simpan User</Button>
    </>
  );

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
      <div className="flex justify-end mb-4">
        <Button onClick={openModalForNew} variant="primary">
          + Tambah User Baru
        </Button>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan Ditangani</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {internalUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ROLES_CONFIG[user.role]?.name || user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.serviceTypesHandled?.join(', ') || (user.role === UserRole.ADMIN || user.role === UserRole.MANAGEMENT ? 'Semua Layanan' : '-')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {(user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGEMENT) && (
                    <>
                    <Button onClick={() => openModalForEdit(user)} variant="outline" size="sm">Edit</Button>
                    <Button onClick={() => handleDelete(user.id)} variant="danger" size="sm" disabled={loggedInUser?.id === user.id}>Hapus</Button>
                    </>
                  )}
                  {user.role === UserRole.MANAGEMENT && (
                    <Button onClick={() => handleDelete(user.id)} variant="danger" size="sm" disabled={loggedInUser?.id === user.id}>
                      Hapus
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Edit User' : 'Tambah User Baru'}
        footer={userModalFooter}
      >
        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
        <Input label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} required />
        <Input label="Username" name="username" value={formData.username} onChange={handleInputChange} required disabled={!!editingUser} />
        <Input label={`Password ${editingUser ? '(Kosongkan jika tidak ingin diubah)' : ''}`} name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required={!editingUser} />
        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={[
            { value: UserRole.SUPERVISOR, label: ROLES_CONFIG[UserRole.SUPERVISOR].name },
            { value: UserRole.AGENT, label: ROLES_CONFIG[UserRole.AGENT].name },
            { value: UserRole.MANAGEMENT, label: ROLES_CONFIG[UserRole.MANAGEMENT].name },
          ]}
          required
        />
        {(formData.role === UserRole.SUPERVISOR || formData.role === UserRole.AGENT) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan Ditangani (Pilih satu atau lebih)</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
            {SERVICE_TYPES_AVAILABLE.map(st => (
              <label key={st} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                  checked={formData.serviceTypesHandled.includes(st)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newServiceTypes = checked 
                      ? [...formData.serviceTypesHandled, st]
                      : formData.serviceTypesHandled.filter(item => item !== st);
                    handleServiceTypeChange(newServiceTypes);
                  }}
                />
                <span className="ml-2 text-sm text-gray-700">{st}</span>
              </label>
            ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;