export async function getStatsCouvOperateur(
  insee: string,
  filter_by: string = 'population',
  operateurs: string,
  techno: string,
  entite: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_couv_operateur/?insee=${insee}&filter_by=${filter_by}&operateurs=${operateurs}&techno=${techno}&entite=${entite}`
    );

    const data = await response.json();

    return data.success ? data : false;
  } catch (error) {
    console.error('Error get stats operateur : ', error);
    return false;
  }
}
