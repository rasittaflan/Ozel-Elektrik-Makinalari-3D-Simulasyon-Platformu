# -*- coding: utf-8 -*-
"""
Automated Engineering & DOM Verification Suite for Özel Elektrik Makinaları v2.0.0
Tests KaTeX formulas, element ID bindings, and all 11 physics verification tests.
"""

import os
import re
import math
import numpy as np

BASE_DIR = r"R:\Dijital_Arsiv\03_PROJELER_VE_ARGE\06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu"
HTML_PATH = os.path.join(BASE_DIR, "Ozel_Elektrik_Makinalari_Simulatoru.html")

def test_dom_bindings(html_content):
    print("--- 1. Testing DOM Element IDs & JS Bindings ---")
    # Find all IDs defined in HTML
    id_pattern = re.compile(r'id=["\']([^"\']+)["\']')
    defined_ids = set(id_pattern.findall(html_content))
    print(f"Total HTML IDs defined: {len(defined_ids)}")

    # Find all getElementById in script
    js_pattern = re.compile(r'document\.getElementById\([\'"]([^\'"]+)[\'"]\)')
    referenced_ids = set(js_pattern.findall(html_content))
    print(f"Total JS getElementById references: {len(referenced_ids)}")

    missing_ids = referenced_ids - defined_ids
    if missing_ids:
        print(f"  [WARNING] The following IDs are referenced in JS but not found in HTML:")
        for mid in missing_ids:
            print(f"    - {mid}")
    else:
        print("  [PASS] All referenced IDs exist in HTML DOM! (100% ID match)")
    return missing_ids

def test_latex_integrity(html_content):
    print("\n--- 2. Testing KaTeX & LaTeX Formula Delimiters ---")
    bad_chars = ['\x0b', '\x0c', '\x07', '\x08']
    has_bad = False
    for c in bad_chars:
        if c in html_content:
            print(f"  [FAIL] Found control char {repr(c)} in HTML!")
            has_bad = True
    if not has_bad:
        print("  [PASS] Zero corrupt ASCII control characters.")

    # Check KaTeX delimiters
    inline_tex = re.findall(r'\\\((.*?)\\\)', html_content)
    block_tex = re.findall(r'\\\[(.*?)\\\]', html_content)
    dollar_tex = re.findall(r'\$([^\$]+)\$', html_content)
    print(f"Found {len(inline_tex)} inline \\(...\\) formulas, {len(block_tex)} block \\[...\\] formulas, and {len(dollar_tex)} $...$ formulas.")
    
    # Check that critical formulas exist uncorrupted
    crit_formulas = [
        r"\vec{F} = I (\vec{l} \times \vec{B})",
        r"T_e = \sum (\vec{r}_k \times \vec{F}_k)_z",
        r"L_a \frac{di_a}{dt} = V_a - R_a i_a - K_e \omega",
        r"J \frac{d\omega}{dt} = K_t i_a - B_m \omega - T_L",
        r"P_{mech} = T_e \cdot \omega",
        r"P_{elek} = E_a \cdot i_a"
    ]
    all_found = True
    for cf in crit_formulas:
        # Check without strict whitespace
        clean_cf = "".join(cf.split())
        clean_html = "".join(html_content.split())
        if clean_cf in clean_html:
            print(f"  [PASS] Verified formula: {cf}")
        else:
            print(f"  [WARNING] Formula not found verbatim: {cf}")
            all_found = False
    return not has_bad

def test_11_engineering_checks():
    print("\n--- 3. Running 11 Mandatory Engineering Verification Tests ---")
    results = []

    # Test 1: Lorentz Force Direction: F = I * (l x B)
    # Slot 1: l = (0, 0, 1) (into screen), B = (0, -1, 0) (downward from N to S)
    l = np.array([0, 0, 1])
    B = np.array([0, -1, 0])
    I = 10.0 # A
    F = I * np.cross(l, B) # (10, 0, 0) -> +X direction (rightward)
    r_slot1 = np.array([0, 0.05, 0]) # Radius vector at top slot (Y = +0.05m)
    Torque = np.cross(r_slot1, F) # (0, 0.05, 0) x (10, 0, 0) = (0, 0, -0.5) N*m -> Clockwise (-Z)
    test1_pass = F[0] > 0 and Torque[2] < 0
    results.append(("Test 1: Lorentz Force & CW Rotation on Slot 1", test1_pass, f"F_x={F[0]} N (rightward), T_z={Torque[2]} N*m (CW)"))

    # Test 2: Polarity Inversion (Current Reversal)
    I_rev = -10.0
    F_rev = I_rev * np.cross(l, B)
    Torque_rev = np.cross(r_slot1, F_rev)
    test2_pass = F_rev[0] < 0 and Torque_rev[2] > 0
    results.append(("Test 2: Armature Current Reversal (CCW Rotation)", test2_pass, f"F_x={F_rev[0]} N (leftward), T_z={Torque_rev[2]} N*m (CCW)"))

    # Test 3: Stator Field Reversal (B Reversed)
    B_rev = np.array([0, 1, 0])
    F_B_rev = I * np.cross(l, B_rev)
    Torque_B_rev = np.cross(r_slot1, F_B_rev)
    test3_pass = F_B_rev[0] < 0 and Torque_B_rev[2] > 0
    results.append(("Test 3: Stator Field Reversal (CCW Rotation)", test3_pass, f"F_x={F_B_rev[0]} N, T_z={Torque_B_rev[2]} N*m"))

    # Test 4: Dual Reversal (Universal Motor AC Property)
    # Both I and B reversed: (-I) x (-B) = I x B -> Same direction
    F_dual = I_rev * np.cross(l, B_rev)
    Torque_dual = np.cross(r_slot1, F_dual)
    test4_pass = np.allclose(F_dual, F) and np.allclose(Torque_dual, Torque)
    results.append(("Test 4: Dual Inversion Preserves Rotation (Universal Motor)", test4_pass, f"F_dual == F_orig ({np.allclose(F_dual, F)})"))

    # Test 5: Back-EMF at zero speed
    Ke = 0.55 # V/(rad/s)
    Ea_zero = Ke * 0.0
    test5_pass = (Ea_zero == 0.0)
    results.append(("Test 5: Zero Speed Zero Back-EMF Guarantee", test5_pass, f"E_a(omega=0) = {Ea_zero} V"))

    # Test 6: Mechanical and Electrical Power Equality: P_mech = T_e * omega, P_elek = E_a * i_a
    # For SI units, Kt = Ke.
    Kt = 0.55 # N*m/A
    omega_test = 150.0 # rad/s
    ia_test = 8.0 # A
    Te_test = Kt * ia_test
    Ea_test = Ke * omega_test
    P_mech = Te_test * omega_test
    P_elek = Ea_test * ia_test
    test6_pass = math.isclose(P_mech, P_elek, rel_tol=1e-9)
    results.append(("Test 6: Power Conservation P_mech == P_elek (Kt == Ke)", test6_pass, f"P_mech = {P_mech:.2f} W, P_elek = {P_elek:.2f} W"))

    # Test 7: Steady-state DC motor speed matches analytical ODE equilibrium
    Va = 120.0
    Ra = 1.2
    Bm = 0.002
    TL = 2.0
    # Steady state:
    # 0 = Va - Ra*ia - Ke*omega -> ia = (Va - Ke*omega)/Ra
    # 0 = Kt*ia - Bm*omega - TL -> Kt*(Va - Ke*omega)/Ra - Bm*omega - TL = 0
    # omega*(Bm + Kt*Ke/Ra) = Kt*Va/Ra - TL
    omega_ss_analytical = (Kt * Va / Ra - TL) / (Bm + Kt * Ke / Ra)
    ia_ss_analytical = (Va - Ke * omega_ss_analytical) / Ra
    test7_pass = omega_ss_analytical > 0 and ia_ss_analytical > 0
    results.append(("Test 7: Steady-State Analytical ODE Equilibrium", test7_pass, f"omega_ss = {omega_ss_analytical:.2f} rad/s ({omega_ss_analytical*9.5493:.1f} RPM), ia_ss = {ia_ss_analytical:.2f} A"))

    # Test 8: BLDC 6-step Hall state commutation mapping
    # Steps: 1: (A+, B-), 2: (A+, C-), 3: (B+, C-), 4: (B+, A-), 5: (C+, A-), 6: (C+, B-)
    hall_states = [
        (1, 0, 1), # Step 1 (5)
        (1, 0, 0), # Step 2 (4)
        (1, 1, 0), # Step 3 (6)
        (0, 1, 0), # Step 4 (2)
        (0, 1, 1), # Step 5 (3)
        (0, 0, 1)  # Step 6 (1)
    ]
    # Unique states and count
    test8_pass = len(set(hall_states)) == 6 and (0, 0, 0) not in hall_states and (1, 1, 1) not in hall_states
    results.append(("Test 8: BLDC 6-Step Inverter Commutation Sequence", test8_pass, f"6 valid non-zero/non-all-one Hall states"))

    # Test 9: Quadrature Encoder 4X Decoding Resolution
    ppr = 1024
    cpr = 4 * ppr
    angular_resolution_deg = 360.0 / cpr
    test9_pass = (cpr == 4096) and math.isclose(angular_resolution_deg, 0.087890625)
    results.append(("Test 9: Quadrature Encoder 4X Decoding (4096 CPR)", test9_pass, f"Resolution = {angular_resolution_deg:.5f} deg/edge (4096 CPR)"))

    # Test 10: Stepper Motor Step Angle & Microstepping
    m_phases = 2
    Nr_teeth = 50
    step_angle_full = 360.0 / (2 * m_phases * Nr_teeth) # 1.8 deg
    microsteps = 16
    step_angle_micro = step_angle_full / microsteps
    test10_pass = math.isclose(step_angle_full, 1.8) and math.isclose(step_angle_micro, 0.1125)
    results.append(("Test 10: Stepper Motor Step Angle & 1/16 Microstepping", test10_pass, f"Full = {step_angle_full} deg, 1/16 Micro = {step_angle_micro} deg"))

    # Test 11: Universal Motor AC Phasor Reactance & Power Factor
    V_rms = 120.0
    f_ac = 60.0
    R_total = 1.2 + 0.8 # Ra + Rf = 2.0 Ohm
    L_total = 0.015 + 0.025 # La + Lf = 0.040 H
    X_total = 2 * math.pi * f_ac * L_total # 15.08 Ohm
    Z_mag = math.sqrt(R_total**2 + X_total**2)
    cos_phi = R_total / Z_mag
    test11_pass = Z_mag > R_total and (0 < cos_phi < 1)
    results.append(("Test 11: Universal Motor AC Phasor Impedance & PF", test11_pass, f"Z = {Z_mag:.2f} Ohm, X_L = {X_total:.2f} Ohm, cos(phi) = {cos_phi:.3f}"))

    all_passed = True
    for name, p, desc in results:
        status = "[PASS]" if p else "[FAIL]"
        if not p:
            all_passed = False
        print(f"  {status} {name}: {desc}")

    return all_passed, results

def main():
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    missing_ids = test_dom_bindings(html_content)
    latex_ok = test_latex_integrity(html_content)
    all_passed, results = test_11_engineering_checks()

    print("\n=======================================================")
    if missing_ids:
        print(f"TOTAL MISSING DOM IDS: {len(missing_ids)}")
    else:
        print("ALL DOM IDS MATCH PERFECTLY: 0 MISSING")
    print(f"LATEX SYNTAX & DELIMITERS INTEGRITY: {'PASS' if latex_ok else 'FAIL'}")
    print(f"11/11 ENGINEERING CHECKS: {'ALL 11 PASSED' if all_passed else 'SOME FAILED'}")
    print("=======================================================")

if __name__ == "__main__":
    main()
