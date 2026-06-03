import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Map as MaplibreMap } from 'maplibre-gl';

export const Format = {
  PNG: 'png',
  PDF: 'pdf',
} as const;
type Format = (typeof Format)[keyof typeof Format];

export const Unit = {
  in: 'in',
  mm: 'mm',
} as const;
type Unit = (typeof Unit)[keyof typeof Unit];

export const Size = {
  A3: [420, 297],
  A4: [297, 210],
} as const;
type Size = (typeof Size)[keyof typeof Size];

export const PageOrientation = {
  Landscape: 'landscape',
  Portrait: 'portrait',
} as const;
type PageOrientation = (typeof PageOrientation)[keyof typeof PageOrientation];

export const DPI = {
  72: 72,
  96: 96,
  200: 200,
  300: 300,
  400: 400,
} as const;
type DPI = (typeof DPI)[keyof typeof DPI];

export default class MapGenerator {
  private width: number;

  private height: number;

  sizeMuliplicator = 3;

  /**
   * Constructor
   * @param map MaplibreMap object
   * @param size layout size. default is A4
   * @param dpi dpi value. deafult is 300
   * @param format image format. default is PNG
   * @param unit length unit. default is mm
   */
  constructor(
    private map: MaplibreMap,
    private legendCanvas: HTMLCanvasElement,
    private scaleCanvas: HTMLCanvasElement,
    size: Size = Size.A4,
    private dpi: number = 300,
    private format: string = Format.PNG.toString(),
    private unit: Unit = Unit.mm,
    private fileName: string = 'map'
  ) {
    this.width = size[0];
    this.height = size[1];
  }

  //Generate and download Map image
  generate() {
    const this_ = this;

    // Calculate pixel ratio
    const actualPixelRatio: number = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      get() {
        return this_.dpi / 96;
      },
    });
    // Create map container
    const hidden = document.createElement('div');
    hidden.className = 'hidden-map';
    document.body.appendChild(hidden);
    const container = document.createElement('div');
    container.style.width = this.toPixels(this.width);
    container.style.height = this.toPixels(this.height);
    hidden.appendChild(container);

    const style = this.map.getStyle();
    if (style && style.sources) {
      const sources = style.sources;
      Object.keys(sources).forEach((name) => {
        const src = sources[name] as { [key: string]: any };
        Object.keys(src).forEach((key) => {
          if (!src[key]) delete src[key];
        });
      });
    }

    // Render map
    const renderMap = new MaplibreMap({
      container,
      style,
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
      interactive: false,
      preserveDrawingBuffer: true,
      fadeDuration: 0,
      attributionControl: false,
      // hack to read transfrom request callback function
      transformRequest: (this.map as any)._requestManager._transformRequestFn,
    });

    const images = (this.map.style.imageManager || {}).images || [];
    for (const key in images) {
      if (images[key].data) {
        renderMap.addImage(key, images[key].data);
      } else {
        console.warn(`Skipping image ${key} due to null data`);
      }
    }

    const oPromise = new Promise((resolve, reject) => {
      renderMap.once('idle', () => {
        const canvas = renderMap.getCanvas();
        const mergedCanvas = this_.mergeCanvas(canvas);
        const dataUrl = mergedCanvas.toDataURL();
        const fileName = `${this.fileName}.${this_.format}`;
        switch (this_.format) {
          case Format.PNG:
            this_.toPNG(mergedCanvas, fileName);
            break;
          case Format.PDF:
            this_.toPDF(renderMap, mergedCanvas, fileName);
            break;
          default:
            console.error(`Invalid file format: ${this_.format}`);
            break;
        }

        resolve(dataUrl);

        renderMap.remove();
        hidden.parentNode?.removeChild(hidden);
        Object.defineProperty(window, 'devicePixelRatio', {
          get() {
            return actualPixelRatio;
          },
        });
      });
    });
    return oPromise;
  }

  /**
   * Convert canvas to PNG
   * @param canvas Canvas element
   * @param fileName file name
   */
  private toPNG(canvas: HTMLCanvasElement, fileName: string) {
    canvas.toBlob((blob) => {
      // @ts-ignore
      saveAs(blob, fileName);
    });
  }

  /**
   * Convert Map object to PDF
   * @param map Map object
   * @param fileName file name
   */
  private toPDF(
    map: MaplibreMap,
    mergedCanvas: HTMLCanvasElement,
    fileName: string
  ) {
    const pdf = new jsPDF({
      orientation: this.width > this.height ? 'l' : 'p',
      unit: this.unit,
      compress: true,
    });

    pdf.addImage(
      mergedCanvas.toDataURL('image/png'),
      'png',
      0,
      0,
      this.width,
      this.height,
      undefined,
      'FAST'
    );

    const { lng, lat } = map.getCenter();
    pdf.setProperties({
      title: map.getStyle().name,
      subject: `center: [${lng}, ${lat}], zoom: ${map.getZoom()}`,
      creator: 'Mapbox GL Export Plugin',
      author: '(c)Mapbox, (c)OpenStreetMap',
    });

    pdf.save(fileName);
  }

  /**
   * Convert mm/inch to pixel
   * @param length mm/inch length
   * @param conversionFactor DPI value. default is 96.
   */
  private toPixels(length: number, conversionFactor = 96) {
    if (this.unit === Unit.mm) {
      conversionFactor /= 25.4;
    }
    return `${conversionFactor * length}px`;
  }

  private mergeCanvas(mapCanvas: HTMLCanvasElement) {
    const newCanvas = document.createElement('canvas');
    const newContextCanvas = newCanvas.getContext('2d');

    const height = mapCanvas.height;
    const width = mapCanvas.width;

    const legendCanvasHeight = this.getNewSize(this.legendCanvas.height);
    const legendCanvasWidth = this.getNewSize(this.legendCanvas.width);

    const scaleCanvasHeight = this.getNewSize(this.scaleCanvas.height);
    const scaleCanvasWidth = this.getNewSize(this.scaleCanvas.width);

    newCanvas.width = width;
    newCanvas.height = height;

    newContextCanvas?.drawImage(mapCanvas, 0, 0);
    newContextCanvas?.drawImage(
      this.legendCanvas,
      50,
      height - (legendCanvasHeight + 25),
      legendCanvasWidth,
      legendCanvasHeight
    );
    newContextCanvas?.drawImage(
      this.scaleCanvas,
      legendCanvasWidth + 100,
      height - (scaleCanvasHeight + 25),
      scaleCanvasWidth,
      scaleCanvasHeight
    );

    return newCanvas;
  }

  private getNewSize(value: any) {
    return value * this.sizeMuliplicator;
  }
}
