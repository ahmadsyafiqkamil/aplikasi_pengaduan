import React, { useState, useEffect } from 'react';
import { useAppConfig } from '../../hooks/useAppConfig';
import { AppContentConfig, CustomFormFieldDefinition, FormFieldType } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Select from '../common/Select';
import Modal from '../common/Modal';

interface Setting {
  key: string;
  value: string;
}

interface SettingsMap {
  [key: string]: string;
}

const ContentFormManagement: React.FC = () => {
  const { config, updateConfig, addCustomField, updateFormField, deleteCustomField, reorderFields } = useAppConfig();
  const [formData, setFormData] = useState<AppContentConfig>(config);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFormFieldDefinition | null>(null);
  const [customFieldModalError, setCustomFieldModalError] = useState<string | null>(null);
  const [newCustomField, setNewCustomField] = useState<Omit<CustomFormFieldDefinition, 'id' | 'order' | 'isVisible'>>({
    label: '',
    type: FormFieldType.TEXT_SINGKAT,
    isRequired: false,
    placeholder: '',
    options: [],
  });

  const [allManageableFields, setAllManageableFields] = useState<(CustomFormFieldDefinition | any)[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json() as Setting[];
        const settingsMap: SettingsMap = {};
        data.forEach((setting: Setting) => {
          settingsMap[setting.key] = setting.value;
        });
        setFormData((prev) => ({
          ...prev,
          bannerTitle: settingsMap["adminBannerTitle"] || "",
          bannerDescription: settingsMap["adminBannerDescription"] || "",
          complaintFlow: settingsMap["adminComplaintFlow"] || "",
          socialMedia: settingsMap["adminSocialMedia"] || ""
        }));
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Update formData state when the global config changes (e.g., after saving or initial load)
    setFormData(config);
  }, [config]);

  useEffect(() => {
    // This effect rebuilds `allManageableFields` whenever relevant parts of `config` or `formData.formTexts` change.
    const standardFieldsArray = Object.entries(config.standardFieldsOrderAndVisibility)
      .map(([id, data]) => {
        const formTextKey = `${id}Label`;
        const label = formData.formTexts && formData.formTexts[formTextKey] 
                      ? formData.formTexts[formTextKey] 
                      : data.label;
        return { 
            ...data, 
            id, 
            label: label,
            isCustom: false, 
            type: 'standard' as FormFieldType
        };
      }); 
    
    const customFieldsArray = config.customFormFields.map(cf => ({ ...cf, isCustom: true }));
    
    const combined = [...standardFieldsArray, ...customFieldsArray];
    combined.sort((a,b) => a.order - b.order);
    setAllManageableFields(combined);
  }, [
      config.standardFieldsOrderAndVisibility, 
      config.customFormFields, 
      formData.formTexts
  ]);

  const saveSetting = async (key: string, value: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3000/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ key, value })
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: keyof AppContentConfig | 'socialMedia', subKey?: string) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (section === 'formTexts' && subKey) {
      setFormData(prev => ({
        ...prev,
        formTexts: { ...prev.formTexts, [name]: value },
      }));
    } else if (section === 'socialMedia') {
         setFormData(prev => ({ ...prev, [name]: value }));
    }
     else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSaveAll = () => {
    // First, update the general configuration with data from the form (banner, descriptions, formTexts, social media links)
    // This will also persist the current state of customFormFields and standardFieldsOrderAndVisibility as they are in `formData` (due to useEffect syncing formData with config)
    updateConfig(formData); 
    
    // Then, apply any reordering or visibility changes made specifically in the `allManageableFields` list.
    // `reorderFields` is designed to update the order and visibility properties in the main config.
    reorderFields(allManageableFields); 
    
    alert('Perubahan Konten & Form berhasil disimpan!');
  };

  const openNewCustomFieldModal = () => {
    setEditingField(null);
    setNewCustomField({ label: '', type: FormFieldType.TEXT_SINGKAT, isRequired: false, placeholder: '', options: [] });
    setCustomFieldModalError(null);
    setIsCustomFieldModalOpen(true);
  };

  const openEditCustomFieldModal = (field: CustomFormFieldDefinition) => {
    setEditingField(field);
    setNewCustomField({ ...field, options: field.options || [] });
    setCustomFieldModalError(null);
    setIsCustomFieldModalOpen(true);
  };

  const handleCustomFieldModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setNewCustomField(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "options") {
         setNewCustomField(prev => ({ ...prev, [name]: value.split(',').map(s=>s.trim()) }));
    }
    else {
        setNewCustomField(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveCustomField = () => {
    setCustomFieldModalError(null);
    if (!newCustomField.label.trim() || (newCustomField.type === FormFieldType.PILIHAN && (!newCustomField.options || newCustomField.options.length === 0 || newCustomField.options.some(o => !o.trim())))) {
      setCustomFieldModalError('Label field dan Opsi (untuk tipe Pilihan) wajib diisi dan valid.');
      return;
    }
    if (editingField) {
      updateFormField(editingField.id, newCustomField);
    } else {
      // When adding a new custom field, it's added to `config.customFormFields` via `addCustomField`.
      // The `useEffect` listening to `config.customFormFields` will then update `allManageableFields`.
      addCustomField(newCustomField);
    }
    setIsCustomFieldModalOpen(false);
  };

  const handleFieldVisibilityChange = (fieldId: string, isVisible: boolean) => {
     setAllManageableFields(prevFields => prevFields.map(f => f.id === fieldId ? {...f, isVisible} : f));
  };
  
  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = allManageableFields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= allManageableFields.length) return;

    const newFields = [...allManageableFields];
    const [movedField] = newFields.splice(currentIndex, 1);
    newFields.splice(newIndex, 0, movedField);
    
    // Update local `allManageableFields` state with new order. `reorderFields` on save will persist this to global config.
    setAllManageableFields(newFields.map((f, idx) => ({ ...f, order: idx })));
  };

  const customFieldModalFooter = (
    <>
      <Button variant="outline" onClick={() => setIsCustomFieldModalOpen(false)}>Batal</Button>
      <Button variant="primary" onClick={handleSaveCustomField}>Simpan Field</Button>
    </>
  );


  return (
    <div className="space-y-8">
      {/* Banner Management */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-primary">Kelola Banner Utama</h3>
        <Input label={config.formTexts.adminBannerTitleLabel || "Judul Utama Banner"} name="bannerTitle" value={formData.bannerTitle} onChange={handleInputChange} />
        <Textarea label={config.formTexts.adminBannerDescriptionLabel || "Deskripsi Utama Banner"} name="bannerDescription" value={formData.bannerDescription} onChange={handleInputChange} />
        <Input label={config.formTexts.adminBannerImageUrlLabel || "URL Gambar Banner"} name="bannerImageUrl" value={formData.bannerImageUrl} onChange={handleInputChange} />
      </section>

      {/* Complaint Flow Management */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-1 text-primary">Kelola Bagian Alur Pengaduan</h3>
        <p className="text-sm text-gray-500 mb-3">Atur judul, deskripsi, dan visibilitas bagian alur pengaduan di halaman utama.</p>
        <Input label={config.formTexts.adminFlowTitleLabel || "Judul Bagian Alur"} name="complaintFlowTitle" value={formData.complaintFlowTitle} onChange={handleInputChange} />
        <Textarea label={config.formTexts.adminFlowDescriptionLabel || "Deskripsi Bagian Alur"} name="complaintFlowDescription" value={formData.complaintFlowDescription} onChange={handleInputChange} />
        <div className="mt-4">
            <label className="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    name="showComplaintFlowSection"
                    checked={formData.showComplaintFlowSection}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                />
                <span className="ml-2 text-gray-700">{config.formTexts.adminFlowShowSectionLabel || "Tampilkan Bagian Alur di Halaman Utama"}</span>
            </label>
        </div>
      </section>

      {/* Social Media Links Management */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-primary">{config.formTexts.adminSocialMediaSectionTitle || "Kelola Tautan Media Sosial & Website"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={config.formTexts.adminSocialFacebookLabel || "URL Facebook"} name="socialMediaFacebookUrl" value={formData.socialMediaFacebookUrl} onChange={(e) => handleInputChange(e, 'socialMedia')} placeholder="https://facebook.com/username"/>
            <Input label={config.formTexts.adminSocialTwitterLabel || "URL Twitter (X)"} name="socialMediaTwitterUrl" value={formData.socialMediaTwitterUrl} onChange={(e) => handleInputChange(e, 'socialMedia')} placeholder="https://twitter.com/username"/>
            <Input label={config.formTexts.adminSocialInstagramLabel || "URL Instagram"} name="socialMediaInstagramUrl" value={formData.socialMediaInstagramUrl} onChange={(e) => handleInputChange(e, 'socialMedia')} placeholder="https://instagram.com/username"/>
            <Input label={config.formTexts.adminSocialYoutubeLabel || "URL YouTube"} name="socialMediaYoutubeUrl" value={formData.socialMediaYoutubeUrl} onChange={(e) => handleInputChange(e, 'socialMedia')} placeholder="https://youtube.com/channel/id"/>
            <Input label={config.formTexts.adminSocialWebsiteLabel || "URL Website Resmi"} name="socialMediaWebsiteUrl" value={formData.socialMediaWebsiteUrl} onChange={(e) => handleInputChange(e, 'socialMedia')} placeholder="https://website-resmi.com" containerClassName="md:col-span-2"/>
        </div>
      </section>

      {/* Standard Form Texts Management */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-primary">Kelola Teks Standar Formulir Pengaduan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(config.formTexts) // Iterate over keys from the global config to determine which text fields to show
            .filter(key => !key.startsWith('admin') && !key.startsWith('login') && !key.startsWith('logout') && !key.startsWith('user') && !key.startsWith('save'))
            .map(key => (
            <Input
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} // Auto-generate label from key
              name={key} // This 'name' is the key in formTexts, e.g., 'reporterNameLabel'
              value={formData.formTexts[key] || ''} // Value comes from formData local state
              onChange={(e) => handleInputChange(e, 'formTexts', key)}
            />
          ))}
        </div>
      </section>
      
      {/* Custom Form Fields Management */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">Kelola Field Formulir Kustom</h3>
            <Button onClick={openNewCustomFieldModal} variant="secondary" size="sm">
                + Tambah Field Kustom Baru
            </Button>
        </div>
        {config.customFormFields.length > 0 ? ( // Read from global config for listing existing custom fields
             <ul className="space-y-2">
                {config.customFormFields.map(field => (
                    <li key={field.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                        <div>
                            <p className="font-medium">{field.label} <span className="text-xs text-gray-500">({field.type}) {field.isRequired ? '(Wajib)' : ''}</span></p>
                            {field.placeholder && <p className="text-sm text-gray-500">Placeholder: {field.placeholder}</p>}
                            {field.options && field.options.length > 0 && <p className="text-sm text-gray-500">Opsi: {field.options.join(', ')}</p>}
                        </div>
                        <div className="space-x-2">
                            <Button onClick={() => openEditCustomFieldModal(field)} variant="outline" size="sm">Edit</Button>
                            <Button onClick={() => {if(window.confirm('Yakin ingin menghapus field ini?')) deleteCustomField(field.id)}} variant="danger" size="sm">Hapus</Button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : <p className="text-gray-500">Belum ada field kustom.</p>}
      </section>

      {/* Urutan & Visibilitas Field Formulir */}
      <section className="p-6 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-primary">Kelola Urutan & Visibilitas Field Formulir</h3>
        <p className="text-sm text-gray-600 mb-4">Atur urutan dan field mana saja yang tampil di formulir pengaduan publik. Field inti (seperti Deskripsi) tidak dapat disembunyikan.</p>
        <div className="space-y-3">
          {allManageableFields.map((field, index) => ( // Rendered from local state allManageableFields
            <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3 w-6 text-center">{index + 1}.</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary disabled:opacity-50"
                    checked={field.isVisible}
                    onChange={(e) => handleFieldVisibilityChange(field.id, e.target.checked)}
                    disabled={field.isCore}
                  />
                  {/* The field.label here will be dynamic due to useEffect updates */}
                  <span className={`ml-2 font-medium ${field.isCore ? 'text-gray-400' : 'text-gray-700'}`}>{field.label}</span>
                  {field.isCustom && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Kustom</span>}
                   {field.isCore && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">Inti</span>}
                </label>
              </div>
              <div className="space-x-1">
                <Button onClick={() => moveField(field.id, 'up')} disabled={index === 0} size="sm" variant="ghost" className="p-1">▲</Button>
                <Button onClick={() => moveField(field.id, 'down')} disabled={index === allManageableFields.length - 1} size="sm" variant="ghost" className="p-1">▼</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 text-right">
        <Button onClick={handleSaveAll} variant="primary" size="lg">
          {config.formTexts.adminSaveContentButton || "Simpan Semua Perubahan"}
        </Button>
      </div>

      <Modal 
        isOpen={isCustomFieldModalOpen} 
        onClose={() => setIsCustomFieldModalOpen(false)} 
        title={editingField ? "Edit Field Kustom" : "Tambah Field Kustom Baru"}
        footer={customFieldModalFooter}
      >
        {customFieldModalError && <p className="text-red-500 text-sm mb-3">{customFieldModalError}</p>}
        <Input label="Label Field" name="label" value={newCustomField.label} onChange={handleCustomFieldModalChange} required />
        <Input label="Placeholder (Opsional)" name="placeholder" value={newCustomField.placeholder || ''} onChange={handleCustomFieldModalChange} />
        <Select
            label="Tipe Field"
            name="type"
            value={newCustomField.type}
            onChange={(e) => handleCustomFieldModalChange(e as React.ChangeEvent<HTMLSelectElement>)}
            options={Object.values(FormFieldType).map(ft => ({value: ft, label: ft}))}
            required
        />
        {newCustomField.type === FormFieldType.PILIHAN && (
            <Input 
                label="Opsi Pilihan (pisahkan dengan koma)" 
                name="options" 
                value={newCustomField.options?.join(', ') || ''} 
                onChange={handleCustomFieldModalChange} 
                placeholder="cth: Opsi 1, Opsi 2, Opsi 3" 
                required 
            />
        )}
        <label className="flex items-center mt-4">
            <input type="checkbox" name="isRequired" checked={newCustomField.isRequired} onChange={handleCustomFieldModalChange} className="form-checkbox h-5 w-5 text-primary" />
            <span className="ml-2 text-gray-700">Wajib Diisi</span>
        </label>
      </Modal>
    </div>
  );
};

export default ContentFormManagement;