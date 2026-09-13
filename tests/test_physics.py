import math

def test_clausius_clapeyron():
    # Exact integrated Clausius-Clapeyron equation anchored at Triple Point (0.01 C, 6.1112 mbar)
    def get_ice_sublimation_pressure_mbar(temp_c):
        T = temp_c + 273.15
        deltaH_over_R = 6149.1
        T_tp = 273.16
        p_mbar = 6.1112 * math.exp(-deltaH_over_R * (1 / T - 1 / T_tp))
        return p_mbar

    p_minus_40 = get_ice_sublimation_pressure_mbar(-40)
    p_minus_20 = get_ice_sublimation_pressure_mbar(-20)
    p_tp = get_ice_sublimation_pressure_mbar(0.01)

    print(f"P_sub(-40 C) = {p_minus_40:.5f} mbar")
    print(f"P_sub(-20 C) = {p_minus_20:.5f} mbar")
    print(f"P_sub(0.01 C) = {p_tp:.5f} mbar (Triple Point ~ 6.11 mbar)")

    assert 0.12 < p_minus_40 < 0.14, f"P(-40 C) was {p_minus_40}"
    assert 1.0 < p_minus_20 < 1.1, f"P(-20 C) was {p_minus_20}"
    assert 6.09 < p_tp < 6.13, f"Triple point was {p_tp}"

def test_sublimation_rate():
    U = 35 # W/m^2*K
    A = 1.2 # m^2
    delta_T = 25 # K
    mass = 15 # kg

    heat_duty_watts = U * A * delta_T
    latent_heat_j_kg = 2838000
    sub_rate_kg_s = heat_duty_watts / latent_heat_j_kg
    sub_rate_kg_h = sub_rate_kg_s * 3600
    drying_time_h = mass / sub_rate_kg_h

    print(f"Heat duty = {heat_duty_watts:.1f} W")
    print(f"Sublimation rate = {sub_rate_kg_h:.3f} kg/h")
    print(f"Drying time = {drying_time_h:.1f} hours")

    assert heat_duty_watts == 1050
    assert 1.0 < sub_rate_kg_h < 2.0
    assert 5 < drying_time_h < 15

def test_pumpdown():
    V = 100 # L
    S_m3_h = 40 # m^3/h
    S_L_s = (S_m3_h * 1000) / 3600
    tau = V / S_L_s
    P0 = 1013.25
    P_target = 0.05
    time_target_s = tau * math.log(P0 / P_target)

    print(f"Pump tau = {tau:.2f} s")
    print(f"Time to 0.05 mbar = {time_target_s:.1f} s ({time_target_s/60:.2f} min)")

    assert tau > 0
    assert time_target_s > 0
    assert time_target_s / 60 < 10

if __name__ == "__main__":
    test_clausius_clapeyron()
    test_sublimation_rate()
    test_pumpdown()
    print("ALL PHYSICS UNIT TESTS PASSED GREEN!")
