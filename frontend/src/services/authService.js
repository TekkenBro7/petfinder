import client from '../api/client';
import { Cookies } from 'react-cookie';
import userService from './userService';

const cookies = new Cookies();

class AuthService {
  constructor() {
    this.tokenRefreshPromise = null;
  }

  async login(username, password) {
    const response = await client.post('/auth/login/', {
      username,
      password,
    });

    const { access, refresh } = response.data;

    if (access && refresh) {
      localStorage.setItem('token', access);

      cookies.set('refresh_token', refresh, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'strict',
        secure: import.meta.env.NODE_ENV === 'production',
      });

      const user = await this.fetchCurrentUser();
      return { access, refresh, user };
    }

    return { access, refresh, user: null };
  }

  async register(userData) {
    const response = await client.post('/users/', userData);

    if (response.data.id) {
      const loginResult = await this.login(
        userData.username,
        userData.password
      );
      return loginResult;
    }

    return response.data;
  }

  async logout() {
    try {
      const refreshToken = cookies.get('refresh_token');
      if (refreshToken) {
        await client.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async verify() {
    const response = await client.get('/auth/verify/');
    return response.data;
  }

  async fetchCurrentUser() {
    try {
      const userData = await userService.getCurrentUser();
      this.saveUserData(userData);
      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  saveUserData(userData) {
    const safeUserData = {
      id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      role: userData.role,
    };

    localStorage.setItem('user', JSON.stringify(safeUserData));
  }

  async refreshToken() {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const refreshToken = cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await client.post('/auth/refresh/', {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;

        if (access) {
          localStorage.setItem('token', access);
        }

        if (refresh) {
          cookies.set('refresh_token', refresh, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'strict',
            secure: import.meta.env.NODE_ENV === 'production',
          });
        }

        return access;
      } catch (error) {
        this.clearAuthData();
        throw error;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  async getCurrentUser(forceRefresh = false) {
    const cachedUser = this.getCachedUser();

    if (cachedUser && !forceRefresh) {
      return cachedUser;
    }

    try {
      const userData = await this.fetchCurrentUser();
      return userData;
    } catch (error) {
      if (cachedUser) {
        console.warn('Using cached user data due to API error');
        return cachedUser;
      }
      throw error;
    }
  }

  async checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      await this.verify();
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          return true;
        } catch {
          this.clearAuthData();
          return false;
        }
      }

      this.clearAuthData();
      return false;
    }
  }

  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    cookies.remove('refresh_token', { path: '/' });
  }

  getCachedUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  hasToken() {
    return !!localStorage.getItem('token');
  }

  hasRole(role) {
    const user = this.getCachedUser();
    return user?.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  updateCachedUser(userData) {
    this.saveUserData(userData);
  }
}

export default new AuthService();
