import { html, Component, render, useState } from "../libs/htm.js";
import { parseUrlParams } from "../urlParams.js";

const Login = ({ onLogin, toSignUp, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return html`<form class="form" onSubmit=${login}>
    <div class="title">Login to Map NN</div>
    <div class="label">Email</div>
    <input class="form-input" value=${email} onChange=${(e) =>
    setEmail(e.target.value)}/>
    <div class="label">Password</div>
    <input class="form-input" value=${password} onChange=${(e) =>
    setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class="error">${error}</div>`}
    <div class="row">
      <button class="form-button primary">Login</button>
      <button class="form-button" onClick=${toSignUp}>Sign Up</button>
    </div>
  </form>`;
};

const SignUp = ({ onSignUp, toLogin, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = (e) => {
    e.preventDefault();
    onSignUp({ name, email, password });
  };

  return html`<form class="form" onSubmit=${signUp} >
    <div class="title">Sign Up to Map NN</div>
    <div class="label">Name</div>
    <input class="form-input" value=${name} onChange=${(e) =>
    setName(e.target.value)}/>
    <div class="label">Email</div>
    <input class="form-input" value=${email} onChange=${(e) =>
    setEmail(e.target.value)}/>
    <div class="label">Password</div>
    <input class="form-input" value=${password} onChange=${(e) =>
    setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class="error">${error}</div>`}
    <div class="row">
      <button class="form-button primary">Sign Up</button>
      <button class="form-button" onClick=${toLogin}>Back</button>
    </div>
  </form>`;
};

const PasswordReset = ({ onPasswordReset, error, resetToken }) => {
  const [password, setPassword] = useState("");

  const passwordReset = (e) => {
    e.preventDefault();
    onPasswordReset({ password, resetToken });
  };

  return html`<form class="form" onSubmit=${passwordReset}>
    <div class="title">Update Account</div>
    <div class="label">New Password</div>
    <input class="form-input" value=${password} onChange=${(e) =>
    setPassword(e.target.value)} type="password"></input>
    ${error && html`<div class="error">${error}</div>`}
    <div class="row">
      <button class="form-button primary">Change</button>
    </div>
  </form>`;
};

export const createAuth = (authStore) => {
  const { resetToken } = parseUrlParams();
  
  class Auth extends Component {

    logout() {
      authStore.logout()
    }
    onLogin(credentials) {
      authStore.login(credentials)
    }
    onSignUp(credentials) {
      authStore.signUp(credentials)
    }

    onPasswordReset(credentials) {
      authStore.passwordReset(credentials)
    }

    render({}) {
      const { show, ui, error } = authStore.getUi();
      const onClose = () => this.setState({ show: false });
      let content = null;
      if (ui === "login") {
        content = html`<${Login}
          onLogin=${this.onLogin.bind(this)}
          toSignUp=${() => this.setState({ ui: "signUp" })}
          error=${error}
        />`;
      } else if (ui === "signUp") {
        content = html`<${SignUp}
          onSignUp=${this.onSignUp.bind(this)}
          toLogin=${() => this.setState({ ui: "login" })}
          error=${error}
        />`;
      } else if (ui === "passwordReset") {
        content = html`<${PasswordReset}
          onPasswordReset=${this.onPasswordReset.bind(this)}
          resetToken=${resetToken}
          error=${error}
        />`;
      }

      return show && content
        ? html`<div class=${show ? "modal" : "modal"}>
            <div class="modal-content">
              <button class="close-button" onClick=${onClose}>✕</button>
              ${content}
            </div>
          </div>`
        : html`<div></div>`;
    }
  }

  authStore.onRefresh(() => {
    render(html`<${Auth} />`, document.getElementById("auth"));
  });

  render(html`<${Auth} />`, document.getElementById("auth"));

  return auth;
};
