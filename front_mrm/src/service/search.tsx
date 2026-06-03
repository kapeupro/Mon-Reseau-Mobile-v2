import { formatParamsGetInfoSelectedData } from '@/store/utils/search';

export async function SearchDepRegCom(
  toSearch: string = '',
  category: string = ''
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}search_optimal/?filter=${toSearch}&category=${category}`
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getInfoSelectedData(selectedData: any) {
  const oURLSearchParams = new URLSearchParams(
    formatParamsGetInfoSelectedData(selectedData)
  );
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }search_one/?${oURLSearchParams.toString()}`
    );
    const data = await response.json();

    return Array.isArray(data) && data.length ? data[0] : false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
