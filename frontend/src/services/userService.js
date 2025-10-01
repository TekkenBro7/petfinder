import client from '../api/client';

class UserService {
  async getUsers(params = {}) {
    const response = await client.get('/users/', { params });
    return response.data;
  }

  async getUserById(userId) {
    const response = await client.get(`/users/${userId}/`);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await client.patch(`/users/${userId}/`, userData);
    return response.data;
  }

  async deleteUser(userId) {
    await client.delete(`/users/${userId}/`);
  }

  async getUserAds(userId) {
    const response = await client.get(`/users/${userId}/ads/`);
    return response.data;
  }

  async getCurrentUser() {
    const response = await client.get('/users/me/');
    return response.data;
  }
}

export default new UserService();
