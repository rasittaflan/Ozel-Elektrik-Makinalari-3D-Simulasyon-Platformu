import sys
import os

sys.path.insert(0, r'C:\Users\muham\scratch_ocr\sections')

from part1_nav_overview import PART1_HTML
from part2_3d_lab import PART2_HTML
from part3_direction_bldc import PART3_HTML
from part4_universal_servo import PART4_HTML
from part5_stepper_exam_notes import PART5_HTML
from part6_javascript import PART6_JS

desktop_path = r'C:\Users\muham\Desktop\Ozel_Elektrik_Makinalari_Simulatoru.html'

full_html = PART1_HTML + PART2_HTML + PART3_HTML + PART4_HTML + PART5_HTML + PART6_JS

with open(desktop_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f'Successfully assembled {len(full_html)} bytes into {desktop_path}')
