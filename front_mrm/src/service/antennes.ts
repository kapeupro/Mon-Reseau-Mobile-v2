export async function getDepartementByGid(gid: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FEATURESERV_URL}collections/${process.env.NEXT_PUBLIC_SCHEMA}.departement_light/items.json?&filter=gid=${gid}`
    );
    const data = await response.json();

    return data.features?.length ? data.features[0] : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSiteByFid(
  id_site: string,
  code_dep: string,
  isSav = false
) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }site/?id_site=${id_site}&code_dep=${code_dep}&is_sav=${
        isSav ? '1' : '0'
      }`
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSupportByNiveau(params: any) {
  const paramsUrl = new URLSearchParams(params);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}extent?${paramsUrl.toString()}`
    );
    const data = await response.json();
    return data.length ? data[0] : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getNbSite() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}nb_site/`);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getStatsAntenneOperateur(
  insee: string,
  operateurs: string,
  entite: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_antenne_operateur/?insee=${insee}&operateurs=${operateurs}&entite=${entite}`
    );

    const data = await response.json();

    return data.success ? data : false;
  } catch (error) {
    console.error('Error get stats operateur : ', error);
    return false;
  }
}
