# Özel Elektrik Makinaları: 3D Hibrit Simülasyon & Aktif Öğrenme Laboratuvarı
## Special Electrical Machines: 3D Hybrid Simulation & Active Learning Platform

**Proje Sahibi / Project Owner:** Muhammet Raşit Taflan  
**Ders / Course:** KTÜ Elektrik-Elektronik Mühendisliği — Özel Elektrik Makinaları (Dr. Hakan Kahveci Ders Notları)  
**Sürüm / Version:** v1.0.0  
**Tarih / Date:** Kasım 2026 / November 2026  

---

## TR: Proje Hakkında

Bu proje; Dr. Hakan Kahveci'nin 81 sayfalık "ÖZEL ELEKTRİK MAKİNALARI" ders notları derinlemesine incelenerek oluşturulmuş, yüksek çözünürlüklü 3D WebGL (Three.js), etkileşimli vektörel 2D laboratuvarlar, dinamik osiloskoplar ve çözümlü sınav soruları bankası içeren yeni nesil bir mühendislik simülasyon ve ders çalışma platformudur.

### Temel Özellikler
1. **3D Fotogerçekçi Motor & Vektör Laboratuvarı (Three.js):**
   - Soğutma kanatlı çelik stator gövdesi, N ve S kutup pabuçları ve bakır sargıları.
   - 8 oluklu lamine sac rotor göbeği, oluklara gömülü 3D bakır sargı döngüleri.
   - Dilimli pirinç komütatör, yaylı grafit kömür fırçalar, rulmanlar ve 120° Hall PCB'si.
   - Canlı Vektörler: Manyetik Akı ($\vec{B}$), İletken Akımı ($\vec{I}$), Lorentz Teğet Kuvveti ($\vec{F} = I(\vec{l}\times\vec{B})$), Açısal Hız ($\vec{\omega}$) ve 3D Vidalama Kuralı Gizmosu.
   - Parçalanmış Görünüm (Exploded View $\%0 - \%100$), Şeffaf Gövde (X-Ray) ve Çeyrek Kesit modları.
2. **Dönüş Yönü & Vidalama Kuralı Laboratuvarı (Defter Sayfa 1 Dijital İkizi):**
   - El yazısı ders notundaki çizimin etkileşimli 2D simülatörü.
   - Oluk 1 ($\odot$) ve Oluk 2 ($\otimes$) akımları, aşağı yönlü $\vec{B}$ alanı, vidalama kuralı ile soldan sağa kuvvet ve Saat Yönünde (CW) dönüş ispatı.
   - Polarite tersleme deneyleri ($N\leftrightarrow S$, akım tersleme, çift tersleme).
3. **BLDC & 6-Adım Elektronik Komütasyon Laboratuvarı:**
   - 6 MOSFET'li 3-faz evirici köprüsü ($A^+, A^-, B^+, B^-, C^+, C^-$) iletim yolları.
   - 120° Hall sensör ($H_1, H_2, H_3$) doğruluk tablosu ve sektör tayini.
   - 3-Faz yamuk ters EMK ve akım dalga şekillerini çizen canlı dijital osiloskop.
4. **Üniversal Motor AC/DC Davranış Laboratuvarı (Sayfa 34-35 Sorusu):**
   - $120\text{V}, 60\text{Hz}, 2000\text{ d/d}, R=20\,\Omega, X_L=32\,\Omega$ orijinal defter sorusu.
   - Dinamik gerilim üçgeni fazör diyagramı ($V_{ac}^2 = (E_a + IR)^2 + (IX_L)^2$).
   - DC'ye bağlandığında devrin $2251\text{ d/d}$'ye çıkışının formülleri, $\cos\varphi$ ve verim hesabı.
5. **Servo Sistemler: Enkoder & Resolver Laboratuvarı:**
   - 4096 PPR artımsal enkoder optik diski, 90° kuadratür faz farkı ile yön tespiti (CW/CCW), 4X kenar sayımı ($16,384\text{ darbe/tur}$) ve Z index palsi.
   - Resolver: Döner transformatör taşıyıcı uyarımı, $V_{sin}, V_{cos}$ sinyalleri ve $\theta = \arctan(V_{sin} / V_{cos})$ mutlak açı çözücü.
6. **Adım Motorları (Step Motors) Laboratuvarı:**
   - VR, PM ve Hibrit adım motoru topolojileri.
   - Dalga (Wave), Tam Adım, Yarım Adım ve Mikro Adım (1/8) sürüşü.
   - $\theta_s = \frac{360^\circ}{m \cdot N_r}$, $S = m \cdot N_r$, $f = \frac{n \cdot S}{60}$ dinamik frekans ve hız hesaplayıcısı.
7. **Sınav Soruları & İnteraktif Çözüm Bankası:**
   - Hakan Kahveci'nin defterindeki 5 temel sınav sorusu, adım adım KaTeX çözümleri ve tek tıkla simülatöre aktarma entegrasyonu.

---

## EN: About The Project

This repository hosts a state-of-the-art interactive engineering simulation and learning workstation engineered from the comprehensive analysis of Dr. Hakan Kahveci's 81-page lecture notes on **Special Electrical Machines**.

### Core Modules
- **3D Photorealistic Motor Simulation:** Built with Three.js WebGL, featuring stator laminations, cooling fins, salient poles, copper coils, commutator segments, carbon brushes, Hall PCB, animated flux lines ($\vec{B}$), current vectors ($\vec{I}$), and Lorentz force vectors ($\vec{F} = I(\vec{l}\times\vec{B})$) with exploded and cutaway views.
- **Direction of Rotation & Right-Hand Rule Lab:** Exact digital twin of notebook page 1 demonstrating how $\vec{F} = i(\vec{l}\times\vec{B})$ drives clockwise (CW) rotation.
- **BLDC 6-Step Inverter Commutation:** 3-phase inverter bridge with active conduction path illumination, 120° Hall truth table, and multichannel trapezoidal Back-EMF oscilloscope.
- **Universal Motor AC/DC Phasor Lab:** Interactive solver for the $120\text{V}, 60\text{Hz}$ problem (Pages 34-35), demonstrating speed increase under DC and unidirectional AC torque.
- **Servo Encoders & Resolvers:** 4096 PPR quadrature incremental decoding, X4 multiplier, carrier-modulated resolver demodulator.
- **Stepper Motors:** VR, PM, and Hybrid stepper topologies with microstepping and speed-frequency calculator.
- **Exam Problem Bank:** 5 fully solved university examination problems with interactive parameter sliders and KaTeX mathematical formulations.

---

## Dizin Yapısı / Directory Layout

```
06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu/
│
├── Ozel_Elektrik_Makinalari_Simulatoru.html          # Ana interaktif simülatör (Tek dosya / Standalone)
├── Ozel_Elektrik_Makinalari_Simulatoru_KARARLI.html  # Doğrulanmış kararlı sürüm
├── README.md                                         # Proje dokümantasyonu (TR/EN)
├── CHANGELOG.md                                      # İki dilli sürüm geçmişi
├── Ozel_Elektrik_Makinalari_v1.0.0.zip               # Tüm kaynakları içeren arşiv paketi
│
├── kaynak_dokumanlar/                                # Orijinal ders notu ve el yazısı çizimler
│   ├── OZEL_ELEKTRIK_MAKINALARI_HAKAN_KAHVECI.pdf    # 81 sayfalık ders notu PDF'i
│   └── Hakan_Kahveci_Sayfa1_Vidalama_Kurali.jpg      # Sayfa 1 vidalama kuralı notu
│
├── src/                                              # Modüler Python üretim kodları
│   ├── assemble.py                                   # Modülleri birleştiren ana derleyici
│   └── sections/                                     # Arayüz, 3D ve fizik motoru modülleri
│       ├── part1_nav_overview.py
│       ├── part2_3d_lab.py
│       ├── part3_direction_bldc.py
│       ├── part4_universal_servo.py
│       ├── part5_stepper_exam_notes.py
│       └── part6_javascript.py
│
└── analiz_ve_ocr/                                    # 81 sayfanın OCR ve analiz çıktıları
    ├── ocr_results.txt
    └── slice_ocr_all.txt
```

---

## Çalıştırma / How to Run

1. `Ozel_Elektrik_Makinalari_Simulatoru.html` dosyasına çift tıklayarak herhangi bir modern web tarayıcısında (Chrome, Edge, Firefox, Brave) doğrudan çalıştırabilirsiniz.
2. İnternet bağlantısı olmasa dahi tarayıcı önbelleği üzerinden çalışabilecek şekilde optimize edilmiştir.
