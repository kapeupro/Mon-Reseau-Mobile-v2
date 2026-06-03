export async function getDataGeolocalisation(coords: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}data_geolocalisation/?coords=${coords}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}
