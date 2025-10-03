import client from '../api/client';

class FavoriteService {
  async getMyFavorites() {
    const response = await client.get('/favorites/my_favorites/');
    return response.data;
  }

  async toggleFavorite(adId) {
    const response = await client.post(`/favorites/toggle/${adId}/`);
    return response.data;
  }

  async checkFavorite(adId) {
    const response = await client.get(`/favorites/check/${adId}/`);
    return response.data;
  }

  async addToFavorites(adId) {
    const response = await client.post('/favorites/', {
      ad_id: adId,
    });
    return response.data;
  }

  async removeFromFavorites(favoriteId) {
    await client.delete(`/favorites/${favoriteId}/`);
  }
}

export default new FavoriteService();
