import React from 'react';
import { getStatusVariant } from '../../utils/statusManager';

const StatusChip = ({ status, icon }) => {
  const variantClass = getStatusVariant(status);
  
  return (
    <span className={`status-chip ${variantClass}`}>
      {icon && <span>{icon}</span>}
      {status}
    </span>
  );
};

export default StatusChip;
