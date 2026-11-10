PART5_HTML = """
    <!-- ========================================== -->
    <!-- TAB 7: ADIM MOTORLARI (STEP MOTORS) LAB -->
    <!-- ========================================== -->
    <section id="tab-stepper" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <i class="fa-solid fa-gears"></i>
          <span>Bölüm 4 • Sayfa 54-64 • Adım Motorları & Sürüş Yöntemleri</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Adım Motorları (Step Motors), Mikro Adımlama ve Frekans-Hız Laboratuvarı
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Adım motorları, mikrodenetleyiciden gelen her bir dijital pals ile sabit bir açısal adım ($\theta_s$) atan fırçasız, senkron makinelerdir.
          Açık çevrim kontrol edilmelerine rağmen adımı kaçırmadıkları sürece kesin pozisyonlama sağlarlar.
        </p>
      </div>

      <!-- Stepper Simulator & Controls Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: 2D Stepper Excitation & Rotor Teeth Canvas -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-circle-dot text-amber-400"></i> Rotor Dişleri & Faz Sargıları Canlı Uyarma Şeması
            </h3>
            <span id="stepModeBadge" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
              Tam Adım (Full-Step)
            </span>
          </div>

          <!-- Stepper Canvas -->
          <div class="relative w-full h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <canvas id="stepperCanvas" class="w-full h-full"></canvas>
          </div>

          <!-- Step Drive Modes Selector -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-300">Sürme Yöntemi (Modu):</label>
            <div class="grid grid-cols-4 gap-2 text-xs">
              <button onclick="setStepperDriveMode('wave')" id="btnStepWave" class="px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition">
                Dalga (1 Faz)
              </button>
              <button onclick="setStepperDriveMode('full')" id="btnStepFull" class="px-2 py-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 font-bold transition">
                Tam Adım (2 Faz)
              </button>
              <button onclick="setStepperDriveMode('half')" id="btnStepHalf" class="px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition">
                Yarım (Half-Step)
              </button>
              <button onclick="setStepperDriveMode('micro')" id="btnStepMicro" class="px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition">
                Mikro Adım (1/8)
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Mathematical Speed-Frequency & Tooth Calculator -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-calculator text-cyan-400"></i> Adım Açısı & Frekans-Hız Hesaplayıcısı
            </h3>
            <span class="text-xs font-mono text-cyan-400">Defter Sayfa 58-60</span>
          </div>

          <!-- Interactive Stepper Inputs -->
          <div class="space-y-3 text-xs">
            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Faz Sayısı ($m$):</span>
                <span id="labelStepM" class="font-mono font-bold text-cyan-400">4 Faz</span>
              </div>
              <input type="range" id="sliderStepM" min="2" max="5" step="1" value="4" oninput="calculateStepper()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Rotor Diş Sayısı ($N_r$):</span>
                <span id="labelStepNr" class="font-mono font-bold text-amber-400">50 Diş</span>
              </div>
              <input type="range" id="sliderStepNr" min="10" max="100" step="5" value="50" oninput="calculateStepper()" class="w-full">
            </div>

            <div>
              <div class="flex justify-between">
                <span class="text-slate-400">Hedef Motor Hızı ($n$):</span>
                <span id="labelStepRpm" class="font-mono font-bold text-emerald-400">1200 d/d</span>
              </div>
              <input type="range" id="sliderStepRpm" min="60" max="3000" step="60" value="1200" oninput="calculateStepper()" class="w-full">
            </div>
          </div>

          <!-- Dynamic Output Card -->
          <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
            <div class="text-amber-400 font-bold border-b border-slate-800 pb-1">Hesaplanan Değerler:</div>
            <div class="grid grid-cols-2 gap-2 text-slate-300">
              <div>Adım Açısı ($\theta_s$): <strong id="resStepAngle" class="text-white">1.80°</strong></div>
              <div>Tur Başına Adım ($S$): <strong id="resStepCount" class="text-white">200 adım/tur</strong></div>
              <div>Gereken Frekans ($f_{step}$): <strong id="resStepFreq" class="text-emerald-400">4000 Hz (4 kHz)</strong></div>
              <div>Adım Periyodu ($T_{step}$): <strong id="resStepPeriod" class="text-cyan-400">250 µs</strong></div>
            </div>
            <div class="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
              Formüller: $\theta_s = \frac{360^\circ}{m \cdot N_r}$, $S = \frac{360^\circ}{\theta_s}$, $f = \frac{n \cdot S}{60}$.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- TAB 8: SINAV SORULARI & ÇÖZÜM BANKASI -->
    <!-- ========================================== -->
    <section id="tab-exam-bank" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-amber-400">
          <i class="fa-solid fa-file-signature"></i>
          <span>Dr. Hakan Kahveci Özel Elektrik Makinaları • Çıkmış & Model Sınav Soruları</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Sınav Soruları, Sayısal Problemler & Adım Adım Akademik Çözüm Bankası
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Ders defterindeki tüm çizimli ve sayısal sorular aşağıda toplanmıştır.
          Parametreleri değiştirerek yeni senaryolar türetebilir, detaylı çözümü inceleyebilir ve 
          <strong>"Simülatörde Göster"</strong> düğmesiyle verileri anında 3D laboratuvara aktarabilirsiniz.
        </p>
      </div>

      <!-- 5 Comprehensive Questions Accordion / List -->
      <div class="space-y-6">
        
        <!-- Question 1: Notebook Page 1 (Uploaded Image Twin) -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-xs text-cyan-300">Q1</span>
              <h3 class="text-base font-bold text-white">Motor Hangi Yöne Döner? Manyetik Kutup ve Akım Vektörü ile Yön İspatı</h3>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">Defter Sayfa 1 • 20 Puan</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <strong>Soru Metni:</strong><br>
            Şekildeki 2 kutuplu DA makinesinde statorun üst kısmında N, alt kısmında S kutbu bulunmaktadır.
            Rotorun 1 nolu oluğundaki sargıdan sayfa düzleminden dışarı doğru ($\odot$) $I_1$ akımı, 
            2 nolu oluğundaki sargıdan ise sayfa düzlemine içeri doğru ($\otimes$) $I_2$ akımı akmaktadır.<br>
            <strong>a)</strong> 1 ve 2 nolu oluktaki iletkenlere etkiyen Laplace/Lorentz kuvvetlerinin büyüklük ve yönlerini vidalama kuralını kullanarak vektörel olarak bulunuz.<br>
            <strong>b)</strong> Rotorun hangi yöne (CW / CCW) döneceğini net döndürme momenti denklemini yazarak açıklayınız.<br>
            <strong>c)</strong> Besleme geriliminin polaritesi ters çevrilirse ne olur? Hem besleme gerilimi hem de mıknatıs kutupları aynı anda ters çevrilirse ne olur?
          </div>

          <!-- Step-by-Step KaTeX Solution Box -->
          <div class="p-5 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-3 text-xs sm:text-sm font-mono">
            <div class="text-cyan-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Akademik Çözüm Adımları:
            </div>
            <div class="text-slate-300 space-y-2">
              <div><strong>a) 1 ve 2 Nolu Oluk Kuvvetleri:</strong></div>
              <div>$\vec{F} = i (\vec{l} \times \vec{B})$ Lorentz formülü uygulanır. Koordinat sisteminde $+x$ sağa, $+y$ yukarı, $+z$ sayfa dışına tanımlansın.</div>
              <div>• Manyetik alan vektörü N'den S'ye doğrudur: $\vec{B} = -B \hat{j}$ (Aşağı yönlü).</div>
              <div>• 1 nolu olukta akım sayfa dışınadır: $\vec{l}_1 = +l \hat{k}$.</div>
              <div>$$\vec{F}_1 = i (l \hat{k} \times (-B \hat{j})) = -i l B (\hat{k} \times \hat{j}) = -i l B (-\hat{i}) = +i l B \hat{i}\quad \implies \mathbf{Soldan\ Sa\check{g}a\ (\rightarrow)}$$</div>
              <div>• 2 nolu olukta akım sayfa içincedir: $\vec{l}_2 = -l \hat{k}$.</div>
              <div>$$\vec{F}_2 = i (-l \hat{k} \times (-B \hat{j})) = +i l B (\hat{k} \times \hat{j}) = -i l B \hat{i}\quad \implies \mathbf{Sa\check{g}dan\ Sola\ (\leftarrow)}$$</div>

              <div class="pt-2"><strong>b) Net Döndürme Momenti (Tork):</strong></div>
              <div>$\vec{r}_1$ vektörü merkezden oluk 1'e ($+y$ ve $-x$ yönünde), $\vec{r}_2$ ise ($ -y$ ve $+x$ yönünde) uzanır.</div>
              <div>Üstteki kuvvet sağa, alttaki kuvvet sola iter. Mil merkezine göre her iki tork da aynı yönde toplanır:</div>
              <div>$$\vec{T} = \vec{r}_1 \times \vec{F}_1 + \vec{r}_2 \times \vec{F}_2 = (r F_1 + r F_2) \hat{k}_{cw}\quad \implies \mathbf{Saat\ \dot{I}breleri\ Y\ddot{o}n\ddot{u}nde\ (CW)\ D\ddot{o}ner!}$$</div>

              <div class="pt-2"><strong>c) Polarite Değişimleri:</strong></div>
              <div>• Yalnız akım yönü değişirse: $\vec{l}$ ters döner $\implies \vec{F}$ ters döner $\implies$ Motor <strong>CCW (Ters)</strong> döner.</div>
              <div>• Hem akım hem manyetik kutuplar aynı anda değişirse: İki eksi birbirini çarparak artı yapar: $(-1) \times (-1) = +1 \implies$ Motor <strong>YİNE CW (Saat Yönünde)</strong> döner!</div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button onclick="switchTab('tab-direction-lab')" class="px-3 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> Yön Simülatöründe Canlı Gör
              </button>
            </div>
          </div>
        </div>

        <!-- Question 2: BLDC 120 Hall Sensor Commutation Sector -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-xs text-emerald-300">Q2</span>
              <h3 class="text-base font-bold text-white">BLDC 120° Hall Sinyalleri, Komütasyon Sektörü ve Evirici Durumu</h3>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">Defter Sayfa 14-22 • 20 Puan</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <strong>Soru Metni:</strong><br>
            3 fazlı, 120° elektriksel yerleşimli Hall sensörlerine sahip bir fırçasız doğru akım (BLDC) motorunun 
            sensör çıkışları bir anda osiloskopta $[H_1, H_2, H_3] = [1, 1, 0]$ olarak ölçülmüştür.<br>
            <strong>a)</strong> Rotor o anda elektriksel olarak hangi açı aralığında (sektörde) bulunmaktadır?<br>
            <strong>b)</strong> Saat yönünde (CW) tork üretmeye devam etmek için 6 transistörlü eviricide hangi üst ve alt transistörler iletimde olmalıdır? Hangi faz boştadır?<br>
            <strong>c)</strong> Motorun dönüş yönünü saat yönünün tersine (CCW) çevirmek için eviriciye uygulanması gereken anahtarlama durumu nedir?
          </div>

          <!-- Solution -->
          <div class="p-5 rounded-xl bg-slate-950 border border-emerald-900/50 space-y-3 text-xs sm:text-sm font-mono">
            <div class="text-emerald-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Akademik Çözüm Adımları:
            </div>
            <div class="text-slate-300 space-y-2">
              <div><strong>a) Sektör Belirleme:</strong></div>
              <div>120° Hall mantık tablosuna göre:</div>
              <div>• Adım 1: $[1, 0, 1] \rightarrow 0^\circ - 60^\circ$</div>
              <div>• Adım 2: $[1, 0, 0] \rightarrow 60^\circ - 120^\circ$</div>
              <div>• <strong>Adım 3: $[1, 1, 0] \rightarrow 120^\circ - 180^\circ$</strong></div>
              <div>Demek ki rotor o anda <strong>3. Sektörde ($120^\circ - 180^\circ$)</strong> bulunmaktadır.</div>

              <div class="pt-2"><strong>b) İletimdeki Anahtarlar ve Boşta Olan Faz:</strong></div>
              <div>3. Adımda motor sargılarına pozitif tork sağlamak için:</div>
              <div>• <strong>B+ Transistörü (Üst Kol)</strong> ve <strong>C- Transistörü (Alt Kol)</strong> iletimdedir.</div>
              <div>• Akım Faz B'den girer, Faz C'den çıkar ($B^+ C^-$).</div>
              <div>• <strong>Faz A tamamen BOŞTADIR (Floating)</strong>. A fazında yamuk şeklinde ters EMK ($e_a$) sıfır geçişi (zero-crossing) yapar.</div>

              <div class="pt-2"><strong>c) CCW Yön Dönüşümü:</strong></div>
              <div>Ters yönde döndürmek için akım polaritesi terslenir: $B^+ C^-$ yerine <strong>$C^+ B^-$</strong> (Adım 6) anahtarlanmalıdır!</div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button onclick="switchTab('tab-bldc')" class="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> BLDC Laboratuvarında Simüle Et
              </button>
            </div>
          </div>
        </div>

        <!-- Question 3: Universal Motor AC vs DC Detailed Calculation -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center font-bold text-xs text-amber-300">Q3</span>
              <h3 class="text-base font-bold text-white">Üniversal Motorda AC vs DC Çalışma, Empedans Üçgeni ve Verim Hesabı</h3>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">Defter Sayfa 34-35 Birebir • 25 Puan</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <strong>Soru Metni (Defterdeki Orijinal Soru):</strong><br>
            Bir üniversal motor $V = 120\text{ V}, 60\text{ Hz}$ alternatif gerilim kaynağına bağlandığında şebekeden $I = 1.5\text{ A}$ akım çekmekte ve $n_{ac} = 2000\text{ d/d}$ hızla dönmektedir.
            Motorun toplam omik direnci $R = R_a + R_f = 20\ \Omega$, toplam endüktif reaktansı ise $X_L = 32\ \Omega$'dur.<br>
            <strong>a)</strong> AC çalışmada endüklenen zıt EMK'yi ($E_{ac}$) ve güç katsayısını ($\cos\varphi$) bulunuz.<br>
            <strong>b)</strong> Bu motor aynı $120\text{ V}$ gerilimli bir DC kaynağa bağlandığında ve yine $1.5\text{ A}$ akım çektiğinde devir sayısı ($n_{dc}$) ne olur?<br>
            <strong>c)</strong> AC ve DC çalışma durumlarındaki mekanik çıkış güçlerini ve elektriksel verimleri karşılaştırınız.
          </div>

          <!-- Solution -->
          <div class="p-5 rounded-xl bg-slate-950 border border-amber-900/50 space-y-3 text-xs sm:text-sm font-mono">
            <div class="text-amber-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Akademik Çözüm Adımları:
            </div>
            <div class="text-slate-300 space-y-2">
              <div><strong>a) AC Zıt EMK ve Güç Katsayısı Hesabı:</strong></div>
              <div>AC gerilim üçgeni bağıntısı: $V_{ac}^2 = (E_{ac} + I R)^2 + (I X_L)^2$</div>
              <div>$120^2 = (E_{ac} + 1.5 \times 20)^2 + (1.5 \times 32)^2$</div>
              <div>$14400 = (E_{ac} + 30)^2 + (48)^2 = (E_{ac} + 30)^2 + 2304$</div>
              <div>$(E_{ac} + 30)^2 = 14400 - 2304 = 12096 \implies E_{ac} + 30 = \sqrt{12096} \approx 109.98\text{ V}$</div>
              <div>$$E_{ac} = 109.98 - 30 = \mathbf{79.98\text{ V}}\quad (\approx 80\text{ V})$$</div>
              <div>Güç Katsayısı: $\cos\varphi = \frac{E_{ac} + I R}{V} = \frac{79.98 + 30}{120} = \frac{109.98}{120} = \mathbf{0.9165}$</div>

              <div class="pt-2"><strong>b) DC Çalışmada Devir Sayısı:</strong></div>
              <div>DC'de reaktans sıfırdır ($X_L = 0$). Zıt EMK doğrudan omik gerilim düşümü çıkarılarak bulunur:</div>
              <div>$$E_{dc} = V_{dc} - I R = 120 - (1.5 \times 20) = 120 - 30 = \mathbf{90.0\text{ V}}$$</div>
              <div>Dönme hızı zıt EMK ile doğru orantılıdır ($E \propto \Phi \cdot n$). Akım aynı kaldığı için manyetik akı $\Phi$ sabittir:</div>
              <div>$$\frac{n_{dc}}{n_{ac}} = \frac{E_{dc}}{E_{ac}} \implies n_{dc} = n_{ac} \cdot \frac{E_{dc}}{E_{ac}} = 2000 \cdot \frac{90.0}{79.98} \approx \mathbf{2250.5\text{ d/d}}$$</div>
              <div class="text-cyan-300">• Yorum: DC beslemede reaktif gerilim düşümü ($I X_L$) ortadan kalktığı için zıt EMK büyür ve motor devri 2000 d/d'den 2250 d/d'ye yükselir!</div>

              <div class="pt-2"><strong>c) Güç ve Verim Kıyaslaması:</strong></div>
              <div>• AC Giriş Gücü: $P_{gir,ac} = V \cdot I \cdot \cos\varphi = 120 \times 1.5 \times 0.9165 = \mathbf{165.0\text{ W}}$</div>
              <div>• AC Mekanik Güç: $P_{çık,ac} = E_{ac} \cdot I = 79.98 \times 1.5 = \mathbf{119.97\text{ W}} \implies \eta_{ac} = \frac{119.97}{165.0} \approx \mathbf{72.7\%}$</div>
              <div>• DC Giriş Gücü: $P_{gir,dc} = V \cdot I = 120 \times 1.5 = \mathbf{180.0\text{ W}}$</div>
              <div>• DC Mekanik Güç: $P_{çık,dc} = E_{dc} \cdot I = 90.0 \times 1.5 = \mathbf{135.0\text{ W}} \implies \eta_{dc} = \frac{135.0}{180.0} = \mathbf{75.0\%}$</div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button onclick="switchTab('tab-universal')" class="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-900 border border-amber-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> Üniversal Motor Simülatöründe Dene
              </button>
            </div>
          </div>
        </div>

        <!-- Question 4: Servo 4096 PPR Encoder & Resolver Calculation -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-xs text-indigo-300">Q4</span>
              <h3 class="text-base font-bold text-white">Servo Enkoder Çözünürlüğü, Pals Frekansı ve Resolver Açı Tayini</h3>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">Defter Sayfa 46-50 • 20 Puan</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <strong>Soru Metni:</strong><br>
            Bir CNC freze tezgahının servo motor miline 4096 PPR (Pulse Per Revolution) çözünürlüğe sahip optik artımsal bir enkoder bağlanmıştır.
            Motor $n = 3000\text{ d/d}$ hızla dönmektedir.<br>
            <strong>a)</strong> Bu enkoderin her bir kare dalga periyodunun temsil ettiği açısal mekanik çözünürlük ($\Delta\theta$) kaç derecedir?<br>
            <strong>b)</strong> Sürücü kuadratür 4X (X4 edge-detect) kod çözme kullandığında bir turda sayılan toplam darbe sayısı kaçtır?<br>
            <strong>c)</strong> A ve B çıkış kanallarından üretilen sinyallerin temel frekansı ($f$) kaç kHz'dir?<br>
            <strong>d)</strong> Aynı servo motorda enkoder yerine resolver kullanılsaydı ve stator sargılarında genlik oranı $\frac{V_{sin}}{V_{cos}} = 0.577$ ölçülseydi rotor açısı ($\theta$) ne olurdu?
          </div>

          <!-- Solution -->
          <div class="p-5 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-3 text-xs sm:text-sm font-mono">
            <div class="text-indigo-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Akademik Çözüm Adımları:
            </div>
            <div class="text-slate-300 space-y-2">
              <div><strong>a) Açısal Çözünürlük:</strong></div>
              <div>$$\Delta\theta = \frac{360^\circ}{PPR} = \frac{360^\circ}{4096} \approx \mathbf{0.08789^\circ}\quad (5.27\text{ ark dakika})$$</div>

              <div class="pt-2"><strong>b) 4X Kuadratür Darbe Sayısı:</strong></div>
              <div>A ve B sinyallerinin hem yükselen hem düşen kenarları sayıldığında bir periyotta 4 kenar tespit edilir:</div>
              <div>$$Count_{4X} = 4 \times PPR = 4 \times 4096 = \mathbf{16384\text{ sayım/tur}}$$</div>
              <div>Efektif çözünürlük: $\Delta\theta_{4X} = \frac{360^\circ}{16384} \approx \mathbf{0.02197^\circ}$.</div>

              <div class="pt-2"><strong>c) Çıkış Sinyali Frekansı ($f$):</strong></div>
              <div>Motor devri $n = 3000\text{ d/d} = \frac{3000}{60} = 50\text{ tur/saniye}$.</div>
              <div>$$f = PPR \times \frac{n}{60} = 4096 \times 50 = 204,800\text{ Hz} = \mathbf{204.8\text{ kHz}}$$</div>

              <div class="pt-2"><strong>d) Resolver Mutlak Açı Hesabı:</strong></div>
              <div>Resolver çıkışları: $V_{sin} = V_m \sin\theta \sin\omega t$ ve $V_{cos} = V_m \cos\theta \sin\omega t$.</div>
              <div>$$\tan\theta = \frac{V_{sin}}{V_{cos}} = 0.577 \implies \theta = \arctan(0.577) = \mathbf{30.0^\circ}$$</div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button onclick="switchTab('tab-servo')" class="px-3 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> Enkoder/Resolver Simülatöründe Gör
              </button>
            </div>
          </div>
        </div>

        <!-- Question 5: Hybrid Stepper Motor Teeth, Step Angle & Speed -->
        <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-xs text-cyan-300">Q5</span>
              <h3 class="text-base font-bold text-white">4 Fazlı 50 Dişli Hibrit Adım Motorunda Devir-Frekans ve Yarım Adım Dönüşümü</h3>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">Defter Sayfa 58-60 Birebir • 15 Puan</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <strong>Soru Metni (Defterdeki Orijinal Soru):</strong><br>
            4 fazlı ($m = 4$), rotorunda 50 adet diş ($N_r = 50$) bulunan hibrit bir adım motoru endüstriyel bir pozisyonlama ünitesinde kullanılmaktadır.<br>
            <strong>a)</strong> Bu motorun tam adım sürüş modundaki adım açısını ($\theta_s$) ve bir turu tamamlamak için gereken adım sayısını ($S$) hesaplayınız.<br>
            <strong>b)</strong> Motor milinin $n = 1200\text{ d/d}$ devirle dönmesi için mikrodenetleyici sürücüsünden uygulanması gereken darbe (pals) frekansı ($f$) kaç kHz olmalıdır?<br>
            <strong>c)</strong> Motor daha hassas çalışması için yarım adım (half-step) moduna geçirilirse yeni adım açısı ve aynı $1200\text{ d/d}$ hızı korumak için gereken pals frekansı ne olur?
          </div>

          <!-- Solution -->
          <div class="p-5 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-3 text-xs sm:text-sm font-mono">
            <div class="text-cyan-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Akademik Çözüm Adımları:
            </div>
            <div class="text-slate-300 space-y-2">
              <div><strong>a) Tam Adım Açısı ve Tur Başına Adım Sayısı:</strong></div>
              <div>$$\theta_s = \frac{360^\circ}{m \cdot N_r} = \frac{360^\circ}{4 \times 50} = \frac{360^\circ}{200} = \mathbf{1.8^\circ}$$</div>
              <div>$$S = \frac{360^\circ}{\theta_s} = 200\text{ ad\im/tur}$$</div>

              <div class="pt-2"><strong>b) Pals Frekansı Hesabı ($n = 1200\text{ d/d}$):</strong></div>
              <div>Hız formülü: $n = \frac{\theta_s \cdot f}{360^\circ} \times 60 = \frac{f}{S} \times 60$</div>
              <div>$$f = \frac{n \cdot S}{60} = \frac{1200 \times 200}{60} = 20 \times 200 = \mathbf{4000\text{ Hz}} = \mathbf{4.0\text{ kHz}}$$</div>

              <div class="pt-2"><strong>c) Yarım Adım (Half-Step) Dönüşümü:</strong></div>
              <div>Yarım adımda adımlar 1 faz ve 2 faz ardışık uyarıldığı için adım açısı yarıya iner:</div>
              <div>$$\theta_s' = \frac{\theta_s}{2} = \frac{1.8^\circ}{2} = \mathbf{0.9^\circ}$$</div>
              <div>Tur başına gereken adım sayısı 2 katına çıkar: $S' = 2 \times 200 = \mathbf{400\text{ ad\im/tur}}$.</div>
              <div>Aynı $1200\text{ d/d}$ mekanik hızı korumak için darbe frekansı da 2 katına çıkmalıdır:</div>
              <div>$$f' = \frac{1200 \times 400}{60} = 20 \times 400 = \mathbf{8000\text{ Hz}} = \mathbf{8.0\text{ kHz}}$$</div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button onclick="switchTab('tab-stepper')" class="px-3 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-play"></i> Adım Motoru Simülatöründe Test Et
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ========================================== -->
    <!-- TAB 9: DEFTER ÖZETİ & FORMÜL KARTLARI -->
    <!-- ========================================== -->
    <section id="tab-notes" class="tab-content hidden space-y-6">
      <div class="glass-card rounded-2xl p-6 border-slate-800 space-y-2">
        <div class="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <i class="fa-solid fa-pen-fancy"></i>
          <span>Fiziksel Ders Defteri Kılavuzu & Sınav Öncesi Hızlı Bakış Formülleri</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          Deftere Yaz: Altın Mühendislik Formülleri & Püf Noktalar
        </h2>
        <p class="text-xs sm:text-sm text-slate-300">
          Sınavda çıkabilecek tüm kritik formüller, birimler ve türev bağıntıları aşağıda derli toplu olarak sunulmuştur.
          Fiziksel defterinize not alırken bu şemayı referans alabilirsiniz.
        </p>
      </div>

      <!-- Formula Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        
        <!-- Card 1 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-cyan-400 font-mono">1. LORENTZ & LAPLACE</span>
            <i class="fa-solid fa-magnet text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$\vec{F} = i (\vec{l} \times \vec{B})$ [N]</div>
            <div>$F = B \cdot I \cdot l \cdot \sin\theta$</div>
            <div>$\vec{T} = \vec{r} \times \vec{F}$ [N·m]</div>
            <div>$T = 2 \cdot r \cdot l \cdot I \cdot B$</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Vidalama kuralı: 4 parmak $\vec{l}$'den $\vec{B}$'ye kıvrılır, başparmak $\vec{F}$'yi gösterir.
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-emerald-400 font-mono">2. BLDC KOMÜTASYON</span>
            <i class="fa-solid fa-microchip text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$E = k_e \cdot \omega$ [V]</div>
            <div>$T_e = 2 \cdot k_t \cdot I$ [N·m]</div>
            <div>$P_{mech} = T_e \cdot \omega_m$ [W]</div>
            <div>$\theta_e = \frac{P}{2} \cdot \theta_m$</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              120° iletimde her anda 2 transistör açık, 1 faz boşta (floating).
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-amber-400 font-mono">3. ÜNİVERSAL MOTOR</span>
            <i class="fa-solid fa-plug text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$V_{ac}^2 = (E_{ac} + IR)^2 + (IX_L)^2$</div>
            <div>$E_{dc} = V_{dc} - I R$</div>
            <div>$n_{dc} = n_{ac} \cdot \frac{E_{dc}}{E_{ac}}$</div>
            <div>$\cos\varphi = \frac{E_{ac} + IR}{V_{ac}}$</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Şebeke polaritesini değiştirmek dönüş yönünü değiştirmez. Armatür uçları değiştirilmelidir.
            </div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-indigo-400 font-mono">4. SERVO ENKODER</span>
            <i class="fa-solid fa-compact-disc text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$\Delta\theta = \frac{360^\circ}{PPR}$ [derece/pals]</div>
            <div>$Count_{4X} = 4 \times PPR$</div>
            <div>$f_{pulse} = \frac{n \cdot PPR}{60}$ [Hz]</div>
            <div>A, B'den önce $\implies$ CW; B, A'dan önce $\implies$ CCW</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Z kanalı: Her tam turda 1 pals üretir (sıfır noktası referansı).
            </div>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-rose-400 font-mono">5. RESOLVER ÇÖZÜCÜ</span>
            <i class="fa-solid fa-atom text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$V_{sin} = V_m \sin\theta \sin\omega_c t$</div>
            <div>$V_{cos} = V_m \cos\theta \sin\omega_c t$</div>
            <div>$\theta = \arctan\left(\frac{V_{sin}}{V_{cos}}\right)$</div>
            <div>Yüksek sıcaklık, toz ve titreşime en dayanıklı analog mutlak algılayıcı.</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              R-to-D (Resolver to Digital) dönüştürücü ile mikrodenetleyiciye okunur.
            </div>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="glass-card rounded-xl p-5 border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-purple-400 font-mono">6. ADIM MOTORU</span>
            <i class="fa-solid fa-gears text-slate-500"></i>
          </div>
          <div class="space-y-1.5 font-mono text-slate-300">
            <div>$\theta_s = \frac{360^\circ}{m \cdot N_r}$</div>
            <div>$S = \frac{360^\circ}{\theta_s} = m \cdot N_r$</div>
            <div>$n = \frac{f \cdot 60}{S}$ [d/d]</div>
            <div>$f = \frac{n \cdot S}{60}$ [Hz]</div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Yarım adımda: $\theta_s' = \theta_s / 2$, $S' = 2S$, $f' = 2f$.
            </div>
          </div>
        </div>

      </div>
    </section>

  </main>

  <!-- Global Footer -->
  <footer class="mt-auto border-t border-slate-800 bg-slate-900/90 backdrop-blur-md py-4 text-center text-xs text-slate-500 font-mono">
    <div class="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
      <div>KTÜ Elektrik-Elektronik Mühendisliği • Özel Elektrik Makinaları Dersi</div>
      <div class="text-slate-400">Hazırlayan: <strong>Muhammet Raşit Taflan</strong> • 3D WebGL Hibrit Simülasyon Platformu</div>
      <div>Dr. Hakan Kahveci Notlarına Dayalıdır</div>
    </div>
  </footer>
"""
