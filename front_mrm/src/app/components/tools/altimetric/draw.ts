import * as turf from '@turf/turf';
import { Position } from '@turf/turf';

import { getAltitudes } from '@/service/altimetrie';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  Filler,
  Legend,
  ScatterController,
  ChartConfiguration,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Annotation from 'chartjs-plugin-annotation';
export default class AltimetricDraw {
  pointA;
  pointB;
  numberIntervals;
  decimaleNumber;
  distanceValues?: number[];
  units: string;
  idcanvas: string;
  map: any;
  interval: number;
  debug: boolean;
  oChart: any;
  positionLabelMarge: number;
  lengthLineInMetter: number;
  constructor(pointA: number[], pointB: number[]) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.numberIntervals = 30;
    this.decimaleNumber = 8;
    this.units = 'metters';
    this.idcanvas = 'canvas-altimetrie';
    this.interval = 0;
    this.debug = false;
    this.lengthLineInMetter = 0;
    this.positionLabelMarge = 1;
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      LineController,
      PointElement,
      LineElement,
      Filler,
      ChartDataLabels,
      Legend,
      ScatterController,
      Annotation
    );
  }

  setMap(map: any) {
    this.map = map;
  }
  getMap() {
    return this.map;
  }
  setLengthLineInMetter(lengthLineInMetter: number) {
    this.lengthLineInMetter = lengthLineInMetter;
  }
  getLengthLineInMetter() {
    return this.lengthLineInMetter;
  }
  setIntervale(interval: number) {
    this.interval = interval;
  }
  getIntervale() {
    return this.interval;
  }
  setDistance(aDistance: number[]) {
    this.distanceValues = aDistance;
  }
  getDistance() {
    return this.distanceValues;
  }
  getX(pointX: number[]) {
    return pointX[0];
  }
  getY(pointY: number[]) {
    return pointY[1];
  }
  async build() {
    const equidistantPoints = this.createEquidistantPoints();
    const alittudeZ: any = await this.loadZ(equidistantPoints);
    if (alittudeZ === false) {
      return false;
    }
    this.draw(alittudeZ);
  }

  getLengthInterval() {
    const lineAB = turf.lineString([
      [this.getX(this.pointA), this.getY(this.pointA)],
      [this.getX(this.pointB), this.getY(this.pointB)],
    ]);
    let lineLength = turf.length(lineAB, { units: 'meters' });
    this.setLengthLineInMetter(lineLength);

    let interval = lineLength / (this.numberIntervals - 1);
    this.setUnits('meters');
    interval = 5 * Math.round(interval / 5);
    interval = Math.ceil(interval);

    if (interval > 1000) {
      interval = Math.round(interval / 1000) * 1000;
      if (lineLength < interval * this.numberIntervals) {
        interval = Math.floor(interval / 1000) * 1000;
      }
    }
    return interval;
  }

  setUnits(units: string) {
    this.units = units;
  }
  getUnits() {
    return this.units;
  }

  formatDistance(distance: number) {
    if (!this.isChangeUnits()) {
      distance = 5 * Math.round(distance / 5);
      return Math.ceil(distance);
    }
    distance = distance / 1000;
    return Number.isInteger(distance) ? distance : Math.round(distance);
  }

  formatDistanceEnd(distance: number) {
    if (!this.isChangeUnits()) {
      return Math.ceil(distance);
    }
    distance = distance / 1000;
    return Number.isInteger(distance) ? distance : Math.ceil(distance);
  }

  createEquidistantPoints() {
    const lineAB = turf.lineString([
      [this.getX(this.pointA), this.getY(this.pointA)],
      [this.getX(this.pointB), this.getY(this.pointB)],
    ]);

    const interval = this.getLengthInterval();
    this.setIntervale(interval);
    let equidistantPoints = [];
    let distance = [];
    let currentDistance = 0;
    for (let i = 0; i < this.numberIntervals; i++) {
      currentDistance = interval * i;
      if (i === this.numberIntervals - 1) {
        distance.push(this.formatDistanceEnd(this.getLengthLineInMetter()));
      } else {
        distance.push(this.formatDistance(currentDistance));
      }
      let currentPoint = turf.along(lineAB, currentDistance, {
        units: 'meters',
      });
      equidistantPoints.push(currentPoint.geometry.coordinates);
    }

    this.drawMap(equidistantPoints);
    this.setDistance(distance);
    return equidistantPoints;
  }

  drawMap(equidistantPoints: Position[]) {
    if (!this.debug) {
      return;
    }
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    const omap = this.getMap();

    omap.addSource('geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    omap.addLayer({
      id: 'measure-pointserer',
      type: 'circle',
      source: 'geojson',
      paint: {
        'circle-radius': 10,
        'circle-color': '#ff0000',
      },
    });

    const source = omap.getSource('geojson');
    let aPointFeature = [];
    for (let i = 0; i < equidistantPoints.length; i++) {
      let pt = equidistantPoints[i];
      let pointGeojson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pt[0], pt[1]],
        },
        properties: {
          id: String(new Date().getTime()),
          length: geojson.features.length,
        },
      };
      aPointFeature.push(pointGeojson);
    }
    source.setData({
      type: 'FeatureCollection',
      features: aPointFeature,
    });
  }

  loadStrCoord(equidistantPoints: Position[], type: string) {
    let strRes = '';
    for (let i = 0; i < equidistantPoints.length; i++) {
      let position = equidistantPoints[i];
      if (strRes !== '') {
        strRes += '|';
      }
      if (type === 'lon') {
        strRes += position[0].toFixed(this.decimaleNumber);
      } else {
        strRes += position[1].toFixed(this.decimaleNumber);
      }
    }
    return strRes;
  }

  async loadZ(equidistantPoints: Position[]) {
    const lon = this.loadStrCoord(equidistantPoints, 'lon');
    const lat = this.loadStrCoord(equidistantPoints, 'lat');

    const aData = await getAltitudes(lon, lat);
    if (aData === false) {
      return false;
    }
    let alittudeZ = [];
    for (let i = 0; i < aData.length; i++) {
      alittudeZ.push(this.adjusteZ(aData[i]['z']));
    }
    return alittudeZ;
  }

  adjusteZ(z: number) {
    if (Math.round(z) == -99999) {
      return 0.01;
    } else {
      return Math.round(z);
    }
  }
  initCanvas() {
    const canvasdom = document.getElementById(
      this.idcanvas
    ) as HTMLCanvasElement;

    if (!canvasdom) {
      return null;
    }

    const ctx = canvasdom.getContext('2d');
    return ctx;
  }
  getUnitsAltitude() {
    return ' (m)';
  }
  isChangeUnits() {
    const lngMax = this.getIntervale() * this.numberIntervals;
    return lngMax < 10000 ? false : true;
  }
  getUnitsDistance() {
    return this.isChangeUnits() === false ? ' (m)' : ' (km)';
  }
  getMaxY(alittudeZ: number[]) {
    let maxval = Math.max(...alittudeZ);
    let haltiudeStep = Math.round(maxval / 7);
    haltiudeStep = 10 * Math.round(haltiudeStep / 10);
    return maxval + haltiudeStep;
  }
  buildOptions(alittudeZ: number[]) {
    const baseColor = 'rgb(112, 111, 189, 0.75)';
    const options = {
      plugins: {
        filler: {
          propagate: false,
        },
        legend: {
          display: false, // Affiche ou masque la légende
        },
        datalabels: {
          color: function (context: any) {
            if (
              context.dataset.type === 'scatter' &&
              context.dataset.displayLabel
            ) {
              return '#FFFFFF';
            } else {
              return '#rgb(31, 30, 69, 1)';
            }
          },
          anchor: 'end',
          align: function (context: any) {
            if (context.dataset.type === 'scatter') {
              if (context.dataset.displayExtreme) {
                return context.dataset.displayExtremeA ? 'right' : 'left';
              }
              return 'center';
            } else {
              let maxValue = Math.max(...context.dataset.data);
              const index = context.dataset.data.indexOf(maxValue);
              if (index === 0) {
                return 'right';
              } else if (index === context.dataset.data.length - 1) {
                return 'left';
              } else {
                return 'top';
              }
            }
          },
          offset: function (context: any) {
            if (context.dataset.type === 'scatter') {
              return 7;
            } else {
              let maxValue = Math.max(...context.dataset.data);
              const index = context.dataset.data.indexOf(maxValue);
              if (index === 0) {
                return 7;
              } else if (index === context.dataset.data.length - 1) {
                return 7;
              } else {
                return 0;
              }
            }
          },
          textAlign: 'center',
          font: {
            size: 10,
            weight: 'bold',
          },
          formatter: function (value: number, context: any) {
            if (
              context.dataset.type === 'scatter' &&
              context.dataset.displayLabel
            ) {
              if (value === context.dataset.data[0]) {
                return 'A';
              } else if (
                value === context.dataset.data[context.dataset.data.length - 1]
              ) {
                return 'B';
              } else {
                return '';
              }
            } else {
              if (context.dataset.type === 'scatter') {
                if (context.dataset.displayExtreme) {
                  let maxValue = Math.max(...context.dataset.datareference);
                  if (maxValue !== value && value !== 0) {
                    return value + ' m';
                  }
                  return '';
                } else {
                  return '';
                }
              } else {
                let maxValue = Math.max(...context.dataset.data);
                if (value === maxValue && context.dataset.maxFound === false) {
                  context.dataset.maxFound = true;
                  return 'Max : ' + value + ' m';
                }
                return '';
              }
            }
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          border: {
            color: baseColor,
          },
          grid: {
            color: 'white',
            tickColor: 'white',
          },
          ticks: {
            font: {
              size: 10,
            },
            autoSkip: true,
            maxTicksLimit: 5,
          },
          title: {
            display: true,
            align: 'start',
            text: 'Distance' + this.getUnitsDistance(),
            font: {
              weight: 'bold',
              size: 11,
            },
          },
        },
        y: {
          suggestedMax: this.getMaxY(alittudeZ),
          position: 'right',
          border: {
            color: baseColor,
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            tickColor: 'white',
          },
          ticks: {
            font: {
              size: 10,
            },
          },
          title: {
            display: true,
            align: 'end',
            text: 'Altitude ' + this.getUnitsAltitude(),
            font: {
              weight: 'bold',
              size: 11,
            },
          },
        },
      },
    };
    return options;
  }

  buildConfig(alittudeZ: number[]) {
    const data = this.buildData(alittudeZ);
    const options = this.buildOptions(alittudeZ);
    const config = {
      type: 'line',
      data: data,
      options: options,
    } as ChartConfiguration;
    return config;
  }

  getValueStartEnd(alittudeZ: number[]) {
    let aVal = new Array(alittudeZ.length).fill(0);
    aVal[0] = alittudeZ[0];
    aVal[alittudeZ.length - 1] = alittudeZ[alittudeZ.length - 1];
    return aVal;
  }

  getValueLabelPosition(value: number) {
    if (value <= this.positionLabelMarge) {
      return value;
    }
    return value - this.positionLabelMarge;
  }

  getValueStart(alittudeZ: number[]) {
    let aVal = new Array(alittudeZ.length).fill(0);
    aVal[0] = this.getValueLabelPosition(alittudeZ[0]);
    return aVal;
  }

  getValueEnd(alittudeZ: number[]) {
    let aVal = new Array(alittudeZ.length).fill(0);
    aVal[alittudeZ.length - 1] = this.getValueLabelPosition(
      alittudeZ[alittudeZ.length - 1]
    );
    return aVal;
  }

  buildData(alittudeZ: number[]) {
    const baseColor = 'rgb(112, 111, 189, 0.75)';
    const pointColorA = 'rgb(31, 30, 69, 1)';
    const valueDistance = this.getDistance();
    const valueStartEnd = this.getValueStartEnd(alittudeZ);
    const valueStart = this.getValueStart(alittudeZ);
    const valueEnd = this.getValueEnd(alittudeZ);

    const data = {
      labels: valueDistance,
      datasets: [
        {
          type: 'scatter',
          label: 'point radius',
          data: valueStartEnd,
          displayLabel: false,
          strokeColor: 'rgba(255, 255, 220, .75)',
          backgroundColor: pointColorA,
          pointRadius: function (ctx: any) {
            var value = ctx.dataset.data[ctx.dataIndex];
            return value === 0 ? 0 : 7;
          },
        },
        {
          type: 'scatter',
          label: 'label radius',
          data: valueStartEnd,
          displayLabel: true,
          strokeColor: 'rgba(255, 255, 220, .75)',
          backgroundColor: pointColorA,
          pointRadius: 0,
        },
        {
          type: 'scatter',
          label: 'label radius',
          data: valueStart,
          datareference: alittudeZ,
          displayExtremeA: true,
          displayExtreme: true,
          strokeColor: 'rgba(255, 255, 220, .75)',
          backgroundColor: pointColorA,
          pointRadius: 0,
        },
        {
          type: 'scatter',
          label: 'label radius',
          data: valueEnd,
          datareference: alittudeZ,
          displayExtremeB: true,
          displayExtreme: true,
          strokeColor: 'rgba(255, 255, 220, .75)',
          backgroundColor: pointColorA,
          pointRadius: 0,
        },
        {
          label: 'courbe',
          data: alittudeZ,
          fillColor: baseColor,
          strokeColor: baseColor,
          pointRadius: 0,
          maxFound: false,
          backgroundColor: baseColor,
          tension: 0.2,
          fill: true,
        },
      ],
    };
    return data;
  }
  draw(alittudeZ: number[]) {
    const context = this.initCanvas();
    if (context === null) {
      return false;
    }
    const config = this.buildConfig(alittudeZ);
    this.oChart = new Chart(context, config);
  }
  destroyChart() {
    if (this.oChart) {
      this.oChart.destroy();
    }
  }
}
