export async function getCrowd() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}crowd/`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
