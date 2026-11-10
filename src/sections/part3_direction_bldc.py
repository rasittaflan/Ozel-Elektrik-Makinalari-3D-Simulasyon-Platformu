PART3_HTML = """
    <!-- ========================================== -->
    <!-- TAB 3: DÖNÜŞ YÖNÜ TAYİNİ & VİDALAMA KURALI -->
    <!-- ========================================== -->
    <section id="tab-direction-lab" class="tab-content hidden space-y-6">
      <!-- Header Banner -->
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Dr. Hakan Kahveci Ders Defteri Sayfa 1 • Temel Elektromanyetik Prensip</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Motor Hangi Yöne Döner? Manyetik Alan, Akım & Vidalama Kuralı Laboratuvarı
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Aşağıdaki laboratuvarda, ders notunuzun ilk sayfasındaki motor kesit çizimi ve $\vec{F} = i(\vec{l}\times\vec{B})$ formülasyonu 
          etkileşimli bir simülatöre dönüştürülmüştür. Kutupları veya akım yönünü değiştirerek kuvvet ve dönüş yönünün nasıl tepki verdiğini anlık olarak gözlemleyin.
        </p>
      </div>

      <!-- Interactive 2D Cross Section & Derivation Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: 2D Interactive Cross-Section Canvas -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-compass-drafting text-cyan-400"></i> Motor Kesiti & Vektör Dağılımı (2D)
            </h3>
            <span id="badgeRotationDir" class="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
              <i class="fa-solid fa-rotate-right"></i> DÖNÜŞ: SAAT İBRELERİ YÖNÜNDE (CW)
            </span>
          </div>

          <!-- 2D Canvas Container -->
          <div class="relative w-full h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 flex items-center justify-center">
            <canvas id="direction2dCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Quick Action Buttons for Direction Experiments -->
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button onclick="flipMagneticPoles()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold flex items-center justify-center gap-1 transition">
              <i class="fa-solid fa-arrows-up-down"></i> Kutupları Değiş ($N \leftrightarrow S$)
            </button>
            <button onclick="flipCurrentDirection()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-300 font-semibold flex items-center justify-center gap-1 transition">
              <i class="fa-solid fa-right-left"></i> Akımı Tersle ($+ \leftrightarrow -$)
            </button>
            <button onclick="resetDirectionLab()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-1 transition">
              <i class="fa-solid fa-rotate-left"></i> Orijinal Hal (Defter)
            </button>
          </div>
        </div>

        <!-- Right: Right-Hand Screw Rule & Step-by-Step KaTeX Derivation -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <i class="fa-solid fa-calculator text-emerald-400"></i> Matematiksel Formülasyon & Vidalama Kuralı İspatı
            </h3>

            <!-- Handwritten Notebook Equation Box -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-cyan-900/60 font-mono text-xs sm:text-sm space-y-2">
              <div class="text-cyan-400 font-bold flex items-center gap-2">
                <i class="fa-solid fa-quote-left"></i> Defterdeki Temel Denklem:
              </div>
              <div class="text-center py-1 text-white text-base">
                $$\vec{F} = i (\vec{l} \times \vec{B})$$
              </div>
              <div class="text-slate-400 text-xs">
                $\vec{l}$: Akım ile aynı yönde tanımlı uzunluk vektörü [m]<br>
                $\vec{B}$: Manyetik akı yoğunluğu vektörü (N kutbundan S kutbuna doğru) [Tesla]<br>
                $\vec{F}$: İletkene etkiyen mekanik Laplace/Lorentz kuvveti [Newton]
              </div>
            </div>

            <!-- Dynamic Slot 1 & Slot 2 Analysis -->
            <div class="space-y-3 text-xs sm:text-sm">
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div class="font-bold text-yellow-300 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-yellow-950 border border-yellow-800 flex items-center justify-center text-[10px]">1</span>
                  1 Nolu Oluktaki Sargıya Etkiyen Kuvvet ($\vec{F}_1$):
                </div>
                <p id="analysisSlot1" class="text-slate-300 leading-relaxed text-xs">
                  1 nolu olukta akım <strong>sayfa düzleminden DIŞARI ($\odot$)</strong> doğrudur ($\vec{l}_1 = +z$). 
                  Manyetik alan $\vec{B}$ Kuzeyden Güneye <strong>AŞAĞI ($\downarrow$)</strong> yönlüdür ($\vec{B} = -y$).<br>
                  Vidalama kuralına göre: Sağ elin 4 parmağı $\odot$ yönünden $\downarrow$ yönüne büküldüğünde, başparmak 
                  <strong class="text-emerald-400">SOLDAN SAĞA ($\rightarrow$, $+x$)</strong> gösterir!
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div class="font-bold text-yellow-300 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-yellow-950 border border-yellow-800 flex items-center justify-center text-[10px]">2</span>
                  2 Nolu Oluktaki Sargıya Etkiyen Kuvvet ($\vec{F}_2$):
                </div>
                <p id="analysisSlot2" class="text-slate-300 leading-relaxed text-xs">
                  2 nolu olukta akım <strong>sayfa düzlemine İÇERİ ($\otimes$)</strong> doğrudur ($\vec{l}_2 = -z$). 
                  Manyetik alan $\vec{B}$ yine <strong>AŞAĞI ($\downarrow$)</strong> yönlüdür.<br>
                  Vidalama kuralına göre: $\vec{l}_2 \times \vec{B}$ çarpımı başparmağı 
                  <strong class="text-emerald-400">SAĞDAN SOLA ($\leftarrow$, $-x$)</strong> yöneltir!
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-1.5">
                <div class="font-bold text-cyan-300 flex items-center gap-1.5">
                  <i class="fa-solid fa-arrows-spin text-cyan-400"></i> Net Döndürme Momenti (Tork $\vec{T}$):
                </div>
                <p id="analysisTorque" class="text-slate-200 leading-relaxed text-xs">
                  Üstteki iletkene sağa ($\rightarrow$), alttaki iletkene sola ($\leftarrow$) etkiyen kuvvet çifti rotor merkezine göre saat ibreleri yönünde bir döndürme torku yaratır:
                  $$\vec{T} = \vec{r}_1 \times \vec{F}_1 + \vec{r}_2 \times \vec{F}_2 \implies \mathbf{CW\ (Saat\ Yönü)}$$
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Notice -->
          <div class="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Fırçalar 180° sonra akımı ters çevirerek dönüşün sürekliliğini garanti eder.</span>
            <button onclick="syncDirectionWith3D()" class="px-2.5 py-1 rounded bg-cyan-900/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-bold transition">
              3D Sahneye Aktar <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- TAB 4: BLDC & 6-ADIM KOMÜTASYON LAB -->
    <!-- ========================================== -->
    <section id="tab-bldc" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <i class="fa-solid fa-microchip"></i>
          <span>Bölüm 1 & 2 • Sayfa 10-29 • Fırçasız DA Motorları ve Evirici Sürüşü</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          BLDC 6-Adım Elektronik Komütasyon & Hall Sensörleri Laboratuvarı
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Klasik motorlardaki fırça-kollektör düzeneği yerine 120° yerleştirilmiş 3 adet Hall sensörü ($H_1, H_2, H_3$) rotor pozisyonunu algılar.
          6 anahtarlı 3-fazlı evirici köprüsü (inverter) her 60° elektriksel açıda ilgili iki fazı sırayla enerjilendirir.
        </p>
      </div>

      <!-- Inverter Bridge & Hall Table Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: 3-Phase Inverter Bridge Schematic (Span 2) -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-network-wired text-cyan-400"></i> 3-Fazlı Evirici Köprüsü (Inverter Bridge) & İletim Yolları
            </h3>
            <div class="flex items-center space-x-2 text-xs font-mono">
              <span class="text-slate-400">Mevcut Adım:</span>
              <span id="bldcCurrentStepLabel" class="font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">Adım 1 ($A^+ B^-$)</span>
            </div>
          </div>

          <!-- Schematic Canvas / Visualizer -->
          <div class="relative w-full h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <canvas id="bldcBridgeCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Step Navigation Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex items-center space-x-2">
              <button onclick="prevBldcStep()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition">
                <i class="fa-solid fa-backward-step"></i> Önceki Adım
              </button>
              <button id="btnBldcAutoPlay" onclick="toggleBldcAutoPlay()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition">
                <i class="fa-solid fa-play"></i> Otomatik Komütasyon
              </button>
              <button onclick="nextBldcStep()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition">
                Sonraki Adım <i class="fa-solid fa-forward-step"></i>
              </button>
            </div>

            <div class="flex items-center space-x-2 text-xs">
              <span class="text-slate-400">Yön:</span>
              <button id="bldcDirCW" onclick="setBldcDirection(1)" class="px-2.5 py-1 rounded bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold transition">CW (1-2-3-4-5-6)</button>
              <button id="bldcDirCCW" onclick="setBldcDirection(-1)" class="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold transition">CCW (6-5-4-3-2-1)</button>
            </div>
          </div>
        </div>

        <!-- Right: 120° Hall Sensor Truth Table & Logic -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <i class="fa-solid fa-table-cells text-indigo-400"></i> Hall Sensörleri Doğruluk Tablosu (120°)
          </h3>

          <div class="overflow-x-auto text-xs font-mono">
            <table class="w-full text-center border-collapse">
              <thead>
                <tr class="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th class="py-2 px-1">Adım</th>
                  <th class="py-2 px-1">Açı</th>
                  <th class="py-2 px-1 text-cyan-400">H1</th>
                  <th class="py-2 px-1 text-cyan-400">H2</th>
                  <th class="py-2 px-1 text-cyan-400">H3</th>
                  <th class="py-2 px-1 text-emerald-400">Aktif Faz</th>
                </tr>
              </thead>
              <tbody id="bldcTruthTableBody" class="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                <tr id="row-step-1" class="bg-cyan-950/50 text-cyan-300 font-bold">
                  <td class="py-1.5">1</td>
                  <td>0° - 60°</td>
                  <td>1</td><td>0</td><td>1</td>
                  <td class="text-emerald-400 font-bold">A+ B-</td>
                </tr>
                <tr id="row-step-2">
                  <td class="py-1.5">2</td>
                  <td>60° - 120°</td>
                  <td>1</td><td>0</td><td>0</td>
                  <td class="text-emerald-400">A+ C-</td>
                </tr>
                <tr id="row-step-3">
                  <td class="py-1.5">3</td>
                  <td>120° - 180°</td>
                  <td>1</td><td>1</td><td>0</td>
                  <td class="text-emerald-400">B+ C-</td>
                </tr>
                <tr id="row-step-4">
                  <td class="py-1.5">4</td>
                  <td>180° - 240°</td>
                  <td>0</td><td>1</td><td>0</td>
                  <td class="text-emerald-400">B+ A-</td>
                </tr>
                <tr id="row-step-5">
                  <td class="py-1.5">5</td>
                  <td>240° - 300°</td>
                  <td>0</td><td>1</td><td>1</td>
                  <td class="text-emerald-400">C+ A-</td>
                </tr>
                <tr id="row-step-6">
                  <td class="py-1.5">6</td>
                  <td>300° - 360°</td>
                  <td>0</td><td>0</td><td>1</td>
                  <td class="text-emerald-400">C+ B-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div class="font-bold text-slate-300">Komütasyon Kuralı:</div>
            <div>• Her adımda 2 faz iletimde, 1 faz boştadır (120° iletim).</div>
            <div>• Tork ifadesi: $T_e = \frac{e_a i_a + e_b i_b + e_c i_c}{\omega_m} = 2 k_t I$.</div>
          </div>
        </div>
      </div>

      <!-- Live Oscilloscope: Trapezoidal Back-EMF & Current Waveforms -->
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-wave-square text-emerald-400"></i> Dijital Osiloskop: 3-Faz Trapezoidal Ters EMK & Faz Akımları
          </h3>
          <span class="text-xs font-mono text-slate-400">Defter Sayfa 8 & 20 Osiloskop Ölçümleri</span>
        </div>
        <div class="w-full h-[220px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
          <canvas id="bldcOscilloscopeCanvas" class="w-full h-full"></canvas>
        </div>
      </div>
    </section>
"""
