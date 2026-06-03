export async function getTerritory(params: any) {
  const paramsUrl = new URLSearchParams(params);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}territory/?${paramsUrl.toString()}`
    );
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

export async function getStatCouverture(params: any) {
  const paramsUrl = new URLSearchParams({
    id: params.id,
    operators: params.operators,
    service: params.service,
    entite: params.entite,
    x: params.x,
    y: params.y,
  });
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }stat_couverture/?${paramsUrl.toString()}`
    );
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getStatTest(params: any) {
  const paramsUrl = new URLSearchParams(params);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_test/?${paramsUrl.toString()}`
    );
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getStatZone(params: any) {
  const paramsUrl = new URLSearchParams({
    id: params.id,
    entite: params.entite,
  });

  if (params.dept_outremer) {
    paramsUrl.append('dept_outremer', params.dept_outremer);
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}stat_zone/?${paramsUrl.toString()}`
    );
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getStatSignalement(params: any) {
  const paramsUrl = new URLSearchParams(params);
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }stat_signalement/?${paramsUrl.toString()}`
    );
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getLinkPublication(dept: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}link_publication/?dept=${dept}`
    );
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
