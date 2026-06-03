'use client';
import React from 'react';
import ProgressbarComponent from '../../components/progressbar';
import { getWidthWindow } from '../../../service/window';

export default function Progressbar() {
  const valuesBouygues = [2450, 3265, 10];
  const colorBouygues = ['#a9eaff', '#3dd0ff', '#24b2de'];
  const valuesFree = [0, 99.5, 0, 0.5];
  const colorFree = ['#8fffe3', '#4be1bb', '#32ba98', '#10745b'];
  const valuesOrange = [84, 1, 14, 1];
  const colorOrange = ['#ffc584', '#ff8700', '#c06600', '#864701'];
  const valuesSfr = [42, 13, 25, 20];
  const colorSfr = ['#ffabaa', '#e47170', '#b54241', '#880100'];
  const operateur1 = [75, 10, 15];
  const operateur2 = [0, 0, 0];
  const coloroperateur = ['#CFB8D0', '#A071A2', '#702A74'];
  const iswithiconOrange = false;
  const iswithtotalBouygues = true;
  const isprecentFreeCaraibe = true;
  const ispercentBouygues = false;
  const widthOp2 = 200;

  const margin = 5;
  const width = getWidthWindow() - margin * 2;
  console.log();
  return (
    <div className='ml-5'>
      <ProgressbarComponent
        title='Bouygues'
        color={colorBouygues}
        iswithtotal={iswithtotalBouygues}
        ispercent={ispercentBouygues}
        values={valuesBouygues}
      ></ProgressbarComponent>
      <ProgressbarComponent
        title='Free Caraïbes'
        color={colorFree}
        values={valuesFree}
        ispercent={isprecentFreeCaraibe}
      ></ProgressbarComponent>
      <ProgressbarComponent
        title='Orange'
        subtitle='A partir de 362 mesures dont 3 de crowdsourcing'
        color={colorOrange}
        iswithicon={iswithiconOrange}
        values={valuesOrange}
      ></ProgressbarComponent>
      <ProgressbarComponent
        title='SFR'
        color={colorSfr}
        values={valuesSfr}
      ></ProgressbarComponent>
      <ProgressbarComponent
        title='Par 2 Opérateur'
        color={coloroperateur}
        ispercent={ispercentBouygues}
        values={operateur2}
      ></ProgressbarComponent>
    </div>
  );
}
