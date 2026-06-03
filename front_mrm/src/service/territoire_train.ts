export async function getStatTerritoireTrain(params: any) {
  const searchParams = new URLSearchParams(params);

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }stat_territoire_train/?${searchParams.toString()}`
    );

    const data = await response.json();

    return data.success ? data : false;
  } catch (error) {
    console.error('Error get stats territoire train : ', error);
    return false;
  }
}

export async function getListTrainByAxis(params: any) {
  const searchParams = new URLSearchParams(params);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}train/?${searchParams.toString()}`
    );

    const jsonResp = await response.json();
    return jsonResp.success ? jsonResp.data : false;
  } catch (error) {
    console.error('Error get list train : ', error);
    return false;
  }
}
