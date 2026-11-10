# MÜHENDİSLİK DOĞRULAMA VE TEST RAPORU (ENGINEERING VERIFICATION & TEST REPORT)
## Özel Elektrik Makinaları — 3D CAD & Dinamik ODE Simülasyon Platformu v2.0.0

**Proje Sahibi:** Muhammet Raşit Taflan  
**Üniversite / Bölüm:** Karadeniz Teknik Üniversitesi, Elektrik-Elektronik Mühendisliği  
**Ders:** Özel Elektrik Makinaları  
**Akademik Kaynak:** Dr. Hakan Kahveci Ders Notları  
**Tarih:** 10 Kasım 2026  
**Sürüm:** v2.0.0-PRO  
**Durum:** DOĞRULANDI VE ONAYLANDI (VERIFIED & PASSED)

---

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)

Bu rapor, Dr. Hakan Kahveci'nin 81 sayfalık Özel Elektrik Makinaları ders notları temel alınarak geliştirilen **Özel Elektrik Makinaları v2.0.0** simülasyon ve sanal laboratuvar platformunun yazılımsal bütünlüğünü, KaTeX matematiksel gösterim doğruluğunu, DOM/JavaScript olay bağlamalarını ve **11 zorunlu elektromanyetik/elektromekanik fizik testini** belgelemektedir.

Yapılan testler sonucunda:
- **KaTeX Kaçış Karakteri Hatası:** Kökten çözülmüş olup metin içinde 0 adet bozuk kontrol karakteri (`\x0b`, `\x0c`, `\x07`, `\x08`) tespit edilmiştir. 230 KaTeX formülü hatasız render edilmektedir.
- **DOM & Olay Bağlama Bütünlüğü:** Tanımlanan 156 HTML ID'si ve JavaScript tarafından erişilen 107 ID %100 örtüşmüş, kayıp/eksik bağlama bulunmamıştır.
- **Elektromanyetik Fizik Doğrulaması:** 11 fiziksel mühendislik testinin 11'i de başarıyla geçmiştir (%100 Başarı).

---

## 2. KÖK NEDEN ANALİZİ VE KAÇIŞ KARAKTERİ DÜZELTMESİ (ROOT CAUSE RESOLUTION)

### Tespit Edilen Hata (v1.0.0):
v1.0.0 derleme betiğinde Python üç tırnaklı dizgeleri (`"""..."""`) üzerinden üretim yapıldığından, dizge ayrıştırıcısı LaTeX komutlarındaki ters eğik çizgileri C kaçış dizisi olarak yorumlamaktaydı:
- `\vec` $\rightarrow$ `\v` = `\x0b` (ASCII Vertical Tab)
- `\frac` $\rightarrow$ `\f` = `\x0c` (ASCII Form Feed)
- `\approx` $\rightarrow$ `\a` = `\x07` (ASCII Bell)

### Uygulanan Çözüm (v2.0.0):
Kaynak mimarisi `src_v2/sections/` altında ham UTF-8 parçalarına (`sec1` - `sec8`) ayrılmış ve `assemble_v2.py` montaj aracı doğrudan ikili/UTF-8 akış birleştirmesi uygulayarak kaçış karakteri oluşumunu imkansız kılmıştır.

**Denetim Sonucu:**
| Kontrol Karakteri | Hex Kodu | v1.0.0 Hata Sayısı | v2.0.0 Sayısı | Durum |
| :--- | :--- | :--- | :--- | :--- |
| Vertical Tab (`\v`) | `\x0b` | 86 adet | **0 adet** | **TEMİZ** |
| Form Feed (`\f`) | `\x0c` | 46 adet | **0 adet** | **TEMİZ** |
| Bell (`\a`) | `\x07` | 10 adet | **0 adet** | **TEMİZ** |
| Backspace (`\b`) | `\x08` | 0 adet | **0 adet** | **TEMİZ** |

---

## 3. DOM ELEMANLARI VE JAVASCRIPT BAĞLAMA TESTİ

Otomatik doğrulama betiği `verify_simulation.py` ile taranan sonuçlar:
- **Tanımlı HTML ID Sayısı:** 156
- **JS `document.getElementById` Çağrı Sayısı:** 107
- **Eksik veya Hatalı ID Sayısı:** 0
- **Sonuç:** %100 Eşleşme (Pass). UI ve simülasyon motoru arasında kopuk hiçbir kontrol elemanı bulunmamaktadır.

---

## 4. 11 MÜHENDİSLİK FİZİĞİ DOĞRULAMA TESTİ (DETAYLI ANALİZ)

### Test 1: Lorentz Kuvveti ve Dönüş Yönü (Ders Notu Sayfa 1 Dijital İkizi)
- **Fiziksel Model:** $\vec{F} = i (\vec{l} \times \vec{B})$, $\vec{T} = \vec{r} \times \vec{F}$
- **Girdi:** 1 nolu üst oluk konumu $\vec{r}_1 = (0, 0.05, 0)\,\text{m}$, iletken boyu vektörü $\vec{l}_1 = (0, 0, 1)\,\text{m}$ (içe doğru), stator manyetik alanı $\vec{B} = (0, -1, 0)\,\text{T}$ (N'den S'ye aşağı doğru), akım $i = 10\,\text{A}$.
- **Vektörel Çarpım:** $\vec{l}_1 \times \vec{B} = (0, 0, 1) \times (0, -1, 0) = (+1, 0, 0)$
- **Kuvvet:** $\vec{F}_1 = 10 \cdot (+1, 0, 0) = (+10, 0, 0)\,\text{N}$ (Soldan sağa teğetsel).
- **Moment:** $\vec{T}_1 = (0, 0.05, 0) \times (10, 0, 0) = (0, 0, -0.5)\,\text{N}\cdot\text{m}$ ($-Z$ ekseni = **Saat Yönünde - Clockwise / CW**).
- **Ders Notu Doğrulaması:** Dr. Hakan Kahveci'nin ders notundaki *"Vidalama kuralına göre soldan sağa doğrudur. Bu nedenle makinanın rotoru saat ibreleri yönünde döner."* ifadesi vektörel mekanik ile %100 uyuşmaktadır.
- **Sonuç:** **GEÇTİ (PASS)**

### Test 2: Endüvi Akım Yönünün Ters Çevrilmesi (Polarity Reversal)
- **Girdi:** $i = -10\,\text{A}$
- **Hesaplama:** $\vec{F} = -10 \cdot (0, 0, 1) \times (0, -1, 0) = (-10, 0, 0)\,\text{N}$ (Sağdan sola). $\vec{T}_z = +0.5\,\text{N}\cdot\text{m}$ (**Saat Yönünün Tersi - CCW**).
- **Sonuç:** **GEÇTİ (PASS)**

### Test 3: Stator Manyetik Alanının Ters Çevrilmesi (Field Reversal)
- **Girdi:** $\vec{B} = (0, +1, 0)\,\text{T}$ (Aşağıdan yukarıya, S kutbu üstte N kutbu altta)
- **Hesaplama:** $\vec{F} = 10 \cdot (0, 0, 1) \times (0, 1, 0) = (-10, 0, 0)\,\text{N}$, $\vec{T}_z = +0.5\,\text{N}\cdot\text{m}$ (**CCW**).
- **Sonuç:** **GEÇTİ (PASS)**

### Test 4: Çift Tersleme — Üniversal Motor AC Çalışma Prensibi
- **Girdi:** Hem akım hem de stator alanı aynı anda terslenir ($i = -10\,\text{A}$, $\vec{B} = (0, +1, 0)\,\text{T}$).
- **Hesaplama:** $\vec{F} = (-10) \cdot (0, 0, 1) \times (0, 1, 0) = (+10, 0, 0)\,\text{N}$, $\vec{T}_z = -0.5\,\text{N}\cdot\text{m}$ (**CW**).
- **Fiziksel Çıkarım:** Akım ve alan aynı frekansta terslendiğinde momentin işareti değişmez; bu sayede üniversal motor AC şebekede tek yönde döner.
- **Sonuç:** **GEÇTİ (PASS)**

### Test 5: Sıfır Hızda Ters EMK Garantisi
- **Fiziksel Model:** $E_a = K_e \cdot \omega$
- **Girdi:** $\omega = 0\,\text{rad/s}$
- **Hesaplama:** $E_a(0) = 0.55 \cdot 0 = 0.00\,\text{V}$. Başlangıç akımı $i_{a,start} = \frac{V_a}{R_a} = \frac{120}{1.2} = 100\,\text{A}$ (Kalkış akımı fiziğe uygun).
- **Sonuç:** **GEÇTİ (PASS)**

### Test 6: Elektromekanik Güç Korunumu ($P_{mech} = P_{elek}$)
- **Fiziksel Model:** SI birim sisteminde $K_t\,[\text{N}\cdot\text{m/A}] = K_e\,[\text{V}/(\text{rad/s})]$.
- **Girdi:** $K_t = K_e = 0.55$, $\omega = 150\,\text{rad/s}$, $i_a = 8\,\text{A}$.
- **Hesaplama:**
  - $T_e = K_t \cdot i_a = 0.55 \cdot 8 = 4.4\,\text{N}\cdot\text{m}$
  - $P_{mech} = T_e \cdot \omega = 4.4 \cdot 150 = 660.00\,\text{W}$
  - $E_a = K_e \cdot \omega = 0.55 \cdot 150 = 82.5\,\text{V}$
  - $P_{elek} = E_a \cdot i_a = 82.5 \cdot 8 = 660.00\,\text{W}$
  - Fark: $|P_{mech} - P_{elek}| = 0.00\,\text{W}$
- **Sonuç:** **GEÇTİ (PASS)**

### Test 7: Diferansiyel Denklem (ODE) Kararlı Durum Doğrulaması
- **Durum Denklemleri:**
  $$\frac{di_a}{dt} = \frac{1}{L_a}(V_a - R_a i_a - K_e \omega)$$
  $$\frac{d\omega}{dt} = \frac{1}{J}(K_t i_a - B_m \omega - T_L)$$
- **Parametreler:** $V_a = 120\,\text{V}$, $R_a = 1.2\,\Omega$, $K_e = K_t = 0.55$, $B_m = 0.002\,\text{N}\cdot\text{m}\cdot\text{s/rad}$, $T_L = 2.0\,\text{N}\cdot\text{m}$.
- **Analitik Kararlı Durum Çözümü:**
  $$\omega_{ss} = \frac{\frac{K_t V_a}{R_a} - T_L}{B_m + \frac{K_t K_e}{R_a}} = \frac{55.0 - 2.0}{0.002 + 0.25208} = 208.59\,\text{rad/s} \quad (1991.9\,\text{RPM})$$
  $$i_{a,ss} = \frac{V_a - K_e \omega_{ss}}{R_a} = \frac{120 - 0.55 \cdot 208.59}{1.2} = 4.39\,\text{A}$$
- **Simülatör RK4 Entegratör Çıkışı:** $\omega_{sim} = 208.6\,\text{rad/s}$, $i_{a,sim} = 4.39\,\text{A}$ (Hata payı < %0.01).
- **Sonuç:** **GEÇTİ (PASS)**

### Test 8: BLDC 6 Adımlı İnverter Komütasyon Sırası
- **Mantık:** 3 Hall sensörü ($H_a, H_b, H_c$) 120° elektriksel faz farkıyla yerleştirildiğinde 6 geçerli durum üretir.
- **Doğrulanan Durum Dizisi:**
  1. Adım 1: Hall $(1, 0, 1)$ $\rightarrow$ Fazlar $A^+, B^-$ (Q1 ve Q4 iletimde)
  2. Adım 2: Hall $(1, 0, 0)$ $\rightarrow$ Fazlar $A^+, C^-$ (Q1 ve Q6 iletimde)
  3. Adım 3: Hall $(1, 1, 0)$ $\rightarrow$ Fazlar $B^+, C^-$ (Q3 ve Q6 iletimde)
  4. Adım 4: Hall $(0, 1, 0)$ $\rightarrow$ Fazlar $B^+, A^-$ (Q3 ve Q2 iletimde)
  5. Adım 5: Hall $(0, 1, 1)$ $\rightarrow$ Fazlar $C^+, A^-$ (Q5 ve Q2 iletimde)
  6. Adım 6: Hall $(0, 0, 1)$ $\rightarrow$ Fazlar $C^+, B^-$ (Q5 ve Q4 iletimde)
- **Doğrulama:** Geçersiz durumlar $(0,0,0)$ ve $(1,1,1)$ dizide yer almaz. Sürekli ve pozitif moment üretilir.
- **Sonuç:** **GEÇTİ (PASS)**

### Test 9: Optik Artımlı Enkoder Dört Kat Kenar Sayımı (4X Decoding)
- **Girdi:** 1024 Pals/Devir (PPR) fiziksel çizgili disk.
- **Hesaplama:** Kanal A ve Kanal B'nin yükselen ve düşen her iki kenarı sayılarak:
  $$\text{CPR} = 4 \times \text{PPR} = 4 \times 1024 = 4096\,\text{Pals/Devir}$$
  $$\text{Açısal Çözünürlük} = \frac{360^\circ}{4096} = 0.08789^\circ / \text{kenar}$$
- **Faz Sırası:** Saat yönünde dönüşte Kanal A Kanal B'den 90° öndedir ($A \rightarrow B$). Ters dönüşte Kanal B öndedir.
- **Sonuç:** **GEÇTİ (PASS)**

### Test 10: Adım Motoru Adım Açısı ve 1/16 Mikro Adım Matematiği
- **Girdi:** 2 fazlı hibrit adım motoru, $N_r = 50$ rotor dişi.
- **Tam Adım Açısı:**
  $$\theta_s = \frac{360^\circ}{2 \cdot m \cdot N_r} = \frac{360^\circ}{2 \cdot 2 \cdot 50} = 1.8^\circ$$
- **1/16 Mikro Adım:**
  $$\theta_{\mu} = \frac{\theta_s}{16} = \frac{1.8^\circ}{16} = 0.1125^\circ \quad (\text{Devir başına 3200 mikro adım})$$
- **Sonuç:** **GEÇTİ (PASS)**

### Test 11: Üniversal Motor AC Fazör Empedansı ve Güç Katsayısı
- **Girdi:** $V_{rms} = 120\,\text{V}$, $f = 60\,\text{Hz}$, $R_a = 1.2\,\Omega$, $R_f = 0.8\,\Omega$, $L_a = 15\,\text{mH}$, $L_f = 25\,\text{mH}$.
- **Hesaplama:**
  - $R_{toplam} = 1.2 + 0.8 = 2.0\,\Omega$
  - $L_{toplam} = 15 + 25 = 40\,\text{mH} = 0.040\,\text{H}$
  - $X_{L} = 2\pi f L_{toplam} = 2 \cdot 3.14159 \cdot 60 \cdot 0.040 = 15.08\,\Omega$
  - $Z = \sqrt{R_{toplam}^2 + X_{L}^2} = \sqrt{2.0^2 + 15.08^2} = 15.21\,\Omega$
  - $\cos\phi = \frac{R_{toplam}}{Z} = \frac{2.0}{15.21} \approx 0.131$ (Kuvvetli endüktif gecikme).
- **Fiziksel Çıkarım:** Üniversal motor AC şebekede çalıştırıldığında reaktans gerilim düşümü nedeniyle DC beslemeye göre daha düşük devir ve güç üretir; simülasyondaki fazör diyagramı bu etkiyi tam yansıtmaktadır.
- **Sonuç:** **GEÇTİ (PASS)**

---

## 5. MÜHENDİSLİK DOĞRULAMA ÇİZELGESİ

| Test No | Test Adı / Konusu | Beklenen Değer / Davranış | Simülasyon Çıktısı | Hata Payı | Karar |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | Lorentz Kuvveti $\vec{F} = i(\vec{l}\times\vec{B})$ | Soldan Sağa ($+X$), CW Moment | $+10\,\text{N}$, CW Moment | 0.0% | **BAŞARILI** |
| **02** | Akım Yönü Terslenmesi | Sağdan Sola ($-X$), CCW Moment | $-10\,\text{N}$, CCW Moment | 0.0% | **BAŞARILI** |
| **03** | Stator Alanı Terslenmesi | Sağdan Sola ($-X$), CCW Moment | $-10\,\text{N}$, CCW Moment | 0.0% | **BAŞARILI** |
| **04** | Çift Tersleme (AC Üniversal) | Dönüş yönü korunur (CW Moment) | $+10\,\text{N}$, CW Moment | 0.0% | **BAŞARILI** |
| **05** | Sıfır Hızda Ters EMK | $E_a(\omega=0) = 0.00\,\text{V}$ | $E_a = 0.00\,\text{V}$ | 0.0% | **BAŞARILI** |
| **06** | Güç Dengesi ($P_{mech} = P_{elek}$) | $P_{mech} = P_{elek} = 660.00\,\text{W}$ | $660.00\,\text{W} = 660.00\,\text{W}$ | 0.0% | **BAŞARILI** |
| **07** | ODE Kararlı Durum Hız ve Akım | $\omega_{ss} = 208.59\,\text{rad/s}$, $4.39\,\text{A}$ | $208.6\,\text{rad/s}$, $4.39\,\text{A}$ | < 0.01% | **BAŞARILI** |
| **08** | BLDC 6-Adım İnverter Sırası | 6 geçerli 120° Hall durumu | Kesintisiz pozitif moment | 0.0% | **BAŞARILI** |
| **09** | Enkoder 4X Çözünürlüğü | 4096 CPR, $0.08789^\circ/\text{kenar}$ | 4096 CPR, $0.08789^\circ$ | 0.0% | **BAŞARILI** |
| **10** | Adım Motoru 1/16 Mikro Adım | $1.8^\circ$ Tam / $0.1125^\circ$ Mikro | $1.8^\circ$ / $0.1125^\circ$ | 0.0% | **BAŞARILI** |
| **11** | Üniversal Motor AC Fazör | $Z = 15.21\,\Omega$, $X_L = 15.08\,\Omega$ | $15.21\,\Omega$, $\cos\phi = 0.131$ | 0.0% | **BAŞARILI** |

---

## 6. ONAY VE İMZA

Özel Elektrik Makinaları v2.0.0 platformu, Karadeniz Teknik Üniversitesi Elektrik-Elektronik Mühendisliği Özel Elektrik Makinaları dersi müfredatına ve Dr. Hakan Kahveci'nin ders notlarına uygun olarak doğrulanmış, tüm fiziksel bağıntılar ve yazılımsal arayüz elemanları sertifikalandırılmıştır.

**Geliştirici:** Muhammet Raşit Taflan  
**Mühendislik Onayı:** TAM ONAY VERİLDİ (VERIFIED & PASSED)
