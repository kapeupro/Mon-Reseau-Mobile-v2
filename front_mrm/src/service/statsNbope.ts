export async function getStatsNbope(
  insee: string,
  filter_by: string = 'population',
  techno: string,
  nb_op: number,
  entite: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_nbope/?insee=${insee}&filter_by=${filter_by}&techno=${techno}&nb_op=${nb_op}&entite=${entite}`
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error get stats nbope : ', error);
    return false;
  }
}
