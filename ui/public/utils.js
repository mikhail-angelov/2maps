import './libs/axios.js'

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const getId = () => Math.random().toString(36).slice(2);
export const delay = async (t, cb) => setTimeout(cb, t);

export const get = async (url) => {
  try {
    const res = await window.axios.get(url)
    return res.data
  } catch (e) {
    console.log('fetch error', e)
    throw e
  }
}
export const put = async (url, data) => {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': data ? 'application/json' : 'text/plain'
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : ''
    })
    const j = await res.json()
    return j
  } catch (e) {
    console.log('fetch error', e)
    throw e
  }
}
export const post = async (url, data) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': data ? 'application/json' : 'text/plain'
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : ''
    })
    const j = await res.json()
    return j
  } catch (e) {
    console.log('fetch error', e)
    throw e
  }
}
export const postLarge = async (url, data) => {
  try {
    const body = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
    body.append("value", jsonBlob);

    const res = await window.axios({
      method: 'post',
      url,
      data: body,
    })
    return res.data
  } catch (e) {
    console.log('fetch error', e)
    throw e
  }
}