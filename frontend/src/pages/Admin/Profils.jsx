import React from 'react';
import GenericCRUD from '../../components/GenericCRUD';
import { adminService } from '../../services/api';

export default function AdminProfils() {
  return (
    <GenericCRUD
      title="Profil"
      fields={[{ name: 'libelle', label: 'Libellé', required: true }]}
      service={{
        getAll: adminService.getProfils,
        create: adminService.createProfil,
        update: adminService.updateProfil,
        delete: adminService.deleteProfil,
      }}
      gradient="linear-gradient(135deg, #EC4899, #DB2777)"
    />
  );
}
