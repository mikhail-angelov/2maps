import { html, Component, render, useState, useEffect } from "../libs/htm.js";
import { parseUrlParams } from "../urlParams.js";
import { isMobile, post } from "../utils.js";

const check = async () => {
  try {
    const res = await post(`/auth/check`, {})
    return res.auth === 'ok'
  } catch (e) {
    return false
  }
}
const login = async (credentials) => {
  const res = await post(`/auth/login`, credentials)
  return res.auth === 'ok'
}
const logout = async () => {
  const res = await post(`/auth/logout`, {})
  return false
}
const signUp = async (data) => {
  const res = await post(`/auth/sign-up`, data)
  return res.auth === 'ok'
}
const passwordReset = async (data) => {
  const res = await post(`/auth/reset-password`, data)
  return res.auth === 'ok'
}


const Login = ({ onLogin, toSignUp, error }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = (e) => {
    e.preventDefault()
    onLogin({ email, password })
  }

  return html`<form class="form" onSubmit=${login}>
    <div class="title">Login to Map NN</div>
    <div class="label">Email</div>
    <input class="form-input" value=${email} onChange=${(e) => setEmail(e.target.value)}/>
    <div class="label">Password</div>
    <input class="form-input" value=${password} onChange=${(e) => setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class=error>${error}</div>`}
    <div class="row">
      <button class="form-button primary">Login</button>
      <button class="form-button" onClick=${toSignUp}>Sign Up</button>
    </div>
  </form>`;

};

const SignUp = ({ onSignUp, toLogin, error }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signUp = (e) => {
    e.preventDefault()
    onSignUp({ name, email, password })
  }

  return html`<form class="form" onSubmit=${signUp} >
    <div class="title">Sign Up to Map NN</div>
    <div class="label">Name</div>
    <input class="form-input" value=${name} onChange=${(e) => setName(e.target.value)}/>
    <div class="label">Email</div>
    <input class="form-input" value=${email} onChange=${(e) => setEmail(e.target.value)}/>
    <div class="label">Password</div>
    <input class="form-input" value=${password} onChange=${(e) => setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class=error>${error}</div>`}
    <div class="row">
      <button class="form-button primary">Sign Up</button>
      <button class="form-button" onClick=${toLogin}>Back</button>
    </div>
  </form>`;

};

const PasswordReset = ({ onPasswordReset, error, resetToken }) => {
  const [password, setPassword] = useState('')

  const passwordReset = (e) => {
    e.preventDefault()
    onPasswordReset({ password, resetToken })
  }

  return html`<form class="form" onSubmit=${passwordReset}>
    <div class="title">Update Account</div>
    <div class="label">New Password</div>
    <input class="form-input" value=${password} onChange=${(e) => setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class=error>${error}</div>`}
    <div class="row">
      <button class="form-button primary">Change</button>
    </div>
  </form>`;

};

export const createAuth = (onAuthChanged) => {
  const {resetToken} = parseUrlParams()
  const auth = {
    showLogin: () => { },
    showSignUp: () => { },
    logout: () => { },
    showPasswordReset: () => { },
  }

  class Auth extends Component {
    componentDidMount() {
      auth.showLogin = this.showLogin.bind(this);
      auth.showSignUp = this.showSignUp.bind(this);
      auth.logout = this.logout.bind(this);
      auth.showPasswordReset = this.showPasswordReset.bind(this);
      check().then(onAuthChanged)

      this.setState({
        show: false,
        ui: 'login',
        error: '',
      });
    }

    logout() {
      logout()
      onAuthChanged(false)
    }
    showLogin() {
      this.setState({ show: true, ui: 'login' });
    }
    showSignUp() {
      this.setState({ show: true, ui: 'signUp' });
    }
    showPasswordReset() {
      this.setState({ show: true, ui: 'password-reset' });
    }

    async onLogin(credentials) {
      try {
        const data = await login(credentials)
        console.log('login', data)
        if (data) {
          this.setState({ show: false })
          onAuthChanged(true)
        } else {
          this.setState({ error: 'invalid login' })
        }
      } catch (e) {
        console.log('login error', e)
        this.setState({ error: e.toString() })
      }
    }
    async onSignUp(credentials) {
      try {
        const data = await signUp(credentials)
        console.log('onSignUp', data)
        if (data) {
          this.setState({ show: false })
          onAuthChanged(true)
        } else {
          this.setState({ error: 'invalid sign up' })
        }
      } catch (e) {
        console.log('onSignUp error', e)
        this.setState({ error: e.toString() })
      }
    }

    async onPasswordReset(credentials) {
      try {
        const data = await passwordReset(credentials)
        console.log('onPasswordReset', data)
        if (data) {
          this.setState({ show: false })
        } else {
          this.setState({ error: 'invalid password reset' })
        }
      } catch (e) {
        console.log('passwordReset error', e)
        this.setState({ error: e.toString() })
      }
    }

    render({ }, { show, ui, error }) {

      const onClose = () => this.setState({ show: false })
      let content = null
      if (ui === 'login') {
        content = html`<${Login} onLogin=${this.onLogin.bind(this)} toSignUp=${() => this.setState({ ui: 'signUp' })} error=${error}/>`
      } else if (ui === 'signUp') {
        content = html`<${SignUp} onSignUp=${this.onSignUp.bind(this)} toLogin=${() => this.setState({ ui: 'login' })} error=${error}/>`
      } else if (ui === 'password-reset') {
        content = html`<${PasswordReset} onPasswordReset=${this.onPasswordReset.bind(this)} resetToken=${resetToken} error=${error}/>`
      }

      return show && content ?
        html`<div class=${show ? "modal" : "modal"}>
          <div class="modal-content">
          <button class="close-button" onClick=${onClose}>✕</button>
          ${content}
          </div>
        </div>`:
        html`<div></div>`;
    }
  }

  render(html`<${Auth} />`, document.getElementById("auth"));

  return auth

};

