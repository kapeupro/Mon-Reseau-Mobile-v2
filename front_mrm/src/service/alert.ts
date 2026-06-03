export async function generateUrlPrefilledForm(params: any = {}) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_LINK_ALERT!, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_ALERT_ARCEP}`,
      },
      body: paramsToFormData({
        alerte: JSON.stringify({
          ...params,
          aliasProblematique: 'MRM_COUVERTURE_INDOOR',
        }),
      }),
    });
    const data = await response.json();
    return data.url ?? false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function paramsToFormData(oParams: any) {
  const oFormData = new FormData();

  for (const [key, value] of Object.entries(oParams)) {
    oFormData.append(key, value as string);
  }

  return oFormData;
}
