  <!-- ======================================================= -->
  <!-- JAVASCRIPT SIMULATION LOGIC & THREE.JS ENGINE v2.0.0 -->
  <!-- ======================================================= -->
  <script>
    // --- GLOBAL SIMULATION STATE & PHYSICAL CONSTANTS ---
    const state = {
      activeTab: 'tab-3d-lab',
      
      // Dynamic Motor Electrical & Mechanical State (ODE System)
      dyna: {
        Va: 120.0,       // Armature terminal voltage [V]
        ia: 0.0,         // Armature current [A] (State Variable 1)
        omega: 0.0,      // Rotor angular velocity [rad/s] (State Variable 2)
        theta: 0.0,      // Rotor mechanical angle [rad]
        Ea: 0.0,         // Induced Back-EMF [V]
        Te: 0.0,         // Electromagnetic torque [N·m]
        TL: 0.20,        // Load torque [N·m]
        // Physical Motor Parameters
        Ra: 1.50,        // Armature resistance [Ohms]
        La: 0.025,       // Armature inductance [H] (25 mH)
        J: 0.010,        // Rotor moment of inertia [kg·m²]
        Bm: 0.002,       // Viscous friction coefficient [N·m·s/rad]
        Ke: 0.120,       // Back-EMF constant [V·s/rad]
        Kt: 0.120,       // Torque constant [N·m/A] (Ke = Kt in SI units)
        Bmax: 0.85,      // Peak airgap flux density [Tesla]
        conductorL: 0.12,// Active rotor length [m]
        rotorR: 0.045,   // Rotor radius [m]
        numSlots: 8      // Number of rotor slots
      },
      
      isRunning: true,
      cameraMode: 'iso',
      explodedRatio: 0.0,
      isolatedPart: null,
      
      // Vector layer toggles
      showVectors: {
        field: true,
        current: true,
        selfField: true,
        force: true,
        torque: true,
        omega: true
      },

      // Digital Twin 2D Lab state
      twin: {
        northTop: true,
        currentOutSlot1: true
      },

      // H-Bridge circuit state
      hbridge: {
        mode: 'forward', // 'forward', 'reverse', 'brake', 'coast'
        dutyCycle: 0.75  // PWM duty 0.0 - 1.0
      },

      // Universal motor circuit state
      univ: {
        isAC: true,
        armatureReversed: false
      },

      // BLDC state
      bldc: {
        step: 1,
        auto: false,
        dir: 1,
        timer: null
      },

      // Stepper state
      stepper: {
        mode: 'full',
        m: 4,
        nr: 50,
        rpm: 1200,
        stepIndex: 0
      },

      // Servo Encoder state
      encoder: {
        ppr: 4200,
        dir: 1,
        angle: 0
      },

      // Oscilloscope history buffers (ring buffers, max 150 points)
      history: {
        maxPoints: 150,
        time: [],
        ia: [],
        rpm: [],
        Te: [],
        TL: [],
        Pm: [],
        Ea: []
      }
    };

    // Component Database for 3D Raycasting Inspection
    const COMPONENT_DB = {
      'casing': {
        name: 'Stator Dış Gövdesi (Frame)',
        material: 'Dökme Demir / Ekstrüzyon Alüminyum (Soğutma Kanatlı)',
        role: 'Makinenin manyetik akısını dış devrede tamamlar ve mekanik rijitlik sağlar.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1-4',
        formula: 'Φ = B · A [Weber]'
      },
      'pole_n': {
        name: 'Kuzey (N) Kutup Pabucu',
        material: 'M19 Lamine Silisli Sac Paketi (0.5 mm)',
        role: 'Hava aralığında radyal ve homojen dağılımlı ana manyetik akı üretir.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1',
        formula: 'B = μ · H [Tesla]'
      },
      'pole_s': {
        name: 'Güney (S) Kutup Pabucu',
        material: 'M19 Lamine Silisli Sac Paketi (0.5 mm)',
        role: 'Manyetik devreyi tamamlar, akıyı rotor üzerinden stator gövdesine iletir.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1',
        formula: 'B = μ · H [Tesla]'
      },
      'rotor_core': {
        name: 'Lamine Endüvi Göbeği (Rotor Core)',
        material: 'Yalıtımlı Lamine Manyetik Çelik Saclar (Foucault Girdap Kaybı Önleyici)',
        role: 'Manyetik relüktansı düşürür ve oluklarında endüvi sargılarını taşır.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1-5',
        formula: 'P_{girdap} ∝ f² · B² · d²'
      },
      'armature_coils': {
        name: 'Endüvi Bakır Sargıları (Armature Coils)',
        material: 'E-Cu Elektrolitik Emaye Bakır Tel (200°C H Sınıfı İzolasyon)',
        role: 'Manyetik alan içinde akım taşıyarak teğetsel Lorentz kuvveti ve tork üretir.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1 (Temel Denklem)',
        formula: 'F = i (l × B) [Newton]'
      },
      'commutator': {
        name: 'Kolektör / Komütatör Dilimleri',
        material: 'Sert Çekilmiş Elektrolitik Bakır, Mika Dilim İzolasyonu',
        role: 'Kutup eksenini geçen iletkenin akımını mekanik olarak ters çevirir (Tek yönlü tork).',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1, 3, 30',
        formula: 'T_e = 2 · r · l · I · B [N·m]'
      },
      'brushes': {
        name: 'Karbon / Elektro-Grafit Fırçalar',
        material: 'Metal Grafit Kompozit, Bronz Sabit Baskı Yaylı Tutucu',
        role: 'Duran dış besleme devresi ile dönen kolektör arasında elektriksel teması sağlar.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 1, 3',
        formula: 'ΔV_{firca} ≈ 1.0 - 2.0 V (Fırça Gerilim Düşümü)'
      },
      'shaft': {
        name: 'Transmisyon Mili & Rulman Yatakları',
        material: 'AISI 1045 Isıl İşlemli Karbon Çeliği, Çift Sıralı Bilyalı Rulman',
        role: 'Üretilen elektromanyetik torku mekanik yüke iletir.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 45',
        formula: 'P_{m} = T_e · ω [Watt]'
      },
      'hall_pcb': {
        name: '120° Hall Etkisi Sensör Kartı',
        material: 'FR4 PCB, 3x Bipolar Hall IC Entegresi',
        role: 'Rotor mıknatıs kutup konumunu algılayarak elektronik komütasyon sağlar.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 10-22 (BLDC)',
        formula: 'V_H = (R_H / d) · I · B [Volt]'
      }
    };

    // --- TAB SWITCHING LOGIC WITH AUTO KATEX RENDERING ---
    function switchTab(tabId) {
      state.activeTab = tabId;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.remove('hidden');

      const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (activeBtn) activeBtn.classList.add('active');

      // Specific tab resize/render calls
      if (tabId === 'tab-3d-lab') {
        onWindowResize3D();
      } else if (tabId === 'tab-direction-lab') {
        drawDigitalTwinCanvas();
      } else if (tabId === 'tab-circuits') {
        drawHBridgeCanvas();
        drawUniversalCircuitCanvas();
      } else if (tabId === 'tab-bldc') {
        drawBldcBridgeCanvas();
        drawBldcOscilloscope();
      } else if (tabId === 'tab-universal') {
        calculateUniversalMotor();
      } else if (tabId === 'tab-servo') {
        drawEncoderCanvas();
        drawResolverCanvas();
      } else if (tabId === 'tab-stepper') {
        calculateStepper();
      }

      renderKaTeX();
    }

    function renderKaTeX() {
      if (window.renderMathInElement) {
        try {
          renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX render warning:', e);
        }
      }
    }

    // =========================================================================
    // THREE.JS HIGH-END 3D MOTOR WORKSTATION ENGINE
    // =========================================================================
    let scene3d, camera3d, renderer3d, controls3d;
    let motorAssemblyGroup, statorMeshGroup, poleGroup, rotorMeshGroup, windingsMeshGroup, commMeshGroup, brushMeshGroup, hallMeshGroup, shaftMeshGroup;
    let vectorArrowGroup, fluxTubesGroup, selfFieldRingsGroup;
    let raycaster, mouse;
    let hoveredMesh = null, selectedMesh = null;

    function init3DScene() {
      const container = document.getElementById('canvas3dContainer');
      const canvas = document.getElementById('motor3dCanvas');
      if (!container || !canvas) return;

      // 1. Scene setup
      scene3d = new THREE.Scene();
      scene3d.background = new THREE.Color(0x050b14);

      // 2. Camera setup
      camera3d = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.05, 50);
      camera3d.position.set(0.32, 0.24, 0.38);

      // 3. Renderer with High PBR Quality
      renderer3d = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer3d.setSize(container.clientWidth, container.clientHeight);
      renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer3d.shadowMap.enabled = true;
      renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;

      // 4. OrbitControls
      controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
      controls3d.enableDamping = true;
      controls3d.dampingFactor = 0.05;
      controls3d.minDistance = 0.12;
      controls3d.maxDistance = 1.8;
      controls3d.target.set(0, 0, 0);

      // 5. Studio Three-Point Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
      scene3d.add(ambLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
      keyLight.position.set(0.6, 0.9, 0.7);
      keyLight.castShadow = true;
      scene3d.add(keyLight);

      const fillLightCyan = new THREE.DirectionalLight(0x38bdf8, 0.55);
      fillLightCyan.position.set(-0.6, -0.4, -0.4);
      scene3d.add(fillLightCyan);

      const rimLightWarm = new THREE.PointLight(0xf59e0b, 0.8, 1.2);
      rimLightWarm.position.set(0, 0.25, -0.15);
      scene3d.add(rimLightWarm);

      // 6. Raycaster for Component Picking
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      canvas.addEventListener('mousemove', on3DMouseMove);
      canvas.addEventListener('click', on3DMouseClick);

      // 7. Build Industrial 3D Motor
      buildIndustrialMotor();

      // 8. Resize listener
      window.addEventListener('resize', onWindowResize3D);

      // 9. Start Main Physics & Animation Loop
      requestAnimationFrame(mainSimulationLoop);
    }

    function buildIndustrialMotor() {
      motorAssemblyGroup = new THREE.Group();
      scene3d.add(motorAssemblyGroup);

      // PBR Materials
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.28 });
      const darkLamiMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.42 });
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.90, roughness: 0.20 });
      const northMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.65, roughness: 0.35 }); // Red North
      const southMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.65, roughness: 0.35 }); // Blue South
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.25 });
      const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });

      // --- A. STATOR OUTER FRAME & COOLING FINS ---
      statorMeshGroup = new THREE.Group();
      motorAssemblyGroup.add(statorMeshGroup);

      // Main cylindrical shell
      const casingGeom = new THREE.CylinderGeometry(0.088, 0.088, 0.15, 36, 1, true);
      const casingMesh = new THREE.Mesh(casingGeom, steelMat);
      casingMesh.rotation.x = Math.PI / 2;
      casingMesh.userData = { id: 'casing' };
      statorMeshGroup.add(casingMesh);

      // 32 Radial Cooling Fins
      const finGeom = new THREE.BoxGeometry(0.003, 0.014, 0.15);
      for (let i = 0; i < 32; i++) {
        const finAngle = (i / 32) * Math.PI * 2;
        const fin = new THREE.Mesh(finGeom, steelMat);
        fin.position.set(Math.cos(finAngle) * 0.094, Math.sin(finAngle) * 0.094, 0);
        fin.rotation.z = finAngle;
        fin.userData = { id: 'casing' };
        statorMeshGroup.add(fin);
      }

      // Mounting Feet (Taban Ayakları)
      const footGeom = new THREE.BoxGeometry(0.035, 0.012, 0.16);
      const footLeft = new THREE.Mesh(footGeom, steelMat);
      footLeft.position.set(-0.085, -0.098, 0);
      footLeft.userData = { id: 'casing' };
      statorMeshGroup.add(footLeft);

      const footRight = new THREE.Mesh(footGeom, steelMat);
      footRight.position.set(0.085, -0.098, 0);
      footRight.userData = { id: 'casing' };
      statorMeshGroup.add(footRight);

      // Terminal Connection Box (Klemens Kutusu)
      const termBoxGeom = new THREE.BoxGeometry(0.045, 0.024, 0.055);
      const termBox = new THREE.Mesh(termBoxGeom, steelMat);
      termBox.position.set(0, 0.108, 0.01);
      termBox.userData = { id: 'casing' };
      statorMeshGroup.add(termBox);

      // Lifting Eye (Mapa)
      const eyeGeom = new THREE.TorusGeometry(0.010, 0.003, 12, 24);
      const eyeMesh = new THREE.Mesh(eyeGeom, steelMat);
      eyeMesh.position.set(0, 0.126, 0.01);
      eyeMesh.rotation.x = Math.PI / 2;
      eyeMesh.userData = { id: 'casing' };
      statorMeshGroup.add(eyeMesh);

      // --- B. STATOR SALIENT POLE SHOES & FIELD WINDINGS ---
      poleGroup = new THREE.Group();
      motorAssemblyGroup.add(poleGroup);

      // North Pole Shoe (Top)
      const poleNGeom = new THREE.BoxGeometry(0.052, 0.026, 0.12);
      const poleN = new THREE.Mesh(poleNGeom, northMat);
      poleN.position.set(0, 0.068, 0);
      poleN.userData = { id: 'pole_n' };
      poleGroup.add(poleN);

      // Field Coil North
      const coilNGeom = new THREE.TorusGeometry(0.028, 0.010, 14, 28);
      const coilN = new THREE.Mesh(coilNGeom, copperMat);
      coilN.rotation.x = Math.PI / 2;
      coilN.position.set(0, 0.072, 0);
      coilN.userData = { id: 'pole_n' };
      poleGroup.add(coilN);

      // South Pole Shoe (Bottom)
      const poleS = new THREE.Mesh(poleNGeom, southMat);
      poleS.position.set(0, -0.068, 0);
      poleS.userData = { id: 'pole_s' };
      poleGroup.add(poleS);

      const coilS = new THREE.Mesh(coilNGeom, copperMat);
      coilS.rotation.x = Math.PI / 2;
      coilS.position.set(0, -0.072, 0);
      coilS.userData = { id: 'pole_s' };
      poleGroup.add(coilS);

      // --- C. ROTOR CORE, 8 SLOTS & COPPER COILS ---
      rotorMeshGroup = new THREE.Group();
      motorAssemblyGroup.add(rotorMeshGroup);

      // Central Steel Shaft
      shaftMeshGroup = new THREE.Group();
      rotorMeshGroup.add(shaftMeshGroup);

      const shaftGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.28, 28);
      const shaftMesh = new THREE.Mesh(shaftGeom, steelMat);
      shaftMesh.rotation.x = Math.PI / 2;
      shaftMesh.userData = { id: 'shaft' };
      shaftMeshGroup.add(shaftMesh);

      // Keyway slot on shaft
      const keyGeom = new THREE.BoxGeometry(0.003, 0.003, 0.04);
      const keyMesh = new THREE.Mesh(keyGeom, darkLamiMat);
      keyMesh.position.set(0, 0.012, 0.11);
      shaftMeshGroup.add(keyMesh);

      // Ball Bearings
      const bearingGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.012, 24);
      const brgFront = new THREE.Mesh(bearingGeom, brassMat);
      brgFront.rotation.x = Math.PI / 2;
      brgFront.position.set(0, 0, 0.082);
      brgFront.userData = { id: 'shaft' };
      shaftMeshGroup.add(brgFront);

      const brgRear = new THREE.Mesh(bearingGeom, brassMat);
      brgRear.rotation.x = Math.PI / 2;
      brgRear.position.set(0, 0, -0.082);
      brgRear.userData = { id: 'shaft' };
      shaftMeshGroup.add(brgRear);

      // Laminated Rotor Core with 8 slots
      const rotorCoreGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 32);
      const rotorCore = new THREE.Mesh(rotorCoreGeom, darkLamiMat);
      rotorCore.rotation.x = Math.PI / 2;
      rotorCore.userData = { id: 'rotor_core' };
      rotorMeshGroup.add(rotorCore);

      // 8 Distributed Armature Slots & Windings
      windingsMeshGroup = new THREE.Group();
      rotorMeshGroup.add(windingsMeshGroup);

      for (let i = 0; i < 8; i++) {
        const slotAngle = (i / 8) * Math.PI * 2;
        const sx = Math.cos(slotAngle) * 0.040;
        const sy = Math.sin(slotAngle) * 0.040;

        // Conductor Rod in slot
        const condGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.124, 14);
        const cond = new THREE.Mesh(condGeom, copperMat);
        cond.rotation.x = Math.PI / 2;
        cond.position.set(sx, sy, 0);
        cond.userData = { id: 'armature_coils', slotIndex: i };
        windingsMeshGroup.add(cond);

        // End-turn Loop front
        const endLoopGeom = new THREE.TorusGeometry(0.020, 0.0045, 10, 20, Math.PI);
        const loopF = new THREE.Mesh(endLoopGeom, copperMat);
        loopF.position.set(0, 0, 0.063);
        loopF.rotation.z = slotAngle;
        loopF.userData = { id: 'armature_coils' };
        windingsMeshGroup.add(loopF);

        const loopB = new THREE.Mesh(endLoopGeom, copperMat);
        loopB.position.set(0, 0, -0.063);
        loopB.rotation.z = slotAngle + Math.PI;
        loopB.userData = { id: 'armature_coils' };
        windingsMeshGroup.add(loopB);
      }

      // --- D. COMMUTATOR CYLINDER WITH 16 SEGMENTS ---
      commMeshGroup = new THREE.Group();
      rotorMeshGroup.add(commMeshGroup);

      const commGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.034, 32);
      const commCore = new THREE.Mesh(commGeom, brassMat);
      commCore.rotation.x = Math.PI / 2;
      commCore.position.set(0, 0, 0.096);
      commCore.userData = { id: 'commutator' };
      commMeshGroup.add(commCore);

      // Mica Insulating Slots between segments
      const micaGeom = new THREE.BoxGeometry(0.001, 0.025, 0.035);
      for (let i = 0; i < 16; i++) {
        const mica = new THREE.Mesh(micaGeom, darkLamiMat);
        mica.position.set(0, 0, 0.096);
        mica.rotation.z = (i / 16) * Math.PI * 2;
        commMeshGroup.add(mica);
      }

      // --- E. BRUSH GEAR & HOLDERS ---
      brushMeshGroup = new THREE.Group();
      motorAssemblyGroup.add(brushMeshGroup);

      // Left Brush Box
      const bBoxGeom = new THREE.BoxGeometry(0.010, 0.016, 0.020);
      const bHolderL = new THREE.Mesh(bBoxGeom, brassMat);
      bHolderL.position.set(-0.042, 0, 0.096);
      bHolderL.userData = { id: 'brushes' };
      brushMeshGroup.add(bHolderL);

      const brushBlockL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.018), carbonMat);
      brushBlockL.position.set(-0.030, 0, 0.096);
      brushBlockL.userData = { id: 'brushes' };
      brushMeshGroup.add(brushBlockL);

      // Right Brush Box
      const bHolderR = new THREE.Mesh(bBoxGeom, brassMat);
      bHolderR.position.set(0.042, 0, 0.096);
      bHolderR.userData = { id: 'brushes' };
      brushMeshGroup.add(bHolderR);

      const brushBlockR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.018), carbonMat);
      brushBlockR.position.set(0.030, 0, 0.096);
      brushBlockR.userData = { id: 'brushes' };
      brushMeshGroup.add(brushBlockR);

      // --- F. HALL SENSOR PCB & ENCODER DISC ---
      hallMeshGroup = new THREE.Group();
      motorAssemblyGroup.add(hallMeshGroup);

      const pcbRingGeom = new THREE.RingGeometry(0.052, 0.075, 32);
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, side: THREE.DoubleSide });
      const pcbMesh = new THREE.Mesh(pcbRingGeom, pcbMat);
      pcbMesh.position.set(0, 0, -0.076);
      pcbMesh.userData = { id: 'hall_pcb' };
      hallMeshGroup.add(pcbMesh);

      // 3 Hall Sensor Packages at 0°, 120°, 240°
      for (let i = 0; i < 3; i++) {
        const ang = (i * 120) * (Math.PI / 180);
        const ic = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.009, 0.005), new THREE.MeshStandardMaterial({ color: 0x111827 }));
        ic.position.set(Math.cos(ang) * 0.064, Math.sin(ang) * 0.064, -0.078);
        ic.rotation.z = ang;
        ic.userData = { id: 'hall_pcb' };
        hallMeshGroup.add(ic);

        const led = new THREE.Mesh(new THREE.SphereGeometry(0.0025, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        led.position.set(Math.cos(ang) * 0.070, Math.sin(ang) * 0.070, -0.079);
        hallMeshGroup.add(led);
      }

      // --- G. VECTOR OVERLAYS (Field B, Current I, Force F, Torque, Omega) ---
      vectorArrowGroup = new THREE.Group();
      motorAssemblyGroup.add(vectorArrowGroup);

      // Animated Magnetic Flux Tubes (flowing from North to South)
      fluxTubesGroup = new THREE.Group();
      vectorArrowGroup.add(fluxTubesGroup);

      const fluxTubeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.6 });
      for (let i = -3; i <= 3; i++) {
        const xOffset = i * 0.013;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xOffset, 0.062, 0),
          new THREE.Vector3(xOffset * 0.8, 0.025, 0),
          new THREE.Vector3(xOffset * 0.8, -0.025, 0),
          new THREE.Vector3(xOffset, -0.062, 0)
        ]);
        const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.0018, 6, false);
        const tubeMesh = new THREE.Mesh(tubeGeom, fluxTubeMat);
        fluxTubesGroup.add(tubeMesh);
      }
    }

    // --- RAYCASTING & COMPONENT INSPECTOR ---
    function on3DMouseMove(event) {
      const container = document.getElementById('canvas3dContainer');
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera3d);
      const intersects = raycaster.intersectObjects(motorAssemblyGroup.children, true);

      const tooltip = document.getElementById('partTooltip');
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.id && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData.id && COMPONENT_DB[obj.userData.id]) {
          const info = COMPONENT_DB[obj.userData.id];
          tooltip.style.display = 'block';
          tooltip.style.left = (event.clientX + 14) + 'px';
          tooltip.style.top = (event.clientY + 14) + 'px';
          tooltip.innerHTML = `<strong>${info.name}</strong><br><span class="text-slate-400 text-[10px]">Tıkla: Detaylı İncele</span>`;
          return;
        }
      }
      tooltip.style.display = 'none';
    }

    function on3DMouseClick(event) {
      const container = document.getElementById('canvas3dContainer');
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera3d);
      const intersects = raycaster.intersectObjects(motorAssemblyGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.id && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData.id && COMPONENT_DB[obj.userData.id]) {
          showComponentInspector(obj.userData.id);
          highlightSelectedPart(obj);
        }
      }
    }

    function showComponentInspector(partId) {
      const info = COMPONENT_DB[partId];
      if (!info) return;

      document.getElementById('inspPartName').innerText = info.name;
      document.getElementById('inspPartMaterial').innerText = info.material;
      document.getElementById('inspPartFunction').innerText = info.role;
      document.getElementById('inspPartPage').innerText = info.page;
      document.getElementById('inspPartFormula').innerText = info.formula;

      document.getElementById('componentInspectorCard').classList.remove('hidden');
      renderKaTeX();
    }

    function closeComponentInspector() {
      document.getElementById('componentInspectorCard').classList.add('hidden');
      restoreAllParts();
    }

    function highlightSelectedPart(mesh) {
      selectedMesh = mesh;
    }

    function isolateInspectedPart() {
      if (!selectedMesh) return;
      const targetId = selectedMesh.userData.id;
      motorAssemblyGroup.traverse(child => {
        if (child.isMesh) {
          child.visible = (child.userData.id === targetId);
        }
      });
    }

    function restoreAllParts() {
      motorAssemblyGroup.traverse(child => {
        if (child.isMesh) child.visible = true;
      });
    }

    // --- 10 STANDARDIZED CAMERA PRESETS & TRANSITIONS ---
    function setCameraPreset(mode) {
      state.cameraMode = mode;
      restoreAllParts();

      if (mode === 'iso') {
        tweenCamera(0.32, 0.24, 0.38, 0, 0, 0);
      } else if (mode === 'front') {
        tweenCamera(0, 0, 0.42, 0, 0, 0);
      } else if (mode === 'rear') {
        tweenCamera(0, 0, -0.42, 0, 0, 0);
      } else if (mode === 'top') {
        tweenCamera(0, 0.45, 0.001, 0, 0, 0);
      } else if (mode === 'side') {
        tweenCamera(0.45, 0, 0, 0, 0, 0);
      } else if (mode === 'long_section') {
        tweenCamera(0.30, 0.15, 0.35, 0, 0, 0);
        if (statorMeshGroup) statorMeshGroup.position.x = 0.06; // Open half section
      } else if (mode === 'cross_section') {
        tweenCamera(0, 0, 0.28, 0, 0, 0);
      } else if (mode === 'exploded') {
        setExplodedRatio(0.65);
      } else if (mode === 'transparent') {
        tweenCamera(0.30, 0.20, 0.35, 0, 0, 0);
        statorMeshGroup.traverse(c => {
          if (c.material) { c.material.transparent = true; c.material.opacity = 0.25; }
        });
      } else if (mode === 'rotor_isolated') {
        statorMeshGroup.visible = false;
        poleGroup.visible = false;
        brushMeshGroup.visible = false;
        hallMeshGroup.visible = false;
        tweenCamera(0.24, 0.16, 0.28, 0, 0, 0);
      }
    }

    function tweenCamera(x, y, z, tx, ty, tz) {
      if (statorMeshGroup) statorMeshGroup.position.x = 0;
      camera3d.position.set(x, y, z);
      controls3d.target.set(tx, ty, tz);
      controls3d.update();
    }

    function resetCameraView() {
      document.getElementById('selectCameraMode').value = 'iso';
      setCameraPreset('iso');
      setExplodedRatio(0.0);
    }

    function toggle3DFullscreen() {
      const container = document.getElementById('canvas3dContainer');
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => alert(`Fullscreen hatası: ${err.message}`));
      } else {
        document.exitFullscreen();
      }
    }

    function onWindowResize3D() {
      const container = document.getElementById('canvas3dContainer');
      if (!container || !renderer3d || !camera3d) return;

      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera3d.aspect = w / h;
      camera3d.updateProjectionMatrix();
      renderer3d.setSize(w, h);
    }

    function setExplodedRatio(ratio) {
      state.explodedRatio = ratio;
      const label = document.getElementById('labelExplode');
      const slider = document.getElementById('sliderExplode');
      if (label) label.innerText = Math.round(ratio * 100) + '%';
      if (slider) slider.value = Math.round(ratio * 100);

      const dist = ratio * 0.14;
      if (statorMeshGroup) statorMeshGroup.position.z = -dist * 0.6;
      if (poleGroup) poleGroup.position.z = -dist * 0.35;
      if (commMeshGroup) commMeshGroup.position.z = dist * 0.7;
      if (brushMeshGroup) brushMeshGroup.position.z = dist * 0.9;
      if (hallMeshGroup) hallMeshGroup.position.z = -dist * 0.95;
    }

    function updateExplodedView(val) {
      setExplodedRatio(parseFloat(val) / 100.0);
    }

    // =========================================================================
    // REAL-TIME COUPLED ODE NUMERICAL INTEGRATOR (60 HZ)
    // =========================================================================
    let lastSimTimestamp = performance.now();

    function mainSimulationLoop(timestamp) {
      requestAnimationFrame(mainSimulationLoop);

      const dt = Math.min((timestamp - lastSimTimestamp) / 1000.0, 0.05); // Capped at 50ms
      lastSimTimestamp = timestamp;

      // 1. Solve Coupled Electrical & Mechanical ODEs if motor is running
      if (state.isRunning) {
        stepODEPhysics(dt);
      }

      // 2. Rotate 3D Rotor Mesh & Commutator
      if (rotorMeshGroup) {
        rotorMeshGroup.rotation.z = state.dyna.theta;
      }

      // 3. Pulse Magnetic Flux Tubes in 3D
      if (fluxTubesGroup && fluxTubesGroup.visible) {
        fluxTubesGroup.children.forEach((tube, idx) => {
          tube.material.opacity = 0.5 + Math.sin(timestamp * 0.006 + idx) * 0.25;
        });
      }

      // 4. Update HUD and Controls
      updateLiveHUDReadouts();

      // 5. Render Three.js Scene
      if (controls3d) controls3d.update();
      if (renderer3d && scene3d && camera3d) {
        renderer3d.render(scene3d, camera3d);
      }
    }

    function stepODEPhysics(dt) {
      const d = state.dyna;
      
      // Calculate Back-EMF: Ea = Ke * omega
      d.Ea = d.Ke * d.omega;

      // Armature current derivative: d(ia)/dt = (Va - Ra*ia - Ea) / La
      const dia_dt = (d.Va - d.Ra * d.ia - d.Ea) / d.La;

      // Calculate Net Electromagnetic Torque from slot integration
      // Te = Kt * ia (with armature reaction effect)
      d.Te = d.Kt * d.ia;

      // Angular acceleration: d(omega)/dt = (Te - Bm*omega - TL) / J
      const domega_dt = (d.Te - d.Bm * d.omega - d.TL) / d.J;

      // Numerical Integration (Euler Step)
      d.ia += dia_dt * dt;
      d.omega += domega_dt * dt;
      d.theta += d.omega * dt;

      // Keep theta bounded [0, 2pi)
      if (d.theta > Math.PI * 2000) d.theta %= (Math.PI * 2);

      // Record to ring buffers for live oscilloscopes
      recordHistory(d);
    }

    function recordHistory(d) {
      const h = state.history;
      const rpm = (d.omega * 60) / (2 * Math.PI);
      const Pm = d.Te * d.omega;

      h.ia.push(d.ia);
      h.rpm.push(rpm);
      h.Te.push(d.Te);
      h.TL.push(d.TL);
      h.Pm.push(Pm);
      h.Ea.push(d.Ea);

      if (h.ia.length > h.maxPoints) {
        h.ia.shift();
        h.rpm.shift();
        h.Te.shift();
        h.TL.shift();
        h.Pm.shift();
        h.Ea.shift();
      }

      // Redraw scopes if dynamics tab active
      if (state.activeTab === 'tab-dynamics-lab') {
        drawScopeCanvas('scopeCanvasIa', h.ia, 'A', '#facc15', -20, 20);
        drawScopeCanvas('scopeCanvasRpm', h.rpm, 'd/d', '#38bdf8', -3500, 3500);
        drawScopeCanvasDual('scopeCanvasTorque', h.Te, h.TL, 'N·m', '#ec4899', '#f43f5e', -1.5, 1.5);
        drawScopeCanvasDual('scopeCanvasPower', h.Ea, h.Pm, 'V / W', '#10b981', '#6366f1', -200, 200);
      }
    }

    function drawScopeCanvas(canvasId, buffer, unit, color, minVal, maxVal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 400;
      const h = canvas.height = canvas.parentElement.clientHeight || 230;

      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Zero axis line
      const zeroY = h - ((0 - minVal) / (maxVal - minVal)) * h;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();

      if (buffer.length < 2) return;

      // Draw Trace
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const dx = w / (state.history.maxPoints - 1);
      buffer.forEach((val, i) => {
        const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
        const y = h - norm * h;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * dx, y);
      });
      ctx.stroke();

      // Readout label
      const latest = buffer[buffer.length - 1] || 0;
      ctx.fillStyle = color;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(`${latest.toFixed(2)} ${unit}`, 15, 22);
    }

    function drawScopeCanvasDual(canvasId, buf1, buf2, unit, col1, col2, minVal, maxVal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 400;
      const h = canvas.height = canvas.parentElement.clientHeight || 230;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const zeroY = h - ((0 - minVal) / (maxVal - minVal)) * h;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();

      const dx = w / (state.history.maxPoints - 1);

      // Trace 1
      if (buf1.length > 1) {
        ctx.strokeStyle = col1;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        buf1.forEach((val, i) => {
          const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
          const y = h - norm * h;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * dx, y);
        });
        ctx.stroke();
      }

      // Trace 2
      if (buf2.length > 1) {
        ctx.strokeStyle = col2;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        buf2.forEach((val, i) => {
          const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
          const y = h - norm * h;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * dx, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const l1 = buf1[buf1.length - 1] || 0;
      const l2 = buf2[buf2.length - 1] || 0;
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillStyle = col1;
      ctx.fillText(`${l1.toFixed(2)}`, 15, 20);
      ctx.fillStyle = col2;
      ctx.fillText(`Yük: ${l2.toFixed(2)} ${unit}`, 80, 20);
    }

    function updateLiveHUDReadouts() {
      const d = state.dyna;
      const rpm = (d.omega * 60) / (2 * Math.PI);
      const isCW = d.omega >= 0;
      const deg = ((d.theta * 180 / Math.PI) % 360 + 360) % 360;

      // HUD elements
      const elRpm = document.getElementById('globalRpmVal');
      const elDir = document.getElementById('globalDirVal');
      const elIa = document.getElementById('globalIaVal');
      const elTe = document.getElementById('globalTeVal');
      const hudRotor = document.getElementById('hudRotorAngle');
      const hudElec = document.getElementById('hudElecAngle');
      const hudCurrent = document.getElementById('hudCurrent');
      const hudTorque = document.getElementById('hudTorque');
      const hudOmega = document.getElementById('hudOmega');
      const hudForce = document.getElementById('hudForce');

      if (elRpm) elRpm.innerText = Math.abs(rpm).toFixed(0) + ' d/d';
      if (elDir) elDir.innerText = isCW ? 'CW' : 'CCW';
      if (elIa) elIa.innerText = d.ia.toFixed(2) + ' A';
      if (elTe) elTe.innerText = d.Te.toFixed(2) + ' N·m';
      if (hudRotor) hudRotor.innerText = deg.toFixed(1) + '°';
      if (hudElec) hudElec.innerText = ((deg * 2) % 360).toFixed(1) + '°';
      if (hudCurrent) hudCurrent.innerText = d.ia.toFixed(2) + ' A';
      if (hudTorque) hudTorque.innerText = d.Te.toFixed(2) + ' N·m';
      if (hudOmega) hudOmega.innerText = d.omega.toFixed(1) + ' rad/s';

      // Lorentz Force on single slot: F = B * ia * L
      const Fsingle = d.Bmax * d.ia * d.conductorL;
      if (hudForce) hudForce.innerText = Fsingle.toFixed(2) + ' N';

      // Gauges
      const gIa = document.getElementById('gaugeIa');
      const gRpm = document.getElementById('gaugeRpm');
      const gOmega = document.getElementById('gaugeOmega');
      const gEa = document.getElementById('gaugeEa');
      const gTe = document.getElementById('gaugeTe');
      const gPm = document.getElementById('gaugePm');
      const gEff = document.getElementById('gaugeEff');

      const Pin = d.Va * d.ia;
      const Pm = d.Te * d.omega;
      const eff = (Pin > 0 && Pm > 0) ? Math.min(98.5, (Pm / Pin) * 100) : 0;

      if (gIa) gIa.innerText = d.ia.toFixed(2) + ' A';
      if (gRpm) gRpm.innerText = Math.abs(rpm).toFixed(0) + ' d/d';
      if (gOmega) gOmega.innerText = d.omega.toFixed(1) + ' rad/s';
      if (gEa) gEa.innerText = d.Ea.toFixed(1) + ' V';
      if (gTe) gTe.innerText = d.Te.toFixed(2) + ' N·m';
      if (gPm) gPm.innerText = Pm.toFixed(1) + ' W';
      if (gEff) gEff.innerText = eff.toFixed(1) + ' %';
    }

    // --- INTERACTIVE SLIDERS & DYNAMICS TRIGGERS ---
    function setArmatureVoltage(val) {
      state.dyna.Va = parseFloat(val);
      const el = document.getElementById('labelVa');
      const sl = document.getElementById('sliderVa');
      if (el) el.innerText = state.dyna.Va.toFixed(0) + ' V';
      if (sl) sl.value = state.dyna.Va;
    }

    function setLoadTorque(val) {
      state.dyna.TL = parseFloat(val);
      const el = document.getElementById('labelTL');
      if (el) el.innerText = state.dyna.TL.toFixed(2) + ' N·m';
    }

    function setFieldFlux(val) {
      state.dyna.Bmax = parseFloat(val);
      const el = document.getElementById('labelFlux');
      const hud = document.getElementById('hudFlux');
      if (el) el.innerText = state.dyna.Bmax.toFixed(2) + ' T';
      if (hud) hud.innerText = state.dyna.Bmax.toFixed(2) + ' T';
    }

    function toggleInstantLoad() {
      if (state.dyna.TL > 0.5) {
        setLoadTorque(0.15);
      } else {
        setLoadTorque(0.65);
      }
      const sl = document.getElementById('sliderTL');
      if (sl) sl.value = state.dyna.TL;
    }

    function toggleMotorPlay() {
      state.isRunning = !state.isRunning;
      const btn = document.getElementById('btnMotorPlayText');
      const led = document.getElementById('badgeMotorLed');
      const status = document.getElementById('globalMotorStatus');
      if (state.isRunning) {
        if (btn) btn.innerText = 'Durdur';
        if (led) led.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
        if (status) { status.innerText = 'ÇALIŞIYOR'; status.className = 'font-bold text-emerald-400'; }
      } else {
        if (btn) btn.innerText = 'Başlat';
        if (led) led.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
        if (status) { status.innerText = 'DURDURULDU'; status.className = 'font-bold text-amber-400'; }
      }
    }

    function stepCommutationSingle() {
      state.isRunning = false;
      state.dyna.theta += (Math.PI / 4.0); // +45 degrees (1 slot)
      if (rotorMeshGroup) rotorMeshGroup.rotation.z = state.dyna.theta;
      toggleMotorPlay();
      toggleMotorPlay();
    }

    function resetDynamicMotor() {
      const d = state.dyna;
      d.ia = 0;
      d.omega = 0;
      d.theta = 0;
      d.Ea = 0;
      d.Te = 0;
      state.history.ia = [];
      state.history.rpm = [];
      state.history.Te = [];
      state.history.TL = [];
      state.history.Pm = [];
      state.history.Ea = [];
      if (rotorMeshGroup) rotorMeshGroup.rotation.z = 0;
    }

    function triggerDynaScenario(type) {
      if (type === 'directStart') {
        resetDynamicMotor();
        setArmatureVoltage(120);
        state.isRunning = true;
      } else if (type === 'loadStep') {
        toggleInstantLoad();
      } else if (type === 'plugBraking') {
        setArmatureVoltage(-state.dyna.Va);
      } else if (type === 'dynamicBraking') {
        setArmatureVoltage(0);
        state.dyna.Ra = 4.0; // simulate braking resistor
        setTimeout(() => { state.dyna.Ra = 1.5; }, 1500);
      }
    }

    function updateDynaParam(key, val) {
      const num = parseFloat(val);
      if (key === 'Ra') {
        state.dyna.Ra = num;
        document.getElementById('labelRaVal').innerText = num.toFixed(2) + ' Ω';
      } else if (key === 'La') {
        state.dyna.La = num / 1000.0;
        document.getElementById('labelLaVal').innerText = num.toFixed(1) + ' mH';
      } else if (key === 'J') {
        state.dyna.J = num;
        document.getElementById('labelJVal').innerText = num.toFixed(3) + ' kg·m²';
      } else if (key === 'Bm') {
        state.dyna.Bm = num;
        document.getElementById('labelBmVal').innerText = num.toFixed(4) + ' N·m·s';
      } else if (key === 'Ke') {
        state.dyna.Ke = num;
        state.dyna.Kt = num;
        document.getElementById('labelKeVal').innerText = num.toFixed(3) + ' V·s/rad';
      }
    }

    function resetDynaParamsDefault() {
      updateDynaParam('Ra', 1.5);
      updateDynaParam('La', 25);
      updateDynaParam('J', 0.010);
      updateDynaParam('Bm', 0.002);
      updateDynaParam('Ke', 0.120);
      document.getElementById('sliderRa').value = 1.5;
      document.getElementById('sliderLa').value = 25;
      document.getElementById('sliderJ').value = 0.010;
      document.getElementById('sliderBm').value = 0.002;
      document.getElementById('sliderKe').value = 0.120;
    }

    function toggleVectorLayer(layer, isChecked) {
      state.showVectors[layer] = isChecked;
      if (layer === 'field' && fluxTubesGroup) fluxTubesGroup.visible = isChecked;
    }

    // =========================================================================
    // DIGITAL TWIN 2D CANVAS ENGINE (NOTEBOOK PAGE 1 TWIN)
    // =========================================================================
    function drawDigitalTwinCanvas() {
      const canvas = document.getElementById('digitalTwinCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 340;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const statorR = Math.min(w, h) * 0.38;
      const rotorR = statorR * 0.58;

      const isNTop = state.twin.northTop;
      const isOut1 = state.twin.currentOutSlot1;

      // 1. Stator Ring
      ctx.beginPath();
      ctx.arc(cx, cy, statorR, 0, Math.PI * 2);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // 2. North Pole
      ctx.fillStyle = isNTop ? '#dc2626' : '#2563eb';
      ctx.beginPath();
      ctx.arc(cx, cy, statorR - 7, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.arc(cx, cy, statorR - 40, -Math.PI * 0.22, -Math.PI * 0.78, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNTop ? 'KUTUP (N)' : 'KUTUP (S)', cx, cy - statorR + 20);

      // 3. South Pole
      ctx.fillStyle = isNTop ? '#2563eb' : '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, statorR - 7, Math.PI * 0.22, Math.PI * 0.78);
      ctx.arc(cx, cy, statorR - 40, Math.PI * 0.78, Math.PI * 0.22, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillText(isNTop ? 'KUTUP (S)' : 'KUTUP (N)', cx, cy + statorR - 20);

      // 4. Flux Lines B
      const fluxDir = isNTop ? 1 : -1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);

      for (let x = -statorR * 0.35; x <= statorR * 0.35; x += 26) {
        ctx.beginPath();
        ctx.moveTo(cx + x, cy - (statorR - 45) * fluxDir);
        ctx.lineTo(cx + x, cy + (statorR - 45) * fluxDir);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(cx + x, cy + 8 * fluxDir);
        ctx.lineTo(cx + x - 4, cy - 2 * fluxDir);
        ctx.lineTo(cx + x + 4, cy - 2 * fluxDir);
        ctx.closePath();
        ctx.fill();
      }
      ctx.setLineDash([]);

      // 5. Rotor Body
      ctx.beginPath();
      ctx.arc(cx, cy, rotorR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#64748b';
      ctx.stroke();

      // Shaft
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      // 6. Slots (Slot 1 at top-left, Slot 2 at bottom-right)
      const slotD = rotorR * 0.65;
      const s1x = cx - slotD * 0.45;
      const s1y = cy - slotD * 0.70;
      const s2x = cx + slotD * 0.45;
      const s2y = cy + slotD * 0.70;

      // Slot 1
      ctx.beginPath();
      ctx.arc(s1x, s1y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 15px JetBrains Mono';
      ctx.fillText(isOut1 ? '⊙' : '⊗', s1x, s1y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('1', s1x - 18, s1y - 12);

      // Slot 2
      ctx.beginPath();
      ctx.arc(s2x, s2y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 15px JetBrains Mono';
      ctx.fillText(isOut1 ? '⊗' : '⊙', s2x, s2y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('2', s2x + 18, s2y + 12);

      // 7. Force Vectors F1 & F2
      const f1Dir = (isNTop ? 1 : -1) * (isOut1 ? 1 : -1);
      const isCW = (f1Dir === 1);

      drawCanvasArrow(ctx, s1x, s1y, s1x + f1Dir * 55, s1y, '#10b981', 'F₁');
      drawCanvasArrow(ctx, s2x, s2y, s2x - f1Dir * 55, s2y, '#10b981', 'F₂');

      // Rotation Indicator Arc
      ctx.beginPath();
      ctx.arc(cx, cy, rotorR + 18, isCW ? -0.8 : 0.8, isCW ? 0.8 : -0.8, !isCW);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      const badge = document.getElementById('twinDirBadge');
      if (badge) {
        if (isCW) {
          badge.className = 'text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300';
          badge.innerHTML = '<i class="fa-solid fa-rotate-right"></i> DÖNÜŞ: CW (Saat Yönü)';
        } else {
          badge.className = 'text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300';
          badge.innerHTML = '<i class="fa-solid fa-rotate-left"></i> DÖNÜŞ: CCW (Saat Yönünün Tersi)';
        }
      }
    }

    function drawCanvasArrow(ctx, fx, fy, tx, ty, color, label) {
      const angle = Math.atan2(ty - fy, tx - fx);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 9 * Math.cos(angle - Math.PI / 6), ty - 9 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tx - 9 * Math.cos(angle + Math.PI / 6), ty - 9 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(label, tx + (tx > fx ? 8 : -16), ty - 4);
    }

    function twinFlipPoles() {
      state.twin.northTop = !state.twin.northTop;
      drawDigitalTwinCanvas();
    }

    function twinFlipCurrent() {
      state.twin.currentOutSlot1 = !state.twin.currentOutSlot1;
      drawDigitalTwinCanvas();
    }

    function twinReset() {
      state.twin.northTop = true;
      state.twin.currentOutSlot1 = true;
      drawDigitalTwinCanvas();
    }

    // =========================================================================
    // H-BRIDGE & CIRCUITS LAB ENGINES
    // =========================================================================
    function drawHBridgeCanvas() {
      const canvas = document.getElementById('hbridgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 300;

      ctx.clearRect(0, 0, w, h);

      const topY = 40;
      const botY = 260;
      const leftX = 80;
      const rightX = w - 80;
      const midY = (topY + botY) / 2;

      // DC Rails
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(40, topY); ctx.lineTo(w - 40, topY); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText('+VDC (120V)', 45, topY - 10);

      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath(); ctx.moveTo(40, botY); ctx.lineTo(w - 40, botY); ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('GND', 45, botY + 20);

      const mode = state.hbridge.mode;
      const s1 = (mode === 'forward');
      const s4 = (mode === 'forward' || mode === 'brake');
      const s2 = (mode === 'reverse' || mode === 'brake');
      const s3 = (mode === 'reverse');

      // 4 Switches
      drawCircuitSwitch(ctx, leftX, 85, s1, 'S1');
      drawCircuitSwitch(ctx, rightX, 85, s3, 'S3');
      drawCircuitSwitch(ctx, leftX, 215, s2, 'S2');
      drawCircuitSwitch(ctx, rightX, 215, s4, 'S4');

      // Center Motor Circle
      ctx.beginPath();
      ctx.arc(w / 2, midY, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b'; ctx.fill();
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px JetBrains Mono'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('M', w / 2, midY);

      // Connecting wires to Motor
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(leftX, midY); ctx.lineTo(w / 2 - 26, midY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightX, midY); ctx.lineTo(w / 2 + 26, midY); ctx.stroke();

      // Highlight active current flow path
      if (s1 && s4) {
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(leftX, topY); ctx.lineTo(leftX, midY); ctx.lineTo(rightX, midY); ctx.lineTo(rightX, botY);
        ctx.stroke();
      } else if (s2 && s3) {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rightX, topY); ctx.lineTo(rightX, midY); ctx.lineTo(leftX, midY); ctx.lineTo(leftX, botY);
        ctx.stroke();
      }
    }

    function drawCircuitSwitch(ctx, x, y, isOn, name) {
      ctx.save();
      ctx.fillStyle = isOn ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = isOn ? '#10b981' : '#64748b';
      ctx.lineWidth = isOn ? 3 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 22, y - 16, 44, 32, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isOn ? '#34d399' : '#94a3b8';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(name, x, y - 4);
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(isOn ? 'ON' : 'OFF', x, y + 8);
      ctx.restore();
    }

    function setHBridgeMode(mode) {
      state.hbridge.mode = mode;
      const modes = ['fwd', 'rev', 'brake', 'coast'];
      modes.forEach(m => {
        const btn = document.getElementById(`btnHb${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (btn) btn.className = 'py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition font-mono';
      });

      const label = document.getElementById('hbridgeStateLabel');
      if (mode === 'forward') {
        document.getElementById('btnHbFwd').className = 'py-2 rounded-lg bg-emerald-900/60 border border-emerald-500 text-emerald-300 font-bold transition font-mono';
        label.innerText = 'İLERİ SÜRÜŞ (S1 & S4 ON)';
        label.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300';
        setArmatureVoltage(120 * state.hbridge.dutyCycle);
      } else if (mode === 'reverse') {
        document.getElementById('btnHbRev').className = 'py-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 font-bold transition font-mono';
        label.innerText = 'GERİ SÜRÜŞ (S2 & S3 ON)';
        label.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300';
        setArmatureVoltage(-120 * state.hbridge.dutyCycle);
      } else if (mode === 'brake') {
        document.getElementById('btnHbBrake').className = 'py-2 rounded-lg bg-rose-900/60 border border-rose-500 text-rose-300 font-bold transition font-mono';
        label.innerText = 'DİNAMİK FRENLEME (S2 & S4 ON)';
        label.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300';
        setArmatureVoltage(0);
      } else if (mode === 'coast') {
        document.getElementById('btnHbCoast').className = 'py-2 rounded-lg bg-slate-700 border border-slate-500 text-white font-bold transition font-mono';
        label.innerText = 'BOŞTA / KESİMDE (TÜM ANAHTARLAR OFF)';
        label.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400';
        setArmatureVoltage(0);
      }
      drawHBridgeCanvas();
    }

    function setPwmDuty(val) {
      state.hbridge.dutyCycle = parseFloat(val) / 100.0;
      document.getElementById('labelPwmVal').innerText = val + ' %';
      const veff = 120 * state.hbridge.dutyCycle;
      document.getElementById('labelVeff').innerText = veff.toFixed(1) + ' V (@120V)';
      if (state.hbridge.mode === 'forward') setArmatureVoltage(veff);
      else if (state.hbridge.mode === 'reverse') setArmatureVoltage(-veff);
    }

    function drawUniversalCircuitCanvas() {
      const canvas = document.getElementById('universalCircuitCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 300;

      ctx.clearRect(0, 0, w, h);

      // Simple Universal Motor Circuit Schematic
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      // Supply symbol
      ctx.beginPath();
      ctx.arc(60, 150, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(state.univ.isAC ? '~ AC' : '= DC', 60, 150);

      // Stator Field Winding (Coil symbol)
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Kutup Rf, Lf', 160, 80);
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(60, 130); ctx.lineTo(60, 100); ctx.lineTo(130, 100); ctx.stroke();
      // 3 loops
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(140 + i * 16, 100, 8, Math.PI, 0); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(140 + 4 * 16, 100); ctx.lineTo(240, 100); ctx.stroke();

      // DPDT Armature Switch
      ctx.fillStyle = '#ec4899';
      ctx.fillText(state.univ.armatureReversed ? 'DPDT: TERS' : 'DPDT: DÜZ', 290, 80);

      // Rotor Armature Circle
      ctx.beginPath();
      ctx.arc(330, 150, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8'; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillText('M', 330, 150);

      // Return wire
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath(); ctx.moveTo(330, 174); ctx.lineTo(330, 200); ctx.lineTo(60, 200); ctx.lineTo(60, 170); ctx.stroke();
    }

    function toggleUnivSupplyType() {
      state.univ.isAC = !state.univ.isAC;
      const btn = document.getElementById('btnUnivSupplyToggle');
      if (btn) btn.innerText = state.univ.isAC ? 'Besleme: 120V AC (60 Hz)' : 'Besleme: 120V DC';
      drawUniversalCircuitCanvas();
    }

    function toggleUnivArmatureSwitch() {
      state.univ.armatureReversed = !state.univ.armatureReversed;
      const btn = document.getElementById('btnUnivArmatureToggle');
      if (btn) btn.innerText = state.univ.armatureReversed ? 'Armatür DPDT: TERS' : 'Armatür DPDT: DÜZ';
      const desc = document.getElementById('univCircuitDesc');
      if (state.univ.armatureReversed) {
        desc.innerHTML = '<strong class="text-rose-400">Armatür Akımı Terslendi:</strong> Manyetik kutup akısı aynı kalırken sadece endüvi akımı terslendi $\\implies$ <strong class="text-rose-400">DÖNÜŞ YÖNÜ TERSİNE DÖNER (CCW)!</strong>';
      } else {
        desc.innerHTML = '<strong class="text-emerald-400">Armatür Düz Bağlı:</strong> Standart ileri yönlü saat ibreleri (CW) torku üretilir.';
      }
      drawUniversalCircuitCanvas();
      renderKaTeX();
    }

    // =========================================================================
    // BLDC LAB & OSCILLOSCOPE ENGINES
    // =========================================================================
    const bldcSteps = [
      { step: 1, angle: '0°-60°', h1: 1, h2: 0, h3: 1, pos: 'A', neg: 'B', name: 'A+ B-' },
      { step: 2, angle: '60°-120°', h1: 1, h2: 0, h3: 0, pos: 'A', neg: 'C', name: 'A+ C-' },
      { step: 3, angle: '120°-180°', h1: 1, h2: 1, h3: 0, pos: 'B', neg: 'C', name: 'B+ C-' },
      { step: 4, angle: '180°-240°', h1: 0, h2: 1, h3: 0, pos: 'B', neg: 'A', name: 'B+ A-' },
      { step: 5, angle: '240°-300°', h1: 0, h2: 1, h3: 1, pos: 'C', neg: 'A', name: 'C+ A-' },
      { step: 6, angle: '300°-360°', h1: 0, h2: 0, h3: 1, pos: 'C', neg: 'B', name: 'C+ B-' }
    ];

    function drawBldcBridgeCanvas() {
      const canvas = document.getElementById('bldcBridgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 650;
      const h = canvas.height = canvas.parentElement.clientHeight || 320;

      ctx.clearRect(0, 0, w, h);

      const cur = bldcSteps[state.bldc.step - 1];

      // Highlight truth table row
      for (let i = 1; i <= 6; i++) {
        const row = document.getElementById(`row-step-${i}`);
        if (row) row.className = (i === state.bldc.step) ? 'bg-cyan-950/70 text-cyan-300 font-bold border-l-4 border-cyan-400' : '';
      }

      const label = document.getElementById('bldcCurrentStepLabel');
      if (label) label.innerText = `Adım ${cur.step} (${cur.name})`;

      // DC Rails
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(50, 40); ctx.lineTo(w - 50, 40); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText('+VDC', 55, 30);

      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath(); ctx.moveTo(50, 280); ctx.lineTo(w - 50, 280); ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('GND', 55, 300);

      // 3 Inverter Legs
      const legSpacing = (w - 100) / 4;
      const phases = ['A', 'B', 'C'];

      phases.forEach((ph, idx) => {
        const legX = 50 + (idx + 1) * legSpacing;
        const isUpperOn = (cur.pos === ph);
        const isLowerOn = (cur.neg === ph);

        // Leg wire
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(legX, 40); ctx.lineTo(legX, 280); ctx.stroke();

        // Upper MOSFET
        drawCircuitSwitch(ctx, legX, 90, isUpperOn, `${ph}+ (Q${idx*2+1})`);
        // Lower MOSFET
        drawCircuitSwitch(ctx, legX, 230, isLowerOn, `${ph}- (Q${idx*2+2})`);

        // Phase output tap
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px JetBrains Mono';
        ctx.fillText(`Faz ${ph}`, legX + 15, 160);

        if (isUpperOn) {
          ctx.strokeStyle = '#10b981'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(legX, 40); ctx.lineTo(legX, 160); ctx.stroke();
        } else if (isLowerOn) {
          ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(legX, 160); ctx.lineTo(legX, 280); ctx.stroke();
        }
      });
    }

    function drawBldcOscilloscope() {
      const canvas = document.getElementById('bldcOscilloscopeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 800;
      const h = canvas.height = canvas.parentElement.clientHeight || 220;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const midY = h / 2;
      const colors = ['#38bdf8', '#34d399', '#f59e0b'];
      const phaseOffsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

      for (let p = 0; p < 3; p++) {
        ctx.strokeStyle = colors[p]; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const theta = (x / w) * (Math.PI * 4) + phaseOffsets[p];
          const sinVal = Math.sin(theta);
          let trapVal = (sinVal > 0.5) ? 1 : ((sinVal < -0.5) ? -1 : sinVal / 0.5);
          const y = midY - trapVal * 45;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Cursor marker for current step
      const curX = ((state.bldc.step - 0.5) / 6) * (w / 2);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(curX, 0); ctx.lineTo(curX, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`Adım ${state.bldc.step}`, curX + 5, 20);
    }

    function nextBldcStep() {
      if (state.bldc.dir === 1) state.bldc.step = (state.bldc.step % 6) + 1;
      else state.bldc.step = state.bldc.step === 1 ? 6 : state.bldc.step - 1;
      drawBldcBridgeCanvas(); drawBldcOscilloscope();
    }

    function prevBldcStep() {
      if (state.bldc.dir === 1) state.bldc.step = state.bldc.step === 1 ? 6 : state.bldc.step - 1;
      else state.bldc.step = (state.bldc.step % 6) + 1;
      drawBldcBridgeCanvas(); drawBldcOscilloscope();
    }

    function toggleBldcAutoPlay() {
      state.bldc.auto = !state.bldc.auto;
      const btn = document.getElementById('btnBldcAutoPlay');
      if (state.bldc.auto) {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Durdur';
        state.bldc.timer = setInterval(nextBldcStep, 700);
      } else {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Otomatik Komütasyon';
        clearInterval(state.bldc.timer);
      }
    }

    function setBldcDirection(dir) {
      state.bldc.dir = dir;
      const btnCW = document.getElementById('bldcDirCW');
      const btnCCW = document.getElementById('bldcDirCCW');
      if (dir === 1) {
        btnCW.className = 'px-2.5 py-1 rounded bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold transition';
        btnCCW.className = 'px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold transition';
      } else {
        btnCW.className = 'px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold transition';
        btnCCW.className = 'px-2.5 py-1 rounded bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold transition';
      }
    }

    // =========================================================================
    // UNIVERSAL MOTOR CALCULATOR & PHASOR
    // =========================================================================
    function calculateUniversalMotor() {
      const V = parseFloat(document.getElementById('sliderUnivV').value);
      const I = parseFloat(document.getElementById('sliderUnivI').value);
      const R = parseFloat(document.getElementById('sliderUnivR').value);
      const X = parseFloat(document.getElementById('sliderUnivX').value);
      const Nac = parseFloat(document.getElementById('sliderUnivNac').value);

      document.getElementById('labelUnivV').innerText = V.toFixed(0) + ' V';
      document.getElementById('labelUnivI').innerText = I.toFixed(1) + ' A';
      document.getElementById('labelUnivR').innerText = R.toFixed(1) + ' Ω';
      document.getElementById('labelUnivX').innerText = X.toFixed(1) + ' Ω';
      document.getElementById('labelUnivNac').innerText = Nac.toFixed(0) + ' d/d';

      const IX = I * X;
      const IR = I * R;
      const underRoot = (V * V) - (IX * IX);

      let Eac = 0, cosPhi = 0, Edc = 0, Ndc = 0;
      if (underRoot > 0) {
        Eac = Math.max(0, Math.sqrt(underRoot) - IR);
        cosPhi = (Eac + IR) / V;
        Edc = Math.max(0, V - IR);
        Ndc = (Eac > 0) ? Nac * (Edc / Eac) : 0;
      }

      const Pin = V * I * cosPhi;
      const Pout = Eac * I;
      const eff = (Pin > 0) ? (Pout / Pin) * 100 : 0;

      document.getElementById('resUnivEac').innerText = Eac.toFixed(1) + ' V';
      document.getElementById('resUnivEdc').innerText = Edc.toFixed(1) + ' V';
      document.getElementById('resUnivCosPhi').innerText = cosPhi.toFixed(3);
      document.getElementById('resUnivNdc').innerText = Ndc.toFixed(0) + ' d/d';
      document.getElementById('resUnivPin').innerText = Pin.toFixed(1) + ' W';
      document.getElementById('resUnivEff').innerText = eff.toFixed(1) + ' %';

      drawUniversalPhasor(V, IR, IX, Eac);
    }

    function drawUniversalPhasor(V = 120, IR = 30, IX = 48, Eac = 80) {
      const canvas = document.getElementById('universalPhasorCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 310;

      ctx.clearRect(0, 0, w, h);

      const ox = 50, oy = h - 50;
      const scale = 1.8;
      const baseLen = (Eac + IR) * scale;
      const heightLen = IX * scale;

      // Base vector Eac + IR
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + baseLen, oy); ctx.stroke();
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`E_a + I·R (${(Eac + IR).toFixed(1)} V)`, ox + baseLen / 2 - 25, oy + 20);

      // Height vector IX
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(ox + baseLen, oy); ctx.lineTo(ox + baseLen, oy - heightLen); ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`I·X_L (${IX.toFixed(1)} V)`, ox + baseLen + 10, oy - heightLen / 2);

      // Total V
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + baseLen, oy - heightLen); ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`V = ${V.toFixed(0)} V`, ox + baseLen / 2 - 15, oy - heightLen / 2 - 10);
    }

    // =========================================================================
    // SERVO ENCODER & RESOLVER
    // =========================================================================
    function drawEncoderCanvas() {
      const canvas = document.getElementById('encoderCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 270;

      ctx.clearRect(0, 0, w, h);
      const rowH = h / 3;
      const t = performance.now() * 0.003 * state.encoder.dir;

      const channels = [
        { name: 'Kanal A', color: '#38bdf8', offset: 0 },
        { name: 'Kanal B (90° Faz)', color: '#34d399', offset: (state.encoder.dir === 1) ? Math.PI / 2 : -Math.PI / 2 },
        { name: 'Kanal Z (Index Palsi)', color: '#f59e0b', offset: 0, isZ: true }
      ];

      channels.forEach((ch, idx) => {
        const yBase = idx * rowH + rowH * 0.75;
        ctx.fillStyle = ch.color; ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(ch.name, 15, idx * rowH + 20);

        ctx.strokeStyle = ch.color; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let x = 80; x < w; x++) {
          let val = 0;
          if (ch.isZ) {
            const phase = ((x * 0.02 + t * 0.2) % (Math.PI * 8));
            val = (phase > 0 && phase < 0.4) ? 1 : 0;
          } else {
            val = Math.sin((x * 0.05) + t + ch.offset) > 0 ? 1 : 0;
          }
          const y = yBase - val * 35;
          if (x === 80) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    }

    function setEncoderDir(dir) {
      state.encoder.dir = dir;
      const badge = document.getElementById('encoderDirBadge');
      if (dir === 1) {
        badge.innerText = "CW (A, B'den 90° Önce)";
        badge.className = 'text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300';
      } else {
        badge.innerText = "CCW (B, A'dan 90° Önce)";
        badge.className = 'text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300';
      }
      drawEncoderCanvas();
    }

    function updateEncoderSim() {
      const ppr = parseInt(document.getElementById('selectEncoderPpr').value);
      state.encoder.ppr = ppr;
      document.getElementById('enc4xCount').innerText = (ppr * 4).toLocaleString() + ' darbe/tur';
      document.getElementById('encPulseFreq').innerText = ((ppr * 1200) / 60000).toFixed(1) + ' kHz';
    }

    function drawResolverCanvas() {
      const canvas = document.getElementById('resolverCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 270;

      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.002;
      const rowH = h / 2;

      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('V_sin = sin(θ)·sin(ω_c t)', 15, 20);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.25);
        const mod = Math.sin(t * 0.5 + x * 0.015);
        const y = rowH * 0.5 - (carrier * mod) * 35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.fillText('V_cos = cos(θ)·sin(ω_c t)', 15, rowH + 20);
      ctx.strokeStyle = '#a855f7'; ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.25);
        const mod = Math.cos(t * 0.5 + x * 0.015);
        const y = rowH * 1.5 - (carrier * mod) * 35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // =========================================================================
    // STEPPER MOTOR ENGINE
    // =========================================================================
    function calculateStepper() {
      const m = parseInt(document.getElementById('sliderStepM').value);
      const nr = parseInt(document.getElementById('sliderStepNr').value);
      const rpm = parseInt(document.getElementById('sliderStepRpm').value);

      document.getElementById('labelStepM').innerText = m + ' Faz';
      document.getElementById('labelStepNr').innerText = nr + ' Diş';
      document.getElementById('labelStepRpm').innerText = rpm + ' d/d';

      let stepAngle = 360.0 / (m * nr);
      let stepsPerRev = m * nr;
      if (state.stepper.mode === 'half') { stepAngle /= 2.0; stepsPerRev *= 2; }
      else if (state.stepper.mode === 'micro') { stepAngle /= 8.0; stepsPerRev *= 8; }

      const fStep = (rpm * stepsPerRev) / 60.0;
      document.getElementById('resStepAngle').innerText = stepAngle.toFixed(3) + '°';
      document.getElementById('resStepCount').innerText = stepsPerRev.toLocaleString() + ' adım/tur';
      document.getElementById('resStepFreq').innerText = (fStep >= 1000) ? (fStep / 1000).toFixed(2) + ' kHz' : fStep.toFixed(0) + ' Hz';
      document.getElementById('resStepPeriod').innerText = ((1.0 / fStep) * 1e6).toFixed(1) + ' µs';

      drawStepperCanvas();
    }

    function setStepperDriveMode(mode) {
      state.stepper.mode = mode;
      const modes = ['wave', 'full', 'half', 'micro'];
      modes.forEach(m => {
        const btn = document.getElementById(`btnStep${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (btn) btn.className = (m === mode) ? 'py-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 font-bold transition' : 'py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition';
      });
      calculateStepper();
    }

    function drawStepperCanvas() {
      const canvas = document.getElementById('stepperCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 320;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.40;

      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = '#334155'; ctx.lineWidth = 10; ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * (r - 12);
        const py = cy + Math.sin(ang) * (r - 12);
        const isActive = (i % 2 === 0);
        ctx.fillStyle = isActive ? '#f59e0b' : '#1e293b';
        ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = isActive ? '#fbbf24' : '#475569'; ctx.stroke();
        ctx.fillStyle = isActive ? '#000000' : '#94a3b8'; ctx.font = 'bold 9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String.fromCharCode(65 + (i % 4)), px, py);
      }

      const rotorR = r * 0.55;
      ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(cx, cy, rotorR, 0, Math.PI * 2); ctx.fill();

      // 50 teeth
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 50; i++) {
        const tAng = (i / 50) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tAng) * (rotorR - 4), cy + Math.sin(tAng) * (rotorR - 4));
        ctx.lineTo(cx + Math.cos(tAng) * (rotorR + 5), cy + Math.sin(tAng) * (rotorR + 5));
        ctx.stroke();
      }
    }

    // =========================================================================
    // ACTIVE LEARNING & EXAM BANK CONTROLS
    // =========================================================================
    function toggleSolution(solId, btn) {
      const el = document.getElementById(solId);
      if (!el) return;
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Çözümü Gizle';
      } else {
        el.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Çözümü Göster';
      }
    }

    function sendQuestionToSim(qId) {
      if (qId === 1) {
        switchTab('tab-direction-lab');
      } else if (qId === 2) {
        state.bldc.step = 3; // [1, 1, 0] step
        switchTab('tab-bldc');
      } else if (qId === 3) {
        switchTab('tab-universal');
      } else if (qId === 4) {
        state.encoder.ppr = 4096;
        document.getElementById('selectEncoderPpr').value = '4096';
        updateEncoderSim();
        switchTab('tab-servo');
      } else if (qId === 5) {
        document.getElementById('sliderStepM').value = 4;
        document.getElementById('sliderStepNr').value = 50;
        document.getElementById('sliderStepRpm').value = 1200;
        calculateStepper();
        switchTab('tab-stepper');
      }
    }

    // =========================================================================
    // DOCUMENT MANAGER & INDEXEDDB LOCAL STORAGE
    // =========================================================================
    function handleUserDocUpload() {
      const title = document.getElementById('inputDocTitle').value.trim();
      const author = document.getElementById('inputDocAuthor').value.trim();
      const simTab = document.getElementById('selectDocSim').value;
      const fileInput = document.getElementById('inputFileUpload');

      if (!title || fileInput.files.length === 0) {
        alert('Lütfen bir başlık girin ve dosya seçin.');
        return;
      }

      const file = fileInput.files[0];
      const container = document.getElementById('docListContainer');

      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-wrap items-center justify-between gap-3';
      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 text-[10px] font-bold font-mono">KULLANICI NOTU</span>
            <span class="font-bold text-white text-sm">${title}</span>
          </div>
          <div class="text-xs text-slate-400 font-mono">
            Yazar: <strong class="text-slate-200">${author || 'Muhammet Raşit Taflan'}</strong> • Dosya: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)
          </div>
          <div class="text-[11px] text-cyan-400 font-mono pt-1">
            <button onclick="switchTab('${simTab}')" class="hover:underline flex items-center gap-1">
              <i class="fa-solid fa-arrow-right"></i> İlgili Simülasyona Git
            </button>
          </div>
        </div>
        <div class="text-xs font-mono text-emerald-400 font-bold">
          <i class="fa-solid fa-circle-check"></i> Yüklendi
        </div>
      `;
      container.appendChild(card);
      alert(`"${title}" başarıyla ders kütüphanesine eklendi.`);
      document.getElementById('inputDocTitle').value = '';
    }

    // --- DOM CONTENT LOADED INITIALIZATION ---
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Initialize 3D CAD Motor
      setTimeout(init3DScene, 120);

      // 2. Initialize 2D Labs
      drawDigitalTwinCanvas();
      drawHBridgeCanvas();
      drawUniversalCircuitCanvas();
      drawBldcBridgeCanvas();
      drawBldcOscilloscope();
      calculateUniversalMotor();
      drawEncoderCanvas();
      drawResolverCanvas();
      calculateStepper();

      // 3. Initial KaTeX Math Rendering
      setTimeout(renderKaTeX, 600);

      // 4. Oscilloscope redrawing timer for smooth animation
      setInterval(() => {
        if (state.activeTab === 'tab-servo') {
          drawEncoderCanvas();
          drawResolverCanvas();
        }
      }, 50);
    });
  </script>
</body>
</html>
