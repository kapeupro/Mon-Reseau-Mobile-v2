export async function fetchOperators(
  territoire: string = '',
  theme: string = 'default'
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}generalinfos/?${territoire}=true&theme=${theme}`
  );
  return response.json();
}
