// Mock API service since backend is not implemented yet
export const fetchShipments = async (source, destination) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data generation
  const mockShipments = [
    {
      shipmentId: `SHP-${Math.floor(Math.random() * 10000)}`,
      organizationName: 'Swift Logistics Inc.',
      rating: 4.9,
      distance: 1250,
      averageEta: '2d 4h'
    },
    {
      shipmentId: `SHP-${Math.floor(Math.random() * 10000)}`,
      organizationName: 'Global Freight Co.',
      rating: 4.5,
      distance: 1240,
      averageEta: '2d 6h'
    },
    {
      shipmentId: `SHP-${Math.floor(Math.random() * 10000)}`,
      organizationName: 'Apex Transport',
      rating: 4.2,
      distance: 1260,
      averageEta: '2d 5h'
    },
    {
      shipmentId: `SHP-${Math.floor(Math.random() * 10000)}`,
      organizationName: 'Reliable Carriers',
      rating: 3.8,
      distance: 1300,
      averageEta: '2d 12h'
    }
  ];

  return mockShipments.sort((a, b) => b.rating - a.rating);
};

export const acceptShipment = async (shipmentId) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true, message: `Shipment ${shipmentId} accepted successfully.` };
};