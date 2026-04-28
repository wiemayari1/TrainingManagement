import React from 'react';
import GenericCRUD from '../../components/GenericCRUD';
import { adminService } from '../../services/api';

export default function AdminDomaines() {
  return (
    <GenericCRUD
      title="Domaine"
      fields={[{ name: 'libelle', label: 'Libellé', required: true }]}
      service={{
        getAll: adminService.getDomaines,
        create: adminService.createDomaine,
        update: adminService.updateDomaine,
        delete: adminService.deleteDomaine,
      }}
      gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
    />
  );
}
