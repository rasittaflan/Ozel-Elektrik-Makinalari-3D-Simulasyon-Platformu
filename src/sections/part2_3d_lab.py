PART2_HTML = """
    <!-- ========================================== -->
    <!-- TAB 2: 3D MOTOR & VEKTÖR LABORATUVARI -->
    <!-- ========================================== -->
    <section id="tab-3d-lab" class="tab-content hidden space-y-6">
      <!-- 3D Viewport & Control Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Left: 3D Canvas Viewport (Span 3) -->
        <div class="lg:col-span-3 glass-card rounded-2xl overflow-hidden border-slate-800 flex flex-col relative shadow-2xl">
          <!-- Viewport Header Toolbar -->
          <div class="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></span>
              <span class="text-xs font-mono font-bold text-white uppercase tracking-wider">3D Fotogerçekçi Motor & Vektör Sahnesi</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Three.js WebGL</span>
            </div>

            <!-- Camera View Presets -->
            <div class="flex items-center space-x-1 text-xs">
              <span class="text-slate-400 text-[11px] mr-1 hidden sm:inline">Kamera:</span>
              <button onclick="setCameraView('iso')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition" title="İzometrik Görünüm">İzometrik</button>
              <button onclick="setCameraView('front')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition" title="Ön Kesit Görünümü">Ön (Kutup Kesiti)</button>
              <button onclick="setCameraView('top')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition" title="Üstten Görünüm">Üst</button>
              <button onclick="setCameraView('side')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition" title="Mil Boyunca Yan">Yan (Mil)</button>
              <button onclick="resetCamera()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition" title="Kamerayı Sıfırla"><i class="fa-solid fa-arrows-rotate"></i></button>
            </div>
          </div>

          <!-- 3D Canvas Container -->
          <div class="relative w-full h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden" id="canvas3dContainer">
            <canvas id="motor3dCanvas" class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>

            <!-- 3D Floating Vector Legend Overlay -->
            <div class="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs font-mono space-y-1.5 shadow-xl pointer-events-none select-none">
              <div class="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group text-cyan-400"></i> Aktif 3D Vektörler
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400"></span>
                <span class="text-slate-300">Manyetik Akı ($\vec{B}$): <strong id="hudFlux" class="text-cyan-400">0.85 T</strong></span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-yellow-400 inline-block shadow-sm shadow-yellow-400"></span>
                <span class="text-slate-300">İletken Akımı ($\vec{I}$): <strong id="hudCurrent" class="text-yellow-400">5.0 A</strong></span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400"></span>
                <span class="text-slate-300">Lorentz Kuvveti ($\vec{F}$): <strong id="hudForce" class="text-emerald-400">4.25 N</strong></span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-indigo-400 inline-block shadow-sm shadow-indigo-400"></span>
                <span class="text-slate-300">Açısal Hız ($\vec{\omega}$): <strong id="hudOmega" class="text-indigo-400">125.6 rad/s</strong></span>
              </div>
            </div>

            <!-- 3D Right-Hand Screw Rule Gizmo Badge in Top-Right -->
            <div class="absolute top-4 right-4 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-800/80 text-xs font-mono shadow-xl max-w-[210px] pointer-events-none select-none">
              <div class="font-bold text-cyan-300 text-[11px] flex items-center gap-1 mb-1">
                <i class="fa-solid fa-hand"></i> Vidalama Kuralı Gizmo
              </div>
              <div class="text-[10px] text-slate-300 leading-tight space-y-1">
                <div>$\vec{F} = i(\vec{l}\times\vec{B})$</div>
                <div class="text-yellow-400">İşaret parmağı $\rightarrow$ $\vec{l}$ (Akım)</div>
                <div class="text-cyan-400">Orta parmak $\rightarrow$ $\vec{B}$ (Manyetik Alan)</div>
                <div class="text-emerald-400 font-bold">Başparmak $\rightarrow$ $\vec{F}$ (Kuvvet)</div>
              </div>
            </div>

            <!-- Viewport Bottom Status Bar -->
            <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
              <div class="flex items-center space-x-2">
                <i class="fa-solid fa-circle-info text-cyan-400"></i>
                <span>Sol Tık: Döndür • Sağ Tık: Kaydır • Tekerlek: Yakınlaş/Uzaklaş</span>
              </div>
              <div class="flex items-center space-x-3">
                <span>Rotor Açısı: <strong id="hudRotorAngle" class="text-white">0.0°</strong></span>
                <span>Elektriksel Açı: <strong id="hudElecAngle" class="text-cyan-300">0.0°</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: 3D Motor Controls Panel (Span 1) -->
        <div class="space-y-4">
          <!-- Main Drive Card -->
          <div class="glass-card rounded-2xl p-5 border-slate-800 space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <i class="fa-solid fa-sliders text-cyan-400"></i> Sürüş & Parametreler
            </h3>

            <!-- Run / Pause / Step Controls -->
            <div class="grid grid-cols-3 gap-2">
              <button id="btnMotorPlay" onclick="toggleMotorPlay()" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> <span id="btnMotorPlayText">Durdur</span>
              </button>
              <button onclick="stepMotorCommutation()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1 transition" title="1 Adım Komütasyon İlerle">
                <i class="fa-solid fa-forward-step"></i> Adım
              </button>
              <button onclick="resetMotorPosition()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition" title="Açıyı Sıfırla">
                <i class="fa-solid fa-rotate-left"></i> Sıfırla
              </button>
            </div>

            <!-- Direction Toggle Buttons -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-300">Dönüş Yönü (Polarite):</label>
              <div class="grid grid-cols-2 gap-2">
                <button id="btnDirCW" onclick="setMotorDirection(1)" class="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition">
                  <i class="fa-solid fa-rotate-right"></i> CW (Saat)
                </button>
                <button id="btnDirCCW" onclick="setMotorDirection(-1)" class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center gap-1 transition">
                  <i class="fa-solid fa-rotate-left"></i> CCW (Ters)
                </button>
              </div>
            </div>

            <!-- Speed Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Rotor Hızı ($n$):</span>
                <span id="labelSpeed" class="font-mono font-bold text-cyan-400">1200 d/d</span>
              </div>
              <input type="range" id="sliderSpeed" min="0" max="3000" step="50" value="1200" oninput="updateMotorSpeed(this.value)" class="w-full">
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 d/d</span>
                <span>1500 d/d</span>
                <span>3000 d/d</span>
              </div>
            </div>

            <!-- Armature Current Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">İletken Akımı ($I$):</span>
                <span id="labelCurrent" class="font-mono font-bold text-yellow-400">5.0 A</span>
              </div>
              <input type="range" id="sliderCurrent" min="0.5" max="20" step="0.5" value="5.0" oninput="updateMotorCurrent(this.value)" class="w-full">
            </div>

            <!-- Magnetic Flux Density Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Manyetik Alan Akısı ($B$):</span>
                <span id="labelFlux" class="font-mono font-bold text-cyan-400">0.85 T</span>
              </div>
              <input type="range" id="sliderFlux" min="0.1" max="2.0" step="0.05" value="0.85" oninput="updateMotorFlux(this.value)" class="w-full">
            </div>

            <!-- Exploded View Slider -->
            <div class="space-y-1 pt-2 border-t border-slate-800">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400 flex items-center gap-1">
                  <i class="fa-solid fa-arrows-split-up-and-left text-rose-400"></i> Parçalanmış Görünüm:
                </span>
                <span id="labelExplode" class="font-mono font-bold text-rose-400">0%</span>
              </div>
              <input type="range" id="sliderExplode" min="0" max="100" step="1" value="0" oninput="updateExplodedView(this.value)" class="w-full">
            </div>
          </div>

          <!-- Display & Vector Toggles Card -->
          <div class="glass-card rounded-2xl p-5 border-slate-800 space-y-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <i class="fa-solid fa-eye text-indigo-400"></i> Görünüm & Vektör Filtresi
            </h3>
            <div class="space-y-2 text-xs">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkShowField" checked onchange="toggleVectorLayer('field', this.checked)" class="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0">
                <span class="text-slate-300">Manyetik Alan Vektörleri ($\vec{B}$)</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkShowCurrent" checked onchange="toggleVectorLayer('current', this.checked)" class="rounded bg-slate-800 border-slate-700 text-yellow-500 focus:ring-0">
                <span class="text-slate-300">İletken Akım Okları ($\vec{I}$)</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkShowForce" checked onchange="toggleVectorLayer('force', this.checked)" class="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0">
                <span class="text-slate-300">Lorentz Kuvvet Vektörleri ($\vec{F}$)</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkShowFluxLines" checked onchange="toggleVectorLayer('fluxLines', this.checked)" class="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0">
                <span class="text-slate-300">Akı Çizgileri Animasyonu</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkTransparent" onchange="toggleTransparentCasing(this.checked)" class="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0">
                <span class="text-slate-300">Şeffaf Gövde (X-Ray Modu)</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="chkCutaway" onchange="toggleCutaway(this.checked)" class="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0">
                <span class="text-slate-300">Çeyrek Kesit (Hava Aralığı İçi)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Calculated Engineering Parameters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="glass-card rounded-xl p-4 border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Teğetsel Lorentz Kuvveti ($F$)</div>
          <div id="calcForceVal" class="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">4.25 N</div>
          <div class="text-[11px] text-slate-500 mt-1 font-mono">$F = B \cdot I \cdot l$ ($l=10\text{ cm}$)</div>
        </div>
        <div class="glass-card rounded-xl p-4 border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Elektromanyetik Tork ($T_e$)</div>
          <div id="calcTorqueVal" class="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-1">0.34 N·m</div>
          <div class="text-[11px] text-slate-500 mt-1 font-mono">$T_e = 2 \cdot r \cdot F$ ($r=4\text{ cm}$)</div>
        </div>
        <div class="glass-card rounded-xl p-4 border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Mekanik Çıkış Gücü ($P_{m}$)</div>
          <div id="calcPowerVal" class="text-xl sm:text-2xl font-black font-mono text-indigo-400 mt-1">42.7 W</div>
          <div class="text-[11px] text-slate-500 mt-1 font-mono">$P_m = T_e \cdot \omega$</div>
        </div>
        <div class="glass-card rounded-xl p-4 border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Endüklenen Ters EMK ($E$)</div>
          <div id="calcEmfVal" class="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">8.54 V</div>
          <div class="text-[11px] text-slate-500 mt-1 font-mono">$E = k_e \cdot \omega$ ($k_e \approx 0.068$)</div>
        </div>
      </div>
    </section>
"""
