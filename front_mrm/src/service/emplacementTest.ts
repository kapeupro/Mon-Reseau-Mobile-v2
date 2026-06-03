import { getCsrfToken } from '@/utils/utils';

export async function getEmplacementTest(params: any) {
  const oSearchParams = new URLSearchParams(params);
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }emplacementTest/?${oSearchParams.toString()}`
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error get emplacement test : ', error);
    return false;
  }
}

export async function getEmplacementTestCluster(params: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}clusterQos/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() as string,
        },
        body: JSON.stringify(params),
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error get emplacement test cluster : ', error);
    return false;
  }
}
