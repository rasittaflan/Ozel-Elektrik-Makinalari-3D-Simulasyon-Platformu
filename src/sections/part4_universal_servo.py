PART4_HTML = """
    <!-- ========================================== -->
    <!-- TAB 5: ÜNİVERSAL MOTOR AC/DC LABORATUVARI -->
    <!-- ========================================== -->
    <section id="tab-universal" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <i class="fa-solid fa-plug"></i>
          <span>Bölüm 2 • Sayfa 30-44 • Üniversal (AC/DC Seri) Motorlar</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Üniversal Motor AC & DC Çalışma Davranışı, Empedans Üçgeni ve Dönüş Yönü
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Üniversal motor, hem doğru akım (DC) hem de alternatif akım (AC) ile çalışabilen seri uyarmalı bir motordur.
          AC şebekede akım yön değiştirdiğinde hem armatürdeki akım hem de kutup sargısındaki akı ($\Phi$) aynı anda yön değiştirdiği için 
          tork $T = k \Phi I_a \propto I_a^2$ daima pozitif yönde üretilir.
        </p>
      </div>

      <!-- Phasor Diagram & Equivalent Circuit Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: Phasor Triangle & T-N Characteristics Canvas -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-emerald-400"></i> AC Gerilim Üçgeni (Fazör Diyagramı) & Devir Eğrisi
            </h3>
            <span class="text-xs font-mono text-cyan-400">$V_{ac}^2 = (E_a + IR)^2 + (IX_L)^2$</span>
          </div>

          <!-- Canvas for Phasor Diagram -->
          <div class="relative w-full h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <canvas id="universalPhasorCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Polarite Değişimi Deney Düğmeleri -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div class="text-xs font-bold text-slate-200">Dönüş Yönünü Değiştirme Deneyi (Sayfa 30 Prensibi):</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button onclick="testUniversalPolarity('line')" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition">
                <i class="fa-solid fa-arrows-left-right"></i> Şebeke Uçlarını Çevir ($L \leftrightarrow N$)
              </button>
              <button onclick="testUniversalPolarity('armature')" class="px-3 py-2 rounded-lg bg-cyan-900/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold transition">
                <i class="fa-solid fa-rotate"></i> Sadece Armatür Uçlarını Çevir
              </button>
            </div>
            <div id="universalDirectionResult" class="text-xs font-mono text-emerald-400 font-semibold pt-1">
              • Şebeke uçlarını ters çevirmek yönü DEĞİŞTİRMEZ (Her iki akı da ters döner). Yönü değiştirmek için sadece armatür uçları ters bağlanmalıdır!
            </div>
          </div>
        </div>

        <!-- Right: Interactive Problem Solver (Notebook Page 34-35 Exact Numbers) -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-calculator text-amber-400"></i> Sayfa 34-35 Çözümlü Problem Hesaplayıcısı
            </h3>
            <span class="text-xs font-mono text-amber-400">120V / 2000 d/d Örneği</span>
          </div>

          <!-- Parameter Sliders -->
          <div class="space-y-3 text-xs">
            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Besleme Gerilimi ($V$):</span>
                <span id="labelUnivV" class="font-mono font-bold text-white">120 V</span>
              </div>
              <input type="range" id="sliderUnivV" min="60" max="240" step="5" value="120" oninput="calculateUniversalMotor()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Çekilen Akım ($I$):</span>
                <span id="labelUnivI" class="font-mono font-bold text-yellow-400">1.5 A</span>
              </div>
              <input type="range" id="sliderUnivI" min="0.5" max="5.0" step="0.1" value="1.5" oninput="calculateUniversalMotor()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Toplam Direnç ($R = R_a + R_f$):</span>
                <span id="labelUnivR" class="font-mono font-bold text-slate-300">20.0 Ω</span>
              </div>
              <input type="range" id="sliderUnivR" min="5" max="50" step="1" value="20" oninput="calculateUniversalMotor()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Toplam Reaktans ($X_L = \omega L$):</span>
                <span id="labelUnivX" class="font-mono font-bold text-cyan-400">32.0 Ω</span>
              </div>
              <input type="range" id="sliderUnivX" min="5" max="80" step="1" value="32" oninput="calculateUniversalMotor()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">AC Çalışma Devri ($n_{ac}$):</span>
                <span id="labelUnivNac" class="font-mono font-bold text-emerald-400">2000 d/d</span>
              </div>
              <input type="range" id="sliderUnivNac" min="1000" max="5000" step="100" value="2000" oninput="calculateUniversalMotor()" class="w-full">
            </div>
          </div>

          <!-- Dynamic Results Box -->
          <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
            <div class="text-cyan-400 font-bold border-b border-slate-800 pb-1">Hesaplama Sonuçları:</div>
            <div class="grid grid-cols-2 gap-2 text-slate-300">
              <div>AC Ters EMK ($E_{ac}$): <strong id="resUnivEac" class="text-white">79.8 V</strong></div>
              <div>DC Ters EMK ($E_{dc}$): <strong id="resUnivEdc" class="text-white">90.0 V</strong></div>
              <div>Güç Katsayısı ($\cos\varphi$): <strong id="resUnivCosPhi" class="text-amber-400">0.915</strong></div>
              <div>DC Devir Sayısı ($n_{dc}$): <strong id="resUnivNdc" class="text-emerald-400">2255 d/d</strong></div>
              <div>Giriş Gücü ($P_{gir}$): <strong id="resUnivPin" class="text-indigo-400">164.7 W</strong></div>
              <div>Verim ($\eta$): <strong id="resUnivEff" class="text-cyan-400">72.7 %</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- TAB 6: SERVO SİSTEMLER, ENKODER & RESOLVER -->
    <!-- ========================================== -->
    <section id="tab-servo" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <i class="fa-solid fa-gauge-high"></i>
          <span>Bölüm 3 • Sayfa 45-53 • Servo Sistemlerde Konum Algılayıcılar</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Servo Motorlar, Artımsal & Mutlak Enkoderler ve Resolver Laboratuvarı
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Servo motorların arkasına takılan enkoder veya resolver algılayıcıları milin anlık konum ve hız bilgisini geri besleme olarak sürücüye aktarır.
          Artımsal (Incremental) enkoderde A ve B sinyalleri arasındaki 90° kuadratür faz farkı ile yön algılanır.
          Resolver ise döner transformatör yapısıyla en zorlu endüstriyel ortamlarda mutlak açı çözümü üretir.
        </p>
      </div>

      <!-- Encoder & Resolver Dual Showcase Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: Incremental Encoder Quadrature Simulator -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-compact-disc text-cyan-400"></i> Artımsal (Incremental) Enkoder & Kuadratür Sinyalleri
            </h3>
            <span id="encoderDirBadge" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              CW (A, B'den 90° Önce)
            </span>
          </div>

          <!-- Rotating Disc & Pulse Waveforms Canvas -->
          <div class="relative w-full h-[280px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <canvas id="encoderCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Encoder Controls & Resolution Calculator -->
          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-slate-400">Enkoder Çözünürlüğü (PPR):</label>
                <select id="selectEncoderPpr" onchange="updateEncoderSim()" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                  <option value="1000">1000 PPR (0.3600°)</option>
                  <option value="2048">2048 PPR (0.1758°)</option>
                  <option value="2500">2500 PPR (0.1440°)</option>
                  <option value="4096">4096 PPR (0.0879°)</option>
                  <option value="4200" selected>4200 PPR (0.0857° - Defter)</option>
                  <option value="8192">8192 PPR (0.0439°)</option>
                  <option value="10000">10000 PPR (0.0360°)</option>
                </select>
              </div>
              <div>
                <label class="text-slate-400">Dönüş Yönü Simülasyonu:</label>
                <div class="grid grid-cols-2 gap-1 mt-1">
                  <button id="btnEncCW" onclick="setEncoderDir(1)" class="px-2 py-2 rounded-lg bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold transition">CW (İleri)</button>
                  <button id="btnEncCCW" onclick="setEncoderDir(-1)" class="px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold transition">CCW (Geri)</button>
                </div>
              </div>
            </div>

            <!-- Quadrature Edge Multiplier Info -->
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex justify-between items-center">
              <div>Kuadratür 4X Çözünürlük: <strong id="enc4xCount" class="text-cyan-400">16,800 darbe/tur</strong></div>
              <div>1 Pals Frekansı: <strong id="encPulseFreq" class="text-emerald-400">84.0 kHz</strong> (@1200 d/d)</div>
            </div>
          </div>
        </div>

        <!-- Right: Resolver (Analog Transformer) Modulator Simulator -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-atom text-indigo-400"></i> Resolver (Döner Transformatör) Modülasyonu
            </h3>
            <span class="text-xs font-mono text-indigo-400">Sayfa 50 İncelemesi</span>
          </div>

          <!-- Canvas for Resolver Modulated Waveforms & Lissajous -->
          <div class="relative w-full h-[280px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <canvas id="resolverCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Mathematical Formulations of Resolver -->
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
            <div class="text-indigo-400 font-bold">Resolver Çıkış Denklemleri:</div>
            <div class="space-y-1 text-[11px]">
              <div>• Rotor Uyarma: $V_{ref} = V_m \sin(\omega_c t)$ (Taşıyıcı 5-10 kHz)</div>
              <div>• Sinüs Sargısı: $V_{sin} = V_m \sin(\theta) \cdot \sin(\omega_c t)$</div>
              <div>• Kosinüs Sargısı: $V_{cos} = V_m \cos(\theta) \cdot \sin(\omega_c t)$</div>
              <div class="text-emerald-400 font-bold">• Mutlak Açı Çözümü: $\theta = \arctan\left(\frac{V_{sin}}{V_{cos}}\right)$</div>
            </div>
          </div>
        </div>
      </div>
    </section>
"""
