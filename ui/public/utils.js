export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const getId = () => Math.random().toString(36).slice(2);
export const delay = async (t, cb) => setTimeout(cb, t);

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