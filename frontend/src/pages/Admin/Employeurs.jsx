import React from 'react';
import GenericCRUD from '../../components/GenericCRUD';
import { adminService } from '../../services/api';

export default function AdminEmployeurs() {
  return (
    <GenericCRUD
      title="Employeur"
      fields={[{ name: 'nomEmployeur', label: 'Nom de l\'employeur', required: true }]}
      service={{
        getAll: adminService.getEmployeurs,
        create: adminService.createEmployeur,
        update: adminService.updateEmployeur,
        delete: adminService.deleteEmployeur,
      }}
      gradient="linear-gradient(135deg, #10B981, #059669)"
    />
  );
}
