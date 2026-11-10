# CHANGELOG / Değişiklik Günlüğü

Tüm önemli değişiklikler bu dosyada belgelenmektedir.  
All notable changes to this project are documented in this file.

---

## [1.0.0] - 2026-11-10

### Added / Eklenenler
- TR: Dr. Hakan Kahveci'nin "ÖZEL ELEKTRİK MAKİNALARI" ders notu (81 sayfa) temel alınarak 3D fotogerçekçi motor modeli ve simülasyon ortamı oluşturuldu.
- EN: Created a 3D photorealistic motor model and simulation workstation based on Dr. Hakan Kahveci's "Special Electrical Machines" lecture notes (81 pages).
- TR: Three.js WebGL tabanlı motor geometrisi; stator, kutup pabuçları, bakır sargılar, 8 oluklu lamine rotor sacı, komütatör, yaylı fırçalar ve 120° Hall PCB'si geliştirildi.
- EN: Developed Three.js WebGL motor geometry including stator casing, salient poles, copper coils, 8-slot laminated rotor, commutator, spring-loaded brushes, and 120° Hall PCB.
- TR: Manyetik akı ($\vec{B}$), iletken akımı ($\vec{I}$) ve Lorentz teğet kuvveti ($\vec{F} = I(\vec{l}\times\vec{B})$) vektörleri dinamik olarak 3D ve 2D sahnelerde modellendi.
- EN: Dynamically modeled magnetic flux ($\vec{B}$), armature current ($\vec{I}$), and tangential Lorentz force ($\vec{F} = I(\vec{l}\times\vec{B})$) vectors in 3D and 2D viewports.
- TR: Defter Sayfa 1'deki el yazısı motor kesiti ve vidalama kuralı yön tayini interaktif 2D laboratuvar haline getirildi; kutup ve akım tersleme deneyleri eklendi.
- EN: Converted notebook Page 1 handwritten motor cross-section and right-hand screw rule direction determination into an interactive 2D lab with polarity inversion experiments.
- TR: 6-anahtarlı 3-fazlı evirici köprüsü (inverter) ve 120° Hall sensör tablosuyla çalışan BLDC komütasyon simülatörü ve 3-faz osiloskopu eklendi.
- EN: Implemented a BLDC commutation simulator with a 6-switch 3-phase inverter bridge, 120° Hall truth table, and 3-phase Back-EMF oscilloscope.
- TR: Üniversal motor için Sayfa 34-35'teki $120\text{V}, 60\text{Hz}$ sayısal problemi için dinamik empedans üçgeni, devir ve verim çözücüsü eklendi.
- EN: Added dynamic impedance triangle phasor diagram, speed increase calculator, and efficiency solver for the universal motor problem (Pages 34-35).
- TR: Servo sistemler için 4096 PPR kuadratür enkoder osiloskopu (A, B, Z) ve analog resolver taşıyıcı demodülasyon simülatörü geliştirildi.
- EN: Developed a 4096 PPR quadrature incremental encoder oscilloscope (A, B, Z channels) and an analog resolver carrier demodulation simulator for servo systems.
- TR: Adım motorları (VR, PM, Hibrit) için Dalga, Tam Adım, Yarım Adım ve Mikro Adım (1/8) sürüşü ile devir-frekans hesaplayıcısı entegre edildi.
- EN: Integrated step drive modes (Wave, Full, Half, Microstepping) and a speed-frequency calculator for stepper motors (VR, PM, Hybrid).
- TR: Hakan Kahveci'nin defterindeki 5 temel sınav sorusu, dinamik girdi alanları ve adım adım KaTeX çözümleriyle Sınav Bankası'na eklendi.
- EN: Added 5 comprehensive university exam problems from the lecture notes with dynamic inputs and step-by-step KaTeX solutions to the Exam Bank.
- TR: Proje tüm kaynak kodları, orijinal PDF, çizimler, OCR analizleri ve Python üretim betikleriyle `R:\Dijital_Arsiv\03_PROJELER_VE_ARGE\06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu` altına arşivlendi ve ZIP paketi hazırlandı.
- EN: Archived all project resources, original PDF, sketches, OCR data, and Python build scripts under `R:\Dijital_Arsiv\03_PROJELER_VE_ARGE\06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu` and generated the complete ZIP archive.
