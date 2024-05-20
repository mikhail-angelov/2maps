import { html, Component, render, useState } from "../libs/htm.js";
import { parseUrlParams } from "../urlParams.js";

const Login = ({ onLogin, onClose, toSignUp, toForgetPassword, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return html`
    <form class="card" style=${{ maxWidth: "400px" }} onSubmit=${login}>
      <label class="modal-close"></label>
      <button
        style=${{
          backgroundColor: "transparent",
          position: "absolute",
          right: 0,
          top: "-4px",
        }}
        onClick=${onClose}
      >
        ✕
      </button>
      <fieldset>
        <legend>Login to 2Maps</legend>
        <div class="input-group vertical">
          <label for="email">Email</label>
          <input
            id="email"
            value=${email}
            onChange=${(e) => setEmail(e.target.value)}
          />
        </div>
        <div class="input-group vertical">
          <label for="password">Password</label>
          <input
            id="password"
            value=${password}
            onChange=${(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>

        <div class="row">
          ${error && html`<div style=${{ color: "red" }}>${error}</div>`}
        </div>
        <div class="row">
          <button class="primary">Login</button>
          <button class="" onClick=${toSignUp}>Sign Up</button>
          <button class="" onClick=${toForgetPassword}>Forget Password</button>
        </div>
      </fieldset>
    </form>
  `;
};

const SignUp = ({ onSignUp, onClose, toLogin, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = (e) => {
    e.preventDefault();
    onSignUp({ name, email, password });
  };

  return html` <form class="card" onSubmit=${signUp}>
    <label class="modal-close"></label>
    <button
      style=${{
        backgroundColor: "transparent",
        position: "absolute",
        right: 0,
        top: "-4px",
      }}
      onClick=${onClose}
    >
      ✕
    </button>
    <fieldset>
      <legend>Sign Up to 2Maps</legend>
      <div class="input-group vertical">
        <label for="name">Name</label>
        <input
          id="name"
          value=${name}
          onChange=${(e) => setName(e.target.value)}
        />
      </div>
      <div class="input-group vertical">
        <label for="email">Email</label>
        <input
          id="email"
          value=${email}
          onChange=${(e) => setEmail(e.target.value)}
        />
      </div>
      <div class="input-group vertical">
        <label for="password">Password</label>
        <input
          id="password"
          value=${password}
          onChange=${(e) => setPassword(e.target.value)}
          type="password"
        />
      </div>

      ${error && html`<div class="error">${error}</div>`}
      <div class="row">
        <button class="form-button primary">Sign Up</button>
        <button class="form-button" onClick=${toLogin}>Back</button>
      </div>
    </fieldset>
  </form>`;
};

const ForgetPassword = ({ onForgetPassword, toLogin, onClose, error }) => {
  const [email, setEmail] = useState("");

  const passwordReset = (e) => {
    e.preventDefault();
    onForgetPassword({ email });
  };

  return html`<form class="card" onSubmit=${passwordReset}>
    <label class="modal-close"></label>
    <button
      style=${{
        backgroundColor: "transparent",
        position: "absolute",
        right: 0,
        top: "-4px",
      }}
      onClick=${onClose}
    >
      ✕
    </button>
    <fieldset>
      <legend>Forget password for 2Maps</legend>
      <div class="input-group vertical">
        <label for="email">Email</label>
        <input
          id="email"
          value=${email}
          onChange=${(e) => setEmail(e.target.value)}
        />
      </div>
      ${error && html`<div class="error">${error}</div>`}
      <div class="row">
        <button class="form-button primary">Reset password</button>
        <button class="form-button" onClick=${toLogin}>Back</button>
      </div>
    </fieldset>
  </form>`;
};

const ResetPassword = ({ onPasswordReset, onClose, error }) => {
  const { resetToken } = parseUrlParams();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const passwordReset = (e) => {
    e.preventDefault();
    onPasswordReset({ resetToken, password });
  };

  return html`<form class="card" onSubmit=${passwordReset}>
    <label class="modal-close"></label>
    <button
      style=${{
        backgroundColor: "transparent",
        position: "absolute",
        right: 0,
        top: "-4px",
      }}
      onClick=${onClose}
    >
      ✕
    </button>
    <fieldset>
      <legend>Forget password for 2Maps</legend>
      <div class="input-group vertical">
        <label for="password">Password</label>
        <input
          id="password"
          value=${password}
          onChange=${(e) => setPassword(e.target.value)}
          type="password"
        />
      </div>
      <div class="input-group vertical">
        <label for="password">Password</label>
        <input
          id="password"
          value=${password2}
          onChange=${(e) => setPassword2(e.target.value2)}
          type="password"
        />
      </div>
      ${error && html`<div class="error">${error}</div>`}
      <div class="row">
        <button
          class="form-button primary"
          disabled=${!password || password !== password2}
        >
          Reset password
        </button>
      </div>
    </fieldset>
  </form>`;
};

class Auth extends Component {
  logout() {
    this.props.authStore.authStore.logout();
  }

  onLogin(credentials) {
    this.props.authStore.login(credentials);
  }

  onSignUp(credentials) {
    this.props.authStore.signUp(credentials);
  }

  render({ authStore }) {
    const { show, ui, error } = authStore.getUi();
    const onClose = () => authStore.setUi(false);
    let content = null;
    if (ui === "login") {
      content = html`<${Login}
        onLogin=${this.onLogin.bind(this)}
        onClose=${onClose.bind(this)}
        toSignUp=${() => authStore.setUi(true, "signUp")}
        toForgetPassword=${() => authStore.setUi(true, "forgetPassword")}
        error=${error}
      />`;
    } else if (ui === "signUp") {
      content = html`<${SignUp}
        onSignUp=${this.onSignUp.bind(this)}
        onClose=${onClose.bind(this)}
        toLogin=${() => authStore.setUi(true, "login")}
        error=${error}
      />`;
    } else if (ui === "forgetPassword") {
      content = html`<${ForgetPassword}
        onForgetPassword=${(data) => authStore.forgetPassword(data)}
        onClose=${onClose.bind(this)}
        toLogin=${() => authStore.setUi(true, "login")}
        error=${error}
      />`;
    } else if (ui === "resetPassword") {
      content = html`<${ResetPassword}
        onPasswordReset=${(data) => authStore.resetPassword(data)}
        onClose=${onClose.bind(this)}
        error=${error}
      />`;
    }

    return show && content
      ? html`<div class="modal">${content}</div>`
      : html`<div></div>`;
  }
}

export const createAuth = (authStore) => {
  authStore.onRefresh(() => {
    render(
      html`<${Auth} authStore=${authStore} />`,
      document.getElementById("auth")
    );
  });

  render(
    html`<${Auth} authStore=${authStore} />`,
    document.getElementById("auth")
  );
};
