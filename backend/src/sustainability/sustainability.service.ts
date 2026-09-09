import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VIRTUAL_WATER_M3_PER_T, KSA_RENEWABLE_WATER_M3, FREIGHT_KG_CO2_PER_T_KM, KSA_PORT, ORIGIN_COORDS, haversineKm,
} from './sustainability.constants';

// Quantifies the sustainability footprint of KSA food imports: embedded ("virtual") water and
// shipping CO₂ — turning the water-scarcity concern into a live, measured metric.
@Injectable()
export class SustainabilityService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const suppliers = await this.prisma.supplierCountry.findMany();

    // ── virtual water (per commodity import volume × water content) ──
    const volByCommodity = new Map<string, number>();
    let co2Kg = 0, volWithCoords = 0, totalVol = 0;
    for (const s of suppliers) {
      const coord = ORIGIN_COORDS[s.countryCode];
      const km = coord ? haversineKm({ lat: coord[0], lon: coord[1] }, KSA_PORT) : null;
      for (const b of ((s.breakdown as any[]) || [])) {
        if (!b.commodity || !b.volumeMt) continue;
        volByCommodity.set(b.commodity, (volByCommodity.get(b.commodity) || 0) + b.volumeMt);
        totalVol += b.volumeMt;
        if (km != null) { co2Kg += b.volumeMt * km * FREIGHT_KG_CO2_PER_T_KM; volWithCoords += b.volumeMt; }
      }
    }

    let virtualWaterM3 = 0;
    const drivers: { commodity: string; volumeMt: number; virtualWaterM3: number; waterPerT: number }[] = [];
    for (const [commodity, volMt] of volByCommodity) {
      const wpt = VIRTUAL_WATER_M3_PER_T[commodity];
      if (!wpt) continue;
      const vw = volMt * wpt;
      virtualWaterM3 += vw;
      drivers.push({ commodity, volumeMt: Math.round(volMt), virtualWaterM3: Math.round(vw), waterPerT: wpt });
    }
    drivers.sort((a, b) => b.virtualWaterM3 - a.virtualWaterM3);

    return {
      virtualWaterM3: Math.round(virtualWaterM3),
      virtualWaterMultiple: Math.round((virtualWaterM3 / KSA_RENEWABLE_WATER_M3) * 10) / 10, // ×KSA renewable water
      co2Tonnes: Math.round(co2Kg / 1000),
      milesCoveragePct: totalVol ? Math.round((volWithCoords / totalVol) * 100) : 0,
      drivers: drivers.slice(0, 6),
      methodology:
        'Virtual water = Σ(commodity import volume × water-footprint, Water Footprint Network global averages); ' +
        'compared to KSA renewable water ≈ 2.4B m³/yr (AQUASTAT). CO₂ = Σ(volume × great-circle distance to Jeddah × ' +
        FREIGHT_KG_CO2_PER_T_KM + ' kg/t-km) for origins with curated coordinates. Directional estimates.',
    };
  }
}
