# CHANGELOG / Değişiklik Günlüğü

Tüm önemli değişiklikler bu dosyada belgelenmektedir.  
All notable changes to this project are documented in this file.

---

## [2.0.0] - 2026-11-10

### Added / Eklenenler
- TR: 3D CAD Motor Laboratuvarı için Three.js Raycasting bileşen dedektörü geliştirildi; motor parçalarına (Stator, Rotor, Komütatör, Fırçalar, vb.) tıklandığında Dr. Hakan Kahveci ders notu sayfa numarası, malzeme cinsi, elektromekanik işlevi ve formülünü gösteren canlı Mühendislik İnceleme Kartı eklendi.
- EN: Implemented a Three.js Raycasting component inspector for the 3D CAD Motor Lab; clicking any component displays its engineering card with lecture note page citation, material, electromechanical function, and governing formula.
- TR: 10 standart endüstriyel kamera modu (İzometrik, Ön, Arka, Üst, Mil Ekseni, Boyuna Kesit, Enine Kesit, Parçalanmış CAD, X-Ray Şeffaf Stator, İzole Rotor) eklendi.
- EN: Added 10 standardized industrial CAD camera views (Isometric, Front, Back, Top, Shaft Axis, Longitudinal Section, Cross Section, Exploded CAD, Transparent X-Ray Stator, Isolated Rotor).
- TR: Gerçek zamanlı bağlı diferansiyel denklem (ODE) durum-uzay motoru eklendi: $L_a \frac{di_a}{dt} = V_a - R_a i_a - K_e \omega$ ve $J \frac{d\omega}{dt} = K_t i_a - B_m \omega - T_L$ denklemleri Runge-Kutta 4 (RK4) sayısal integrasyon yöntemiyle çözüldü.
- EN: Added real-time coupled state-space ODE dynamic simulation engine solving electrical and mechanical equations via Runge-Kutta 4 (RK4) integration.
- TR: 4 kanallı canlı kayan osiloskop (Armatür Akımı $i_a$, Açısal Hız $\omega$, Elektromanyetik Moment $T_e$, Ters EMK $E_a$) ve önceden tanımlı dinamik mühendislik senaryoları (Tam Yükte Kalkış, Ani Yük Darbesi, Rejeneratif Frenleme, Gerilim Basamağı) entegre edildi.
- EN: Integrated 4-channel live scrolling oscilloscope ($i_a$, $\omega$, $T_e$, $E_a$) and preset dynamic engineering scenarios (Full Load Startup, Impact Load Step, Regenerative Braking, Voltage Step).
- TR: Sağ El Kuralı için Mod A (Akımın oluşturduğu manyetik alan dolanımı) ve Mod B (Açısal hız vektörü ve dönüş yönü) karşılaştırmalı eğitim modları geliştirildi.
- EN: Implemented dual Right-Hand Rule teaching modules: Mode A (Biot-Savart field circulation) vs Mode B (Angular velocity vector $\vec{\omega}$ vs rotor rotation).
- TR: Dr. Hakan Kahveci'nin el yazısı 1. sayfasındaki çizim ile 3D/2D simülatörün yan yana incelenebildiği Dijital İkiz çalışma alanı oluşturuldu.
- EN: Created a side-by-side Digital Twin workspace comparing the original handwritten scan of Page 1 with the real-time vector simulation.
- TR: İnteraktif Devre Laboratuvarı: Çift yönlü H-Köprü sürücüsü (PWM kontrollü), 3-Fazlı BLDC inverter devresi ve Üniversal Motor DPDT polarite yön anahtarlama şemaları eklendi.
- EN: Interactive Circuit Lab: Bi-directional H-Bridge with PWM control, 3-Phase BLDC inverter schematic, and Universal Motor DPDT reversing switch.
- TR: Kullanıcı ders notları, PDF ve ek çizimleri için tarayıcıda kalıcı yerel depolama sunan IndexedDB Belge Yöneticisi eklendi.
- EN: Added IndexedDB Document Manager providing persistent local storage for user-uploaded lecture notes and schematics.
- TR: 11 zorunlu elektromanyetik ve elektromekanik testin yürütüldüğü ve belgelendiği `MUHENDISLIK_DOGRULAMA_RAPORU.md` hazırlandı.
- EN: Published `MUHENDISLIK_DOGRULAMA_RAPORU.md` documenting 11 mandatory electromagnetic and electromechanical physics verification tests.

### Fixed / Düzeltilenler
- TR: v1.0.0 sürümünde Python dizge üretimindeki kaçış karakteri hatasından kaynaklanan LaTeX bozulmaları (`\vec` -> `\x0b`, `\frac` -> `\x0c`, `\approx` -> `\x07`) mimari modülerleştirilerek ve doğrudan UTF-8 birleştirmesi yapılarak sıfırlandı (0 bozuk karakter).
- EN: Fixed LaTeX corruption bugs in v1.0.0 where escape characters converted `\vec`, `\frac`, `\approx` into ASCII control bytes (`\x0b`, `\x0c`, `\x07`) by re-architecting into clean UTF-8 modular sections.
- TR: DOM element ID bağlamalarındaki eksiklikler giderildi; 156 HTML ID'si ile 107 JS referansı arasında %100 tam örtüşme sağlandı.
- EN: Fixed all DOM element ID references; achieved 100% complete match between 156 defined HTML IDs and 107 JS references with zero orphaned bindings.

### Changed / Değiştirilenler
- TR: Proje kaynak kodu `src_v2/sections/` altında 8 modüle ayrıldı ve otomatik montaj betiği `src_v2/assemble_v2.py` oluşturuldu.
- EN: Re-architected project source code into 8 modular files under `src_v2/sections/` and created automated build script `src_v2/assemble_v2.py`.
- TR: Tüm çıktılar `R:\Dijital_Arsiv`, Masaüstü ve İndirilenler klasörlerine kopyalandı, GitHub deposu ve GitHub Pages senkronize edildi.
- EN: Synchronized all builds across `R:\Dijital_Arsiv`, Desktop, Downloads, and pushed to GitHub repository and GitHub Pages.

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
