import React from 'react';

interface DataFilterProps {
  title: string;
  aData: { label: string; id: string }[];
  setFilter: Function;
}

export default function DataFilter({
  title,
  aData,
  setFilter,
}: Readonly<DataFilterProps>) {
  return (
    <div>
      <h2 className='text-color-primary font-semibold mb-4'>{title}</h2>
      <div className='flex gap-2'>
        {aData.map((data) => (
          <button
            key={data.id}
            className='bg-transparent text-color-primary border-[1.5px]
                            px-4 py-2 hover:bg-primary hover:text-primary-text hover:border-transparent
                            hover:shadow-md transition duration-300 ease-in-out w-min rounded-full
                            btn-btn-outline-primary'
            onClick={() => setFilter(data.id)}
          >
            {data.label}
          </button>
        ))}
      </div>
    </div>
  );
}
