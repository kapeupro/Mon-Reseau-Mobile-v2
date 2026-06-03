export async function getExtent({ id, table }: { id: number; table: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}crowd/?id=${id}&table=${table}`
    );
    const data = await response.json();
    return data.success ? data.extent : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getStatQos(
  protocole: string,
  entite: string,
  operateurs: string,
  typeZone: string,
  entiteFilter: string,
  situation: string,
  crowdSelect: string,
  habitation: number,
  metropole: number
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_qos/?protocole=${protocole}&entite=${entite}&operators=${operateurs}&strate={${typeZone}}&entite_filter=${entiteFilter}&situation=${situation}&datasource=${crowdSelect}&habitation=${habitation}&metropole=${metropole}`
    );
    const data = await response.json();
    return data.success ? data : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getDataAvailableQos(id_crowd: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}dataqos_type_byop/?datasource=${id_crowd}`
    );
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
