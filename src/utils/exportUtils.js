// Utility functions for data export

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that need quotes (contain commas, quotes, or newlines)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportToExcel = (data, filename) => {
  // This would require a library like xlsx
  // For now, we'll export as CSV with .xlsx extension
  exportToCSV(data, filename.replace('.xlsx', ''));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const generateReportData = (type, data, metrics) => {
  switch (type) {
    case 'maintenance':
      return data.maintenanceRequests.map(req => ({
        'Request ID': req.id,
        'Title': req.title,
        'Description': req.description,
        'Status': req.status,
        'Priority': req.priority,
        'Apartment': req.apartment,
        'Submitted By': req.submittedBy,
        'Estimated Cost': formatCurrency(req.estimatedCost || 0),
        'Submitted Date': formatDate(req.submittedDate)
      }));
      
    case 'financial':
      return data.payments.map(payment => ({
        'Payment ID': payment.id,
        'Tenant': payment.tenantName || payment.tenantId,
        'Apartment': payment.apartment,
        'Amount': formatCurrency(payment.amount),
        'Type': payment.type,
        'Status': payment.status,
        'Method': payment.method,
        'Date': formatDate(payment.date)
      }));
      
    case 'occupancy':
      return data.tenants.map(tenant => ({
        'Tenant ID': tenant.id,
        'Name': tenant.name,
        'Email': tenant.email,
        'Apartment': tenant.apartment,
        'Phone': tenant.phone,
        'User Type': tenant.userType
      }));
      
    default:
      return [];
  }
};
