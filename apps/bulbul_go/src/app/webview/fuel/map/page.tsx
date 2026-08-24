import { FuelMap } from '../components/FuelMap'

// Таб «Карта»: АЗС со статусами на MapLibre (подложка — OpenFreeMap,
// после деплоя geo-стека переключается на tiles.bulbul.asia — см. FuelMap).

export default function FuelMapPage() {
    return <FuelMap />
}
