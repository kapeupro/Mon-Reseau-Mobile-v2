import React from 'react';

import Title from '@/app/components/title';
import Help from '@/app/components/help';
import Badge from '@/app/components/badge';
import ModalBubbleText from '@/app/components/modalBubbleText';
import GeometricShape from '@/app/components/geometricShape';
import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';

import ButtonOperator from '@/app/components/support/buttonOperators';

import { useSupportsStore } from '@/store/support';
import {
  useAntenneSiteOperatorStore,
  useAntenneSubPagesStore,
} from '@/store/antenne';
import { useTranslations } from 'next-intl';
import { useZoneSubPagesStore } from '@/store/zone';
import { isZac } from '../zone/utils';

export default function ListOperators() {
  const { setSubPage } = useAntenneSubPagesStore();
  const { setOperatorSite, setData } = useAntenneSiteOperatorStore();
  const { supports: foundSupport } = useSupportsStore();
  const { setSubPage: setSubPageZone } = useZoneSubPagesStore();
  const translations = useTranslations('whatIsThis.support');
  const translationsAntenne = useTranslations('antenne');

  const bIsZac = isZac();

  if (!foundSupport || foundSupport.length === 0) {
    return <></>;
  }

  const nb = foundSupport.map(() => {
    return;
  });
  const siteNb = nb.length > 1 ? 'sites' : 'site';

  const handlerClick = (
    index: any,
    site_id: any,
    operator: any,
    techno: string,
    statutOperator: string,
    colorStatus: string
  ) => {
    setOperatorSite(operator.sta_nm_anfr);
    setData({
      index: index,
      id_site: site_id,
      techno: techno,
      statutOperator: statutOperator,
      color_status: colorStatus,
    });
    if (bIsZac) {
      setSubPageZone('zone_site');
    } else {
      setSubPage('support_site');
    }
  };

  const getConfigOperator = (operatorStatus: string) => {
    let status = translationsAntenne('inOperation');
    let color = '#34eb34';
    switch (operatorStatus) {
      case 'site-maintenance':
        status = translationsAntenne('inMaintenance');
        color = '#ed3232';
        break;
      case 'site-avenir':
        status = translationsAntenne('sitesToCome');
        color = '#d0cfe7';
        break;
    }
    return { status, color };
  };

  return (
    <div>
      <Title
        text={`${nb.length} ${siteNb}`}
        className='text-lg'
        underline={false}
      />
      <ModalBubbleText
        title={translations('title')}
        image={<IconAntennetHelp className='h-60 w-60' />}
        description={translations('description')}
        className='mb-4'
      >
        <Help className={{ main: '', text: 'text-xs' }} />
      </ModalBubbleText>
      {nb.length > 0 && (
        <div
          className='flex flex-col gap-1.5'
          data-test='antennas-support-container-site'
        >
          {foundSupport.map((operator: any, index: any) => {
            let techno = '';
            if (operator.site_5g) {
              techno = '5G';
            } else if (operator.site_4g) {
              techno = '4G';
            } else if (operator.site_3g) {
              techno = '3G';
            } else if (operator.site_2g) {
              techno = '2G';
            }

            const { color: colorStatut, status: labelStatutOperator } =
              getConfigOperator(operator.statutOperator);

            return (
              <ButtonOperator
                key={index}
                text={techno}
                onClick={() =>
                  handlerClick(
                    index + 1,
                    operator.site_id,
                    operator,
                    techno,
                    operator.statutOperator,
                    colorStatut
                  )
                }
              >
                {operator.nom_affichage ? (
                  <Badge
                    text={operator.nom_affichage}
                    color={{
                      color: operator.couleur_defaut,
                      isHexaDecimal: true,
                    }}
                    classname='w-[70px] rounded-lg p-1'
                  />
                ) : (
                  <span className='text-gray-400 font-normal text-xs'>
                    Indisponible
                  </span>
                )}

                <GeometricShape
                  color={{
                    color: colorStatut,
                    isHexaDecimal: true,
                  }}
                  type='circle'
                >
                  <span className='text-xs'>{labelStatutOperator}</span>
                </GeometricShape>
              </ButtonOperator>
            );
          })}
        </div>
      )}
    </div>
  );
}
