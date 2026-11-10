# -*- coding: utf-8 -*-
"""
Packages Özel Elektrik Makinaları v2.0.0 into a clean ZIP distribution archive.
"""

import os
import shutil
import zipfile

BASE_DIR = r"R:\Dijital_Arsiv\03_PROJELER_VE_ARGE\06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu"
ZIP_OUT = os.path.join(BASE_DIR, "Ozel_Elektrik_Makinalari_v3.0.0.zip")
DESKTOP_ZIP = r"C:\Users\muham\OneDrive\Masaüstü\Ozel_Elektrik_Makinalari_v3.0.0.zip"
DESKTOP2_ZIP = r"C:\Users\muham\Desktop\Ozel_Elektrik_Makinalari_v3.0.0.zip"

EXCLUDE_DIRS = {".git", ".system_generated", "__pycache__"}
EXCLUDE_EXTS = {".zip"}

def make_zip():
    print(f"Creating archive: {ZIP_OUT}")
    if os.path.exists(ZIP_OUT):
        os.remove(ZIP_OUT)

    with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(BASE_DIR):
            # Prune excluded dirs
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                _, ext = os.path.splitext(file)
                if ext.lower() in EXCLUDE_EXTS:
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BASE_DIR)
                zf.write(full_path, arcname=rel_path)
                print(f"  + Added {rel_path}")

    size_mb = os.path.getsize(ZIP_OUT) / (1024 * 1024)
    print(f"\n[SUCCESS] Created ZIP: {ZIP_OUT} ({size_mb:.2f} MB)")

    # Copy to Desktops
    for dt in [DESKTOP_ZIP, DESKTOP2_ZIP]:
        dt_dir = os.path.dirname(dt)
        if os.path.exists(dt_dir):
            shutil.copy2(ZIP_OUT, dt)
            print(f"  -> Copied to {dt}")

if __name__ == "__main__":
    make_zip()
