PART1_HTML = """<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <title>KTÜ Özel Elektrik Makinaları | 3D Hibrit Simülasyon & Aktif Öğrenme Laboratuvarı</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
            },
            slate: {
              850: '#0d1527',
              900: '#080e1a',
              950: '#030712'
            }
          }
        }
      }
    }
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- FontAwesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- KaTeX for High Precision Engineering Mathematics -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>

  <!-- Three.js & OrbitControls for 3D Motor Visualization -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

  <!-- Chart.js for Live Multichannel Oscilloscopes -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  <style>
    :root {
      --bg-dark: #050b14;
      --bg-card: rgba(13, 21, 39, 0.88);
      --border-card: rgba(30, 41, 59, 0.85);
      --accent-cyan: #38bdf8;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --accent-indigo: #6366f1;
    }

    body {
      background-color: var(--bg-dark);
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
    }

    code, .font-mono {
      font-family: 'JetBrains Mono', monospace !important;
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      transition: all 0.25s ease;
    }
    .glass-card:hover {
      border-color: rgba(56, 189, 248, 0.45);
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.15);
    }

    .tab-btn {
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      position: relative;
    }
    .tab-btn.active {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(99, 102, 241, 0.2) 100%);
      border-bottom: 2px solid #38bdf8;
      color: #38bdf8;
      font-weight: 700;
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #38bdf8;
      box-shadow: 0 0 10px #38bdf8;
    }

    /* Custom scrollbars */
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: #080e1a; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #38bdf8; }

    /* Custom Range Slider */
    input[type=range] {
      -webkit-appearance: none;
      background: #1e293b;
      height: 6px;
      border-radius: 3px;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #38bdf8;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
      transition: transform 0.1s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }

    .badge-lorentz {
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .katex-display {
      margin: 0.75em 0 !important;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.25em 0;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">

  <!-- Top Global Header -->
  <header class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
          <i class="fa-solid fa-bolt-lightning"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">KTÜ EEE • ELK3010 / ELK4010</span>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Dr. Hakan Kahveci Notları</span>
          </div>
          <h1 class="text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            ÖZEL ELEKTRİK MAKİNALARI <span class="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">3D Hibrit Laboratuvarı</span>
          </h1>
        </div>
      </div>

      <!-- Live Telemetry Badges -->
      <div class="hidden lg:flex items-center space-x-3 text-xs font-mono">
        <div class="glass-card px-3 py-1.5 rounded-lg flex items-center space-x-2 border-slate-800">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-400">Motor Durumu:</span>
          <span id="globalMotorStatus" class="font-bold text-emerald-400">ÇALIŞIYOR</span>
        </div>
        <div class="glass-card px-3 py-1.5 rounded-lg flex items-center space-x-2 border-slate-800">
          <i class="fa-solid fa-arrows-spin text-cyan-400"></i>
          <span class="text-slate-400">Hız:</span>
          <span id="globalRpmVal" class="font-bold text-cyan-300">1200 d/d</span>
          <span id="globalDirVal" class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">CW (Saat Yönü)</span>
        </div>
        <div class="glass-card px-3 py-1.5 rounded-lg flex items-center space-x-2 border-slate-800">
          <i class="fa-solid fa-magnet text-amber-400"></i>
          <span class="text-slate-400">Akı (B):</span>
          <span id="globalFluxVal" class="font-bold text-amber-300">0.85 T</span>
        </div>
        <div class="glass-card px-3 py-1.5 rounded-lg flex items-center space-x-2 border-slate-800">
          <i class="fa-solid fa-user-graduate text-indigo-400"></i>
          <span class="text-slate-400">Öğrenci:</span>
          <span class="font-semibold text-slate-200">Muhammet Raşit Taflan</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Bar -->
    <div class="border-t border-slate-800/80 bg-slate-900/70 overflow-x-auto">
      <div class="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2">
        <button onclick="switchTab('tab-overview')" class="tab-btn active px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-overview">
          <i class="fa-solid fa-book-open"></i> Genel Bakış & Defter Analizi
        </button>
        <button onclick="switchTab('tab-3d-lab')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-3d-lab">
          <i class="fa-solid fa-cube"></i> 3D Motor & Vektör Laboratuvarı
        </button>
        <button onclick="switchTab('tab-direction-lab')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-direction-lab">
          <i class="fa-solid fa-compass"></i> Dönüş Yönü & Manyetik Alan (Vidalama Kuralı)
        </button>
        <button onclick="switchTab('tab-bldc')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-bldc">
          <i class="fa-solid fa-microchip"></i> BLDC & 6-Adım Komütasyon
        </button>
        <button onclick="switchTab('tab-universal')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-universal">
          <i class="fa-solid fa-plug"></i> Üniversal Motor AC/DC
        </button>
        <button onclick="switchTab('tab-servo')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-servo">
          <i class="fa-solid fa-gauge-high"></i> Servo, Enkoder & Resolver
        </button>
        <button onclick="switchTab('tab-stepper')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-stepper">
          <i class="fa-solid fa-gears"></i> Adım Motorları (Step Motors)
        </button>
        <button onclick="switchTab('tab-exam-bank')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-exam-bank">
          <i class="fa-solid fa-file-signature text-amber-400"></i> Sınav Soruları & Çözüm Bankası
        </button>
        <button onclick="switchTab('tab-notes')" class="tab-btn px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center gap-1.5" data-tab="tab-notes">
          <i class="fa-solid fa-pen-fancy text-emerald-400"></i> Defter Özeti & Formüller
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

    <!-- ========================================== -->
    <!-- TAB 1: GENEL BAKIŞ & DEFTER ANALİZİ -->
    <!-- ========================================== -->
    <section id="tab-overview" class="tab-content space-y-6">
      <!-- Hero Banner -->
      <div class="glass-card rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-700/60 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <i class="fa-solid fa-network-wired text-[240px] text-cyan-400"></i>
        </div>
        <div class="max-w-3xl relative z-10 space-y-3">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <i class="fa-solid fa-certificate"></i>
            <span>Dr. Hakan Kahveci Özel Elektrik Makinaları Ders Notu Mühendislik Analizi</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Teoriden Simülasyona: Özel Elektrik Makinaları Çalışma İstasyonu
          </h2>
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bu platform, Dr. Hakan Kahveci'nin 81 sayfalık el yazısı ve teknik ders notları derinlemesine incelenerek oluşturulmuştur.
            Klasik makinelerden modern servo sürücülere uzanan serüvende; manyetik kutupların yerleşimi, akım yönleri, 
            <strong>Lorentz kuvveti ($\vec{F} = i(\vec{l}\times\vec{B})$)</strong>, sağ el kuralı (vidalama kuralı), fırçasız komütasyon,
            artımsal enkoder kuadratür fazları, resolver taşıyıcı uyarımı ve adım motoru mikro adımlama dinamikleri 
            <strong>3 boyutlu fotogerçekçi modeller ve etkileşimli matematiksel çözücüler</strong> ile bütünleştirilmiştir.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <button onclick="switchTab('tab-3d-lab')" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition">
              <i class="fa-solid fa-cube"></i> 3D Motor Laboratuvarını Başlat
            </button>
            <button onclick="switchTab('tab-direction-lab')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition">
              <i class="fa-solid fa-hand-point-right"></i> Vidalama Kuralı & Yön Tayini (Defter Sayfa 1)
            </button>
            <button onclick="switchTab('tab-exam-bank')" class="px-4 py-2 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 border border-amber-700/60 text-amber-300 font-semibold text-xs flex items-center gap-2 transition">
              <i class="fa-solid fa-file-signature"></i> Çıkmış Sınav Sorularını Çöz
            </button>
          </div>
        </div>
      </div>

      <!-- Course Architecture / 5 Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Module 1 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-0.5 rounded-full">Bölüm 1 • Sayfa 1-29</span>
            <i class="fa-solid fa-arrows-spin text-xl text-slate-500 group-hover:text-cyan-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">Doğru Akım, Lorentz Kuvveti & BLDC Temelleri</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Stator kutupları ($N - S$), rotor oluk ve sargıları, fırça-kollektör yapısı. 
            <strong>$\vec{F} = i(\vec{l}\times\vec{B})$</strong> bağıntısı ve vidalama kuralı ile dönüş yönünün tayini.
            Mekanik komütasyondan elektronik komütasyona geçiş, Hall sensörleri (120° yerleşim) ve trapezoidal ters EMK.
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">1. Soru (Defter Sayfa 1)</span>
            <button onclick="switchTab('tab-direction-lab')" class="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
              İncele <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Module 2 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2.5 py-0.5 rounded-full">Bölüm 2 • Sayfa 30-44</span>
            <i class="fa-solid fa-bolt text-xl text-slate-500 group-hover:text-emerald-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">Üniversal Motorlar (AC/DC Seri Motorlar)</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Seri uyarmalı armatür ve kutup sargıları. AC şebekede akım ve manyetik akının eşzamanlı yön değiştirmesi 
            ($T \propto I_a^2$) nedeniyle tek yönlü tork üretimi. DC ve AC empedans farkı ($Z = \sqrt{R^2 + X_L^2}$), reaktans gerilim düşümü,
            hız ve verim farkı hesaplamaları (120V / 2000 d/d sayısal problemi).
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">3. Soru (Defter Sayfa 34-35)</span>
            <button onclick="switchTab('tab-universal')" class="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              İncele <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Module 3 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800 px-2.5 py-0.5 rounded-full">Bölüm 3 • Sayfa 45-53</span>
            <i class="fa-solid fa-microchip text-xl text-slate-500 group-hover:text-indigo-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">Sürekli Mıknatıslı Senkron Servo & Enkoder/Resolver</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Servo sistem mimarisi. Artımsal (Incremental) Enkoder: A, B kanalları (90° kuadratür faz farkı ile yön algılama), Z indeksi, Line Driver, TTL (5V) & HTL (24V).
            Resolver: Döner transformatör ilkesi, $V_{sin} = V_m \sin\theta \sin\omega t$, $V_{cos} = V_m \cos\theta \sin\omega t$, mutlak açı çözümü.
            Master-Slave senkron çalışma ve elektronik dişli.
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">4. Soru (Defter Sayfa 46-50)</span>
            <button onclick="switchTab('tab-servo')" class="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              İncele <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Module 4 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-800 px-2.5 py-0.5 rounded-full">Bölüm 4 • Sayfa 54-64</span>
            <i class="fa-solid fa-gears text-xl text-slate-500 group-hover:text-amber-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">Adım Motorları (Step Motors) & Mikro Adımlama</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Değişken Relüktanslı (VR), Sabit Mıknatıslı (PM) ve Hibrit (Hybrid) motorlar. 
            Adım açısı formülasyonu: $\theta_s = \frac{360^\circ}{m \cdot N_r}$, devir-frekans bağıntısı: $n = \frac{60 \cdot f}{S}$.
            Sürüş modları: Dalga (Wave), Tam Adım, Yarım Adım, Mikro Adımlama. Tutma torku, çekme torku ve rezonans sınırları.
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">5. Soru (Defter Sayfa 58-60)</span>
            <button onclick="switchTab('tab-stepper')" class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              İncele <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Module 5 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-800 px-2.5 py-0.5 rounded-full">Bölüm 5 • 3D & Vektör</span>
            <i class="fa-solid fa-cube text-xl text-slate-500 group-hover:text-rose-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">3D İnteraktif Motor & Vektör Görselleştirici</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Rotor sac paketleri, oluklardaki bakır sargılar, komütatör lamelleri, fırça tutucular ve Hall PCB'si ile tam teşekküllü 3D model.
            Manyetik alan çizgileri ($\vec{B}$), akım vektörleri ($\vec{I}$) ve Lorentz teğet kuvvet vektörleri ($\vec{F}$) gerçek zamanlı render edilir.
            Parçalanmış görünüm (Exploded View) ve şeffaf gövde modu mevcuttur.
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">Three.js WebGL Mimarisi</span>
            <button onclick="switchTab('tab-3d-lab')" class="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
              Başlat <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Module 6 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3 relative group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-purple-400 bg-purple-950/70 border border-purple-800 px-2.5 py-0.5 rounded-full">Sınav Bankası • 5 Problem</span>
            <i class="fa-solid fa-graduation-cap text-xl text-slate-500 group-hover:text-purple-400 transition"></i>
          </div>
          <h3 class="text-base font-bold text-white">Sınav Soruları & İnteraktif Çözücü</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Hakan Kahveci'nin defterindeki 5 temel sınav sorusu: Vidalama kuralıyla dönüş yönü ispatı, BLDC 120° komütasyon sektör tespiti,
            Üniversal motor AC-DC karşılaştırması ($120\text{V}, 60\text{Hz}$), 4096 PPR enkoder ve resolver analizleri, 4 faz 50 dişli adım motoru hız hesabı.
            Dinamik parametre girişli ve KaTeX çözümlü.
          </p>
          <div class="pt-2 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-mono">Dinamik Çözücü</span>
            <button onclick="switchTab('tab-exam-bank')" class="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              Soruları Çöz <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Golden Physical Notebook Principles Card -->
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-feather-pointed text-cyan-400"></i> Hakan Kahveci Dersi İçin 4 Altın Mühendislik İlkesi
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div class="font-bold text-cyan-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">1</span>
              Lorentz Kuvveti ve Vidalama Kuralı Şaşmazlığı
            </div>
            <p class="text-slate-400 leading-relaxed">
              Dönüş yönü tayininde: $\vec{F} = i(\vec{l}\times\vec{B})$ vektörel çarpımını kullan. Sağ elin 4 parmağını akım yönünden ($\vec{l}$)
              manyetik alan yönüne ($\vec{B}$, N'den S'ye) kıvırdığında, dik açılan başparmak iletkene etkiyen kuvveti ($\vec{F}$) verir.
              Merkeze göre moment $\vec{T} = \vec{r}\times\vec{F}$ alınarak dönüş yönü (CW veya CCW) belirlenir.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div class="font-bold text-emerald-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px]">2</span>
              Komütasyon: Fırçalıdan Elektronik BLDC'ye Dönüşüm
            </div>
            <p class="text-slate-400 leading-relaxed">
              Klasik DA motorda komütatör lamelleri kutup eksenini geçince akımı mekanik olarak ters çevirir. BLDC motorda ise bu görevi
              120° yerleştirilmiş 3 Hall sensörü ($H_1, H_2, H_3$) ve 6 transistörlü evirici üstlenir. Her 60°'de iki faz iletime sokulur,
              bir faz boştadır (120° iletim).
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div class="font-bold text-amber-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-[10px]">3</span>
              Üniversal Motorda AC Torkunun Pozitif Kalma Sırrı
            </div>
            <p class="text-slate-400 leading-relaxed">
              Şebeke AC gerilimi ters döndüğünde hem armatür akımı $I_a$ hem de seri bağlı kutup akısı $\Phi$ aynı anda yön değiştirir.
              Tork $T = k \cdot \Phi \cdot I_a \propto I_a^2$ olduğundan negatif değerin karesi pozitif kalır ve motor tek bir yönde dönmeye devam eder!
              Dönüş yönünü değiştirmek için sadece armatür veya sadece uyarma sargısının uçları yer değiştirilmelidir!
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div class="font-bold text-indigo-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px]">4</span>
              Adım Motoru & Konum Çözünürlüğü
            </div>
            <p class="text-slate-400 leading-relaxed">
              Adım açısı $\theta_s = \frac{360^\circ}{m \cdot N_r}$. Tur başına adım $S = m \cdot N_r$. Devir sayısı ise $n = \frac{f \cdot 60}{S}$ [d/d].
              Geri beslemesiz (açık çevrim) hassas pozisyonlama sağlar. Yarım adımda adım açısı yarıya iner, çözünürlük 2 katına çıkar.
            </p>
          </div>
        </div>
      </div>
    </section>
"""
