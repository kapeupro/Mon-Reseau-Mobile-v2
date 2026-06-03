import {
  usePageSuperpositionStore,
  useSuperpositionStore,
} from '@/store/superposition';
import ActionMap from './map';

export default class Action {
  oAction;
  translations;
  isMobile;
  constructor(oAction: any, translations: any, isMobile: boolean = false) {
    this.oAction = oAction;
    this.translations = translations;
    this.isMobile = isMobile;
  }
  isFilter() {
    return this.oAction.action === 'filter';
  }
  start() {
    if (this.isFilter()) {
      this.activeFilter();
    } else {
      this.drawMap();
    }
  }
  drawMap() {
    const oActionMap = new ActionMap(this.oAction, this.translations);
    oActionMap.drawMap();
  }
  activeFilter() {
    const { setPage: setPageSuperposition } =
      usePageSuperpositionStore.getState();
    const { setShow } = useSuperpositionStore.getState();

    setPageSuperposition(this.oAction.name);

    if (this.isMobile) {
      setShow(false);
    }
  }
}
