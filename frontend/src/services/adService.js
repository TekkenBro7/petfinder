import client from '../api/client';

class AdService {
  async getAds(filters = {}) {
    const response = await client.get('/ads/', { params: filters });
    return response.data;
  }

  async getAdById(adId) {
    const response = await client.get(`/ads/${adId}/`);
    return response.data;
  }

  async createAd(adData) {
    const response = await client.post('/ads/', adData);
    return response.data;
  }

  async updateAd(adId, adData) {
    const response = await client.patch(`/ads/${adId}/`, adData);
    return response.data;
  }

  async deleteAd(adId) {
    await client.delete(`/ads/${adId}/`);
  }

  async searchAds(searchParams) {
    const response = await client.get('/ads/', { params: searchParams });
    return response.data;
  }

  async getMyAds() {
    const response = await client.get('/ads/my-ads/');
    return response.data;
  }

  async toggleAdStatus(adId, isActive) {
    const response = await client.patch(`/ads/${adId}/`, {
      is_active: isActive,
    });
    return response.data;
  }
}

export default new AdService();
