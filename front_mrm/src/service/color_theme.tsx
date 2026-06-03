export async function getOperatorsThemeColor(theme: string, operators: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}operator_color_theme/?theme=${theme}&operators=${operators}`
  );
  const data = await response.json();

  return data.success ? data : false;
}
