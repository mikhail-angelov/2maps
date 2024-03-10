import {
  html, render, useState, useEffect,
} from './libs/htm.js';
import { post, put, get } from './utils.js';

const UI_USERS = 'UI_USERS';
const UI_MAPS = 'UI_MAPS';

const ROLES = ['admin', 'user', 'test'];
const MAP_TYPES = ['public', 'admin', 'test'];

const check = async () => {
  const res = await post('/auth/check', {});
  console.log(res);
  if (res.auth !== 'ok' || res.role !== 'admin') {
    throw 'not admin';
  }
};
const loadMaps = async () => {
  try {
    const res = await get('/maps/get', {});
    console.log(res);
    return res;
  } catch (e) {
    console.log('error load maps', e);
    return [];
  }
};
const updateMap = async (map) => {
  const res = await put(`/maps/${map.id}`, map);
  return res;
};
const loadUsers = async () => {
  try {
    const res = await get('/user', {});
    console.log(res);
    return res;
  } catch (e) {
    console.log('error load users', e);
    return [];
  }
};
const updateUser = async (user) => {
  const res = await put(`/user/${user.id}`, user);
  return res;
};

const EditMap = ({
  onClose, map, saveMap, error,
}) => {
  const [name, setName] = useState(map.name);
  const [type, setType] = useState(map.type);
  return html`<div class="modal">
    <div class="modal-content">
      <button class="close-button" onClick=${onClose}>✕</button>
      <form
        class="form"
        onSubmit=${(e) => {
    e.preventDefault();
    saveMap({ id: map.id, name, type });
  }}
      >
        <div class="title">Edit Map</div>
        <div>${map.id}</div>
        <div class="label">Name</div>
        <input
          class="form-input"
          value=${name}
          onChange=${(e) => setName(e.target.value)}
        />
        <div class="label">Type</div>
        <select class="form-select" onChange=${(e) => setType(e.target.value)}>
          ${MAP_TYPES.map((r) => html`<option value=${r}>${r}</option>`)}
        </select>
        ${error && html`<div class="error">${error}</div>`}
        <div class="row">
          <button class="form-button primary">Save</button>
        </div>
      </form>
    </div>
  </div>`;
};

const EditUser = ({
  onClose, user, saveUser, error,
}) => {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  return html`<div class="modal">
    <div class="modal-content">
      <button class="close-button" onClick=${onClose}>✕</button>
      <form
        class="form"
        onSubmit=${(e) => {
    e.preventDefault();
    saveUser({ id: user.id, email, role });
  }}
      >
        <div class="title">Edit User</div>
        <div>${user.id}</div>
        <div class="label">Email</div>
        <input
          class="form-input"
          value=${email}
          onChange=${(e) => setEmail(e.target.value)}
          disabled
        />
        <div class="label">Role</div>
        <select class="form-select" onChange=${(e) => setRole(e.target.value)}>
          ${ROLES.map((r) => html`<option value=${r}>${r}</option>`)}
        </select>
        ${error && html`<div class="error">${error}</div>`}
        <div class="row">
          <button class="form-button primary">Save</button>
        </div>
      </form>
    </div>
  </div>`;
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    loadUsers().then((res) => setUsers(res));
  }, []);

  const onSaveUser = async (user) => {
    console.log('save user', user);
    try {
      const newUser = await updateUser(user);
      setUsers(users.map((u) => (u.id === user.id ? newUser : u)));
      setEditUser(null);
    } catch (e) {
      console.log('error load users', e);
      setError(e);
    }
  };
  return html`<ul class="list" key="users">
    ${users.map(
    (u) => html`<div class="row">
        <div class="label">${u.id}</div>
        <div class="label">${u.email}</div>
        <div class="label">${u.role}</div>
        <button class="form-button" onClick=${() => setEditUser(u)}>
          Edit
        </button>
      </div>`,
  )}
    ${editUser
    && html`<${EditUser}
      onClose=${() => setEditUser(null)}
      user=${editUser}
      saveUser=${onSaveUser}
      error=${error}
    />`}
  </ul>`;
};

const Maps = () => {
  const [maps, setMaps] = useState([]);
  const [editMap, setEditMap] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    loadMaps().then((res) => setMaps(res));
  }, []);

  const onSaveMap = async (map) => {
    console.log('save map', map);
    try {
      const newMap = await updateMap(map);
      setMaps(maps.map((u) => (u.id === map.id ? newMap : u)));
      setEditMap(null);
    } catch (e) {
      console.log('error load maps', e);
      setError(e);
    }
  };
  console.log('maps', maps);
  return html`<ul class="list" key="maps">
    ${maps.map(
    (u) => html`<div class="row">
        <div class="label">${u.id}</div>
        <div class="label">${u.name}</div>
        <div class="label">${u.price}</div>
        <div class="label">${u.size}</div>
        <div class="label">${u.url}</div>
        <div class="label">${u.type}</div>
        <button class="form-button" onClick=${() => setEditMap(u)}>Edit</button>
      </div>`,
  )}
    ${editMap
    && html`<${EditMap}
      onClose=${() => setEditMap(null)}
      map=${editMap}
      saveMap=${onSaveMap}
      error=${error}
    />`}
  </ul>`;
};

const Admin = () => {
  const [ui, setUi] = useState(UI_USERS);

  return html`<div class="admin">
    <div class="left">
    <button class="left-button ${
  ui === UI_USERS ? 'primary' : ''
}" onClick=${() => setUi(UI_USERS)}>Users</button>
    <button class="left-button ${
  ui === UI_USERS ? '' : 'primary'
}"  onClick=${() => setUi(UI_MAPS)}>Map files</button>
    </div>
    ${ui === UI_USERS ? html`<${Users} />` : html`<${Maps} />`}
     </div`;
};

check()
  .then(() => {
    render(html`<${Admin} />`, document.getElementById('main'));
  })
  .catch((e) => {
    console.log('error', e);
    window.location.href = '/';
  });
