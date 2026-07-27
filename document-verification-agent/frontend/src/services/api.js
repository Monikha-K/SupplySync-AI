import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const verifyDocument = async (file, documentType = 'driving_license') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const response = await axios.post(`${API_BASE_URL}/upload-document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
