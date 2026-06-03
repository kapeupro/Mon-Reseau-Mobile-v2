import { useZoneSubPagesStore } from '@/store/zone';
import Zones from '../zone/zones';
import ZoneInfo from '../zone/zoneInfo';
import Site from './subPages/antennes/site';
import Support from '@/app/components/pages/subPages/antennes/support';

export default function Zone() {
  const { subPage } = useZoneSubPagesStore();

  return (
    <div className=''>
      {subPage === '' && <Zones />}
      {subPage === 'zone_info' && <ZoneInfo />}
      {subPage === 'zone_support' && addPadding(Support)}
      {subPage === 'zone_site' && addPadding(Site)}
    </div>
  );
}

function addPadding(Component: any) {
  return (
    <div className='pt-12 px-5'>
      <Component />
    </div>
  );
}
