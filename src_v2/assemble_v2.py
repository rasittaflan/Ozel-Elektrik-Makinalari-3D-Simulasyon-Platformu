# -*- coding: utf-8 -*-
"""
Assembles the modular HTML/JS files into the complete single-file
Özel Elektrik Makinaları v2.0.0 simulation platform.
Ensures zero LaTeX escape character corruption and copies to required locations.
"""

import os
import shutil

BASE_DIR = r"R:\Dijital_Arsiv\03_PROJELER_VE_ARGE\06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu"
SECTIONS_DIR = os.path.join(BASE_DIR, "src_v2", "sections")

SECTIONS = [
    "sec1_head_nav.html",
    "sec2_3d_lab.html",
    "sec3_direction_twin.html",
    "sec4_dynamics_ode.html",
    "sec5_circuits_bldc.html",
    "sec6_universal_servo_stepper.html",
    "sec7_exam_docs_notes.html",
    "sec8_javascript_engine.js"
]

def main():
    print("=== Assembling Özel Elektrik Makinaları v2.0.0 ===")
    parts = []
    total_bytes = 0

    for sec in SECTIONS:
        fpath = os.path.join(SECTIONS_DIR, sec)
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Missing section file: {fpath}")
        
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        
        print(f"  + Read {sec}: {len(content)} characters ({len(content.encode('utf-8'))} bytes)")
        parts.append(content)
        total_bytes += len(content.encode('utf-8'))

    # Join with clean newline
    full_html = "\n".join(parts)
    print(f"\nTotal assembled HTML characters: {len(full_html)}")

    # Audit for unwanted control characters
    bad_chars = {
        '\x0b': '\\x0b (Vertical Tab / \\v)',
        '\x0c': '\\x0c (Form Feed / \\f)',
        '\x07': '\\x07 (Bell / \\a)',
        '\x08': '\\x08 (Backspace / \\b)'
    }
    
    found_bugs = False
    for char, name in bad_chars.items():
        count = full_html.count(char)
        if count > 0:
            print(f"  [ERROR] Found {count} occurrences of {name}!")
            found_bugs = True
        else:
            print(f"  [OK] Clean: 0 occurrences of {name}")

    if found_bugs:
        print("[CRITICAL] Assembly failed due to control characters!")
        return 1

    # Output targets
    targets = [
        os.path.join(BASE_DIR, "Ozel_Elektrik_Makinalari_Simulatoru.html"),
        os.path.join(BASE_DIR, "index.html"),
        os.path.join(BASE_DIR, "Ozel_Elektrik_Makinalari_Simulatoru_KARARLI.html"),
        r"C:\Users\muham\OneDrive\Masaüstü\Ozel_Elektrik_Makinalari_Simulatoru.html",
        r"C:\Users\muham\Desktop\Ozel_Elektrik_Makinalari_Simulatoru.html",
        r"C:\Users\muham\Downloads\Ozel_Elektrik_Makinalari_Simulatoru.html"
    ]

    for target in targets:
        target_dir = os.path.dirname(target)
        if os.path.exists(target_dir):
            with open(target, "w", encoding="utf-8") as f:
                f.write(full_html)
            print(f"  -> Written: {target}")
        else:
            print(f"  (Skipping non-existent directory: {target_dir})")

    print("\n[SUCCESS] Assembly completed with 100% integrity!")
    return 0

if __name__ == "__main__":
    exit(main())
