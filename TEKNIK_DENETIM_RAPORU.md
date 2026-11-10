# Özel Elektrik Makinaları v1.0.0 — Teknik Denetim ve Fiziksel Doğrulama Raporu
## Technical Audit & Physical Verification Report

**Proje:** Özel Elektrik Makinaları — Profesyonel 3D Mühendislik Simülasyonu ve Aktif Öğrenme Platformu  
**Proje Sahibi:** Muhammet Raşit Taflan  
**Kurum:** Karadeniz Teknik Üniversitesi (KTÜ), Elektrik-Elektronik Mühendisliği  
**Akademik Kaynak:** Dr. Hakan Kahveci Ders Notları  
**Denetim Tarihi:** 10 Kasım 2026  
**Denetlenen Sürüm:** v1.0.0  
**Hedef Sürüm:** v2.0.0  

---

## 1. GİRİŞ VE DENETİM AMACI

Bu teknik denetim; projenin v1.0.0 sürümündeki yazılım mimarisi, matematiksel bağıntılar, elektromanyetik kuvvet hesaplamaları, 3D görselleştirme kalitesi, kaçış karakteri hataları ve eğitimsel etkileşim yeteneklerini ayrıntılı olarak incelemek ve v2.0.0 mimarisine geçiş yol haritasını belirlemek amacıyla gerçekleştirilmiştir.

---

## 2. TESPİT EDİLEN SOMUT KOD VE SÖZDİZİMİ SORUNLARI

### 2.1. KaTeX LaTeX Kaçış Karakterlerinin Kontrol Karakterlerine Dönüşmesi
Yapılan otomatik statik kod analizinde HTML dosyası içerisinde çok sayıda bozuk LaTeX sözdizimi saptanmıştır:
- **Düşey Tab (`\x0b` - ASCII 11):** 86 adet tespit edilmiştir. Python kaynak betiklerinde `\vec` yazılırken Python'ın `\v` kaçış dizisini düşey sekmeye dönüştürmesinden kaynaklanmıştır (Örn: `\vec{F}` $\rightarrow$ `\x0bec{F}`).
- **Form Feed (`\x0c` - ASCII 12):** 46 adet tespit edilmiştir. `\frac` ifadelerindeki `\f` harfinin form-feed karakterine dönüşmesiyle ortaya çıkmıştır.
- **Zil Sesi / Bell (`\x07` - ASCII 7):** 10 adet tespit edilmiştir. `\approx` ifadelerindeki `\a` kaçış karakterinden kaynaklanmıştır.
- **Eksik Ters Eğik Çizgiler (`\text`, `\omega`, `\theta`, `\cdot`, `\times`):** Python string birleştirme aşamasında raw string (`r'...'`) yerine çift tırnaklı değerlendirme yapılması nedeniyle tarayıcı konsolunda KaTeX ayrıştırma uyarılarına yol açtığı belirlenmiştir.

**Çözüm:** Python üretim mimarisi, metin değişkenleri içinde string kaçışından arındırılarak doğrudan UTF-8 kodlu şablon dosyaları (`.html`, `.js`, `.css`) üzerinden ham bayt düzeyinde birleştirilen temiz bir mimariye kavuşturulacaktır.

---

## 3. ELEKTROMANYETİK FİZİK VE HESAPLAMA DENETİMİ

### 3.1. Moment (Tork) Hesabındaki Basitleştirmeler ve Hatalar
- **Mevcut Durum (v1.0.0):**
  $$T_e = 2 \cdot r \cdot F = 2 \cdot r \cdot (B \cdot I \cdot l)$$
  Bu bağıntı yalnızca tepe akı yoğunluğundaki iki kutup merkezinde bulunan tek bir iletken çifti için geçerlidir.
- **Fiziksel Gerçeklik ve v2.0.0 Çözümü:**
  Rotor döndükçe her oluğun hava aralığındaki anlık manyetik akı yoğunluğu $B(\theta)$ değişir. Salient (çıkıntılı) kutup pabuçları altında akı tepe değerdeyken ($B_g \approx B_{max}$), kutuplar arası bölgede (interpol) akı sıfıra yaklaşır. Ayrıca komütatör dilimleri nötr bölgeyi geçen iletkenin akım yönünü ($+I \leftrightarrow -I$) ters çevirir.
  Toplam elektromanyetik moment, oluk bazında integrasyonla hesaplanmalıdır:
  $$T_e = \sum_{k=1}^{N_{oluk}} \left(\vec{r}_k \times \vec{F}_k\right)_z = \sum_{k=1}^{N_{oluk}} r \cdot l \cdot I_k(\theta) \cdot B(\theta_k)$$

### 3.2. Gerçek Zamanlı Motor Dinamiği (Diferansiyel Denklemler)
- **Mevcut Durum (v1.0.0):** Devir sayısı yalnızca bir kullanıcı kaydırıcısı (slider) ile doğrudan görsel animasyon hızını değiştirmekteydi. Motorun elektriksel zaman sabiti ($\tau_e = L_a/R_a$), mekanik zaman sabiti ($\tau_m = J/B_m$), kalkış akımı darbesi, yük momenti ($T_L$) altında devir düşümü ve jeneratör/frenleme rejimleri modellenmemişti.
- **v2.0.0 Çözümü:**
  Birinci derece bağlı diferansiyel denklem sistemi (State-Space ODE) 60 Hz Runge-Kutta / Euler nümerik integratörü ile çözülecektir:
  $$L_a \frac{di_a}{dt} = V_a - R_a i_a - K_e \omega$$
  $$J \frac{d\omega}{dt} = K_t i_a - B_m \omega - T_L$$
  Böylece kullanıcı gerilimi artırdığında akımın anlık sıçraması, motorun eylemsizliğiyle hızlanması, yük bindiğinde devrin düşmesi ve gerilim terslendiğinde rejeneratif frenleme dinamik olarak osiloskopta izlenebilecektir.

---

## 4. 3D MOTOR MODELİ VE GÖRSELLEŞTİRME DENETİMİ

### 4.1. Mevcut 3D Model Kısıtları
- Motor sahnesi 520px yüksekliğinde görece dar bir alana sıkışmış ve endüstriyel detaylardan yoksundur.
- Stator saç paketi, terminal bağlantı kutusu (klemens), montaj ayakları, oluk kamaları ve gerçek fırça tutucu yayları eksiktir.
- Kullanıcı parçaların üzerine tıkladığında parça hakkında teknik bilgi alamamaktadır (Raycasting eksikliği).
- Kamera açıları yalnızca birkaç kaba açıdan ibarettir; boyuna kesit, enine kesit ve parça izolasyon modları bulunmamaktadır.

### 4.2. v2.0.0 3D Geliştirme Hedefleri
- PBR (Physically Based Rendering) metalik malzemeler, kontrollü yönlü ışıklar ve kenar vurguları.
- **10 Standart Mühendislik Kamera Modu:** İzometrik, Ön, Arka, Üst, Mil ekseni, Boyuna kesit, Enine kesit, Parçalanmış görünüm (Exploded View), Şeffaf gövde (X-Ray), Yalnızca rotor/sargı izolasyonu.
- **İnteraktif Parça Seçici (Raycaster):** Tıklanan parçanın adını, malzemesini, elektriksel işlevini ve ders notundaki ilgili sayfasını gösteren teknik kart.
- **İkili Sağ El Kuralı Öğrenme Modu:**
  - *Mod A:* Akımın oluşturduğu manyetik alan (Biot-Savart / Ampere kuralı).
  - *Mod B:* Açısal hız vektörü ($\vec{\omega}$) ve dönüş yönü kuralı.

---

## 5. DERS NOTU DİJİTAL İKİZİ VE AKTİF ÖĞRENME

- Dr. Hakan Kahveci'nin defterindeki 1. soru (Vidalama kuralı ve CW dönüş) orijinal taranmış not görseli ile yan yana getirilerek bağımsız vektörel çarpım denklemleriyle doğrulanacaktır.
- Sınav soruları bankası, "Çözümü Göster/Gizle", dinamik parametre kaydırıcıları ve "Simülatöre Aktar" yetenekleriyle tam teşekküllü bir etüt ortamına dönüştürülecektir.
- Yerel doküman yöneticisi (IndexedDB destekli dosya yükleyici) eklenerek kullanıcının kendi çalışma notlarını da platforma ekleyebilmesi sağlanacaktır.

---

Bu denetim raporu doğrultusunda v2.0.0 geliştirme süreci başlatılmıştır.
