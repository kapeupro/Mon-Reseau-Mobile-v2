import { twMerge } from 'tailwind-merge';

import Icon from '@/app/components/iconcmp';

import { ICON_LIST } from '@/app/constant/icon_departements';

interface DepartementImageProps {
  departementCode: string;
  className?: string;
}

const ImageDepartement: React.FC<DepartementImageProps> = ({
  departementCode,
  className,
}) => {
  return (
    <>
      {ICON_LIST.map((item: any, index: any) => {
        if (item.id === departementCode) {
          return (
            <Icon
              key={index}
              icon={item.icon}
              className={twMerge('', className)}
            />
          );
        }
      })}
    </>
  );
};

export default ImageDepartement;
