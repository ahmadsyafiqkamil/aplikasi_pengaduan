
import React, { createContext, useContext, ReactNode } from 'react';
import { AppContentConfig, CustomFormFieldDefinition } from '../types';
import { INITIAL_APP_CONTENT_CONFIG, LOCAL_STORAGE_KEYS } from '../constants';
import useLocalStorage from './useLocalStorage';

interface AppConfigContextType {
  config: AppContentConfig;
  updateConfig: (newConfig: Partial<AppContentConfig>) => void;
  updateFormField: (fieldId: string, updates: Partial<CustomFormFieldDefinition>) => void;
  addCustomField: (field: Omit<CustomFormFieldDefinition, 'id' | 'order' | 'isVisible'>) => void;
  deleteCustomField: (fieldId: string) => void;
  reorderFields: (fields: (CustomFormFieldDefinition | {id: string, order: number, isVisible: boolean, label: string, isCore?:boolean})[]) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useLocalStorage<AppContentConfig>(LOCAL_STORAGE_KEYS.APP_CONFIG, INITIAL_APP_CONTENT_CONFIG);

  const updateConfig = (newConfigData: Partial<AppContentConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfigData }));
  };

  const updateFormField = (fieldId: string, updates: Partial<CustomFormFieldDefinition>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      customFormFields: prevConfig.customFormFields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  };
  
  const addCustomField = (fieldData: Omit<CustomFormFieldDefinition, 'id' | 'order' | 'isVisible'>) => {
    setConfig(prevConfig => {
      const newField: CustomFormFieldDefinition = {
        ...fieldData,
        id: `custom-${Date.now()}`,
        order: (prevConfig.customFormFields.length > 0 ? Math.max(...prevConfig.customFormFields.map(f => f.order)) : 100) + 1, // Ensure unique order, start after standard
        isVisible: true,
      };
      return {
        ...prevConfig,
        customFormFields: [...prevConfig.customFormFields, newField],
      };
    });
  };

  const deleteCustomField = (fieldId: string) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      customFormFields: prevConfig.customFormFields.filter(f => f.id !== fieldId),
    }));
  };

  const reorderFields = (
    fields: (CustomFormFieldDefinition | {id: string, order: number, isVisible: boolean, label: string, isCore?:boolean})[]
    ) => {
    setConfig(prevConfig => {
      const newCustomFields: CustomFormFieldDefinition[] = [];
      const newStandardFieldsConfig: AppContentConfig['standardFieldsOrderAndVisibility'] = { ...prevConfig.standardFieldsOrderAndVisibility };

      fields.forEach((field, index) => {
        if ('type' in field) { // It's a CustomFormFieldDefinition
          newCustomFields.push({ ...field, order: index });
        } else { // It's a standard field config from standardFieldsOrderAndVisibility
            if(newStandardFieldsConfig[field.id]) {
                 newStandardFieldsConfig[field.id] = { ...newStandardFieldsConfig[field.id], order: index, isVisible: field.isVisible };
            }
        }
      });
      
      // Sort custom fields by new order
      newCustomFields.sort((a, b) => a.order - b.order);

      return {
        ...prevConfig,
        customFormFields: newCustomFields,
        standardFieldsOrderAndVisibility: newStandardFieldsConfig
      };
    });
  };


  return (
    <AppConfigContext.Provider value={{ config, updateConfig, updateFormField, addCustomField, deleteCustomField, reorderFields }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
