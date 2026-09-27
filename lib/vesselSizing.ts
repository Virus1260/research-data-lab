/**
 * Parametric Mechanical Sizing Calculator for Conical Freeze-Dryer Vessels
 * Derived from Hosokawa AFD Technical Package (Chapters 05, 11, 24, and 25)
 * Deep engineering parameters including ASME BPE geometry, annular jacket gaps, and code heads.
 */

export interface HosokawaPreset {
  modelL: number;
  nominalVolumeL: number;
  maxBatchVolumeL: number;
  sublimationCapacityKg_h: number;
  scaleCategory: "R&D / Pilot" | "Production / cGMP";
  defaultMinorDiaMm: number;
}

export const HOSOKAWA_PRESETS: HosokawaPreset[] = [
  { modelL: 1, nominalVolumeL: 1, maxBatchVolumeL: 0.5, sublimationCapacityKg_h: 0.1, scaleCategory: "R&D / Pilot", defaultMinorDiaMm: 80 },
  { modelL: 5, nominalVolumeL: 5, maxBatchVolumeL: 2.5, sublimationCapacityKg_h: 0.3, scaleCategory: "R&D / Pilot", defaultMinorDiaMm: 80 },
  { modelL: 20, nominalVolumeL: 20, maxBatchVolumeL: 10, sublimationCapacityKg_h: 0.8, scaleCategory: "R&D / Pilot", defaultMinorDiaMm: 100 },
  { modelL: 60, nominalVolumeL: 60, maxBatchVolumeL: 30, sublimationCapacityKg_h: 1.7, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 100 },
  { modelL: 100, nominalVolumeL: 100, maxBatchVolumeL: 50, sublimationCapacityKg_h: 2.2, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 150 },
  { modelL: 200, nominalVolumeL: 200, maxBatchVolumeL: 100, sublimationCapacityKg_h: 3.4, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 150 },
  { modelL: 500, nominalVolumeL: 500, maxBatchVolumeL: 250, sublimationCapacityKg_h: 7.2, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 150 },
  { modelL: 800, nominalVolumeL: 800, maxBatchVolumeL: 400, sublimationCapacityKg_h: 9.9, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 200 },
  { modelL: 1000, nominalVolumeL: 1000, maxBatchVolumeL: 500, sublimationCapacityKg_h: 11.4, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 200 },
  { modelL: 1500, nominalVolumeL: 1500, maxBatchVolumeL: 750, sublimationCapacityKg_h: 13.7, scaleCategory: "Production / cGMP", defaultMinorDiaMm: 250 },
];

export interface ConeGeometryParams {
  nominalVolumeL?: number;
  workingVolumeL?: number;
  halfAngleDeg?: number; // 10° to 35° (Hosokawa AFD steep cone standard is 17°)
  minorDiaMm?: number; // Apex discharge bore (e.g. 100 mm for DN100)
  shellThicknessMm?: number; // e.g. 4.0 mm
  drivingMode?: 'volume' | 'height' | 'diameter' | 'vol_and_height';
  targetHeightCm?: number;
  targetDiameterCm?: number;
}

export interface ConeGeometryResult {
  heightCm: number;
  heightMm: number;
  diameterCm: number;
  diameterMm: number;
  radiusCm: number;
  radiusMm: number;
  minorDiameterMm: number;
  minorRadiusMm: number;
  slantLengthCm: number;
  slantLengthMm: number;
  lateralAreaM2: number;
  fillHeightCm: number;
  fillHeightMm: number;
  fillHeightPercent: number;
  freeboardHeightCm: number;
  freeboardHeightMm: number;
  freeboardPercent: number;
  volumeRatio: number; // workingVolumeL / nominalVolumeL
  halfAngleDeg: number;
  includedAngleDeg: number; // 2 * halfAngleDeg
  shellThicknessMm: number;
  outerDiameterMm: number;
  calculatedNominalVolumeL: number;
  calculatedWorkingVolumeL: number;
}

/**
 * Calculates true conical frustum vessel geometry with exact mathematical coupling
 * between top major diameter, bottom nozzle bore (minor diameter), height, and cone half-angle.
 * 
 * Governing Frustum Relations:
 * tan(α) = (R_major - R_minor) / h_cone
 * D_major = D_minor + 2 * h_cone * tan(α)
 * V_cone = (π / [3 * tan(α)]) * [R_major³ - R_minor³]
 */
export function calculateConeGeometry(params: ConeGeometryParams): ConeGeometryResult {
  const {
    nominalVolumeL = 20,
    workingVolumeL = 10,
    halfAngleDeg = 17,
    minorDiaMm = 100,
    shellThicknessMm = 4.0,
    drivingMode = 'volume',
    targetHeightCm = 43.0,
    targetDiameterCm = 36.3,
  } = params;

  let actualHalfAngleDeg = halfAngleDeg;
  let alphaRad = (halfAngleDeg * Math.PI) / 180;
  let tanAlpha = Math.tan(alphaRad);
  let sinAlpha = Math.sin(alphaRad);

  const minorRadiusCm = (minorDiaMm / 10) / 2;
  const rMinor3 = Math.pow(minorRadiusCm, 3);

  let heightCm = 44.5;
  let radiusCm = 20.75;
  let diameterCm = 41.5;
  let calcNominalVolumeL = nominalVolumeL;

  if (drivingMode === 'height') {
    heightCm = Math.max(10, targetHeightCm);
    radiusCm = minorRadiusCm + heightCm * tanAlpha;
    diameterCm = 2 * radiusCm;
    // Conical frustum volume: V = (π / (3 * tanα)) * (R_major³ - R_minor³)
    const volumeCm3 = (Math.PI / (3 * tanAlpha)) * (Math.pow(radiusCm, 3) - rMinor3);
    calcNominalVolumeL = Number((volumeCm3 / 1000).toFixed(2));
  } else if (drivingMode === 'diameter') {
    diameterCm = Math.max(minorDiaMm / 10 + 2, targetDiameterCm);
    radiusCm = diameterCm / 2;
    heightCm = (radiusCm - minorRadiusCm) / tanAlpha;
    const volumeCm3 = (Math.PI / (3 * tanAlpha)) * (Math.pow(radiusCm, 3) - rMinor3);
    calcNominalVolumeL = Number((volumeCm3 / 1000).toFixed(2));
  } else if (drivingMode === 'vol_and_height') {
    heightCm = Math.max(10, targetHeightCm);
    calcNominalVolumeL = Math.max(0.5, nominalVolumeL);
    const volumeCm3 = calcNominalVolumeL * 1000;
    // Exact conical frustum volume: V = (π * h / 3) * (R² + R * r0 + r0²)
    // Let K = 3 * V / (π * h)
    // R² + r0 * R + (r0² - K) = 0
    // Quadratic formula: R = (-r0 + sqrt(4K - 3*r0²)) / 2
    const K = (3 * volumeCm3) / (Math.PI * heightCm);
    const disc = 4 * K - 3 * Math.pow(minorRadiusCm, 2);
    if (disc > 0) {
      radiusCm = (-minorRadiusCm + Math.sqrt(disc)) / 2;
      diameterCm = 2 * radiusCm;
      const solvedTan = (radiusCm - minorRadiusCm) / heightCm;
      actualHalfAngleDeg = Number(((Math.atan(solvedTan) * 180) / Math.PI).toFixed(1));
      alphaRad = (actualHalfAngleDeg * Math.PI) / 180;
      tanAlpha = Math.tan(alphaRad);
      sinAlpha = Math.sin(alphaRad);
    } else {
      radiusCm = minorRadiusCm + heightCm * tanAlpha;
      diameterCm = 2 * radiusCm;
    }
  } else {
    // Volume driven (default): solve exact frustum equation for given volume and minor radius
    calcNominalVolumeL = Math.max(0.5, nominalVolumeL);
    const volumeCm3 = calcNominalVolumeL * 1000;
    // R_major³ = R_minor³ + (3 * V * tanα / π)
    const rMajor3 = rMinor3 + (3 * volumeCm3 * tanAlpha) / Math.PI;
    radiusCm = Math.cbrt(rMajor3);
    diameterCm = 2 * radiusCm;
    heightCm = (radiusCm - minorRadiusCm) / tanAlpha;
  }

  // Slant length of conical frustum along generator wall
  const slantLengthCm = (radiusCm - minorRadiusCm) / sinAlpha;

  // Lateral surface area of frustum: A_lat = π * (R_major + R_minor) * L_slant (in m²)
  const lateralAreaM2 = (Math.PI * (radiusCm + minorRadiusCm) * slantLengthCm) / 10000;

  // Working liquid fill height calculation in the conical frustum:
  const effectiveWorkingL = drivingMode === 'volume' ? Math.min(calcNominalVolumeL, workingVolumeL) : calcNominalVolumeL * 0.50;
  const workCm3 = effectiveWorkingL * 1000;
  const rFill3 = rMinor3 + (3 * workCm3 * tanAlpha) / Math.PI;
  const fillRadiusCm = Math.cbrt(rFill3);
  const fillHeightCm = Math.max(0, (fillRadiusCm - minorRadiusCm) / tanAlpha);
  const fillHeightPercent = (fillHeightCm / Math.max(0.1, heightCm)) * 100;

  const freeboardHeightCm = Math.max(0, heightCm - fillHeightCm);
  const freeboardPercent = 100 - fillHeightPercent;

  const volumeRatio = effectiveWorkingL / Math.max(0.001, calcNominalVolumeL);
  const diameterMm = diameterCm * 10;
  const outerDiameterMm = diameterMm + 2 * shellThicknessMm;

  return {
    heightCm: Number(heightCm.toFixed(2)),
    heightMm: Number((heightCm * 10).toFixed(1)),
    diameterCm: Number(diameterCm.toFixed(2)),
    diameterMm: Number(diameterMm.toFixed(1)),
    radiusCm: Number(radiusCm.toFixed(2)),
    radiusMm: Number((radiusCm * 10).toFixed(1)),
    minorDiameterMm: minorDiaMm,
    minorRadiusMm: minorDiaMm / 2,
    slantLengthCm: Number(slantLengthCm.toFixed(2)),
    slantLengthMm: Number((slantLengthCm * 10).toFixed(1)),
    lateralAreaM2: Number(lateralAreaM2.toFixed(3)),
    fillHeightCm: Number(fillHeightCm.toFixed(2)),
    fillHeightMm: Number((fillHeightCm * 10).toFixed(1)),
    fillHeightPercent: Number(fillHeightPercent.toFixed(1)),
    freeboardHeightCm: Number(freeboardHeightCm.toFixed(2)),
    freeboardHeightMm: Number((freeboardHeightCm * 10).toFixed(1)),
    freeboardPercent: Number(freeboardPercent.toFixed(1)),
    volumeRatio: Number(volumeRatio.toFixed(3)),
    halfAngleDeg: actualHalfAngleDeg,
    includedAngleDeg: actualHalfAngleDeg * 2,
    shellThicknessMm,
    outerDiameterMm: Number(outerDiameterMm.toFixed(1)),
    calculatedNominalVolumeL: calcNominalVolumeL,
    calculatedWorkingVolumeL: Number(effectiveWorkingL.toFixed(2)),
  };
}

export interface JacketCrossCheckParams {
  sublimationRateKg_h: number;
  heatTransferCoeffU: number; // W/(m²·K), typical 50-200
  deltaT_C: number; // °C, typical 10-30
  coneLateralAreaM2: number;
  topDiameterCm: number;
  annularGapMm?: number; // default 50 mm as requested by user
  jacketWallThicknessMm?: number; // default 3.0 mm
  fluidDensityKg_m3?: number; // 920 kg/m³ for silicone oil, 1000 for water
}

export interface JacketCrossCheckResult {
  heatDutyW: number;
  requiredAreaM2: number;
  coneAreaM2: number;
  areaSurplusDeficitM2: number;
  isAdequate: boolean;
  suggestedCylinderExtensionCm: number;
  annularGapMm: number;
  jacketInnerDiameterMm: number;
  jacketOuterDiameterMm: number;
  jacketFluidVolumeLiters: number;
  jacketFluidMassKg: number;
  recommendedFlowRateLpm: number;
}

/**
 * Checks if the cone's own lateral heat transfer area satisfies the sublimation duty,
 * and computes the annular jacket space volume, fluid mass, and flow metrics.
 * Q = ṁ_sub * ΔH_sub / 3.6 (W)
 * A_req = Q / (U * ΔT)
 */
export function calculateJacketCrossCheck(params: JacketCrossCheckParams): JacketCrossCheckResult {
  const {
    sublimationRateKg_h,
    heatTransferCoeffU,
    deltaT_C,
    coneLateralAreaM2,
    topDiameterCm,
    annularGapMm = 50,
    jacketWallThicknessMm = 3.0,
    fluidDensityKg_m3 = 920,
  } = params;

  // Latent heat of sublimation for ice ≈ 2838 kJ/kg
  const latentHeatSubKJ_kg = 2838.0;
  const heatDutyW = (sublimationRateKg_h * latentHeatSubKJ_kg * 1000) / 3600;

  const u = Math.max(1, heatTransferCoeffU);
  const dt = Math.max(0.1, deltaT_C);
  const requiredAreaM2 = heatDutyW / (u * dt);

  const areaSurplusDeficitM2 = coneLateralAreaM2 - requiredAreaM2;
  const isAdequate = areaSurplusDeficitM2 >= 0;

  let suggestedCylinderExtensionCm = 0;
  if (!isAdequate) {
    const deficitM2 = Math.abs(areaSurplusDeficitM2);
    const topDiameterM = topDiameterCm / 100;
    const hCylM = deficitM2 / (Math.PI * Math.max(0.05, topDiameterM));
    suggestedCylinderExtensionCm = hCylM * 100;
  }

  // Annular jacket dimensional calculations
  const topDiameterMm = topDiameterCm * 10;
  const innerConeODMm = topDiameterMm + 8; // inner wall 4mm
  const jacketInnerDiameterMm = innerConeODMm + 2 * annularGapMm;
  const jacketOuterDiameterMm = jacketInnerDiameterMm + 2 * jacketWallThicknessMm;

  // Annular volume V_ann = Area_lat * (gap in meters) * 1000 (Liters)
  const gapMeters = annularGapMm / 1000;
  const jacketFluidVolumeLiters = coneLateralAreaM2 * gapMeters * 1000;
  const jacketFluidMassKg = jacketFluidVolumeLiters * (fluidDensityKg_m3 / 1000);

  // Recommended circulation rate to keep temperature uniform across jacket
  // Flow rate (LPM) for ~1.5 m/s velocity in annular gap or 3-5 K delta-T across jacket
  const recommendedFlowRateLpm = Math.max(15, Math.round(heatDutyW / (4.184 * 3 * 60) * 10) / 10);

  return {
    heatDutyW: Math.round(heatDutyW),
    requiredAreaM2: Number(requiredAreaM2.toFixed(3)),
    coneAreaM2: Number(coneLateralAreaM2.toFixed(3)),
    areaSurplusDeficitM2: Number(areaSurplusDeficitM2.toFixed(3)),
    isAdequate,
    suggestedCylinderExtensionCm: Number(suggestedCylinderExtensionCm.toFixed(1)),
    annularGapMm,
    jacketInnerDiameterMm: Number(jacketInnerDiameterMm.toFixed(1)),
    jacketOuterDiameterMm: Number(jacketOuterDiameterMm.toFixed(1)),
    jacketFluidVolumeLiters: Number(jacketFluidVolumeLiters.toFixed(2)),
    jacketFluidMassKg: Number(jacketFluidMassKg.toFixed(2)),
    recommendedFlowRateLpm,
  };
}

export type HeadType = "torispherical" | "ellipsoidal" | "flat";

export interface HeadCalculationParams {
  headType: HeadType;
  topDiameterMm: number;
  designPressureBar: number; // e.g. 2.5 to 3.5 bar for clean steam SIP
  allowableStressMPa: number; // e.g. 115 MPa for 316L at 120°C
  jointEfficiency: number; // e.g. 1.0 or 0.85
  corrosionAllowanceMm?: number; // e.g. 0.0 for pharma 316L
}

export interface HeadCalculationResult {
  headType: HeadType;
  thicknessMm: number;
  crownRadiusL_mm: number;
  knuckleRadiusR_mm: number;
  headDepthMm: number;
  straightFlangeMm: number;
  mFactor: number;
  kFactor: number;
  equivalentSphereRadiusRoMm: number;
  warning?: string;
}

/**
 * Computes ASME Section VIII Division 1 UG-32 internal-pressure thickness for formed heads.
 * - Torispherical: UG-32(e) -> t = P*L*M / (2*S*E - 0.2*P)
 * - Ellipsoidal 2:1: UG-32(d) -> t = P*D*K / (2*S*E - 0.2*P)
 */
export function calculateHeadDimensions(params: HeadCalculationParams): HeadCalculationResult {
  const { headType, topDiameterMm, designPressureBar, allowableStressMPa, jointEfficiency, corrosionAllowanceMm = 0 } = params;

  const D = topDiameterMm;
  const P_MPa = designPressureBar * 0.1; // 1 bar = 0.1 MPa
  const S_MPa = Math.max(10, allowableStressMPa);
  const E = Math.min(1.0, Math.max(0.5, jointEfficiency));

  const denominator = 2 * S_MPa * E - 0.2 * P_MPa;
  const straightFlangeMm = Math.max(25, Math.round(0.08 * D));

  if (headType === "torispherical") {
    // ASME Section VIII Div 1 UG-32(e)
    const L = D; // Crown radius equals diameter
    const r = Math.max(0.06 * D, 6.0); // Knuckle >= 6% of diameter
    const mFactor = (3 + Math.sqrt(L / r)) / 4; // M factor ≈ 1.77
    const t_calc = (P_MPa * L * mFactor) / Math.max(1, denominator);
    const thicknessMm = Math.max(2.5, t_calc + corrosionAllowanceMm);
    // Depth ≈ 0.169 D + straight flange
    const dishDepthOnly = 0.169 * D;
    const headDepthMm = dishDepthOnly + straightFlangeMm;

    return {
      headType,
      thicknessMm: Number(thicknessMm.toFixed(2)),
      crownRadiusL_mm: Math.round(L),
      knuckleRadiusR_mm: Math.round(r),
      headDepthMm: Math.round(headDepthMm),
      straightFlangeMm,
      mFactor: Number(mFactor.toFixed(3)),
      kFactor: 1.0,
      equivalentSphereRadiusRoMm: Math.round(L),
    };
  }

  if (headType === "ellipsoidal") {
    // ASME Section VIII Div 1 UG-32(d) 2:1 ellipsoidal
    const L = 0.9 * D;
    const r = 0.17 * D;
    const headDepthMm = D / 4 + straightFlangeMm;
    const kFactor = 1.0;
    const t_calc = (P_MPa * D * kFactor) / Math.max(1, denominator);
    const thicknessMm = Math.max(2.5, t_calc + corrosionAllowanceMm);

    return {
      headType,
      thicknessMm: Number(thicknessMm.toFixed(2)),
      crownRadiusL_mm: Math.round(L),
      knuckleRadiusR_mm: Math.round(r),
      headDepthMm: Math.round(headDepthMm),
      straightFlangeMm,
      mFactor: 1.0,
      kFactor,
      equivalentSphereRadiusRoMm: Math.round(0.9 * D),
    };
  }

  // Flat Head
  const warning = D > 300
    ? "Flat head is unsuitable above 300mm under vacuum: resists by pure plate bending, leading to impractical thickness and deflections. Use Torispherical or Ellipsoidal."
    : undefined;

  // Approximate flat plate thickness per UG-34: t = d * sqrt(C * P / (S * E)) with C = 0.3
  const t_flat = D * Math.sqrt((0.3 * P_MPa) / Math.max(1, S_MPa * E));

  return {
    headType: "flat",
    thicknessMm: Number(Math.max(6.0, t_flat + corrosionAllowanceMm).toFixed(2)),
    crownRadiusL_mm: 0,
    knuckleRadiusR_mm: 0,
    headDepthMm: 25, // Flange plate thickness
    straightFlangeMm: 0,
    mFactor: 1.0,
    kFactor: 1.0,
    equivalentSphereRadiusRoMm: 0,
    warning,
  };
}

export interface WindenburgTrillingParams {
  diameterMm: number;
  coneHeightMm: number;
  halfAngleDeg: number;
  trialThicknessMm: number;
  youngsModulusGPa?: number; // default 193 GPa for 316L at room temp
  poissonRatio?: number; // default 0.3 for stainless
}

export interface WindenburgTrillingResult {
  pCriticalBar: number;
  allowableExternalBar: number;
  safetyFactor: number;
  isSafeForFullVacuum: boolean;
  disclaimer: string;
}

/**
 * Preliminary external-pressure elastic buckling check using the classical Windenburg-Trilling equation.
 * NOTE: Preliminary estimate only. Not an ASME Code calculation.
 */
export function calculateWindenburgTrilling(params: WindenburgTrillingParams): WindenburgTrillingResult {
  const { diameterMm, coneHeightMm, halfAngleDeg, trialThicknessMm, youngsModulusGPa = 193, poissonRatio = 0.3 } = params;

  // For conical shells under external pressure, ASME Section VIII Appendix 1
  // treats the cone as an equivalent cylinder of diameter D_e = D / cos(alpha)
  // and effective length L_e = slant_height / 2
  const alphaRad = (halfAngleDeg * Math.PI) / 180;
  const D_e = diameterMm / Math.cos(alphaRad);
  const slantMm = (diameterMm / 2) / Math.sin(alphaRad);
  const L_e = slantMm;

  const t = Math.max(0.5, trialThicknessMm);
  const Do = D_e;
  const E_MPa = youngsModulusGPa * 1000;
  const nu = poissonRatio;

  const t_over_Do = t / Do;
  const L_over_Do = L_e / Do;

  // Classical Windenburg-Trilling equation for elastic collapse pressure:
  // P_crit = [2.42 * E * (t/Do)^2.5] / [ (1 - nu^2)^0.75 * ( L/Do - 0.45 * (t/Do)^0.5 ) ]
  const numerator = 2.42 * E_MPa * Math.pow(t_over_Do, 2.5);
  const denominator = Math.pow(1 - nu * nu, 0.75) * Math.max(0.01, L_over_Do - 0.45 * Math.pow(t_over_Do, 0.5));

  const pCritMPa = Math.max(0.01, numerator / Math.max(0.01, denominator));
  const pCritBar = pCritMPa * 10.0;

  // Standard ASME external pressure safety factor FS = 3.0
  const safetyFactor = 3.0;
  const allowableExternalBar = pCritBar / safetyFactor;

  // Full vacuum = 1.013 bar external differential
  const isSafeForFullVacuum = allowableExternalBar >= 1.013;

  return {
    pCriticalBar: Number(pCritBar.toFixed(2)),
    allowableExternalBar: Number(allowableExternalBar.toFixed(2)),
    safetyFactor,
    isSafeForFullVacuum,
    disclaimer: "Preliminary estimate only. Verify final thickness in PV Elite before fabrication.",
  };
}

/**
 * Generates equipment and nozzle JSON payload matching cad_equipment_nozzle_schedule.json
 */
export function generateCadScheduleExport(
  presetName: string,
  coneGeom: ConeGeometryResult,
  headGeom: HeadCalculationResult,
  jacketResult: JacketCrossCheckResult
) {
  const totalHeightMm = coneGeom.heightMm + headGeom.headDepthMm + 80; // 80 mm apex discharge stub

  return {
    export_metadata: {
      generated_by: "Hosokawa AFD Sizing Suite v2.0",
      timestamp: new Date().toISOString(),
      disclaimer: "Preliminary sizing for SolidWorks CAD seed. Certified ASME Section VIII calculations must be validated in PV Elite.",
    },
    equipment_tag: "V-101",
    model_name: presetName,
    dimensions: {
      nominal_volume_liters: Math.round((coneGeom.heightCm * Math.PI * Math.pow(coneGeom.radiusCm, 2)) / 3000),
      working_batch_volume_liters: Math.round(((coneGeom.heightCm * Math.PI * Math.pow(coneGeom.radiusCm, 2)) / 3000) * coneGeom.volumeRatio),
      half_angle_degrees: Math.round(Math.atan(coneGeom.radiusCm / coneGeom.heightCm) * (180 / Math.PI)),
      included_angle_degrees: coneGeom.includedAngleDeg,
      cone_height_mm: Math.round(coneGeom.heightMm),
      top_major_diameter_id_mm: Math.round(coneGeom.diameterMm),
      top_major_diameter_od_mm: Math.round(coneGeom.outerDiameterMm),
      minor_apex_diameter_mm: coneGeom.minorDiameterMm,
      slant_length_mm: Math.round(coneGeom.slantLengthMm),
      cone_lateral_area_m2: coneGeom.lateralAreaM2,
      liquid_fill_height_50pct_mm: Math.round(coneGeom.fillHeightMm),
      liquid_fill_height_percent: coneGeom.fillHeightPercent,
      freeboard_height_mm: Math.round(coneGeom.freeboardHeightMm),
      total_vessel_height_mm: Math.round(totalHeightMm),
      inner_shell_thickness_mm: coneGeom.shellThicknessMm,
    },
    jacket: {
      annular_gap_mm: jacketResult.annularGapMm,
      jacket_inner_diameter_mm: jacketResult.jacketInnerDiameterMm,
      jacket_outer_diameter_mm: jacketResult.jacketOuterDiameterMm,
      annular_fluid_volume_liters: jacketResult.jacketFluidVolumeLiters,
      annular_fluid_mass_kg: jacketResult.jacketFluidMassKg,
      sublimation_heat_duty_watts: jacketResult.heatDutyW,
      required_heat_transfer_area_m2: jacketResult.requiredAreaM2,
      cone_area_adequate: jacketResult.isAdequate,
      suggested_cylinder_extension_mm: Math.round(jacketResult.suggestedCylinderExtensionCm * 10),
      recommended_circulation_lpm: jacketResult.recommendedFlowRateLpm,
    },
    head: {
      type: headGeom.headType,
      crown_radius_mm: headGeom.crownRadiusL_mm,
      knuckle_radius_mm: headGeom.knuckleRadiusR_mm,
      dish_depth_mm: headGeom.headDepthMm,
      straight_flange_mm: headGeom.straightFlangeMm,
      equivalent_sphere_radius_ro_mm: headGeom.equivalentSphereRadiusRoMm,
      estimated_internal_thickness_mm: headGeom.thicknessMm,
    },
    nozzles: [
      { tag: "N1", function: "Product / CIP charge inlet", size: "DN50", connection: "ASME BPE Sanitary Tri-Clamp" },
      { tag: "N2", function: "Vapor outlet to dust collector", size: "DN100", connection: "ISO-K vacuum flange / Tri-Clamp" },
      { tag: "N3", function: "Sterile nitrogen vent & break", size: "DN25", connection: "ASME BPE Sanitary Tri-Clamp" },
      { tag: "N4", function: "Sight glass with illumination", size: "DN65", connection: "Hygienic sight glass assembly" },
      { tag: "N5", function: "Agitator drive penetration", size: "Custom", connection: "Sanitary double mechanical seal with N2 barrier" },
      { tag: "N6", function: "Bottom apex product discharge", size: `DN${coneGeom.minorDiameterMm}`, connection: "Ball-segment flush valve connection" },
      { tag: "J1", function: "Jacket thermal fluid inlet (bottom)", size: "DN32", connection: "Flanged ANSI 150# / Tri-Clamp" },
      { tag: "J2", function: "Jacket thermal fluid outlet (top)", size: "DN32", connection: "Flanged ANSI 150# / Tri-Clamp" },
    ],
  };
}

/**
 * Standard pharmaceutical / ASME pressure vessel head diameters (in mm)
 * Widely fabricated dished and torispherical head punch toolings.
 */
export const STANDARD_HEAD_DIAMETERS_MM = [
  150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000
];

/**
 * Clean standard plate fabrication cone heights (in mm)
 * Convenient sheet metal roll cutting lengths.
 */
export const STANDARD_CONE_HEIGHTS_MM = [
  100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000
];

export interface OptimalFabricationDimension {
  title: string;
  majorDiaMm: number;
  coneHeightMm: number;
  nominalVolumeL: number;
  workingVolumeL: number;
  halfAngleDeg: number;
  minorDiaMm: number;
  isStandardHeadDia: boolean;
  isStandardHeight: boolean;
  description: string;
}

/**
 * Dynamically computes optimal fabrication dimensions with rounded numbers
 * for major diameter and cone height that best match target volume and 17° half-apex angle.
 */
export function getOptimalFabricationSuggestions(
  currentNominalVolumeL: number,
  halfAngleDeg: number = 17,
  minorDiaMm: number = 100
): {
  nearestStandardHead: OptimalFabricationDimension;
  nearestStandardHeight: OptimalFabricationDimension;
  bestBalancedStandard: OptimalFabricationDimension;
  standardSuggestions: OptimalFabricationDimension[];
} {
  const tanAlpha = Math.tan((halfAngleDeg * Math.PI) / 180);
  const rMinorCm = (minorDiaMm / 10) / 2;
  const volCm3 = Math.max(0.5, currentNominalVolumeL) * 1000;

  // Ideal unconstrained radius and height
  const rMajor3 = Math.pow(rMinorCm, 3) + (3 * volCm3 * tanAlpha) / Math.PI;
  const idealRCm = Math.cbrt(rMajor3);
  const idealDMm = idealRCm * 20;
  const idealHMm = ((idealRCm - rMinorCm) / tanAlpha) * 10;

  // Helper to calculate conical frustum volume in Liters
  const calcVol = (dMm: number, hMm: number) => {
    const R = dMm / 20;
    const r0 = rMinorCm;
    const H = hMm / 10;
    const vCm3 = (Math.PI * H / 3) * (R * R + R * r0 + r0 * r0);
    return Number((vCm3 / 1000).toFixed(1));
  };

  // 1. Candidate A: Snap to nearest standard dished head diameter
  const nearestHeadDMm = STANDARD_HEAD_DIAMETERS_MM.reduce((prev, curr) =>
    Math.abs(curr - idealDMm) < Math.abs(prev - idealDMm) ? curr : prev
  );
  const hForHeadMm = ((nearestHeadDMm / 20 - rMinorCm) / tanAlpha) * 10;
  // Round H to nearest 25 mm for practical workshop rolling
  const roundedHForHeadMm = Math.max(100, Math.round(hForHeadMm / 25) * 25);
  const volHeadL = calcVol(nearestHeadDMm, roundedHForHeadMm);

  const nearestStandardHead: OptimalFabricationDimension = {
    title: "Standard Head Tooling Match",
    majorDiaMm: nearestHeadDMm,
    coneHeightMm: roundedHForHeadMm,
    nominalVolumeL: volHeadL,
    workingVolumeL: Number((volHeadL * 0.5).toFixed(1)),
    halfAngleDeg,
    minorDiaMm,
    isStandardHeadDia: true,
    isStandardHeight: roundedHForHeadMm % 50 === 0,
    description: `Uses ASME/DIN standard ${nearestHeadDMm} mm dished head with ${roundedHForHeadMm} mm cone shell.`,
  };

  // 2. Candidate B: Snap to nearest standard rolled cone height
  const nearestHeightMm = STANDARD_CONE_HEIGHTS_MM.reduce((prev, curr) =>
    Math.abs(curr - idealHMm) < Math.abs(prev - idealHMm) ? curr : prev
  );
  const rForHMm = (rMinorCm + (nearestHeightMm / 10) * tanAlpha) * 10;
  // Round D to nearest 25 mm
  const roundedDForHMm = Math.max(minorDiaMm + 50, Math.round((2 * rForHMm) / 25) * 25);
  const volHeightL = calcVol(roundedDForHMm, nearestHeightMm);

  const nearestStandardHeight: OptimalFabricationDimension = {
    title: "Standard Rolled Height Match",
    majorDiaMm: roundedDForHMm,
    coneHeightMm: nearestHeightMm,
    nominalVolumeL: volHeightL,
    workingVolumeL: Number((volHeightL * 0.5).toFixed(1)),
    halfAngleDeg,
    minorDiaMm,
    isStandardHeadDia: STANDARD_HEAD_DIAMETERS_MM.includes(roundedDForHMm),
    isStandardHeight: true,
    description: `Uses ${nearestHeightMm} mm standard plate height with ${roundedDForHMm} mm top flange.`,
  };

  // 3. Candidate C: Best Balanced Standard (both D & H belong to standard increments with minimal angle distortion)
  let bestPair = { d: nearestHeadDMm, h: roundedHForHeadMm, vol: volHeadL, angle: halfAngleDeg };
  let minScore = Infinity;

  for (const d of STANDARD_HEAD_DIAMETERS_MM) {
    if (Math.abs(d - idealDMm) > idealDMm * 0.45) continue;
    for (const h of STANDARD_CONE_HEIGHTS_MM) {
      if (Math.abs(h - idealHMm) > idealHMm * 0.45) continue;
      const angleCalc = (Math.atan((d - minorDiaMm) / (2 * h)) * 180) / Math.PI;
      if (Math.abs(angleCalc - halfAngleDeg) <= 2.5) {
        const v = calcVol(d, h);
        const score = Math.abs(v - currentNominalVolumeL) / currentNominalVolumeL + Math.abs(angleCalc - halfAngleDeg) * 0.15;
        if (score < minScore) {
          minScore = score;
          bestPair = { d, h, vol: v, angle: Number(angleCalc.toFixed(1)) };
        }
      }
    }
  }

  const bestBalancedStandard: OptimalFabricationDimension = {
    title: "Optimal Workshop Standard Sizing",
    majorDiaMm: bestPair.d,
    coneHeightMm: bestPair.h,
    nominalVolumeL: bestPair.vol,
    workingVolumeL: Number((bestPair.vol * 0.5).toFixed(1)),
    halfAngleDeg: bestPair.angle,
    minorDiaMm,
    isStandardHeadDia: true,
    isStandardHeight: true,
    description: `Optimal dual-rounded sizing: D = ${bestPair.d} mm standard head, H = ${bestPair.h} mm cone (α = ${bestPair.angle}°).`,
  };

  return {
    nearestStandardHead,
    nearestStandardHeight,
    bestBalancedStandard,
    standardSuggestions: [bestBalancedStandard, nearestStandardHead, nearestStandardHeight],
  };
}
