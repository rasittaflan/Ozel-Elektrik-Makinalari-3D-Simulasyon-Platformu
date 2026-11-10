# Özel Elektrik Makinaları: 3D CAD & Dinamik ODE Simülasyon Platformu
## Special Electrical Machines: 3D CAD & Dynamic ODE Simulation Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-0284c7?style=for-the-badge&logo=google-chrome&logoColor=white)](https://rasittaflan.github.io/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rasittaflan/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu)
[![KTÜ EEE](https://img.shields.io/badge/KT%C3%9C-Electrical_%26_Electronics_Engineering-0369a1?style=for-the-badge&logo=mortarboard&logoColor=white)](https://www.ktu.edu.tr/eee)
[![Version](https://img.shields.io/badge/Version-v2.0.0--PRO-10b981?style=for-the-badge)](https://github.com/rasittaflan/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/releases)

<br/>

**🌐 Canlı Simülasyon Web Bağlantısı / Live Simulation URL:**  
### **[https://rasittaflan.github.io/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/](https://rasittaflan.github.io/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/)**

</div>

---

**Proje Sahibi / Project Owner:** Muhammet Raşit Taflan  
**Ders / Course:** KTÜ Elektrik-Elektronik Mühendisliği — Özel Elektrik Makinaları  
**Akademik Kaynak / Academic Source:** Dr. Hakan Kahveci Ders Notları (81 Sayfa)  
**Sürüm / Version:** v2.0.0-PRO  
**Tarih / Date:** Kasım 2026 / November 2026  

---

## TR: Proje Hakkında (v2.0.0)

Bu proje; Dr. Hakan Kahveci'nin Karadeniz Teknik Üniversitesi Elektrik-Elektronik Mühendisliği bölümünde anlattığı 81 sayfalık **"ÖZEL ELEKTRİK MAKİNALARI"** ders notlarının derinlemesine analiziyle geliştirilmiş; salt görsel animasyonların ötesinde, gerçek zamanlı diferansiyel denklem (ODE) çözücüsü, Three.js tabanlı CAD seviyesinde bileşen inceleyicisi, 10 standart kamera modu, 4 kanallı canlı osiloskop, interaktif güç elektroniği devreleri ve 11 mühendislik fizik testiyle doğrulanmış yeni nesil bir **Sanal Elektrik Makineleri Laboratuvarı ve Aktif Öğrenme Platformudur**.

### Temel Yenilikler (v2.0.0):
1. **3D CAD Motor Laboratuvarı (Three.js WebGL & Raycasting):**
   - **Mühendislik İnceleme Kartı:** Kullanıcı motordaki herhangi bir parçaya (stator saç paketi, kutup pabuçları, 8 oluklu lamine sac rotor, bakır sargılar, komütatör, yaylı grafit fırçalar, mil, rulmanlar, 120° Hall PCB'si) tıkladığında; parçanın malzeme türü, çalışma sıcaklığı, elektromekanik görevi, ders notundaki sayfa referansı ve fiziksel formülü dinamik kartta gösterilir.
   - **10 Endüstriyel Kamera Modu:** İzometrik, Ön, Arka, Üst, Mil Ekseni, Boyuna Kesit, Enine Kesit, Parçalanmış CAD Görünümü (%0-%100 kesintisiz slider), X-Ray Şeffaf Stator ve Yalnızca Rotor/Sargı modu.
   - **Canlı Vektör Görselleştirmeleri:** Akım yönleri ($\odot$ ve $\otimes$), Stator manyetik alanı ($\vec{B}$), İletkenin kendi manyetik alanı, Lorentz teğet kuvvetleri ($\vec{F} = i(\vec{l}\times\vec{B})$), Elektromanyetik moment ($\vec{T}_e$) ve Açısal hız vektörü ($\vec{\omega}$).
2. **Ders Notu Sayfa 1 Dijital İkizi & Vidalama Kuralı:**
   - Dr. Hakan Kahveci'nin defterindeki ilk motor dönüş yönü çiziminin taranmış orijinal hali ile dijital simülatörü yan yana sunulur.
   - **Mod A:** Akımın oluşturduğu manyetik alan dolanımı (Biot-Savart kuralı).
   - **Mod B:** Dönüş yönü ve açısal hız vektörü ilişkisi ($\vec{\omega}$).
   - Her oluktaki kuvvet ve moment ayrı ayrı hesaplanarak saatin ibreleri yönünde (CW) dönüşün vektörel ispatı gösterilir.
3. **Gerçek Zamanlı Motor Dinamiği (Durum-Uzay ODE Çözücüsü):**
   - Gerçek coupled diferansiyel denklemler Runge-Kutta 4 (RK4) sayısal integrasyonu ile çözülür:
     $$L_a \frac{di_a}{dt} = V_a - R_a i_a - K_e \omega$$
     $$J \frac{d\omega}{dt} = K_t i_a - B_m \omega - T_L$$
   - **4 Kanallı Osiloskop:** $i_a(t)$, $\omega(t)$, $T_e(t)$ ve $E_a(t)$ dalga şekilleri 150 örnek noktalı halka tamponlarla canlı çizilir.
   - **Dinamik Senaryolar:** Tam Yükte Kalkış ($T_L = 2\,\text{N}\cdot\text{m}$), Boşta Kalkış ($T_L = 0$), Ani Yük Darbesi ($T_L \rightarrow 5\,\text{N}\cdot\text{m}$), Rejeneratif Frenleme ve Gerilim Basamağı.
4. **İnteraktif Güç Elektroniği & Devre Laboratuvarı:**
   - **H-Köprüsü:** 4 MOSFET anahtarlaması ve PWM görev periyodu kontrolü ile çift yönlü sürüş simülasyonu.
   - **3-Fazlı BLDC İnverter:** 6 adımlı komütasyon mantığı, 120° Hall sensör tablosu ve 3 fazlı ters EMK gerilimleri.
   - **Üniversal Motor Yön Anahtarı:** DPDT tersleme anahtarı ile alan ve endüvi akım kutuplarının bağımsız yönetimi.
5. **Üniversal Motor, Servo/Enkoder & Adım Motoru Laboratuvarları:**
   - **Üniversal Motor:** Sayfa 34-35 sayısal problemi ($120\,\text{V}, 60\,\text{Hz}$ AC vs DC), empedans üçgeni, reaktans gerilim düşümü ve devir artış hesabı.
   - **Servo & Enkoder/Resolver:** 4096 PPR kuadratür artımsal enkoder (A/B 90° faz farkı, Z sıfır indeksi) ve analog resolver taşıyıcı sinyal demodülasyonu.
   - **Adım Motoru:** VR, PM ve Hibrit motor modelleri; Dalga, Tam Adım ($1.8^\circ$), Yarım Adım ($0.9^\circ$) ve 1/16 Mikro Adım ($0.1125^\circ$) sürüşü.
6. **Üniversite Sınav Bankası & Belge Yöneticisi:**
   - Dr. Hakan Kahveci'nin defterindeki 5 temel sınav sorusu; gizle/göster detaylı KaTeX çözümleri ve dinamik parametre kaydırıcılarıyla.
   - IndexedDB tabanlı Belge Yöneticisi: Kullanıcı ders notu PDF'leri ve çizimlerini tarayıcıda kalıcı olarak saklayabilir.

---

## EN: About The Project (v2.0.0)

This platform is a next-generation **Virtual Electrical Machines CAD & Dynamic ODE Simulation Laboratory** built upon the detailed syllabus and handwritten lecture notes of Dr. Hakan Kahveci (Karadeniz Technical University, Department of Electrical & Electronics Engineering).

### Highlights:
- **CAD Raycasting Component Inspector:** Interactive inspection of all motor parts with live engineering cards, material specs, formulas, and note page citations.
- **10 Industrial Viewport Modes:** Isometric, Front, Back, Top, Shaft View, Longitudinal Section, Cross Section, Exploded View (0-100%), Transparent Stator, Isolated Rotor.
- **Runge-Kutta 4 (RK4) State-Space ODE Dynamics:** Coupled electrical and mechanical differential equations solved at 60 Hz with 4-channel live oscilloscopes ($i_a, \omega, T_e, E_a$).
- **Digital Twin of Page 1:** Side-by-side comparison with the original KTÜ lecture scan proving clockwise (CW) torque via $\vec{F} = i(\vec{l}\times\vec{B})$ and $\vec{T} = \vec{r}\times\vec{F}$.
- **Interactive Circuits:** Bi-directional MOSFET H-bridge with PWM, 6-step BLDC inverter, and DPDT universal motor reverser.
- **11 Verified Engineering Physics Tests:** 100% verified against analytical models in `MUHENDISLIK_DOGRULAMA_RAPORU.md`.

---

## 🔬 Doğrulama ve Test Raporu / Verification & Test Suite

Platform, `MUHENDISLIK_DOGRULAMA_RAPORU.md` dosyasında belgelenen **11 zorunlu elektromekanik fizik testinin tamamını sıfır hatayla geçmiştir:**
1. Lorentz Kuvveti ve CW Dönüş Yönü Testi: **GEÇTİ**
2. Endüvi Akım Yönü Tersleme Testi: **GEÇTİ**
3. Stator Kutup Tersleme Testi: **GEÇTİ**
4. Çift Tersleme (AC Üniversal Motor) Testi: **GEÇTİ**
5. Sıfır Hızda Sıfır Ters EMK Güvencesi: **GEÇTİ**
6. Elektromekanik Güç Korunumu ($P_{mech} = P_{elek}$): **GEÇTİ**
7. Kararlı Durum Dinamik ODE Dengesi: **GEÇTİ**
8. BLDC 6-Adımlı Komütasyon Dizisi Testi: **GEÇTİ**
9. Kuadratür Enkoder 4X Çözünürlük (4096 CPR) Testi: **GEÇTİ**
10. Adım Motoru 1/16 Mikro Adım Matematiği Testi: **GEÇTİ**
11. Üniversal Motor AC Fazör Empedansı Testi: **GEÇTİ**

---

## 📁 Proje Dizin Yapısı / Repository Architecture

```
06_Ozel_Elektrik_Makinalari_3D_Simulasyon_Platformu/
├── index.html                               # GitHub Pages & Ana Simülasyon Web Dosyası
├── Ozel_Elektrik_Makinalari_Simulatoru.html # Tek Parça Bağımsız v2.0.0 Simülatörü
├── Ozel_Elektrik_Makinalari_v1.0.0_BACKUP.html # v1.0.0 Güvenli Arşiv Yedeği
├── Ozel_Elektrik_Makinalari_v2.0.0.zip      # Tüm Projeyi İçeren Dağıtım Paketi
├── MUHENDISLIK_DOGRULAMA_RAPORU.md          # 11 Mühendislik Fizik Testi Raporu
├── TEKNIK_DENETIM_RAPORU.md                 # v1.0.0 Denetim ve Hata Raporu
├── README.md                                # Proje Dokümantasyonu (TR/EN)
├── CHANGELOG.md                             # İki Dilli Sürüm Değişiklik Günlüğü
├── src_v2/                                  # v2.0.0 Modüler Kaynak Kodları
│   ├── assemble_v2.py                       # Otomatik Montaj ve KaTeX Denetim Aracı
│   ├── verify_simulation.py                 # Otomatik Fizik & DOM Doğrulama Paketi
│   └── sections/                            # Bağımsız Modüller
│       ├── sec1_head_nav.html               # Başlık, Meta, Telemetri Rozetleri & Sekmeler
│       ├── sec2_3d_lab.html                 # 3D CAD Motor Sahnesi & Raycasting Kartı
│       ├── sec3_direction_twin.html         # Defter Sayfa 1 Dijital İkizi & Vidalama Kuralı
│       ├── sec4_dynamics_ode.html           # Durum-Uzay ODE Motoru & 4 Kanallı Osiloskop
│       ├── sec5_circuits_bldc.html          # H-Köprüsü, BLDC İnverter & Komütasyon
│       ├── sec6_universal_servo_stepper.html# Üniversal Fazör, 4096 Enkoder & Mikro Adım
│       ├── sec7_exam_docs_notes.html        # Sınav Bankası, Belge Yöneticisi & Formüller
│       └── sec8_javascript_engine.js        # Three.js CAD, RK4 Entegratör & UI Mantığı
└── assets/                                  # Orijinal Taranmış Görseller & Ders PDF'i
    ├── hakan_kahveci_defter_s1.jpg          # Orijinal Defter Sayfa 1 Taraması
    └── OZEL_ELEKTRIK_MAKINALARI_HAKAN_KAHVECI.pdf # 81 Sayfalık Ders Kitabı
```

---

## 🚀 Çalıştırma Talimatları / How to Run

1. **Canlı İnternet Üzerinden:**  
   Herhangi bir modern tarayıcıda (Chrome, Edge, Firefox, Safari) doğrudan aşağıdaki bağlantıyı açınız:  
   👉 **[https://rasittaflan.github.io/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/](https://rasittaflan.github.io/Ozel-Elektrik-Makinalari-3D-Simulasyon-Platformu/)**

2. **Yerel Olarak (Offline / Çevrimdışı):**  
   Masaüstünüzdeki `Ozel_Elektrik_Makinalari_Simulatoru.html` veya `index.html` dosyasına çift tıklayınız. Kurulum veya yerel sunucu gerekmez; tüm kütüphaneler (Three.js, KaTeX, Tailwind CSS) gömülü ve CDN önbelleklemeli çalışmaktadır.

---

## 👨‍💻 Geliştirici & Lisans / Developer & License

- **Geliştirici:** Muhammet Raşit Taflan (KTÜ Elektrik-Elektronik Mühendisliği)
- **Akademik Referans:** Dr. Hakan Kahveci, *Özel Elektrik Makinaları Ders Notları*, KTÜ EEE.
- **Lisans:** MIT Lisansı — Eğitim ve akademik araştırma amacıyla serbestçe kullanılabilir.
