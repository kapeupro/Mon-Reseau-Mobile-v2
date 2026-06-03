import React, { useEffect, useState } from 'react';

import Title from '@/app/components/title';
import ArrowButtonComponent from '@/app/components/arrowButton';

import DataLinks from '@/app/components//territoire/more_elements/dataLinks';
import DataLinksMyConnexion from '@/app/components//territoire/more_elements/dataLinksMyConnexion';

import { useCoordStore } from '@/store/selectedCoordStore';
import { useFilesArianeStore } from '@/store/ariane';

import { getLinkPublication } from '@/service/territory';

import { isCommune, isLocalisation } from '@/utils/activeEntite';

export default function More() {
  const { selectedTerritoire } = useCoordStore();
  const { filesAriane } = useFilesArianeStore();

  const [linkElement, setLinkElement] = useState<any>();

  useEffect(() => {
    if (selectedTerritoire && !selectedTerritoire.insee_dep) return;

    const fetchData = async () => {
      try {
        const data = await getLinkPublication(selectedTerritoire.insee_dep);
        setLinkElement(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
    };

    fetchData();
  }, [selectedTerritoire]);

  const urlItems = () => {
    let textToDisplay;

    if (
      selectedTerritoire &&
      selectedTerritoire.properties?.nom &&
      (selectedTerritoire.entite === 'Département' ||
        selectedTerritoire.type === 'departement')
    ) {
      textToDisplay = selectedTerritoire.properties.nom;
    } else if (selectedTerritoire && selectedTerritoire.label) {
      textToDisplay = selectedTerritoire.label;
    }
    if (textToDisplay && linkElement) {
      return [
        {
          urlName: `La couverture ${isCommune() ? 'à' : 'en'} ${textToDisplay}`,
          link: `https://www.arcep.fr/fileadmin/user_upload/observatoire/couverture_mobile/${
            linkElement.annee
          }/${linkElement.t_long}/${
            selectedTerritoire.insee_dep
              ? selectedTerritoire.insee_dep
              : selectedTerritoire.properties?.insee_dep
          }_etat_couverturemobile_${linkElement.t_short}_ARCEP.pdf`,
          target: '_blank',
        },
        {
          urlName: `L'Observatoire du déploiement 5G`,
          link: `${process.env.NEXT_PUBLIC_LINK_PUBLICATION_ANTENNE}`,
          target: '_blank',
        },
      ];
    } else {
      return [
        {
          urlName: `L'Observatoire du déploiement 5G`,
          link: `${process.env.NEXT_PUBLIC_LINK_PUBLICATION_ANTENNE}`,
          target: '_blank',
        },
      ];
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      {!isLocalisation() && (
        <Title text='Plus de données' className='text-base' underline={false} />
      )}
      {filesAriane
        .slice(2, filesAriane.length - 1)
        .reverse()
        .map((item: any, index: number) => (
          <ArrowButtonComponent
            text={item.text}
            icon={item.icon}
            className='my-1 pt-2'
            onClick={() => item.onClick()}
            key={index}
          />
        ))}
      <DataLinks className='' items={urlItems()} />
      <DataLinksMyConnexion />
    </div>
  );
}
