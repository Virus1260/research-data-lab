/**
 * Exact thermodynamic and engineering physics functions derived from
 * the Hosokawa AFD research dossier (Chapters 02, 06, and 11).
 */

export const WATER_CONSTANTS = {
  TRIPLE_POINT_TEMP_C: 0.01,
  TRIPLE_POINT_PRESS_MBAR: 6.1112,
  LATENT_HEAT_FUSION_KJ_KG: 334.0, // kJ/kg
  LATENT_HEAT_VAPORIZATION_KJ_KG: 2501.0, // kJ/kg at 0°C
  LATENT_HEAT_SUBLIMATION_KJ_KG: 2838.0, // kJ/kg at 0°C
  SPECIFIC_HEAT_WATER_KJ_KG_K: 4.184, // kJ/(kg*K)
  SPECIFIC_HEAT_ICE_KJ_KG_K: 2.09, // kJ/(kg*K)
  ATMOSPHERIC_PRESSURE_MBAR: 1013.25,
};

/**
 * Saturation vapor pressure of ice (Sublimation Curve) in mbar
 * Using Goff-Gratch equation approximation for ice: -100°C to 0.01°C
 */
export function getIceSublimationPressureMbar(tempC: number): number {
  if (tempC > 0.01) tempC = 0.01;
  const T = tempC + 273.15; // Kelvin
  if (T <= 0) return 1e-12;
  // Exact integrated Clausius-Clapeyron equation anchored at Triple Point (0.01°C, 6.1112 mbar)
  // DeltaH_sub / R ≈ 51,126 J/mol / 8.31446 J/(mol*K) ≈ 6149.1 K
  const deltaH_over_R = 6149.1;
  const T_tp = 273.16;
  const pMbar = WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR * Math.exp(-deltaH_over_R * (1 / T - 1 / T_tp));
  return pMbar;
}

/**
 * Saturation vapor pressure of liquid water (Vaporization Curve) in mbar
 * Using Tetens / Buck formula above 0.01°C
 */
export function getWaterVaporPressureMbar(tempC: number): number {
  if (tempC < 0.01) return getIceSublimationPressureMbar(tempC);
  // Buck equation
  const pKpa = 0.61121 * Math.exp((18.678 - tempC / 234.5) * (tempC / (257.14 + tempC)));
  return pKpa * 10.0; // kPa to mbar
}

/**
 * Determines water phase state at given temperature (°C) and pressure (mbar)
 */
export type PhaseState = "SOLID" | "LIQUID" | "VAPOR" | "SUBLIMING" | "MELTING" | "BOILING";

export function getWaterPhaseState(tempC: number, pressMbar: number): {
  state: PhaseState;
  color: string;
  description: string;
  isFreezeDryingWindow: boolean;
} {
  const tpT = WATER_CONSTANTS.TRIPLE_POINT_TEMP_C;
  const tpP = WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR;

  // Freeze drying operating window:
  // T between -55°C and -10°C, P between 0.01 mbar and 1.0 mbar
  const isFreezeDryingWindow =
    tempC >= -55 && tempC <= -10 && pressMbar >= 0.01 && pressMbar <= 1.0;

  if (pressMbar < tpP) {
    // Below triple point pressure: Only SOLID or VAPOR exist in equilibrium
    const pSub = getIceSublimationPressureMbar(tempC);
    const relDiff = Math.abs(pressMbar - pSub) / (pSub || 1);

    if (relDiff < 0.15 && tempC < tpT) {
      return {
        state: "SUBLIMING",
        color: "#E5A93C", // Amber gold
        description: "Direct ice-to-vapor phase transition (Sublimation equilibrium line)",
        isFreezeDryingWindow,
      };
    } else if (pressMbar > pSub) {
      return {
        state: "SOLID",
        color: "#7FD4FF", // Cryo blue
        description: "Frozen solid ice under vacuum",
        isFreezeDryingWindow,
      };
    } else {
      return {
        state: "VAPOR",
        color: "#A78BFA", // Violet vapor
        description: "Sublimed low-density water vapor under vacuum",
        isFreezeDryingWindow,
      };
    }
  } else {
    // Above triple point pressure: Liquid phase exists
    if (tempC < tpT) {
      return {
        state: "SOLID",
        color: "#7FD4FF",
        description: "Solid ice under elevated pressure",
        isFreezeDryingWindow: false,
      };
    }
    const pVap = getWaterVaporPressureMbar(tempC);
    const relDiff = Math.abs(pressMbar - pVap) / (pVap || 1);

    if (relDiff < 0.15) {
      return {
        state: "BOILING",
        color: "#F87171",
        description: "Liquid-vapor boiling equilibrium",
        isFreezeDryingWindow: false,
      };
    } else if (pressMbar > pVap) {
      return {
        state: "LIQUID",
        color: "#38BDF8",
        description: "Liquid water",
        isFreezeDryingWindow: false,
      };
    } else {
      return {
        state: "VAPOR",
        color: "#A78BFA",
        description: "Superheated water vapor / steam",
        isFreezeDryingWindow: false,
      };
    }
  }
}

/**
 * Sublimation rate & heat transfer calculations (Chapter 11)
 * Q = U * A * deltaT
 * m_dot = Q / deltaH_sub
 */
export function calculateSublimationRate({
  heatTransferCoeffU, // W/(m^2*K) typically 15 - 50 W/(m^2*K) in stirred vacuum
  jacketAreaM2, // m^2 jacket contact area
  deltaT_C, // (T_jacket - T_product) in °C, typically 10 - 40 °C
  batchWaterMassKg, // Initial ice mass in kg
}: {
  heatTransferCoeffU: number;
  jacketAreaM2: number;
  deltaT_C: number;
  batchWaterMassKg: number;
}) {
  const heatDutyWatts = heatTransferCoeffU * jacketAreaM2 * deltaT_C; // Watts (J/s)
  const heatDutyKW = heatDutyWatts / 1000;

  // Latent heat of sublimation in J/kg: 2,838,000 J/kg
  const latentHeatJ_kg = WATER_CONSTANTS.LATENT_HEAT_SUBLIMATION_KJ_KG * 1000;
  const sublimationRateKg_s = heatDutyWatts / latentHeatJ_kg;
  const sublimationRateKg_h = sublimationRateKg_s * 3600;

  const dryingTimeHours = batchWaterMassKg > 0 && sublimationRateKg_h > 0
    ? batchWaterMassKg / sublimationRateKg_h
    : 0;

  return {
    heatDutyWatts: Math.round(heatDutyWatts),
    heatDutyKW: Number(heatDutyKW.toFixed(3)),
    sublimationRateKg_h: Number(sublimationRateKg_h.toFixed(3)),
    sublimationRateG_min: Number(((sublimationRateKg_h * 1000) / 60).toFixed(1)),
    dryingTimeHours: Number(dryingTimeHours.toFixed(1)),
  };
}

/**
 * Vacuum pump-down calculation (Chapter 06 & 11)
 * P(t) = (P_0 - P_ult) * exp(-S_eff * t / V) + P_ult
 */
export function calculatePumpdown({
  chamberVolumeLiters, // Liters (e.g. 50 L - 500 L)
  pumpSpeedM3H, // Effective pump speed m^3/h (e.g. 20 - 200 m^3/h)
  leakRateMbarL_s = 0.001, // mbar*L/s
  ultimatePressureMbar = 0.005, // mbar
  targetPressureMbar = 0.05, // mbar
}: {
  chamberVolumeLiters: number;
  pumpSpeedM3H: number;
  leakRateMbarL_s?: number;
  ultimatePressureMbar?: number;
  targetPressureMbar?: number;
}) {
  // Convert pump speed from m^3/h to L/s (1 m^3 = 1000 L, 1 h = 3600 s)
  const pumpSpeedL_s = (pumpSpeedM3H * 1000) / 3600;
  const effectiveUltimateMbar = ultimatePressureMbar + leakRateMbarL_s / Math.max(0.1, pumpSpeedL_s);

  const P0 = WATER_CONSTANTS.ATMOSPHERIC_PRESSURE_MBAR;

  // Time constant tau = V / S in seconds
  const tauSec = chamberVolumeLiters / Math.max(0.1, pumpSpeedL_s);

  // Time to reach target pressure: t = tau * ln((P0 - P_ult)/(P_target - P_ult))
  let timeToTargetSec = 0;
  if (targetPressureMbar > effectiveUltimateMbar) {
    timeToTargetSec = tauSec * Math.log((P0 - effectiveUltimateMbar) / (targetPressureMbar - effectiveUltimateMbar));
  }

  // Generate curve points (time vs pressure)
  const curvePoints: { timeMin: number; pressureMbar: number }[] = [];
  const maxTimeSec = Math.max(timeToTargetSec * 1.5, 300);
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * maxTimeSec;
    const P = (P0 - effectiveUltimateMbar) * Math.exp(-t / tauSec) + effectiveUltimateMbar;
    curvePoints.push({
      timeMin: Number((t / 60).toFixed(2)),
      pressureMbar: Number(P.toFixed(P < 1 ? 4 : 1)),
    });
  }

  return {
    timeToTargetSec: Math.round(timeToTargetSec),
    timeToTargetMin: Number((timeToTargetSec / 60).toFixed(1)),
    effectiveUltimateMbar: Number(effectiveUltimateMbar.toFixed(4)),
    tauSeconds: Number(tauSec.toFixed(1)),
    curvePoints,
  };
}

/**
 * Freezing stage refrigeration load calculation (Chapter 11)
 * Validates against Hosokawa's disclosed 0.1 - 10 °C/min freezing rate
 */
export function calculateRefrigerationLoad({
  batchMassKg, // e.g. 50 kg
  waterFraction, // 0.0 - 1.0 (e.g. 0.8)
  initialTempC = 20, // °C
  targetTempC = -45, // °C
  freezingTimeMin, // Target time in minutes
}: {
  batchMassKg: number;
  waterFraction: number;
  initialTempC?: number;
  targetTempC?: number;
  freezingTimeMin: number;
}) {
  const waterMassKg = batchMassKg * waterFraction;
  const solidMassKg = batchMassKg * (1 - waterFraction);

  // 1. Sensible heat cooling liquid water from initialTemp to 0°C
  const qSensibleLiquidKJ = waterMassKg * WATER_CONSTANTS.SPECIFIC_HEAT_WATER_KJ_KG_K * (initialTempC - 0);

  // 2. Latent heat of freezing at 0°C
  const qLatentFusionKJ = waterMassKg * WATER_CONSTANTS.LATENT_HEAT_FUSION_KJ_KG;

  // 3. Sensible heat cooling ice from 0°C to targetTemp
  const qSensibleIceKJ = waterMassKg * WATER_CONSTANTS.SPECIFIC_HEAT_ICE_KJ_KG_K * (0 - targetTempC);

  // 4. Sensible heat cooling solids (assume average cp = 1.5 kJ/kg*K)
  const qSensibleSolidsKJ = solidMassKg * 1.5 * (initialTempC - targetTempC);

  const totalHeatRemovedKJ = qSensibleLiquidKJ + qLatentFusionKJ + qSensibleIceKJ + qSensibleSolidsKJ;

  const freezeTimeSec = Math.max(1, freezingTimeMin * 60);
  const avgRefrigerationKW = totalHeatRemovedKJ / freezeTimeSec;

  // Freezing rate in °C/min
  const totalTempDelta = initialTempC - targetTempC;
  const coolingRateC_min = totalTempDelta / Math.max(0.1, freezingTimeMin);

  // Hosokawa patent validity window: 0.1 to 10 °C/min
  const isWithinPatentRange = coolingRateC_min >= 0.1 && coolingRateC_min <= 10.0;

  return {
    totalHeatRemovedKJ: Math.round(totalHeatRemovedKJ),
    avgRefrigerationKW: Number(avgRefrigerationKW.toFixed(2)),
    coolingRateC_min: Number(coolingRateC_min.toFixed(2)),
    isWithinPatentRange,
    qSensibleLiquidKJ: Math.round(qSensibleLiquidKJ),
    qLatentFusionKJ: Math.round(qLatentFusionKJ),
    qSensibleIceKJ: Math.round(qSensibleIceKJ),
  };
}

/**
 * Comparative Pressure Gauges (Pirani vs Capacitance Manometer) (Chapter 06)
 * Models primary drying sublimation endpoint detection
 */
export function calculatePiraniVsCapacitanceConvergence(normalizedProgress: number) {
  // progress: 0 (start of primary drying) to 1.0 (secondary drying)
  const trueChamberPressureMbar = 0.08; // Mechanical capacitance manometer reading (true pressure)

  // During primary drying, gas is ~99% water vapor.
  // Pirani reads thermal conductivity calibrated for air/N2. Water vapor conductivity causes Pirani to read ~1.6x true pressure.
  // As primary drying ends (sublimation completes at progress ~ 0.85), vapor composition shifts to inert/nitrogen.
  // Pirani reading plunges and converges with the true capacitance manometer!

  let vaporFraction = 1.0;
  if (normalizedProgress > 0.8) {
    // Sharp drop off between 0.80 and 0.90
    const dropProgress = Math.min(1.0, (normalizedProgress - 0.8) / 0.1);
    vaporFraction = 1.0 - Math.pow(dropProgress, 2);
  }

  const piraniFactor = 1.0 + 0.6 * vaporFraction;
  const piraniReadingMbar = trueChamberPressureMbar * piraniFactor;
  const diffPercent = ((piraniReadingMbar - trueChamberPressureMbar) / trueChamberPressureMbar) * 100;
  const isEndpointDetected = diffPercent < 5.0 && normalizedProgress >= 0.85;

  return {
    capacitanceMbar: Number(trueChamberPressureMbar.toFixed(4)),
    piraniMbar: Number(piraniReadingMbar.toFixed(4)),
    vaporFraction: Number(vaporFraction.toFixed(2)),
    diffPercent: Number(diffPercent.toFixed(1)),
    isEndpointDetected,
  };
}
