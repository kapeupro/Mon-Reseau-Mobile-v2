function formatParams(data: any[], bUpper = true) {
  const fdata = data.join(',');
  return bUpper ? fdata.toUpperCase() : fdata;
}

export async function getSupportById({
  id,
  dispositif,
  technologies,
  status,
  is_zac,
  operators,
  nom_site_operateurs,
}: {
  id?: string;
  dispositif: string;
  technologies: string[];
  status: string[];
  is_zac: number;
  operators: any;
  nom_site_operateurs?: string;
}) {
  try {
    let url = `${
      process.env.NEXT_PUBLIC_API_URL
    }operateur/?fid=${id}&techno=${formatParams(
      technologies
    )}&dispositif=${dispositif}&state=${formatParams(
      status,
      false
    )}&is_zac=${is_zac}&operators=${formatParams(operators, false)}`;

    if (nom_site_operateurs) {
      url += `&nom_site_operateurs=${nom_site_operateurs}`;
    }

    const response = await fetch(url);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error get support : ', error);
    return false;
  }
}
