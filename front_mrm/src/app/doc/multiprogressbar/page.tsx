'use client';
import React from 'react';
import MultiProgressbarComponent from '@/app/components/multiprogressbar';

export default function Progressbar() {
  const valuesBouygues = [2450, 3265, 5855];
  const colorBouygues = ['#a9eaff', '#3dd0ff', '#24b2de'];
  const valuesFree = [4844, 7000, 2020, 1000];
  const colorFree = ['#8fffe3', '#4be1bb', '#32ba98', '#10745b'];
  const valuesOrange = [1500, 2550, 5515, 1055];
  const colorOrange = ['#ffc584', '#ff8700', '#c06600', '#864701'];
  const valuesSfr = [4221, 4524, 600, 900];
  const colorSfr = ['#ffabaa', '#e47170', '#b54241', '#880100'];
  const iswithiconOrange = false;
  const iswithtotalBouygues = true;
  const ispercentBouygues = false;
  const widthOp2 = 357;
  const titles = ['Bouygues', 'Free Caraïbes', 'Orange', 'SFR'];
  const colors = [colorBouygues, colorFree, colorOrange, colorSfr];
  const values = [valuesBouygues, valuesFree, valuesOrange, valuesSfr];
  return (
    <div>
      <MultiProgressbarComponent
        title={titles}
        color={colors}
        iswithtotal={iswithtotalBouygues}
        iswithicon={iswithiconOrange}
        ispercent={ispercentBouygues}
        values={values}
        width={widthOp2}
      ></MultiProgressbarComponent>
    </div>
  );
}
