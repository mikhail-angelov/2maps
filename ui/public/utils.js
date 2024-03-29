import './libs/axios.js';

export const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent,
);

const RATE_COLORS = [
  '#000000',
  '#808080',
  '#0000ff',
  '#00ff00',
  '#ffff00',
  '#ff0000',
];
export const rateToColor = (rate) => (+rate ? RATE_COLORS[+rate % 6] : RATE_COLORS[0]);

export const getId = () => {
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined'
      && performance.now
      && performance.now() * 1000)
    || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    // eslint-disable-next-line no-mixed-operators
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const delay = async (t, cb) => setTimeout(cb, t);
export function debounce(func, interval) {
  let timer;
  return function dd(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, interval);
  };
}

export const get = async (url) => {
  try {
    const res = await window.axios.get(url);
    return res.data;
  } catch (e) {
    console.log('fetch error', e);
    throw e;
  }
};
export const put = async (url, data) => {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': data ? 'application/json' : 'text/plain',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : '',
    });
    const j = await res.json();
    return j;
  } catch (e) {
    console.log('fetch error', e);
    throw e;
  }
};
export const post = async (url, data) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': data ? 'application/json' : 'text/plain',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : '',
    });
    if (!res.ok) {
      throw 'invalid email or password';
    }
    const j = await res.json();
    return j;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('fetch error', e);
    throw e;
  }
};
export const postLarge = async (url, data) => {
  try {
    const body = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    body.append('value', jsonBlob);

    const res = await window.axios({
      method: 'post',
      url,
      data: body,
    });
    return res.data;
  } catch (e) {
    console.log('fetch error', e);
    throw e;
  }
};

export const remove = async (url) => {
  try {
    const res = await window.axios.delete(url);
    return res.data;
  } catch (e) {
    console.log('fetch error', e);
    throw e;
  }
};
