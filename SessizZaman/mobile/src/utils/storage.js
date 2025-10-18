import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getToken() {
    return await AsyncStorage.getItem('authToken');
  },
  
  async setToken(token) {
    await AsyncStorage.setItem('authToken', token);
  },
  
  async removeToken() {
    await AsyncStorage.removeItem('authToken');
  },
  
  async getUser() {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  async setUser(user) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },
  
  async removeUser() {
    await AsyncStorage.removeItem('user');
  },
  
  async clear() {
    await AsyncStorage.clear();
  }
};
