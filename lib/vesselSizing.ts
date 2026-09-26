/**
 * Parametric Mechanical Sizing Calculator for Conical Freeze-Dryer Vessels
 * Derived from Hosokawa AFD Technical Package (Chapters 05, 11, 24, and 25)
 */

export interface HosokawaPreset {
  modelL: number;
  nominalVolumeL: number;
  maxBatchVolumeL: number;
  sublimationCapacityKg_h: number;
  scaleCategory: "R&D / Pilot" | "Production / cGMP";
}

export const HOSOKAWA_PRESETS: HosokawaPreset[] = [
  { modelL: 1, nominalVolumeL: 1, maxBatchVolumeL: 0.5, sublimationCapacityKg_h: 0.1, scaleCategory: "R&D / Pilot" },
  { modelL: 5, nominalVolumeL: 5, maxBatchVolumeL: 2.5, sublimationCapacityKg_h: 0.3, scaleCategory: "R&D / Pilot" },
  { modelL: 20, nominalVolumeL: 20, maxBatchVolumeL: 10, sublimationCapacityKg_h: 0.8, scaleCategory: "R&D / Pilot" },
  { modelL: 60, nominalVolumeL: 60, maxBatchVolumeL: 30, sublimationCapacityKg_h: 1.7, scaleCategory: "Production / cGMP" },
  { modelL: 100, nominalVolumeL: 100, maxBatchVolumeL: 50, sublimationCapacityKg_h: 2.2, scaleCategory: "Production / cGMP" },
  { modelL: 200, nominalVolumeL: 200, maxBatchVolumeL: 100, sublimationCapacityKg_h: 3.4, scaleCategory: "Production / cGMP" },
  { modelL: 500, nominalVolumeL: 500, maxBatchVolumeL: 250, sublimationCapacityKg_h: 7.2, scaleCategory: "Production / cGMP" },
  { modelL: 800, nominalVolumeL: 800, maxBatchVolumeL: 400, sublimationCapacityKg_h: 9.9, scaleCategory: "Production / cGMP" },
  { modelL: 1000, nominalVolumeL: 1000, maxBatchVolumeL: 500, sublimationCapacityKg_h: 11.4, scaleCategory: "Production / cGMP" },
  { modelL: 1500, nominalVolumeL: 1500, maxBatchVolumeL: 750, sublimationCapacityKg_h: 13.7, scaleCategory: "Production / cGMP" },
];

export interface ConeGeometryParams {
  nominalVolumeL: number;
  workingVolumeL: number;
  halfAngleDeg: number; // 20° to 35°
}

export interface ConeGeometryResult {
  heightCm: number;
  diameterCm: number;
  radiusCm: number;
  slantLengthCm: number;
  lateralAreaM2: number;
  fillHeightCm: number;
  fillHeightPercent: number;
  freeboardHeightCm: number;
  freeboardPercent: number;
  volumeRatio: number; // workingVolumeL / nominalVolumeL
}

/**
 * Calculates conical vessel geometry based on nominal volume and half-angle.
 * V_cone = (π / 3) * tan²(α) * h³
 * h = [3 * V / (π * tan²(α))]^(1/3)
 * D = 2 * h * tan(α)
 */
export function calculateConeGeometry(params: ConeGeometryParams): ConeGeometryResult {
  const { nominalVolumeL, workingVolumeL, halfAngleDeg } = params;
  const alphaRad = (halfAngleDeg * Math.PI) / 180;
  const volumeCm3 = nominalVolumeL * 1000;

  const tanAlpha = Math.tan(alphaRad);
  const tan2Alpha = tanAlpha * tanAlpha;

  // Total cone height in cm
  const heightCm = Math.cbrt((3 * volumeCm3) / (Math.PI * tan2Alpha));
  const radiusCm = heightCm * tanAlpha;
  const diameterCm = 2 * radiusCm;

  // Slant length in cm
  const slantLengthCm = radiusCm / Math.sin(alphaRad);

  // Lateral surface area A = π * R * s (in m²)
  const lateralAreaM2 = (Math.PI * radiusCm * slantLengthCm) / 10000;

  // Liquid fill height at working volume:
  // In a cone, volume fraction f = V_work / V_nom
  // fill_height / h = f^(1/3)
  const volumeRatio = workingVolumeL / Math.max(0.001, nominalVolumeL);
  const fillFraction = Math.cbrt(Math.min(1.0, Math.max(0.01, volumeRatio)));
  const fillHeightCm = heightCm * fillFraction;
  const fillHeightPercent = fillFraction * 100;

  const freeboardHeightCm = heightCm - fillHeightCm;
  const freeboardPercent = 100 - fillHeightPercent;

  return {
    heightCm: Number(heightCm.toFixed(2)),
    diameterCm: Number(diameterCm.toFixed(2)),
    radiusCm: Number(radiusCm.toFixed(2)),
    slantLengthCm: Number(slantLengthCm.toFixed(2)),
    lateralAreaM2: Number(lateralAreaM2.toFixed(3)),
    fillHeightCm: Number(fillHeightCm.toFixed(2)),
    fillHeightPercent: Number(fillHeightPercent.toFixed(1)),
    freeboardHeightCm: Number(freeboardHeightCm.toFixed(2)),
    freeboardPercent: Number(freeboardPercent.toFixed(1)),
    volumeRatio: Number(volumeRatio.toFixed(3)),
  };
}

export interface JacketCrossCheckParams {
  sublimationRateKg_h: number;
  heatTransferCoeffU: number; // W/(m²·K), typical 50-200
  deltaT_C: number; // °C, typical 10-30
  coneLateralAreaM2: number;
  topDiameterCm: number;
}

export interface JacketCrossCheckResult {
  heatDutyW: number;
  requiredAreaM2: number;
  coneAreaM2: number;
  areaSurplusDeficitM2: number;
  isAdequate: boolean;
  suggestedCylinderExtensionCm: number;
}

/**
 * Checks if the cone's own lateral heat transfer area satisfies the sublimation duty.
 * Q = ṁ_sub * ΔH_sub / 3.6 (W)
 * A_req = Q / (U * ΔT)
 */
export function calculateJacketCrossCheck(params: JacketCrossCheckParams): JacketCrossCheckResult {
  const { sublimationRateKg_h, heatTransferCoeffU, deltaT_C, coneLateralAreaM2, topDiameterCm } = params;

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
    // Added cylindrical area A_cyl = π * D * h_cyl
    const hCylM = deficitM2 / (Math.PI * Math.max(0.05, topDiameterM));
    suggestedCylinderExtensionCm = hCylM * 100;
  }

  return {
    heatDutyW: Math.round(heatDutyW),
    requiredAreaM2: Number(requiredAreaM2.toFixed(3)),
    coneAreaM2: Number(coneLateralAreaM2.toFixed(3)),
    areaSurplusDeficitM2: Number(areaSurplusDeficitM2.toFixed(3)),
    isAdequate,
    suggestedCylinderExtensionCm: Number(suggestedCylinderExtensionCm.toFixed(1)),
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
  mFactor: number;
  kFactor: number;
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

  if (headType === "torispherical") {
    // ASME Section VIII Div 1 UG-32(e)
    const L = D; // Crown radius equals diameter
    const r = Math.max(0.06 * D, 3 * 1.5); // Knuckle >= 6% of diameter
    const mFactor = (3 + Math.sqrt(L / r)) / 4; // M factor ≈ 1.77
    const t_calc = (P_MPa * L * mFactor) / Math.max(1, denominator);
    const thicknessMm = Math.max(1.5, t_calc + corrosionAllowanceMm);
    // Depth ≈ D - sqrt((D-r)^2 - (D/2-r)^2) ≈ 0.169 D
    const headDepthMm = 0.169 * D;

    return {
      headType,
      thicknessMm: Number(thicknessMm.toFixed(2)),
      crownRadiusL_mm: Math.round(L),
      knuckleRadiusR_mm: Math.round(r),
      headDepthMm: Math.round(headDepthMm),
      mFactor: Number(mFactor.toFixed(3)),
      kFactor: 1.0,
    };
  }

  if (headType === "ellipsoidal") {
    // ASME Section VIII Div 1 UG-32(d) 2:1 ellipsoidal
    const L = 0.9 * D;
    const r = 0.17 * D;
    const headDepthMm = D / 4;
    const kFactor = 1.0;
    const t_calc = (P_MPa * D * kFactor) / Math.max(1, denominator);
    const thicknessMm = Math.max(1.5, t_calc + corrosionAllowanceMm);

    return {
      headType,
      thicknessMm: Number(thicknessMm.toFixed(2)),
      crownRadiusL_mm: Math.round(L),
      knuckleRadiusR_mm: Math.round(r),
      headDepthMm: Math.round(headDepthMm),
      mFactor: 1.0,
      kFactor,
    };
  }

  // Flat Head
  const warning = D > 300
    ? "Flat head is generally unsuitable above 300mm under vacuum: resists by pure plate bending, leading to impractical thickness and deflections. Use Torispherical or Ellipsoidal."
    : undefined;

  // Approximate flat plate thickness per UG-34: t = d * sqrt(C * P / (S * E)) with C = 0.3
  const t_flat = D * Math.sqrt((0.3 * P_MPa) / Math.max(1, S_MPa * E));

  return {
    headType: "flat",
    thicknessMm: Number((t_flat + corrosionAllowanceMm).toFixed(2)),
    crownRadiusL_mm: 0,
    knuckleRadiusR_mm: 0,
    headDepthMm: 0,
    mFactor: 1.0,
    kFactor: 1.0,
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
    disclaimer: "Preliminary estimate only. Verify final thickness in PV Elite (or equivalent licensed ASME Section VIII software) before fabrication.",
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
  return {
    export_metadata: {
      generated_by: "Hosokawa AFD Sizing Suite",
      timestamp: new Date().toISOString(),
      disclaimer: "Preliminary sizing for SolidWorks CAD seed. Certified ASME Section VIII calculations must be validated in PV Elite.",
    },
    equipment_tag: "V-101",
    model_name: presetName,
    geometry: {
      nominal_volume_liters: Math.round(coneGeom.heightCm * Math.PI * Math.pow(coneGeom.radiusCm, 2) / 3000),
      working_batch_volume_liters: Math.round((coneGeom.heightCm * Math.PI * Math.pow(coneGeom.radiusCm, 2) / 3000) * coneGeom.volumeRatio),
      half_angle_degrees: Math.round(Math.atan(coneGeom.radiusCm / coneGeom.heightCm) * (180 / Math.PI)),
      cone_height_mm: Math.round(coneGeom.heightCm * 10),
      top_diameter_mm: Math.round(coneGeom.diameterCm * 10),
      slant_length_mm: Math.round(coneGeom.slantLengthCm * 10),
      cone_lateral_area_m2: coneGeom.lateralAreaM2,
      liquid_fill_height_50pct_mm: Math.round(coneGeom.fillHeightCm * 10),
      liquid_fill_height_percent: coneGeom.fillHeightPercent,
      freeboard_height_mm: Math.round(coneGeom.freeboardHeightCm * 10),
    },
    head: {
      type: headGeom.headType,
      crown_radius_mm: headGeom.crownRadiusL_mm,
      knuckle_radius_mm: headGeom.knuckleRadiusR_mm,
      head_depth_mm: headGeom.headDepthMm,
      estimated_internal_thickness_mm: headGeom.thicknessMm,
    },
    thermal_cross_check: {
      sublimation_heat_duty_watts: jacketResult.heatDutyW,
      required_jacket_area_m2: jacketResult.requiredAreaM2,
      cone_area_adequate: jacketResult.isAdequate,
      suggested_cylinder_extension_mm: Math.round(jacketResult.suggestedCylinderExtensionCm * 10),
    },
    nozzles: [
      { tag: "N1", function: "Product / CIP charge inlet", size: "DN50", connection: "ASME BPE Sanitary Tri-Clamp" },
      { tag: "N2", function: "Vapor outlet to dust collector", size: "DN100", connection: "ISO-K vacuum flange / Tri-Clamp" },
      { tag: "N3", function: "Sterile nitrogen vent & break", size: "DN25", connection: "ASME BPE Sanitary Tri-Clamp" },
      { tag: "N4", function: "Sight glass with illumination", size: "DN65", connection: "Hygienic sight glass assembly" },
      { tag: "N5", function: "Agitator drive penetration", size: "Custom", connection: "Sanitary double mechanical seal with N2 barrier" },
      { tag: "N6", function: "Bottom apex product discharge", size: "DN150", connection: "Ball-segment flush valve connection" },
    ],
  };
}
