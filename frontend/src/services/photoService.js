import client from '../api/client';

class PhotoService {
  async uploadPhoto(adId, imageFile) {
    const formData = new FormData();
    formData.append('ad', adId);
    formData.append('image', imageFile);

    const response = await client.post('/photos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAdPhotos(adId) {
    const response = await client.get('/photos/', { params: { ad: adId } });
    return response.data;
  }

  async deletePhoto(photoId) {
    await client.delete(`/photos/${photoId}/`);
  }

  getImageUrl(imagePath) {
    if (!imagePath) return null;

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const baseUrl = import.meta.env.VITE_MEDIA_URL;
    return `${baseUrl}${imagePath}`;
  }

  async uploadMultiplePhotos(adId, imageFiles) {
    const uploadPromises = imageFiles.map((file) =>
      this.uploadPhoto(adId, file)
    );
    return Promise.all(uploadPromises);
  }
}

export default new PhotoService();
