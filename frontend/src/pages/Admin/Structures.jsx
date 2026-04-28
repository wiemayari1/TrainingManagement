import React from 'react';
import GenericCRUD from '../../components/GenericCRUD';
import { adminService } from '../../services/api';

export default function AdminStructures() {
  return (
    <GenericCRUD
      title="Structure"
      fields={[
        { name: 'libelle', label: 'Libellé', required: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: [
            { value: 'CENTRALE',  label: 'Direction Centrale' },
            { value: 'REGIONALE', label: 'Direction Régionale' },
          ],
        },
      ]}
      service={{
        getAll:  adminService.getStructures,
        create:  adminService.createStructure,
        update:  adminService.updateStructure,
        delete:  adminService.deleteStructure,
      }}
      gradient="linear-gradient(135deg, #06B6D4, #0891B2)"
    />
  );
}
