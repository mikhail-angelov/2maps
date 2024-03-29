import { Store } from './store.js';
import { post } from '../utils.js';
import { parseUrlParams } from '../urlParams.js';

const AUTHENTICATION = 'AUTHENTICATION';

export class AuthStore extends Store {
  show = false;

  ui = 'login';

  error = '';

  authenticated = false;

  constructor() {
    super();
    const { resetToken } = parseUrlParams();
    if (resetToken) {
      this.setUi(true, 'resetPassword');
    } else {
      this.check();
    }
  }

  async check() {
    try {
      const res = await post('/auth/check', {});
      this.setAuthenticated(res.auth === 'ok');
    } catch (e) {
      console.log('auth error', e);
    }
  }

  async login(credentials) {
    try {
      const res = await post('/auth/login', credentials);
      this.setUi(false);
      this.setAuthenticated(res.auth === 'ok');
    } catch (e) {
      console.log('auth error', e);
      this.setError('email or password is invalid');
    }
  }

  async logout() {
    await post('/auth/logout', {});
    this.setAuthenticated(false);
  }

  async signUp(data) {
    try {
      const res = await post('/auth/sign-up', data);
      this.setUi(false);
      this.setAuthenticated(res.auth === 'ok');
    } catch (e) {
      console.log('auth error', e);
      this.setError('invalid sign up');
    }
  }

  async forgetPassword(data) {
    try {
      await post('/auth/forget', data);
      this.setError('Check you email for reset link');
    } catch (e) {
      console.log('auth error', e);
      this.setError('invalid password reset');
    }
  }

  async resetPassword(data) {
    try {
      await post('/auth/reset-password', data);
      this.setUi(false);
    } catch (e) {
      console.log('auth error', e);
      this.setError('invalid password reset');
    }
  }

  getUi() {
    return { show: this.show, ui: this.ui, error: this.error };
  }

  setUi(show, ui) {
    this.show = show;
    this.ui = ui;
    this.refresh();
  }

  setError(error) {
    this.error = error;
    this.refresh();
  }

  showLogin() {
    this.setUi(true, 'login');
  }

  showSignUp() {
    this.setUi(true, 'signUp');
  }

  isAuthenticated() {
    return this.authenticated;
  }

  setAuthenticated(authenticated) {
    this.authenticated = authenticated;
    this.changeAuth();
  }

  subscribeAuth(handler) {
    return this.on(AUTHENTICATION, handler);
  }

  changeAuth() {
    return this.emit(AUTHENTICATION, this.authenticated);
  }
}
