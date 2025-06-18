
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppConfig } from '../../hooks/useAppConfig';
import { useComplaints } from '../../hooks/useComplaints';
import { ServiceType, ComplaintAttachment, FormFieldType, CustomFormFieldDefinition } from '../../types';
import { SERVICE_TYPES_AVAILABLE } from '../../constants';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { getMimeType, fileToBase64 } from '../../utils/helpers';

const ComplaintForm: React.FC = () => {
  const { config } = useAppConfig();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterWhatsApp, setReporterWhatsApp] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [incidentTime, setIncidentTime] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [customFieldData, setCustomFieldData] = useState<Record<string, string | string[]>>({});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const TEXTS = config.formTexts;

  const allFieldsSorted = useMemo(() => {
    const standardFields = Object.entries(config.standardFieldsOrderAndVisibility)
      .map(([key, value]) => ({ ...value, id: key, isCustom: false }));
    
    const customFields = config.customFormFields.map(field => ({ ...field, isCustom: true }));
    
    return [...standardFields, ...customFields]
      .filter(field => field.isVisible)
      .sort((a, b) => a.order - b.order);
  }, [config.standardFieldsOrderAndVisibility, config.customFormFields]);


  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newAttachments: ComplaintAttachment[] = [];
      for (const file of filesArray) {
        try {
          const base64 = await fileToBase64(file);
          newAttachments.push({
            id: `file-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileType: file.type || getMimeType(file.name),
            fileDataUrl: base64,
          });
        } catch (error) {
          console.error("Error converting file to base64", error);
          setErrors(prev => ({...prev, attachments: "Gagal memproses file."}));
        }
      }
      setAttachments(prev => [...prev, ...newAttachments].slice(0, 5)); 
      if (attachments.length + newAttachments.length > 5) {
          setErrors(prev => ({...prev, attachments: "Maksimal 5 file lampiran."}));
      }
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== fileId));
  };

  const handleCustomFieldChange = (fieldId: string, value: string | string[]) => {
    setCustomFieldData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!isAnonymous) {
      if (!reporterName.trim()) newErrors.reporterName = TEXTS.requiredFieldMessage;
      if (!reporterEmail.trim() || !/\S+@\S+\.\S+/.test(reporterEmail)) newErrors.reporterEmail = "Format email tidak valid.";
      if (!reporterWhatsApp.trim() || !/^\d{10,15}$/.test(reporterWhatsApp)) newErrors.reporterWhatsApp = "Format nomor WhatsApp tidak valid (10-15 digit).";
    }
    if (!serviceType) newErrors.serviceType = TEXTS.requiredFieldMessage;
    if (!incidentTime) newErrors.incidentTime = TEXTS.requiredFieldMessage;
    if (!description.trim()) newErrors.description = TEXTS.requiredFieldMessage;

    config.customFormFields.forEach(field => {
      if (field.isVisible && field.isRequired && (!customFieldData[field.id] || (Array.isArray(customFieldData[field.id]) && (customFieldData[field.id] as string[]).length === 0))) {
        newErrors[field.id] = TEXTS.requiredFieldMessage;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage(null);
    try {
      const complaintData = {
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName,
        reporterEmail: isAnonymous ? undefined : reporterEmail,
        reporterWhatsApp: isAnonymous ? undefined : reporterWhatsApp,
        serviceType: serviceType as ServiceType, 
        incidentTime,
        description,
        attachments,
        customFieldData,
      };
      const newComplaint = await addComplaint(complaintData);
      setSuccessMessage(TEXTS.successMessage.replace('{trackingId}', newComplaint.trackingId));
      
      // Reset form fields immediately after success message is set
      setIsAnonymous(false);
      setReporterName('');
      setReporterEmail('');
      setReporterWhatsApp('');
      setServiceType('');
      setIncidentTime('');
      setDescription('');
      setAttachments([]);
      setCustomFieldData({});
      setErrors({});
      
      // Redirect after a delay
      setTimeout(() => {
        setSuccessMessage(null); // Clear message before redirecting
        navigate('/'); 
      }, 3000);
    } catch (err) {
      setErrors({ form: TEXTS.errorMessage });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderField = (fieldConfig: any) => { 
    const { id, label, isCustom } = fieldConfig;
    
    if (id === 'isAnonymous') {
      return (
        <div key={id} className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span className="ml-2 text-gray-700">{TEXTS.anonymousLabel}</span>
          </label>
        </div>
      );
    }
    if (!isAnonymous && (id === 'reporterName' || id === 'reporterEmail' || id === 'reporterWhatsApp')) {
       return (
        <Input
          key={id}
          id={id}
          label={TEXTS[`${id}Label`]}
          placeholder={TEXTS[`${id}Placeholder`]}
          value={
            id === 'reporterName' ? reporterName : 
            id === 'reporterEmail' ? reporterEmail : reporterWhatsApp
          }
          onChange={(e) => {
            if (id === 'reporterName') setReporterName(e.target.value);
            else if (id === 'reporterEmail') setReporterEmail(e.target.value);
            else setReporterWhatsApp(e.target.value);
          }}
          error={errors[id]}
          required={!isAnonymous}
        />
      );
    }
    if (isAnonymous && (id === 'reporterName' || id === 'reporterEmail' || id === 'reporterWhatsApp')) {
        return null; 
    }

    if (id === 'serviceType') {
      return (
        <Select
          key={id}
          id="serviceType"
          label={TEXTS.serviceTypeLabel}
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType)}
          options={SERVICE_TYPES_AVAILABLE.map(st => ({ value: st, label: st }))}
          error={errors.serviceType}
          required
          placeholder="-- Pilih Jenis Layanan --"
        />
      );
    }
    if (id === 'incidentTime') {
      return (
         <Input
            key={id}
            id="incidentTime"
            type="datetime-local"
            label={TEXTS.incidentTimeLabel}
            value={incidentTime}
            onChange={(e) => setIncidentTime(e.target.value)}
            error={errors.incidentTime}
            required
          />
      );
    }
    if (id === 'description') {
      return (
        <Textarea
            key={id}
            id="description"
            label={TEXTS.descriptionLabel}
            placeholder={TEXTS.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
            rows={5}
          />
      );
    }
    if (id === 'attachments') {
       return (
        <div key={id} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{TEXTS.attachmentsLabel}</label>
          <input
            id="attachments-input"
            type="file"
            multiple
            onChange={handleAttachmentChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between text-sm bg-gray-100 p-2 rounded">
                  <span>{att.fileName} ({att.fileType})</span>
                  <button type="button" onClick={() => removeAttachment(att.id)} className="text-red-500 hover:text-red-700">Hapus</button>
                </div>
              ))}
            </div>
          )}
          {errors.attachments && <p className="mt-1 text-xs text-red-600">{errors.attachments}</p>}
        </div>
      );
    }

    if(isCustom) {
        const field = fieldConfig as CustomFormFieldDefinition;
        if (field.type === FormFieldType.TEXT_SINGKAT) {
          return (
            <Input
              key={field.id}
              id={field.id}
              label={field.label}
              placeholder={field.placeholder}
              value={customFieldData[field.id] as string || ''}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              error={errors[field.id]}
              required={field.isRequired}
            />
          );
        }
        if (field.type === FormFieldType.TEXT_PANJANG) {
          return (
            <Textarea
              key={field.id}
              id={field.id}
              label={field.label}
              placeholder={field.placeholder}
              value={customFieldData[field.id] as string || ''}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              error={errors[field.id]}
              required={field.isRequired}
            />
          );
        }
        if (field.type === FormFieldType.PILIHAN && field.options) {
          return (
            <Select
              key={field.id}
              id={field.id}
              label={field.label}
              value={customFieldData[field.id] as string || ''}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              options={field.options.map(opt => ({ value: opt, label: opt }))}
              error={errors[field.id]}
              required={field.isRequired}
              placeholder={`-- Pilih ${field.label} --`}
            />
          );
        }
    }
    return null;
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
      {errors.form && <Alert type="error" message={errors.form} onClose={() => setErrors(prev => ({...prev, form: ''}))} />}
      
      {allFieldsSorted.map(field => renderField(field))}

      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full sm:w-auto" 
          onClick={() => navigate('/')}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full sm:w-auto flex-grow" 
          isLoading={isLoading}
          disabled={!!successMessage} // Disable submit if success message is shown (awaiting redirect)
        >
          {TEXTS.submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintForm;
