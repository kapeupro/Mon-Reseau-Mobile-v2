export async function getStatsZacOperateur(operateurs: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_zac_operateur/?operateurs=${operateurs}`
    );

    const data = await response.json();

    return data.success ? data : false;
  } catch (error) {
    console.error('Error get stats operateur : ', error);
    return false;
  }
}

export async function getZacInfos(id_zac: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}zac_infos/?id_zac=${id_zac}`
    );

    const data = await response.json();

    return data.success ? data : false;
  } catch (error) {
    console.error('Error get stats operateur : ', error);
    return false;
  }
}
