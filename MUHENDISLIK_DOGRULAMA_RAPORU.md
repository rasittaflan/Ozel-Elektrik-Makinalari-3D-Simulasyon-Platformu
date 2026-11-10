# MÜHENDİSLİK DOĞRULAMA VE TEST RAPORU (ENGINEERING VERIFICATION & TEST REPORT)
## Özel Elektrik Makinaları — 3D Elektromanyetik Motor Laboratuvarı v3.0.0-PRO

**Proje Sahibi:** Muhammet Raşit Taflan  
**Üniversite / Bölüm:** Karadeniz Teknik Üniversitesi, Elektrik-Elektronik Mühendisliği  
**Ders:** Özel Elektrik Makinaları  
**Akademik Kaynak:** Dr. Hakan Kahveci Ders Notları (81 Sayfa)  
**Tarih:** 10 Kasım 2026  
**Sürüm:** v3.0.0-PRO  
**Durum:** DOĞRULANDI VE ONAYLANDI (VERIFIED & PASSED)

---

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)

Bu rapor, Karadeniz Teknik Üniversitesi Elektrik-Elektronik Mühendisliği Özel Elektrik Makinaları dersi kapsamında, Dr. Hakan Kahveci'nin ders notları ve sınav soruları temel alınarak geliştirilen **Özel Elektrik Makinaları 3D Elektromanyetik Motor Laboratuvarı v3.0.0** platformunun elektromanyetik fizik motorunu, 3D görselleştirme mimarisini, yavaşlatılmış/adım adım zaman ölçekleme motorunu ve **11 zorunlu elektromanyetik/elektromekanik fizik testini** belgelemektedir.

Yapılan testler ve denetimler sonucunda:
- **3D Manyetik Alan ve Akı Çizgileri:** 3D ortamda Kuzey (N) kutbundan Güney (S) kutbuna doğru akan, kalın ve ışıltılı akı tüpleri üzerinde sürekli hareket eden yön okları başarıyla entegre edilmiştir. Kutuplar terslendiğinde akı yönü ve oklar anında tersine dönmektedir.
- **Hava Aralığı Akı Dağılımı Isı Haritası:** Mavi ($0.0\,\text{T}$) $\rightarrow$ Yeşil ($0.5\,\text{T}$) $\rightarrow$ Kırmızı ($1.0+\,\text{T}$) renk skalalı analitik hava aralığı manyetik alan haritası eklenmiştir (FEM analizi olmadığı açıkça belirtilmiştir).
- **Rotor Oluklarında 3D Akım İşaretleri ve Akış Animasyonu:** Her oluğun üzerinde ⊙ (Dışarı / Turkuaz) ve ⊗ (İçeri / Turuncu) işaretleri ile oluk numaraları (Oluk 1..8) 3D olarak yerleştirilmiştir. İletkenler içinde konvansiyonel akım yönünü temsil eden parçacık akışı gösterilmektedir.
- **Oluk İnceleme ve Dönüş Yönü Deneyi (Sınav Modülü):** Öğrenci herhangi bir oluğa tıklayarak akım yönünü manuel tersleyebilmekte, o oluğun teğetsel Lorentz kuvvet vektörünün anında yön değiştirdiğini ve 8 oluğun toplam momentine ($T_e$) etkisini canlı görebilmektedir.
- **Yavaş Çekim & Adım Adım Simülasyon:** Fiziksel motor hızı (ör. $1200\,\text{d/d}$, $125.7\,\text{rad/s}$) ile görsel animasyon hızı birbirinden ayrılmıştır. $0.01\times$ ile $2\times$ arasında 7 farklı görsel zaman ölçeği, duraklatma, açı kaydırıcısı ($0^\circ - 360^\circ$) ve tek adım/komütasyon (+45°) kontrolleri eklenmiştir.
- **"Bana Açıkla" 8 Adımlı Öğretici Tur:** Stator kutuplarından açısal hız vektörüne kadar 8 aşamalı dinamik eğitim modu 3D sahnede interaktif olarak çalışmaktadır.
- **DOM & Olay Bağlama Bütünlüğü:** 187 tanımlı HTML ID'si ve 108 JS referansı %100 örtüşmüştür (0 eksik ID).
- **KaTeX Matematiksel Bütünlük:** 0 adet bozuk kontrol karakteri (`\x0b`, `\x0c`, `\x07`, `\x08`), 244 KaTeX formülü hatasız görüntülenmektedir.
- **Elektromanyetik Fizik Doğrulaması:** 11/11 Mühendislik Fizik Testi tam başarıyla geçmiştir.

---

## 2. YENİ ELEKTROMANYETİK 3D MİMARİ DOĞRULAMASI (v3.0.0)

### 2.1. Stator Manyetik Alanı ve Dinamik Akı Tüpleri
- **Akı Yolu Geometrisi:** Stator N kutup pabucundan çıkarak hava aralığı ve rotor göbeği üzerinden S kutup pabucuna giren 9 adet 3D `CatmullRomCurve3` eğrisi oluşturulmuştur.
- **Görsel Kalite:** $0.0028\,\text{m}$ yarıçaplı `TubeGeometry` tüpleri, `MeshStandardMaterial` (renk: `#00f5ff`, emisyon: `#007799`, parlaklık: %85) ile stator gövdesi içinde veya kesit modunda son derece net görülebilir kılınmıştır.
- **Hareketli Yön Okları:** Her eğri boyunca kayan 2 adet konik ok ucu (`ConeGeometry`) eklenmiş, akının N'den S'ye doğru yönelimi kesintisiz görselleştirilmiştir.
- **Kutup Tersleme:** Stator kutupları ($N \leftrightarrow S$) terslendiğinde akı eğrileri üzerindeki okların hareket yönü anında tersine dönmektedir.
- **Fiziksel Model Sınırı Uyarısı:** *"Manyetik akı çizgileri üzerindeki parçacık/ok animasyonu fiziksel bir kütle akışı değil, manyetik alan yönünü ve şiddetini görselleştirmek içindir."* uyarısı arayüzde yer almaktadır.

### 2.2. Hava Aralığı Manyetik Akı Dağılımı Isı Haritası
- **Geometri:** Hava aralığında $R = 0.048\,\text{m}$, $L = 0.126\,\text{m}$ silindirik ağ yüzeyi.
- **Dağılım Modeli:** Analitik eşdeğer manyetik devre modeli:
  $$B(\theta) = B_{max} \cdot |\sin\theta|$$
  - Kutup eksenlerinde ($Y = \pm 0.068\,\text{m}$): Kırmızı / Yüksek Akı ($0.85 - 1.2\,\text{T}$).
  - Nötr hat ekseninde ($X = \pm 0.048\,\text{m}$): Koyu Mavi / Düşük Akı ($0.0 - 0.2\,\text{T}$).
- **Uyarı:** Analitik yaklaşım olduğu, sonlu elemanlar yöntemi (FEM) çözümü olmadığı renk ölçeğinde açıkça belgelenmiştir.

### 2.3. 3D Oluk Akım İşaretleri (⊙ ve ⊗) ve İletken Akışı
- **3D Oluk Rozetleri:** Rotorun ön yüzeyinde 8 oluğun merkezine yerleştirilmiş $128\times 128$ piksellik dinamik tuval dokuları (`SpriteMaterial`):
  - ⊙ (Turkuaz `#06b6d4`): Sayfa düzleminden dışarıya, gözlemciye doğru akım ($+Z$).
  - ⊗ (Turuncu `#f97316`): Sayfa düzleminin içine doğru, gözlemciden uzağa akım ($-Z$).
  - Her rozette oluk numarası ("Oluk 1", "Oluk 2" .. "Oluk 8") yer alır.
- **İletken İçi Akış:** Bakır iletkenler boyunca hareket eden küçük kürecikler (+Z için ileri, -Z için geri) konvansiyonel akım yönünü temsil eder.

### 2.4. Oluk İnceleme ve Dönüş Yönü Deneyi (Sınav Simülatörü)
- Kullanıcı motoru duraklatıp veya çalışırken herhangi bir oluğa tıkladığında:
  1. O oluğun akım yönü (⊙ $\leftrightarrow$ ⊗) terslenir.
  2. O oluktaki Lorentz teğetsel kuvvet oku $\vec{F}_k = I_k (\vec{l}_k \times \vec{B}_k)$ anında zıt yöne döner.
  3. Oluğun moment katkısı $T_k = (\vec{r}_k \times \vec{F}_k)_z$ yeniden hesaplanır.
  4. 8 oluğun net momenti $T_e = \sum T_k$ toplanarak rotorun ivmelenme yönü (Saat Yönü CW vs Saat Yönünün Tersi CCW) anında gösterilir.
- Bu deney, Dr. Hakan Kahveci'nin sınavlarında sıkça sorduğu oluk polaritesi sorularını öğrencinin görsel olarak çözmesini sağlar.

### 2.5. Yavaşlatılmış ve Adım Adım Simülasyon
- **Fiziksel Zaman vs Görsel Zaman Ayrımı:**
  - Diferansiyel durum denklemleri $\Delta t_{ode} = 0.001\,\text{s}$ ile çözülür; motor akımı, gerilimi ve hızı ($1200\,\text{d/d}$) gerçek fiziksel değerlerini korur.
  - Görsel açı ilerlemesi: $\Delta\theta_{vis} = \omega_{phys} \cdot \Delta t \cdot \text{timeScale}$.
  - Hız Seçenekleri: $0.01\times$, $0.05\times$, $0.10\times$ (Varsayılan/Önerilen), $0.25\times$, $0.50\times$, $1.0\times$, $2.0\times$.
- **Adım Kontrolleri:** Tek adım ($+0.5^\circ$), $+1^\circ$, $+5^\circ$, $+15^\circ$, $+30^\circ$ ve Komütasyon Adımı ($+45^\circ$).
- **Mekanik Konum Kaydırıcısı:** $0^\circ - 360^\circ$ kaydırıcı ile rotor istenen açıya getirilir; manyetik alan, akımlar, kuvvetler ve moment o açı için eşzamanlı hesaplanır.

---

## 3. DOM ELEMANLARI VE JAVASCRIPT BAĞLAMA TESTİ

Otomatik doğrulama betiği `verify_simulation.py` sonuçları:
- **Tanımlı HTML ID Sayısı:** 187
- **JS `document.getElementById` Çağrı Sayısı:** 108
- **Eksik veya Eşleşmeyen ID Sayısı:** 0
- **Sonuç:** %100 Eşleşme (Pass). UI ile JavaScript simülasyon motoru arasında sıfır kopuk bağlantı.

---

## 4. 11 MÜHENDİSLİK FİZİĞİ DOĞRULAMA TESTİ (DETAYLI ÇİZELGE)

| Test No | Test Adı / Konusu | Beklenen Davranış / Analitik Bağıntı | Simülasyon Sonucu | Karar |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Lorentz Kuvveti $\vec{F} = i(\vec{l}\times\vec{B})$ | Soldan Sağa ($+X$), CW Moment | $F_x = +10.0\,\text{N}$, $T_z = -0.5\,\text{N}\cdot\text{m}$ (CW) | **BAŞARILI** |
| **02** | Akım Yönü Terslenmesi | Sağdan Sola ($-X$), CCW Moment | $F_x = -10.0\,\text{N}$, $T_z = +0.5\,\text{N}\cdot\text{m}$ (CCW) | **BAŞARILI** |
| **03** | Stator Alanı Terslenmesi | Sağdan Sola ($-X$), CCW Moment | $F_x = -10.0\,\text{N}$, $T_z = +0.5\,\text{N}\cdot\text{m}$ (CCW) | **BAŞARILI** |
| **04** | Çift Tersleme (AC Üniversal) | Dönüş yönü korunur (CW Moment) | $F_{dual} == F_{orig}$ (True), CW Moment | **BAŞARILI** |
| **05** | Sıfır Hızda Ters EMK | $E_a(\omega=0) = 0.00\,\text{V}$ | $E_a = 0.00\,\text{V}$, $i_{a,start} = 100\,\text{A}$ | **BAŞARILI** |
| **06** | Güç Dengesi ($P_{mech} = P_{elek}$) | $P_{mech} = P_{elek} = 660.00\,\text{W}$ | $660.00\,\text{W} == 660.00\,\text{W}$ | **BAŞARILI** |
| **07** | ODE Kararlı Durum Dengesi | $\omega_{ss} = 208.59\,\text{rad/s}$, $i_{a,ss} = 4.39\,\text{A}$ | $\omega_{ss} = 208.6\,\text{rad/s}$, $i_{a,ss} = 4.39\,\text{A}$ | **BAŞARILI** |
| **08** | BLDC 6-Adım İnverter Sırası | 6 geçerli 120° Hall durumu | Kesintisiz pozitif moment | **BAŞARILI** |
| **09** | Enkoder 4X Çözünürlüğü | 4096 CPR, $0.08789^\circ/\text{kenar}$ | 4096 CPR, $0.08789^\circ$ | **BAŞARILI** |
| **10** | Adım Motoru 1/16 Mikro Adım | $1.8^\circ$ Tam / $0.1125^\circ$ Mikro | $1.8^\circ$ / $0.1125^\circ$ | **BAŞARILI** |
| **11** | Üniversal Motor AC Fazör | $Z = 15.21\,\Omega$, $X_L = 15.08\,\Omega$ | $Z = 15.21\,\Omega$, $\cos\phi = 0.131$ | **BAŞARILI** |

---

## 5. ONAY VE İMZA

Özel Elektrik Makinaları v3.0.0 platformu, Karadeniz Teknik Üniversitesi Elektrik-Elektronik Mühendisliği bölümü müfredatına ve Dr. Hakan Kahveci'nin ders notlarına uygun olarak doğrulanmış, 3D elektromanyetik görselleştirme, yavaşlatılmış oynatma ve sınav oluk inceleme motoru sertifikalandırılmıştır.

**Geliştirici:** Muhammet Raşit Taflan (KTÜ EEE)  
**Mühendislik Onayı:** TAM ONAY VERİLDİ (VERIFIED & PASSED)
