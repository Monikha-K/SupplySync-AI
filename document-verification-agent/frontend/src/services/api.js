// Placeholder API functions
// No backend implementation here

export const verifyDocument = (file) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock response
      const randomStatus = Math.random();
      let status = 'Verified';
      if (randomStatus > 0.8) status = 'Rejected';
      else if (randomStatus > 0.6) status = 'Pending';
      
      resolve({
        documentType: 'Driver License',
        driverName: 'John Doe',
        licenseNumber: 'DL-12345-67890',
        expiryDate: '2028-12-31',
        status: status,
        remarks: status === 'Rejected' ? 'Image quality too low.' : 'Document processed successfully.'
      });
    }, 2000);
  });
};
