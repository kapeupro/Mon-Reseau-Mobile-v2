export async function getDensity(
  protocole: string,
  insee_com: string,
  mcc_mnc: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}density/?protocole=${protocole}&insee_com=${insee_com}&mcc_mnc=${mcc_mnc}`
    );
    const data = await response.json();
    return data.success ? data : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
