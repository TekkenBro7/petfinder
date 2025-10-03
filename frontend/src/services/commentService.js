import client from '../api/client';

class CommentService {
  async getCommentsByAd(adId) {
    const response = await client.get(`/comments/ad/${adId}/`);
    return response.data;
  }

  async createComment(adId, text) {
    const response = await client.post('/comments/', {
      ad_id: adId,
      text: text,
    });
    return response.data;
  }

  async updateComment(commentId, text) {
    const response = await client.patch(`/comments/${commentId}/`, {
      text: text,
    });
    return response.data;
  }

  async deleteComment(commentId) {
    await client.delete(`/comments/${commentId}/`);
  }

  async getCommentById(commentId) {
    const response = await client.get(`/comments/${commentId}/`);
    return response.data;
  }
}

export default new CommentService();
