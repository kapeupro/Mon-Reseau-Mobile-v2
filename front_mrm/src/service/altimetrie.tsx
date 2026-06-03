export async function getAltitudes(lon: string, lat: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ALTIMETRIE_API}?lon=${lon}&lat=${lat}&resource=ign_rge_alti_wld&delimiter=|&indent=false&measures=false&zonly=false`
    );
    const data = await response.json();
    return data.error ? false : data.elevations;
  } catch (error) {
    return false;
  }
}

export async function getListCrowdsourcing() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}parameterslink/all/`
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
