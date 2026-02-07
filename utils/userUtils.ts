// 用户身份管理工具

export class UserManager {
  private static readonly USER_ID_KEY = 'vita-me-user-id';
  private static readonly USER_INFO_KEY = 'vita-me-user-info';

  // 生成唯一用户ID
  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取或创建用户ID
  static getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    
    if (!userId) {
      userId = this.generateUserId();
      localStorage.setItem(this.USER_ID_KEY, userId);
      console.log('🆔 创建新用户ID:', userId);
    }
    
    return userId;
  }

  // 设置用户ID（用于登录用户）
  static setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
    console.log('🆔 设置用户ID:', userId);
  }

  // 获取用户信息
  static getUserInfo(): any {
    try {
      const info = localStorage.getItem(this.USER_INFO_KEY);
      return info ? JSON.parse(info) : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 设置用户信息
  static setUserInfo(userInfo: any): void {
    try {
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      console.log('👤 设置用户信息:', userInfo);
    } catch (error) {
      console.error('设置用户信息失败:', error);
    }
  }

  // 清除用户数据
  static clearUserData(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    console.log('🗑️ 用户数据已清除');
  }

  // 检查是否为登录用户
  static isLoggedInUser(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.isLoggedIn === true;
  }
}