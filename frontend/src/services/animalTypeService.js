import client from '../api/client';

class AnimalTypeService {
  async getAnimalTypes() {
    const response = await client.get('/animal-types/');
    return response.data;
  }

  async getAnimalTypeById(typeId) {
    const response = await client.get(`/animal-types/${typeId}/`);
    return response.data;
  }

  async createAnimalType(typeData) {
    const response = await client.post('/animal-types/', typeData);
    return response.data;
  }

  async updateAnimalType(typeId, typeData) {
    const response = await client.patch(`/animal-types/${typeId}/`, typeData);
    return response.data;
  }

  async deleteAnimalType(typeId) {
    await client.delete(`/animal-types/${typeId}/`);
  }
}

export default new AnimalTypeService();
