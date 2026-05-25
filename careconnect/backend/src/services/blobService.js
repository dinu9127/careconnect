import { put } from '@vercel/blob';

const uploadToBlob = async ({ key, buffer, contentType, access, token }) => {
  if (!token) {
    throw new Error('Blob storage token is not configured');
  }

  return put(key, buffer, {
    access,
    contentType,
    token
  });
};

export { uploadToBlob };
