export async function initCsrf() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}csrf/`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}
