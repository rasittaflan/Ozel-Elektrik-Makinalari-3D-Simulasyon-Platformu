  <!-- ======================================================= -->
  <!-- JAVASCRIPT SIMULATION LOGIC & THREE.JS ENGINE v3.0.0 -->
  <!-- ======================================================= -->
  <script>
    // --- GLOBAL SIMULATION STATE & PHYSICAL CONSTANTS ---
    const state = {
      activeTab: 'tab-3d-lab',
      
      // Dynamic Motor Electrical & Mechanical State (ODE System)
      dyna: {
        Va: 120.0,       // Armature terminal voltage [V]
        ia: 4.82,        // Armature current [A] (State Variable 1)
        omega: 125.7,    // Rotor angular velocity [rad/s] (State Variable 2)
        theta: 0.0,      // Physical mechanical angle [rad]
        Ea: 85.4,        // Induced Back-EMF [V]
        Te: 0.38,        // Electromagnetic torque [N·m]
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
      isPaused: false,
      timeScale: 0.10,   // Visual slow-motion time factor (0.01 to 2.0)
      visualTheta: 0.0,  // Visual mechanical angle [rad]
      northTop: true,    // True: North on top (+Y), South on bottom (-Y)
      cameraMode: 'iso',
      explodedRatio: 0.0,
      isolatedPart: null,
      
      // Slot current signs for the 8 rotor slots: +1 = ⊙ (Out of page / +Z), -1 = ⊗ (Into page / -Z)
      // Standard initial distribution: Top half [0..3] = ⊙, Bottom half [4..7] = ⊗
      slotCurrents: [1, 1, 1, 1, -1, -1, -1, -1],

      // Vector layer toggles
      showVectors: {
        field: true,
        heatmap: false,
        current: true,
        currentFlow: true,
        force: true,
        torque: true,
        omega: true,
        labels: true
      },

      // Explainer interactive tour
      explainer: {
        active: false,
        step: 0,
        totalSteps: 8
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
        material: 'FR4 Çift Yüzlü PCB, GaAs Hall Sensör Entegreleri',
        role: 'Rotorun manyetik kutup açısını algılayarak elektronik komütasyon zamanlamasını belirler.',
        page: 'Dr. Hakan Kahveci Notları: Sayfa 50-54',
        formula: 'V_H = (I_c · B) / (q · n · d)'
      }
    };

    // =========================================================================
    // THREE.JS 3D MOTOR WORKSTATION ENGINE v3.0
    // =========================================================================
    let scene3d, camera3d, renderer3d, controls3d;
    let motorAssemblyGroup, statorMeshGroup, poleGroup, rotorMeshGroup, windingsMeshGroup, commMeshGroup, brushMeshGroup, hallMeshGroup, shaftMeshGroup;
    let vectorArrowGroup, fluxTubesGroup, airgapHeatmapMesh, slotBadgesGroup, conductorParticlesGroup, forceArrowsGroup, rotationRingMesh, omegaVectorArrow, labels3DGroup;
    let poleNMesh, poleSMesh;
    let fluxCurveList = [], fluxArrowCones = [];
    let slotBadges = [], forceArrowHelpers = [], slotParticleList = [];
    let raycaster, mouse;
    let hoveredMesh = null, selectedMesh = null;

    function init3DScene() {
      const container = document.getElementById('canvas3dContainer');
      const canvas = document.getElementById('motor3dCanvas');
      if (!container || !canvas) return;

      // 1. Scene setup
      scene3d = new THREE.Scene();
      scene3d.background = new THREE.Color(0x040812);

      // 2. Camera setup - Positioned perfectly for optimal scale
      camera3d = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.05, 50);
      camera3d.position.set(0.28, 0.20, 0.32);

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
      controls3d.minDistance = 0.10;
      controls3d.maxDistance = 1.5;
      controls3d.target.set(0, 0, 0);

      // 5. Studio Multi-Point High-Contrast Lighting (Ensures interior is fully visible)
      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene3d.add(ambLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
      keyLight.position.set(0.6, 0.9, 0.7);
      keyLight.castShadow = true;
      scene3d.add(keyLight);

      const frontFill = new THREE.DirectionalLight(0xe0f2fe, 0.75);
      frontFill.position.set(0, 0.1, 0.8);
      scene3d.add(frontFill);

      const fillLightCyan = new THREE.DirectionalLight(0x38bdf8, 0.65);
      fillLightCyan.position.set(-0.6, -0.4, -0.4);
      scene3d.add(fillLightCyan);

      const interiorPointLight = new THREE.PointLight(0xffffff, 0.9, 0.3);
      interiorPointLight.position.set(0, 0, 0.08);
      scene3d.add(interiorPointLight);

      // 6. Raycaster for Component Picking
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      canvas.addEventListener('mousemove', on3DMouseMove);
      canvas.addEventListener('click', on3DMouseClick);

      // 7. Build Complete 3D Motor & Electromagnetic Overlays
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
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x3b4d66, metalness: 0.82, roughness: 0.25 });
      const darkLamiMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.70, roughness: 0.40 });
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.92, roughness: 0.18 });
      const northMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.65, roughness: 0.35 }); // Red North
      const southMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.65, roughness: 0.35 }); // Blue South
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
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

      // Mounting Feet
      const footGeom = new THREE.BoxGeometry(0.035, 0.012, 0.16);
      const footLeft = new THREE.Mesh(footGeom, steelMat);
      footLeft.position.set(-0.085, -0.098, 0);
      footLeft.userData = { id: 'casing' };
      statorMeshGroup.add(footLeft);

      const footRight = new THREE.Mesh(footGeom, steelMat);
      footRight.position.set(0.085, -0.098, 0);
      footRight.userData = { id: 'casing' };
      statorMeshGroup.add(footRight);

      // Terminal Connection Box
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
      const poleNGeom = new THREE.BoxGeometry(0.056, 0.026, 0.12);
      poleNMesh = new THREE.Mesh(poleNGeom, northMat);
      poleNMesh.position.set(0, 0.068, 0);
      poleNMesh.userData = { id: 'pole_n' };
      poleGroup.add(poleNMesh);

      // Field Coil North
      const coilNGeom = new THREE.TorusGeometry(0.028, 0.010, 14, 28);
      const coilN = new THREE.Mesh(coilNGeom, copperMat);
      coilN.rotation.x = Math.PI / 2;
      coilN.position.set(0, 0.072, 0);
      coilN.userData = { id: 'pole_n' };
      poleGroup.add(coilN);

      // South Pole Shoe (Bottom)
      poleSMesh = new THREE.Mesh(poleNGeom, southMat);
      poleSMesh.position.set(0, -0.068, 0);
      poleSMesh.userData = { id: 'pole_s' };
      poleGroup.add(poleSMesh);

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

      // Bearings
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
        const condGeom = new THREE.CylinderGeometry(0.0052, 0.0052, 0.124, 14);
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

      // Mica Insulating Slots
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

      // --- F. HALL SENSOR PCB ---
      hallMeshGroup = new THREE.Group();
      motorAssemblyGroup.add(hallMeshGroup);

      const pcbRingGeom = new THREE.RingGeometry(0.052, 0.075, 32);
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, side: THREE.DoubleSide });
      const pcbMesh = new THREE.Mesh(pcbRingGeom, pcbMat);
      pcbMesh.position.set(0, 0, -0.076);
      pcbMesh.userData = { id: 'hall_pcb' };
      hallMeshGroup.add(pcbMesh);

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

      // =======================================================================
      // ELECTROMAGNETIC VECTOR LAYERS v3.0 (SUPERIOR VISIBILITY & ACCURACY)
      // =======================================================================
      vectorArrowGroup = new THREE.Group();
      motorAssemblyGroup.add(vectorArrowGroup);

      // 1. STATOR MAGNETIC FLUX LINES & ANIMATED ARROWHEADS
      buildHighVisibilityFluxLines();

      // 2. AIR-GAP FLUX DENSITY HEATMAP MESH
      buildAirgapHeatmapMesh();

      // 3. 3D ROTOR SLOT BADGES (⊙ / ⊗ Signs and Slot Numbers)
      build3DSlotBadges();

      // 4. ANIMATED CONDUCTOR CURRENT PARTICLES
      buildConductorParticles();

      // 5. 3D LORENTZ FORCE VECTORS ON ROTOR SLOTS
      build3DForceVectors();

      // 6. MECHANICAL ROTATION RING (TORQUE DIRECTION)
      buildMechanicalRotationRing();

      // 7. AXIAL ANGULAR VELOCITY OMEGA VECTOR ARROW
      buildAxialOmegaArrow();

      // 8. 3D FLOATING TECHNICAL COMPONENT LABELS
      build3DComponentLabels();
    }

    // --- 1. HIGH-VISIBILITY MAGNETIC FLUX LINES ---
    function buildHighVisibilityFluxLines() {
      fluxTubesGroup = new THREE.Group();
      vectorArrowGroup.add(fluxTubesGroup);

      fluxCurveList = [];
      fluxArrowCones = [];

      const fluxTubeMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        emissive: 0x007799,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });

      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.0,
        roughness: 0.1
      });

      // 9 distributed flux paths across the pole shoe width and depth
      const xOffsets = [-0.030, -0.020, -0.010, 0, 0.010, 0.020, 0.030];
      const zOffsets = [-0.028, 0, 0.028];

      xOffsets.forEach(xOff => {
        zOffsets.forEach(zOff => {
          // Curve from North pole (Y > 0) to South pole (Y < 0) through airgap
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(xOff, 0.066, zOff),
            new THREE.Vector3(xOff * 0.85, 0.035, zOff * 0.9),
            new THREE.Vector3(xOff * 0.70, 0.0, zOff * 0.8),
            new THREE.Vector3(xOff * 0.85, -0.035, zOff * 0.9),
            new THREE.Vector3(xOff, -0.066, zOff)
          ]);
          fluxCurveList.push(curve);

          // Thick prominent tube (radius 0.0032 = 3.2 mm)
          const tubeGeom = new THREE.TubeGeometry(curve, 24, 0.0028, 8, false);
          const tubeMesh = new THREE.Mesh(tubeGeom, fluxTubeMat);
          fluxTubesGroup.add(tubeMesh);

          // 2 directional arrowheads along each tube
          for (let k = 0; k < 2; k++) {
            const coneGeom = new THREE.ConeGeometry(0.0055, 0.014, 10);
            coneGeom.rotateX(Math.PI / 2); // Default pointing +Z
            const cone = new THREE.Mesh(coneGeom, coneMat);
            fluxTubesGroup.add(cone);
            fluxArrowCones.push({
              mesh: cone,
              curve: curve,
              baseOffset: k * 0.5
            });
          }
        });
      });
    }

    // --- 2. AIR-GAP FLUX DENSITY HEATMAP MESH ---
    function buildAirgapHeatmapMesh() {
      const radius = 0.048;
      const height = 0.126;
      const radialSegs = 48;
      const geom = new THREE.CylinderGeometry(radius, radius, height, radialSegs, 1, true);
      geom.rotateX(Math.PI / 2);

      // Create vertex colors based on B(theta) = Bmax * cos(theta_e)
      const count = geom.attributes.position.count;
      const colors = new Float32Array(count * 3);
      const pos = geom.attributes.position;

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const angle = Math.atan2(y, x);
        const bNorm = Math.abs(Math.sin(angle)); // High under poles (Y=+/-), low at neutral (X=+/-)

        // Color gradient: Blue (0.0T) -> Green (0.5T) -> Red (1.0T)
        let r, g, b;
        if (bNorm < 0.5) {
          const t = bNorm / 0.5;
          r = 0.1 * (1 - t) + 0.1 * t;
          g = 0.3 * (1 - t) + 0.9 * t;
          b = 0.9 * (1 - t) + 0.2 * t;
        } else {
          const t = (bNorm - 0.5) / 0.5;
          r = 0.1 * (1 - t) + 0.95 * t;
          g = 0.9 * (1 - t) + 0.15 * t;
          b = 0.2 * (1 - t) + 0.1 * t;
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });

      airgapHeatmapMesh = new THREE.Mesh(geom, mat);
      airgapHeatmapMesh.visible = state.showVectors.heatmap;
      vectorArrowGroup.add(airgapHeatmapMesh);
    }

    // --- 3. 3D ROTOR SLOT BADGES (⊙ and ⊗ Signs) ---
    function build3DSlotBadges() {
      slotBadgesGroup = new THREE.Group();
      rotorMeshGroup.add(slotBadgesGroup);

      slotBadges = [];

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 0.040;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = 0.068; // Front face

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const texture = new THREE.CanvasTexture(canvas);

        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x, y, z);
        sprite.scale.set(0.020, 0.020, 1);
        sprite.userData = { slotIndex: i };
        slotBadgesGroup.add(sprite);

        slotBadges.push({
          sprite: sprite,
          canvas: canvas,
          ctx: canvas.getContext('2d'),
          texture: texture,
          slotIndex: i
        });
      }

      updateAllSlotBadges();
    }

    function updateAllSlotBadges() {
      slotBadges.forEach((b, i) => {
        const ctx = b.ctx;
        const isOut = (state.slotCurrents[i] === 1);
        ctx.clearRect(0, 0, 128, 128);

        // Circular background
        ctx.beginPath();
        ctx.arc(64, 64, 58, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = isOut ? '#06b6d4' : '#f97316';
        ctx.stroke();

        // Slot number at top
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Oluk ${i + 1}`, 64, 30);

        // Current Symbol
        ctx.font = 'bold 52px JetBrains Mono, monospace';
        ctx.fillStyle = isOut ? '#22d3ee' : '#fb923c';
        ctx.fillText(isOut ? '⊙' : '⊗', 64, 76);

        // Subtitle
        ctx.font = 'bold 18px JetBrains Mono, monospace';
        ctx.fillStyle = isOut ? '#67e8f9' : '#fdba74';
        ctx.fillText(isOut ? 'DIŞ' : 'İÇ', 64, 110);

        b.texture.needsUpdate = true;
      });
    }

    // --- 4. ANIMATED CONDUCTOR CURRENT PARTICLES ---
    function buildConductorParticles() {
      conductorParticlesGroup = new THREE.Group();
      rotorMeshGroup.add(conductorParticlesGroup);
      slotParticleList = [];

      const pGeom = new THREE.SphereGeometry(0.0022, 8, 8);
      const cyanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const amberMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 0.040;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        for (let p = 0; p < 3; p++) {
          const zInit = -0.05 + p * 0.05;
          const isOut = (state.slotCurrents[i] === 1);
          const pMesh = new THREE.Mesh(pGeom, isOut ? cyanMat : amberMat);
          pMesh.position.set(x, y, zInit);
          conductorParticlesGroup.add(pMesh);

          slotParticleList.push({
            mesh: pMesh,
            slotIndex: i,
            baseAngle: angle,
            r: r,
            z: zInit,
            cyanMat: cyanMat,
            amberMat: amberMat
          });
        }
      }
    }

    // --- 5. 3D LORENTZ FORCE VECTORS ON ROTOR SLOTS ---
    function build3DForceVectors() {
      forceArrowsGroup = new THREE.Group();
      motorAssemblyGroup.add(forceArrowsGroup);
      forceArrowHelpers = [];

      for (let i = 0; i < 8; i++) {
        // Arrow pointing tangentially from each slot
        const dir = new THREE.Vector3(1, 0, 0);
        const origin = new THREE.Vector3(0, 0, 0.068);
        const arrow = new THREE.ArrowHelper(dir, origin, 0.035, 0x10b981, 0.010, 0.006);
        arrow.line.material.linewidth = 3;
        forceArrowsGroup.add(arrow);
        forceArrowHelpers.push(arrow);
      }
    }

    // --- 6. MECHANICAL ROTATION RING (TORQUE DIRECTION) ---
    function buildMechanicalRotationRing() {
      const ringGeom = new THREE.TorusGeometry(0.056, 0.0025, 12, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xbe185d,
        emissiveIntensity: 0.85,
        roughness: 0.2
      });
      rotationRingMesh = new THREE.Mesh(ringGeom, ringMat);
      rotationRingMesh.position.set(0, 0, 0.070);
      vectorArrowGroup.add(rotationRingMesh);

      // Add 4 directional arrow cones along the ring
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const coneGeom = new THREE.ConeGeometry(0.005, 0.012, 8);
        coneGeom.rotateZ(-Math.PI / 2);
        const cone = new THREE.Mesh(coneGeom, ringMat);
        cone.position.set(Math.cos(ang) * 0.056, Math.sin(ang) * 0.056, 0);
        cone.rotation.z = ang;
        rotationRingMesh.add(cone);
      }
    }

    // --- 7. AXIAL ANGULAR VELOCITY OMEGA VECTOR ARROW ---
    function buildAxialOmegaArrow() {
      const dir = new THREE.Vector3(0, 0, -1); // Points into screen for CW
      const origin = new THREE.Vector3(0, 0, 0.12);
      omegaVectorArrow = new THREE.ArrowHelper(dir, origin, 0.065, 0x818cf8, 0.018, 0.010);
      omegaVectorArrow.line.material.linewidth = 4;
      vectorArrowGroup.add(omegaVectorArrow);
    }

    // --- 8. 3D FLOATING TECHNICAL COMPONENT LABELS ---
    function build3DComponentLabels() {
      labels3DGroup = new THREE.Group();
      motorAssemblyGroup.add(labels3DGroup);

      const labelData = [
        { text: 'Stator Gövdesi', pos: [0, 0.115, 0] },
        { text: 'N Kutup Pabucu', pos: [0, 0.075, 0.03] },
        { text: 'S Kutup Pabucu', pos: [0, -0.075, 0.03] },
        { text: '8 Oluklu Lamine Rotor', pos: [0.055, 0.02, 0] },
        { text: 'Bakır Endüvi Sargıları', pos: [-0.050, 0.02, 0.02] },
        { text: 'Kolektör Dilimleri', pos: [0.035, 0.02, 0.096] },
        { text: 'Grafit Fırçalar', pos: [-0.045, 0, 0.096] },
        { text: 'Transmisyon Mili', pos: [0, 0, 0.15] }
      ];

      labelData.forEach(item => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(4, 4, 248, 56, 12);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, 128, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(item.pos[0], item.pos[1], item.pos[2]);
        sprite.scale.set(0.050, 0.0125, 1);
        labels3DGroup.add(sprite);
      });
    }

    // =========================================================================
    // RAYCASTING & COMPONENT INSPECTOR
    // =========================================================================
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

        // Check if user clicked a rotor slot badge
        if (obj.userData && obj.userData.slotIndex !== undefined) {
          toggleSlotCurrentSign(obj.userData.slotIndex);
          return;
        }

        while (obj && !obj.userData.id && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData.id && COMPONENT_DB[obj.userData.id]) {
          showComponentInspector(obj.userData.id, obj);
        }
      }
    }

    function showComponentInspector(partId, meshObj) {
      selectedMesh = meshObj;
      const data = COMPONENT_DB[partId];
      if (!data) return;

      const card = document.getElementById('componentInspectorCard');
      document.getElementById('inspPartName').innerText = data.name;
      document.getElementById('inspPartMaterial').innerText = data.material;
      document.getElementById('inspPartFunction').innerText = data.role;
      document.getElementById('inspPartPage').innerText = data.page;
      document.getElementById('inspPartFormula').innerText = data.formula;
      card.classList.remove('hidden');

      if (window.renderMathInElement) {
        renderMathInElement(document.getElementById('inspPartFormula'), {
          delimiters: [{ left: '$', right: '$', display: false }]
        });
      }
    }

    function closeComponentInspector() {
      document.getElementById('componentInspectorCard').classList.add('hidden');
      selectedMesh = null;
    }

    function isolateInspectedPart() {
      if (!selectedMesh) return;
      const targetId = selectedMesh.userData.id;
      motorAssemblyGroup.traverse(child => {
        if (child.isMesh) {
          child.visible = (child.userData.id === targetId);
        }
      });
      state.isolatedPart = targetId;
    }

    function restoreAllParts() {
      motorAssemblyGroup.traverse(child => {
        if (child.isMesh) child.visible = true;
      });
      state.isolatedPart = null;
    }

    // =========================================================================
    // CAMERA PRESETS & VIEWPORTS
    // =========================================================================
    function setCameraPreset(mode) {
      state.cameraMode = mode;
      const duration = 800;
      const startTime = performance.now();
      const startPos = camera3d.position.clone();
      let targetPos = new THREE.Vector3(0.28, 0.20, 0.32);

      // Reset parts visibility
      restoreAllParts();
      if (statorMeshGroup) statorMeshGroup.visible = true;
      if (fluxTubesGroup) fluxTubesGroup.visible = state.showVectors.field;

      switch (mode) {
        case 'iso':
          targetPos.set(0.28, 0.20, 0.32);
          break;
        case 'front':
          targetPos.set(0, 0, 0.36);
          break;
        case 'rear':
          targetPos.set(0, 0, -0.36);
          break;
        case 'top':
          targetPos.set(0, 0.36, 0.02);
          break;
        case 'side':
          targetPos.set(0.36, 0, 0);
          break;
        case 'long_section':
          targetPos.set(0.28, 0.12, 0.25);
          if (statorMeshGroup) statorMeshGroup.children[0].visible = false;
          break;
        case 'cross_section':
          targetPos.set(0, 0, 0.30);
          if (statorMeshGroup) statorMeshGroup.children[0].visible = false;
          break;
        case 'exploded':
          targetPos.set(0.32, 0.24, 0.36);
          updateExplodedView(50);
          document.getElementById('sliderExplode').value = 50;
          break;
        case 'transparent':
          targetPos.set(0.26, 0.18, 0.30);
          statorMeshGroup.traverse(child => {
            if (child.isMesh && child.material) {
              child.material.transparent = true;
              child.material.opacity = 0.25;
            }
          });
          break;
        case 'rotor_isolated':
          targetPos.set(0.22, 0.14, 0.26);
          statorMeshGroup.visible = false;
          poleGroup.visible = false;
          break;
        case 'field_focus':
          targetPos.set(0.05, 0.05, 0.32);
          statorMeshGroup.visible = false;
          break;
        case 'force_focus':
          targetPos.set(0, 0, 0.28);
          statorMeshGroup.visible = false;
          poleGroup.visible = false;
          break;
      }

      function tweenCamera(now) {
        const progress = Math.min((now - startTime) / duration, 1.0);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        camera3d.position.lerpVectors(startPos, targetPos, ease);
        controls3d.target.set(0, 0, 0);
        controls3d.update();
        if (progress < 1.0) requestAnimationFrame(tweenCamera);
      }
      requestAnimationFrame(tweenCamera);
    }

    function resetCameraView() {
      document.getElementById('selectCameraMode').value = 'iso';
      setCameraPreset('iso');
      updateExplodedView(0);
      document.getElementById('sliderExplode').value = 0;
    }

    function toggle3DFullscreen() {
      const container = document.getElementById('canvas3dContainer');
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }

    function updateExplodedView(percent) {
      state.explodedRatio = percent / 100.0;
      document.getElementById('labelExplode').innerText = percent + '%';
      const d = state.explodedRatio * 0.12;

      if (statorMeshGroup) statorMeshGroup.position.z = -d * 0.6;
      if (poleGroup) poleGroup.position.y = (state.northTop ? 1 : -1) * d * 0.5;
      if (brushMeshGroup) brushMeshGroup.position.z = d * 0.8;
      if (commMeshGroup) commMeshGroup.position.z = d * 0.4;
      if (shaftMeshGroup) shaftMeshGroup.position.z = d * 0.2;
    }

    // =========================================================================
    // MAIN SIMULATION & PHYSICS LOOP (DECOUPLED REAL-TIME + SLOW MOTION)
    // =========================================================================
    let lastSimTimestamp = performance.now();

    function mainSimulationLoop(timestamp) {
      requestAnimationFrame(mainSimulationLoop);

      const dt = Math.min((timestamp - lastSimTimestamp) / 1000.0, 0.05); // Capped at 50ms
      lastSimTimestamp = timestamp;

      // 1. Solve Coupled Electrical & Mechanical ODEs if motor is running
      if (state.isRunning && !state.isPaused) {
        stepODEPhysics(dt);
      }

      // 2. Advance Visual Angle with Visual Time Scale (Slow Motion Decoupling)
      if (state.isRunning && !state.isPaused) {
        state.visualTheta += state.dyna.omega * dt * state.timeScale;
        state.visualTheta = (state.visualTheta % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      }

      // 3. Update 3D Rotor Mesh Orientation
      if (rotorMeshGroup) {
        rotorMeshGroup.rotation.z = state.visualTheta;
      }

      // 4. Update Electromagnetic Vectors and Forces at Current Angle
      updateElectromagneticVectors(dt, timestamp);

      // 5. Update HUD and Controls
      updateLiveHUDReadouts();

      // 6. Render Three.js Scene
      if (controls3d) controls3d.update();
      if (renderer3d && scene3d && camera3d) {
        renderer3d.render(scene3d, camera3d);
      }
    }

    // Coupled State-Space ODE Physics (60 Hz Integration)
    function stepODEPhysics(dt) {
      const d = state.dyna;
      
      // Calculate Back-EMF: Ea = Ke * omega
      d.Ea = d.Ke * d.omega;

      // Armature current derivative: d(ia)/dt = (Va - Ra*ia - Ea) / La
      const dia_dt = (d.Va - d.Ra * d.ia - d.Ea) / d.La;

      // Calculate Net Electromagnetic Torque from slot integration
      d.Te = d.Kt * d.ia;

      // Angular acceleration: d(omega)/dt = (Te - Bm*omega - TL) / J
      const domega_dt = (d.Te - d.Bm * d.omega - d.TL) / d.J;

      // Numerical Integration (Euler Step)
      d.ia += dia_dt * dt;
      d.omega += domega_dt * dt;
      d.theta += d.omega * dt;

      // Bound theta
      if (d.theta > Math.PI * 2000) d.theta %= (Math.PI * 2);

      // Record to history buffers
      recordHistory(d);
    }

    // --- ELECTROMAGNETIC VECTOR UPDATES (FORCE, FLUX, CONES, TORQUE) ---
    function updateElectromagneticVectors(dt, timestamp) {
      const d = state.dyna;
      const isFieldVisible = state.showVectors.field;
      const isForceVisible = state.showVectors.force;
      const isCurrentVisible = state.showVectors.current;
      const isFlowVisible = state.showVectors.currentFlow;
      const isTorqueVisible = state.showVectors.torque;
      const isOmegaVisible = state.showVectors.omega;

      // 1. Move Animated Flux Arrowheads along curves
      if (fluxTubesGroup) {
        fluxTubesGroup.visible = isFieldVisible;
        if (isFieldVisible) {
          const flowDir = state.northTop ? 1 : -1;
          const animSpeed = 0.35; // Visual flow speed

          fluxArrowCones.forEach((item, idx) => {
            let s = (item.baseOffset + (timestamp * 0.001 * animSpeed * flowDir)) % 1.0;
            if (s < 0) s += 1.0;
            const pt = item.curve.getPointAt(s);
            item.mesh.position.copy(pt);

            const tangent = item.curve.getTangentAt(s);
            if (!state.northTop) tangent.negate();
            item.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
          });
        }
      }

      // 2. Animate Conductor Current Particles
      if (conductorParticlesGroup) {
        conductorParticlesGroup.visible = isFlowVisible;
        if (isFlowVisible) {
          const pSpeed = 0.08; // Visual particle speed
          slotParticleList.forEach(p => {
            const isOut = (state.slotCurrents[p.slotIndex] === 1);
            p.mesh.material = isOut ? p.cyanMat : p.amberMat;
            const dir = isOut ? 1 : -1;
            p.z += dir * pSpeed * dt;
            if (p.z > 0.058) p.z = -0.058;
            if (p.z < -0.058) p.z = 0.058;
            p.mesh.position.z = p.z;
          });
        }
      }

      // 3. Update Slot Badges Visibility
      if (slotBadgesGroup) {
        slotBadgesGroup.visible = isCurrentVisible;
      }

      // 4. Update Lorentz Force Vectors on 8 Slots
      if (forceArrowsGroup) {
        forceArrowsGroup.visible = isForceVisible;
        if (isForceVisible) {
          let totalComputedTorque = 0;

          for (let i = 0; i < 8; i++) {
            const arrow = forceArrowHelpers[i];
            const baseAngle = (i / 8) * Math.PI * 2;
            const worldAngle = baseAngle + state.visualTheta;
            const r = 0.040;
            const sx = Math.cos(worldAngle) * r;
            const sy = Math.sin(worldAngle) * r;

            arrow.position.set(sx, sy, 0.068);

            // Local B flux density (vertical downwards from N to S if northTop)
            const bSign = state.northTop ? -1 : 1;
            const localB = d.Bmax * Math.abs(Math.sin(worldAngle)); // Peak near poles

            // Slot current direction: +1 for ⊙ (+Z), -1 for ⊗ (-Z)
            const slotI = state.slotCurrents[i];

            // Lorentz Force: F = I * (l x B)
            // l = (0, 0, slotI), B = (0, bSign * localB, 0)
            // l x B = (0, 0, slotI) x (0, bSign*localB, 0) = (-slotI * bSign * localB, 0, 0)
            // At the top (+Y): slotI = +1, bSign = -1 -> F_x = - (+1)*(-1)*B = +B -> Points to +X (Right, CW!)
            // At the bottom (-Y): slotI = -1, bSign = -1 -> F_x = - (-1)*(-1)*B = -B -> Points to -X (Left, CW!)
            
            // Tangential unit vector around circumference: (-sin(worldAngle), cos(worldAngle), 0)
            // Tangential force component:
            const tangentialDir = -slotI * bSign * Math.sign(sy || 0.001);
            const fx = -Math.sin(worldAngle) * tangentialDir;
            const fy = Math.cos(worldAngle) * tangentialDir;

            const forceDir = new THREE.Vector3(fx, fy, 0).normalize();
            arrow.setDirection(forceDir);

            // Scale arrow length
            const fMag = Math.max(0.015, Math.min(0.045, 0.025 * (localB / 0.85)));
            arrow.setLength(fMag, 0.008, 0.005);

            // Torque contribution: r * F_tangential
            const torqueContrib = r * fMag * 10.0 * tangentialDir;
            totalComputedTorque += torqueContrib;
          }

          // Update Exam Card Torque Readout
          const elExpTorque = document.getElementById('slotExpTorque');
          const elExpDir = document.getElementById('slotExpDirection');
          if (elExpTorque) elExpTorque.innerText = (totalComputedTorque >= 0 ? '+' : '') + totalComputedTorque.toFixed(2) + ' N·m';
          if (elExpDir) {
            if (totalComputedTorque > 0.05) {
              elExpDir.innerText = 'Saat Yönü (CW)';
              elExpDir.className = 'font-bold text-emerald-400';
            } else if (totalComputedTorque < -0.05) {
              elExpDir.innerText = 'Saat Yönünün Tersi (CCW)';
              elExpDir.className = 'font-bold text-rose-400';
            } else {
              elExpDir.innerText = 'Denge / Nötr (0 Nm)';
              elExpDir.className = 'font-bold text-amber-400';
            }
          }
        }
      }

      // 5. Mechanical Rotation Ring Rotation
      if (rotationRingMesh) {
        rotationRingMesh.visible = isTorqueVisible;
        if (isTorqueVisible) {
          const rotDir = (d.omega >= 0) ? -1 : 1; // Visual rotation
          rotationRingMesh.rotation.z -= rotDir * 1.5 * dt;
        }
      }

      // 6. Axial Omega Vector Arrow (Right-Hand Rule)
      if (omegaVectorArrow) {
        omegaVectorArrow.visible = isOmegaVisible;
        if (isOmegaVisible) {
          const isCW = (d.omega >= 0);
          // If CW: points inward (-Z); if CCW: points outward (+Z)
          const omegaDir = new THREE.Vector3(0, 0, isCW ? -1 : 1);
          omegaVectorArrow.setDirection(omegaDir);
          const omegaLen = Math.max(0.035, Math.min(0.080, 0.050 * (Math.abs(d.omega) / 125.0)));
          omegaVectorArrow.setLength(omegaLen, 0.014, 0.008);
        }
      }

      // 7. 3D Labels Visibility
      if (labels3DGroup) {
        labels3DGroup.visible = state.showVectors.labels;
      }
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

      const zeroY = h - ((0 - minVal) / (maxVal - minVal)) * h;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();

      if (buffer.length < 2) return;

      const dx = w / (state.history.maxPoints - 1);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      buffer.forEach((val, i) => {
        const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
        const y = h - norm * h;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * dx, y);
      });
      ctx.stroke();

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
      const visualDeg = ((state.visualTheta * 180 / Math.PI) % 360 + 360) % 360;

      // Update Top Nav Telemetry Badges
      const elRpm = document.getElementById('globalRpmVal');
      const elDir = document.getElementById('globalDirVal');
      const elIa = document.getElementById('globalIaVal');
      const elTe = document.getElementById('globalTeVal');

      if (elRpm) elRpm.innerText = Math.abs(rpm).toFixed(0) + ' d/d';
      if (elDir) elDir.innerText = isCW ? 'CW' : 'CCW';
      if (elIa) elIa.innerText = d.ia.toFixed(2) + ' A';
      if (elTe) elTe.innerText = d.Te.toFixed(2) + ' N·m';

      // 3D Viewport HUD
      const hudRotor = document.getElementById('hudRotorAngle');
      const hudElec = document.getElementById('hudElecAngle');
      const hudCurrent = document.getElementById('hudCurrent');
      const hudTorque = document.getElementById('hudTorque');
      const hudOmega = document.getElementById('hudOmega');
      const hudForce = document.getElementById('hudForce');
      const hudDirText = document.getElementById('hudDirectionText');

      if (hudRotor) hudRotor.innerText = visualDeg.toFixed(1) + '°';
      if (hudElec) hudElec.innerText = ((visualDeg * 2) % 360).toFixed(1) + '°';
      if (hudCurrent) hudCurrent.innerText = d.ia.toFixed(2) + ' A';
      if (hudTorque) hudTorque.innerText = d.Te.toFixed(2) + ' N·m';
      if (hudOmega) hudOmega.innerText = d.omega.toFixed(1) + ' rad/s';
      if (hudForce) hudForce.innerText = (d.ia * d.conductorL * d.Bmax).toFixed(2) + ' N';
      if (hudDirText) {
        hudDirText.innerText = isCW ? 'Saat Yönü (CW)' : 'Saat Yönünün Tersi (CCW)';
        hudDirText.className = isCW ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
      }

      // Bottom control bar sync
      const sliderAngle = document.getElementById('sliderRotorAngle');
      const sliderLabel = document.getElementById('sliderAngleLabel');
      const footerSpeed = document.getElementById('footerPhysSpeed');

      if (sliderAngle && document.activeElement !== sliderAngle) {
        sliderAngle.value = visualDeg.toFixed(1);
      }
      if (sliderLabel) sliderLabel.innerText = visualDeg.toFixed(1);
      if (footerSpeed) footerSpeed.innerText = `${Math.abs(rpm).toFixed(0)} d/d (${Math.abs(d.omega).toFixed(1)} rad/s)`;

      // Gauges in bottom row
      const gIa = document.getElementById('gaugeIa');
      const gRpm = document.getElementById('gaugeRpm');
      const gOmega = document.getElementById('gaugeOmega');
      const gEa = document.getElementById('gaugeEa');
      const gTe = document.getElementById('gaugeTe');
      const gPm = document.getElementById('gaugePm');
      const gEff = document.getElementById('gaugeEff');

      const Pin = Math.abs(d.Va * d.ia);
      const Pout = Math.max(0, d.Te * d.omega);
      const eff = Pin > 1.0 ? Math.min(99.0, (Pout / Pin) * 100.0) : 0;

      if (gIa) gIa.innerText = d.ia.toFixed(2) + ' A';
      if (gRpm) gRpm.innerText = Math.abs(rpm).toFixed(0) + ' d/d';
      if (gOmega) gOmega.innerText = d.omega.toFixed(1) + ' rad/s';
      if (gEa) gEa.innerText = d.Ea.toFixed(1) + ' V';
      if (gTe) gTe.innerText = d.Te.toFixed(2) + ' N·m';
      if (gPm) gPm.innerText = Pout.toFixed(1) + ' W';
      if (gEff) gEff.innerText = eff.toFixed(1) + ' %';
    }

    // =========================================================================
    // SLOW MOTION & INTERACTIVE PLAYBACK CONTROLS
    // =========================================================================
    function setTimeScale(val) {
      state.timeScale = parseFloat(val);
    }

    function toggleMotorPlay() {
      state.isPaused = !state.isPaused;
      state.isRunning = !state.isPaused;
      const btn = document.getElementById('btnPlayPauseText');
      const icon = document.querySelector('#btnPlayPause3D i');
      const led = document.getElementById('badgeMotorLed');
      const status = document.getElementById('globalMotorStatus');

      if (!state.isPaused) {
        if (btn) btn.innerText = 'Duraklat';
        if (icon) icon.className = 'fa-solid fa-pause';
        if (led) led.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
        if (status) { status.innerText = 'ÇALIŞIYOR'; status.className = 'font-bold text-emerald-400'; }
      } else {
        if (btn) btn.innerText = 'Başlat';
        if (icon) icon.className = 'fa-solid fa-play';
        if (led) led.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
        if (status) { status.innerText = 'DURAKLATILDI'; status.className = 'font-bold text-amber-400'; }
      }
    }

    function stepRotorAngle(deltaDeg) {
      state.isPaused = true;
      state.isRunning = false;
      const btn = document.getElementById('btnPlayPauseText');
      if (btn) btn.innerText = 'Başlat';

      state.visualTheta += (deltaDeg * Math.PI / 180.0);
      state.visualTheta = (state.visualTheta % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

      if (rotorMeshGroup) rotorMeshGroup.rotation.z = state.visualTheta;
      updateLiveHUDReadouts();
    }

    function onManualRotorAngleInput(degVal) {
      state.isPaused = true;
      state.isRunning = false;
      const btn = document.getElementById('btnPlayPauseText');
      if (btn) btn.innerText = 'Başlat';

      state.visualTheta = parseFloat(degVal) * (Math.PI / 180.0);
      if (rotorMeshGroup) rotorMeshGroup.rotation.z = state.visualTheta;
      updateLiveHUDReadouts();
    }

    // =========================================================================
    // OLUK İNCELEME VE DÖNÜŞ YÖNÜ DENEYİ (EXAM EXPERIMENT ENGINE)
    // =========================================================================
    function toggleSlotCurrentSign(slotIndex) {
      state.slotCurrents[slotIndex] *= -1;
      updateAllSlotBadges();

      // Update UI Button
      const btn = document.getElementById(`btnSlot${slotIndex}`);
      if (btn) {
        const isOut = (state.slotCurrents[slotIndex] === 1);
        btn.className = isOut 
          ? 'p-1.5 rounded-lg bg-slate-900 border border-cyan-700/70 hover:border-cyan-400 text-center transition'
          : 'p-1.5 rounded-lg bg-slate-900 border border-amber-700/70 hover:border-amber-400 text-center transition';
        btn.querySelector('.text-xs').className = isOut ? 'font-bold text-cyan-400 text-xs' : 'font-bold text-amber-400 text-xs';
        btn.querySelector('.text-xs').innerText = isOut ? '⊙' : '⊗';
      }
    }

    function resetAllSlotsToDefault() {
      state.slotCurrents = [1, 1, 1, 1, -1, -1, -1, -1];
      updateAllSlotBadges();
      for (let i = 0; i < 8; i++) {
        const btn = document.getElementById(`btnSlot${i}`);
        if (btn) {
          const isOut = (state.slotCurrents[i] === 1);
          btn.className = isOut 
            ? 'p-1.5 rounded-lg bg-slate-900 border border-cyan-700/70 hover:border-cyan-400 text-center transition'
            : 'p-1.5 rounded-lg bg-slate-900 border border-amber-700/70 hover:border-amber-400 text-center transition';
          btn.querySelector('.text-xs').className = isOut ? 'font-bold text-cyan-400 text-xs' : 'font-bold text-amber-400 text-xs';
          btn.querySelector('.text-xs').innerText = isOut ? '⊙' : '⊗';
        }
      }
    }

    function invertStatorPoles3D() {
      state.northTop = !state.northTop;

      // Swap pole colors
      if (poleNMesh && poleSMesh) {
        poleNMesh.material.color.setHex(state.northTop ? 0xdc2626 : 0x2563eb);
        poleSMesh.material.color.setHex(state.northTop ? 0x2563eb : 0xdc2626);
      }

      // Also sync digital twin state
      state.twin.northTop = state.northTop;
      drawDigitalTwinCanvas();
    }

    // =========================================================================
    // "BANA AÇIKLA" 8-STEP INTERACTIVE EDUCATIONAL TOUR
    // =========================================================================
    const EXPLAINER_STEPS = [
      {
        title: "1. Stator Elektro-Mıknatıs Kutupları",
        content: "Stator gövdesi üzerinde bulunan kutup pabuçları ana manyetik alanı oluşturur. Üstte Kuzey (N - Kırmızı), altta Güney (S - Mavi) kutbu yer alır. Manyetik alan çizgileri daima Kuzey kutbundan çıkar, hava aralığını geçerek Güney kutbuna girer.",
        formula: "\\vec{B} = B_{max} (-\\hat{j})\\quad (\\text{Yukarıdan Aşa\u011fıya Do\u011fru})",
        cam: 'front'
      },
      {
        title: "2. Manyetik Akı Çizgileri ve Yönü",
        content: "N kutbundan S kutbuna doğru akan parlak mavi çizgiler manyetik akıyı temsil eder. Üzerlerindeki hareketli oklar manyetik akı yoğunluğu vektörünün (\\vec{B}) doğrultusunu gösterir. Bu çizgiler rotor lamine sacı boyunca en düşük relüktanslı yolu izler.",
        formula: "\\Phi = \\iint \\vec{B} \\cdot d\\vec{A} \\quad [\\text{Weber}]",
        cam: 'field_focus'
      },
      {
        title: "3. Rotor Oluk Akımları (⊙ ve ⊗)",
        content: "Rotor üzerindeki 8 olukta bakır iletkenler bulunur. Fırça-kolektör düzeni sayesinde üst yarıdaki oluklardan akım gözlemciye doğru (⊙ Dışarı, Turkuaz), alt yarıdaki oluklardan ise ekrandan içeriye doğru (⊗ İçeri, Turuncu) akar.",
        formula: "I_{üst} = +I_a\\ (\\odot), \\quad I_{alt} = -I_a\\ (\\otimes)",
        cam: 'front'
      },
      {
        title: "4. Lorentz Kuvveti: $\\vec{F} = i(\\vec{l} \\times \\vec{B})$",
        content: "Akım taşıyan iletken manyetik alan içerisindeyken Lorentz kuvveti etkisinde kalır. Üst oluktaki iletken için (+Z içe) ve (B aşağı) vektörel çarpımı sağa doğru (+X) teğetsel bir kuvvet üretir.",
        formula: "\\vec{F}_1 = i (l \\hat{k} \\times (-B \\hat{j})) = +i l B \\hat{i} \\quad (\\mathbf{Sa\u011fa\\ Do\u011fru})",
        cam: 'force_focus'
      },
      {
        title: "5. Moment Kolu ve Elektromanyetik Tork",
        content: "Oluktaki iletkenin mil merkezine olan dik mesafesi moment kolunu (r) oluşturur. Kuvvet ile moment kolunun vektörel çarpımı $\\vec{T}_k = \\vec{r}_k \\times \\vec{F}_k$ teğetsel döndürme momentini meydana getirir.",
        formula: "T_1 = r \\cdot F_{1,te\u011fet} = r \\cdot i \\cdot l \\cdot B \\quad [\\text{N}\\cdot\\text{m}]",
        cam: 'force_focus'
      },
      {
        title: "6. Bütün Olukların Moment Toplamı ($T_e$)",
        content: "Alt yarıdaki iletkenlerde akım ters yönde (⊗) olduğu için kuvvet de sola doğru (-X) oluşur. Hem üstteki sağa kuvvet hem alttaki sola kuvvet aynı yönde döndürme üretir. 8 oluğun momenti toplanarak net motor momenti ($T_e$) elde edilir.",
        formula: "T_e = \\sum_{k=1}^{8} (\\vec{r}_k \\times \\vec{F}_k)_z > 0 \\quad [\\text{Pozitif Net Tork}]",
        cam: 'iso'
      },
      {
        title: "7. Rotor Hareketi ve Dönüş Yönü (Saat Yönü / CW)",
        content: "Net moment pozitif olduğu için rotor saat ibreleri yönünde (Clockwise - CW) ivmelenir. Motorun çevresindeki dairesel pembe ok fiziksel mekanik dönüş yönünü göstermektedir.",
        formula: "J \\frac{d\\omega}{dt} = T_e - B_m \\omega - T_L \\implies \\frac{d\\omega}{dt} > 0\\ (\\text{CW Hızlanma})",
        cam: 'iso'
      },
      {
        title: "8. Açısal Hız Vektörü (\\vec{\\omega}) ve Sağ El Kuralı",
        content: "Sağ el kuralına göre: Dört parmak rotorun fiziksel dönüş yönünü (saat yönü) sardığında, dik açılan başparmak dönme ekseni boyunca içe doğru (-Z) açısal hız vektörünü (\\vec{\\omega}) gösterir. Çevresel ok ile mil ekseni oku bu yüzden farklıdır.",
        formula: "\\vec{\\omega} = -\\omega \\hat{k}\\quad (\\text{Mil Ekseninde Ekrandan \u0130\u00e7eriye Do\u011fru})",
        cam: 'iso'
      }
    ];

    function startExplainerTour() {
      state.explainer.active = true;
      state.explainer.step = 0;
      state.isPaused = true;
      document.getElementById('explainerOverlay').classList.remove('hidden');
      showExplainerStep(0);
    }

    function showExplainerStep(idx) {
      state.explainer.step = idx;
      const step = EXPLAINER_STEPS[idx];
      document.getElementById('explainerStepBadge').innerText = `Adım ${idx + 1}/8`;
      document.getElementById('explainerStepTitle').innerText = step.title;
      document.getElementById('explainerStepContent').innerText = step.content;
      document.getElementById('explainerStepFormula').innerText = `$$${step.formula}$$`;

      // Render KaTeX for formula
      if (window.renderMathInElement) {
        renderMathInElement(document.getElementById('explainerStepFormula'), {
          delimiters: [{ left: '$$', right: '$$', display: true }]
        });
      }

      // Camera preset
      if (step.cam) setCameraPreset(step.cam);

      // Dots
      const dotsContainer = document.getElementById('explainerStepDots');
      dotsContainer.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const dot = document.createElement('span');
        dot.className = (i === idx) 
          ? 'w-2 h-2 rounded-full bg-cyan-400' 
          : 'w-2 h-2 rounded-full bg-slate-700';
        dotsContainer.appendChild(dot);
      }

      document.getElementById('btnExplainerPrev').disabled = (idx === 0);
      document.getElementById('btnExplainerNext').innerHTML = (idx === 7) 
        ? 'Tamamla <i class="fa-solid fa-check ml-1"></i>' 
        : 'Sonraki <i class="fa-solid fa-chevron-right ml-1"></i>';
    }

    function nextExplainerStep() {
      if (state.explainer.step < 7) {
        showExplainerStep(state.explainer.step + 1);
      } else {
        closeExplainerTour();
      }
    }

    function prevExplainerStep() {
      if (state.explainer.step > 0) {
        showExplainerStep(state.explainer.step - 1);
      }
    }

    function closeExplainerTour() {
      state.explainer.active = false;
      document.getElementById('explainerOverlay').classList.add('hidden');
      resetCameraView();
    }

    // =========================================================================
    // SLIDERS & DYNAMICS CONTROLS
    // =========================================================================
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

    function resetDynamicMotor() {
      const d = state.dyna;
      d.ia = 0;
      d.omega = 0;
      d.theta = 0;
      d.Ea = 0;
      d.Te = 0;
      state.visualTheta = 0;
      state.history.ia = [];
      state.history.rpm = [];
      state.history.Te = [];
      state.history.TL = [];
      state.history.Pm = [];
      state.history.Ea = [];
      if (rotorMeshGroup) rotorMeshGroup.rotation.z = 0;
      updateLiveHUDReadouts();
    }

    function triggerDynaScenario(type) {
      if (type === 'directStart') {
        resetDynamicMotor();
        setArmatureVoltage(120);
        state.isPaused = false;
        state.isRunning = true;
      } else if (type === 'loadStep') {
        toggleInstantLoad();
      } else if (type === 'plugBraking') {
        setArmatureVoltage(-state.dyna.Va);
      } else if (type === 'dynamicBraking') {
        setArmatureVoltage(0);
        state.dyna.Ra = 4.0;
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
      if (layer === 'heatmap') {
        if (airgapHeatmapMesh) airgapHeatmapMesh.visible = isChecked;
        const legend = document.getElementById('heatmapLegendBox');
        if (legend) legend.style.display = isChecked ? 'block' : 'none';
      }
      if (layer === 'current' && slotBadgesGroup) slotBadgesGroup.visible = isChecked;
      if (layer === 'currentFlow' && conductorParticlesGroup) conductorParticlesGroup.visible = isChecked;
      if (layer === 'force' && forceArrowsGroup) forceArrowsGroup.visible = isChecked;
      if (layer === 'torque' && rotationRingMesh) rotationRingMesh.visible = isChecked;
      if (layer === 'omega' && omegaVectorArrow) omegaVectorArrow.visible = isChecked;
      if (layer === 'labels' && labels3DGroup) labels3DGroup.visible = isChecked;
    }

    function onWindowResize3D() {
      const container = document.getElementById('canvas3dContainer');
      if (!container || !renderer3d || !camera3d) return;
      camera3d.aspect = container.clientWidth / container.clientHeight;
      camera3d.updateProjectionMatrix();
      renderer3d.setSize(container.clientWidth, container.clientHeight);
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

      ctx.fillStyle = '#ffffff';
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
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();
      ctx.stroke();

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
      ctx.lineWidth = 2;
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

      const tipAngle = isCW ? 0.8 : -0.8;
      const tx = cx + Math.cos(tipAngle) * (rotorR + 18);
      const ty = cy + Math.sin(tipAngle) * (rotorR + 18);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();

      // Text status badge
      const badge = document.getElementById('twinDirBadge');
      if (badge) {
        badge.innerHTML = isCW 
          ? '<i class="fa-solid fa-rotate-right"></i> DÖNÜŞ: CW (Saat Yönü)'
          : '<i class="fa-solid fa-rotate-left"></i> DÖNÜŞ: CCW (Saat Yönünün Tersi)';
        badge.className = isCW
          ? 'text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300'
          : 'text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300';
      }
    }

    function drawCanvasArrow(ctx, fromx, fromy, tox, toy, color, label) {
      const headlen = 8;
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillText(label, tox + (dx > 0 ? 8 : -22), toy - 4);
      }
    }

    function toggleTwinPoles() {
      state.twin.northTop = !state.twin.northTop;
      state.northTop = state.twin.northTop;
      drawDigitalTwinCanvas();
      if (poleNMesh && poleSMesh) {
        poleNMesh.material.color.setHex(state.northTop ? 0xdc2626 : 0x2563eb);
        poleSMesh.material.color.setHex(state.northTop ? 0x2563eb : 0xdc2626);
      }
    }

    function toggleTwinCurrent() {
      state.twin.currentOutSlot1 = !state.twin.currentOutSlot1;
      drawDigitalTwinCanvas();
    }

    function setRHRMode(mode) {
      const btnA = document.getElementById('btnRHRModeA');
      const btnB = document.getElementById('btnRHRModeB');
      const textA = document.getElementById('rhrExplA');
      const textB = document.getElementById('rhrExplB');

      if (mode === 'A') {
        if (btnA) btnA.className = 'px-3 py-1.5 rounded-lg bg-cyan-900 border border-cyan-500 text-cyan-200 font-bold text-xs transition';
        if (btnB) btnB.className = 'px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs transition';
        if (textA) textA.classList.remove('hidden');
        if (textB) textB.classList.add('hidden');
      } else {
        if (btnA) btnA.className = 'px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs transition';
        if (btnB) btnB.className = 'px-3 py-1.5 rounded-lg bg-indigo-900 border border-indigo-500 text-indigo-200 font-bold text-xs transition';
        if (textA) textA.classList.add('hidden');
        if (textB) textB.classList.remove('hidden');
      }
    }

    // =========================================================================
    // CIRCUIT LAB (H-BRIDGE & 3-PHASE BLDC INVERTER)
    // =========================================================================
    function setHBridgeMode(mode) {
      state.hbridge.mode = mode;
      ['btnHbFwd', 'btnHbRev', 'btnHbBrake', 'btnHbCoast'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition';
      });

      const btnFwd = document.getElementById('btnHbFwd');
      const btnRev = document.getElementById('btnHbRev');
      const btnBrake = document.getElementById('btnHbBrake');
      const btnCoast = document.getElementById('btnHbCoast');
      const stateLbl = document.getElementById('hbridgeStateLabel');

      if (mode === 'forward') {
        if (btnFwd) btnFwd.className = 'py-2 rounded-lg bg-emerald-900/60 border border-emerald-500 text-emerald-300 font-bold transition';
        if (stateLbl) { stateLbl.innerText = 'İLERİ (CW)'; stateLbl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300'; }
        setArmatureVoltage(120 * state.hbridge.dutyCycle);
      } else if (mode === 'reverse') {
        if (btnRev) btnRev.className = 'py-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 font-bold transition';
        if (stateLbl) { stateLbl.innerText = 'GERİ (CCW)'; stateLbl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300'; }
        setArmatureVoltage(-120 * state.hbridge.dutyCycle);
      } else if (mode === 'brake') {
        if (btnBrake) btnBrake.className = 'py-2 rounded-lg bg-rose-900/60 border border-rose-500 text-rose-300 font-bold transition';
        if (stateLbl) { stateLbl.innerText = 'FRENLEME'; stateLbl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300'; }
        triggerDynaScenario('dynamicBraking');
      } else if (mode === 'coast') {
        if (btnCoast) btnCoast.className = 'py-2 rounded-lg bg-slate-700 border border-slate-500 text-white font-bold transition';
        if (stateLbl) { stateLbl.innerText = 'SERBEST (COAST)'; stateLbl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400'; }
        setArmatureVoltage(0);
      }
      drawHBridgeCanvas();
    }

    function setHBridgePWM(val) {
      state.hbridge.dutyCycle = parseFloat(val) / 100.0;
      const elPwm = document.getElementById('labelPwmVal');
      if (elPwm) elPwm.innerText = val + ' %';
      if (state.hbridge.mode === 'forward') setArmatureVoltage(120 * state.hbridge.dutyCycle);
      else if (state.hbridge.mode === 'reverse') setArmatureVoltage(-120 * state.hbridge.dutyCycle);
      drawHBridgeCanvas();
    }

    function drawHBridgeCanvas() {
      const canvas = document.getElementById('hbridgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 270;

      ctx.clearRect(0, 0, w, h);

      const q1On = (state.hbridge.mode === 'forward');
      const q4On = (state.hbridge.mode === 'forward');
      const q2On = (state.hbridge.mode === 'reverse');
      const q3On = (state.hbridge.mode === 'reverse');

      // Vcc Rail
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(w - 40, 30); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText('+Vdc (120V)', w / 2 - 35, 22);

      // GND Rail
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(40, h - 30); ctx.lineTo(w - 40, h - 30); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('GND (0V)', w / 2 - 25, h - 14);

      // Switches Q1, Q2, Q3, Q4
      drawSwitch(ctx, 110, 75, 'Q1 (A+)', q1On);
      drawSwitch(ctx, 110, h - 75, 'Q2 (A-)', q2On);
      drawSwitch(ctx, w - 110, 75, 'Q3 (B+)', q3On);
      drawSwitch(ctx, w - 110, h - 75, 'Q4 (B-)', q4On);

      // Center Motor Circle
      const mx = w / 2, my = h / 2;
      ctx.beginPath(); ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#38bdf8'; ctx.stroke();
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 16px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('M', mx, my);

      // Wiring to motor
      ctx.strokeStyle = q1On || q2On ? '#facc15' : '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(110, 75); ctx.lineTo(110, my); ctx.lineTo(mx - 28, my); ctx.stroke();

      ctx.strokeStyle = q3On || q4On ? '#facc15' : '#475569';
      ctx.beginPath(); ctx.moveTo(w - 110, 75); ctx.lineTo(w - 110, my); ctx.lineTo(mx + 28, my); ctx.stroke();
    }

    function drawSwitch(ctx, x, y, label, isOn) {
      ctx.strokeStyle = isOn ? '#10b981' : '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      if (isOn) ctx.lineTo(x, y + 20);
      else ctx.lineTo(x + 14, y + 16);
      ctx.stroke();

      ctx.fillStyle = isOn ? '#34d399' : '#94a3b8';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + (isOn ? 25 : 30), y);
    }

    // =========================================================================
    // BLDC COMMUTATION & 3-PHASE INVERTER
    // =========================================================================
    const BLDC_TABLE = [
      { step: 1, hall: '101', hi: 'A+', lo: 'B-', desc: 'Q1 ve Q4 İletimde' },
      { step: 2, hall: '100', hi: 'A+', lo: 'C-', desc: 'Q1 ve Q6 İletimde' },
      { step: 3, hall: '110', hi: 'B+', lo: 'C-', desc: 'Q3 ve Q6 İletimde' },
      { step: 4, hall: '010', hi: 'B+', lo: 'A-', desc: 'Q3 ve Q2 İletimde' },
      { step: 5, hall: '011', hi: 'C+', lo: 'A-', desc: 'Q5 ve Q2 İletimde' },
      { step: 6, hall: '001', hi: 'C+', lo: 'B-', desc: 'Q5 ve Q4 İletimde' }
    ];

    function drawBldcBridgeCanvas() {
      const canvas = document.getElementById('bldcBridgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 270;

      ctx.clearRect(0, 0, w, h);

      const cur = BLDC_TABLE[state.bldc.step - 1];
      const stepLbl = document.getElementById('bldcCurrentStepLabel');
      if (stepLbl) stepLbl.innerText = `Adım ${cur.step}/6 (${cur.hi} / ${cur.lo})`;

      for (let s = 1; s <= 6; s++) {
        const row = document.getElementById(`row-step-${s}`);
        if (row) {
          row.className = (s === state.bldc.step) 
            ? 'bg-cyan-950/50 text-cyan-300 font-bold' 
            : '';
        }
      }

      const cols = [w * 0.25, w * 0.50, w * 0.75];
      const labelsTop = ['Q1 (A+)', 'Q3 (B+)', 'Q5 (C+)'];
      const labelsBot = ['Q2 (A-)', 'Q4 (B-)', 'Q6 (C-)'];

      cols.forEach((cx, i) => {
        const topOn = (i === 0 && cur.hi === 'A+') || (i === 1 && cur.hi === 'B+') || (i === 2 && cur.hi === 'C+');
        const botOn = (i === 0 && cur.lo === 'A-') || (i === 1 && cur.lo === 'B-') || (i === 2 && cur.lo === 'C-');
        drawSwitch(ctx, cx, 65, labelsTop[i], topOn);
        drawSwitch(ctx, cx, h - 65, labelsBot[i], botOn);
      });
    }

    function drawBldcOscilloscope() {
      const canvas = document.getElementById('bldcOscilloscopeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 180;

      ctx.clearRect(0, 0, w, h);

      // Draw 3 trapezoidal Back-EMF waves (120 deg apart)
      const colors = ['#38bdf8', '#f59e0b', '#ec4899'];
      const names = ['Faz A', 'Faz B', 'Faz C'];

      for (let ph = 0; ph < 3; ph++) {
        const phaseShift = (ph * 2 * Math.PI) / 3;
        ctx.strokeStyle = colors[ph];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const midY = (ph + 0.5) * (h / 3);

        for (let x = 0; x < w; x++) {
          const theta = (x / w) * Math.PI * 4 + phaseShift;
          const sinVal = Math.sin(theta);
          const trapVal = Math.max(-1, Math.min(1, sinVal * 1.6));
          const y = midY - trapVal * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = colors[ph];
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(names[ph], 15, midY - 12);
      }

      // Current step indicator
      const stepX = ((state.bldc.step - 0.5) / 6) * w;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(stepX, 0); ctx.lineTo(stepX, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#10b981'; ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`Adım ${state.bldc.step}`, stepX + 5, 20);
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
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 0; x < w; x++) {
          let val = 0;
          if (ch.isZ) {
            const zPeriod = w * 0.8;
            val = ((x + t * 40) % zPeriod < 12) ? 1 : 0;
          } else {
            val = Math.sin((x / 14) + t + ch.offset) > 0 ? 1 : 0;
          }
          const y = yBase - val * (rowH * 0.55);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = ch.color;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(ch.name, 15, yBase - rowH * 0.60);
      });
    }

    function drawResolverCanvas() {
      const canvas = document.getElementById('resolverCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 240;

      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.005;
      const theta = (t * 0.15) % (Math.PI * 2);

      // Carrier frequency ~ 10kHz modulated by sin/cos
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.35 + t * 10);
        const modSin = Math.sin(theta);
        const y = h * 0.35 - (carrier * modSin * 35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`V_sin = V_c · sin(θ) [θ = ${(theta * 180 / Math.PI).toFixed(0)}°]`, 15, 25);

      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.35 + t * 10);
        const modCos = Math.cos(theta);
        const y = h * 0.75 - (carrier * modCos * 35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`V_cos = V_c · cos(θ)`, 15, h * 0.50 + 25);
    }

    // =========================================================================
    // STEPPER MOTOR SIMULATOR
    // =========================================================================
    function setStepperMode(mode) {
      state.stepper.mode = mode;
      ['btnStepFull', 'btnStepHalf', 'btnStepMicro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold transition';
      });

      if (mode === 'full') {
        document.getElementById('btnStepFull').className = 'py-1.5 rounded bg-cyan-900 border border-cyan-500 text-cyan-200 font-bold transition';
      } else if (mode === 'half') {
        document.getElementById('btnStepHalf').className = 'py-1.5 rounded bg-cyan-900 border border-cyan-500 text-cyan-200 font-bold transition';
      } else if (mode === 'micro') {
        document.getElementById('btnStepMicro').className = 'py-1.5 rounded bg-cyan-900 border border-cyan-500 text-cyan-200 font-bold transition';
      }
      calculateStepperValues();
    }

    function calculateStepperValues() {
      const m = state.stepper.m;
      const nr = state.stepper.nr;
      const rpm = state.stepper.rpm;

      let stepAngle = 360.0 / (2 * m * nr); // 1.8 deg
      let stepsPerRev = 360.0 / stepAngle; // 200

      if (state.stepper.mode === 'half') {
        stepAngle /= 2.0;
        stepsPerRev *= 2.0;
      } else if (state.stepper.mode === 'micro') {
        stepAngle /= 16.0;
        stepsPerRev *= 16.0;
      }

      const pulseFreq = (rpm * stepsPerRev) / 60.0;

      const elAngle = document.getElementById('resStepAngle');
      const elSpr = document.getElementById('resStepCount');
      const elFreq = document.getElementById('resStepFreq');

      if (elAngle) elAngle.innerText = stepAngle.toFixed(4) + '°';
      if (elSpr) elSpr.innerText = stepsPerRev.toFixed(0);
      if (elFreq) elFreq.innerText = pulseFreq.toFixed(1) + ' Hz';
    }

    // =========================================================================
    // EXAM PROBLEM BANK SOLUTION TOGGLES
    // =========================================================================
    function toggleExamSolution(qNum) {
      const sol = document.getElementById(`examSol${qNum}`);
      if (!sol) return;
      sol.classList.toggle('hidden');
    }

    // =========================================================================
    // DOCUMENT MANAGER (INDEXEDDB STORAGE FOR USER LECTURE NOTES)
    // =========================================================================
    let dbInstance = null;

    function initDocManagerDB() {
      const req = indexedDB.open('OzelElektrikMakinalariDocsDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        loadSavedDocuments();
      };
    }

    function handleDocFileUpload(files) {
      if (!files || !files.length || !dbInstance) return;
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const docRecord = {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result,
            uploadDate: new Date().toLocaleDateString('tr-TR')
          };
          const tx = dbInstance.transaction('documents', 'readwrite');
          tx.objectStore('documents').add(docRecord);
          tx.oncomplete = () => loadSavedDocuments();
        };
        reader.readAsDataURL(file);
      });
    }

    function loadSavedDocuments() {
      if (!dbInstance) return;
      const listEl = document.getElementById('docListContainer');
      if (!listEl) return;
      listEl.innerHTML = '';

      const tx = dbInstance.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const req = store.getAll();

      req.onsuccess = () => {
        const docs = req.result || [];
        if (docs.length === 0) {
          listEl.innerHTML = '<div class="text-slate-500 text-xs text-center py-4">Kayıtlı kullanıcı belgesi yok.</div>';
          return;
        }
        docs.forEach(doc => {
          const item = document.createElement('div');
          item.className = 'flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono';
          item.innerHTML = `
            <div class="flex items-center space-x-2 truncate">
              <i class="fa-solid fa-file-pdf text-rose-400"></i>
              <span class="text-slate-200 truncate font-semibold">${doc.name}</span>
              <span class="text-[10px] text-slate-500">(${(doc.size / 1024).toFixed(0)} KB)</span>
            </div>
            <div class="flex space-x-1.5">
              <a href="${doc.dataUrl}" download="${doc.name}" class="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-900 text-cyan-300 transition text-[11px]"><i class="fa-solid fa-download"></i></a>
              <button onclick="deleteDocRecord(${doc.id})" class="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-300 transition text-[11px]"><i class="fa-solid fa-trash"></i></button>
            </div>
          `;
          listEl.appendChild(item);
        });
      };
    }

    function deleteDocRecord(id) {
      if (!dbInstance) return;
      const tx = dbInstance.transaction('documents', 'readwrite');
      tx.objectStore('documents').delete(id);
      tx.oncomplete = () => loadSavedDocuments();
    }

    // =========================================================================
    // TAB SWITCHING & GLOBAL NAVIGATION
    // =========================================================================
    function switchMainTab(tabId) {
      state.activeTab = tabId;

      // Update Tab Buttons
      const tabBtns = document.querySelectorAll('.nav-tab-btn');
      tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.className = 'nav-tab-btn active px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
        } else {
          btn.className = 'nav-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent';
        }
      });

      // Show/Hide Sections
      const sections = document.querySelectorAll('.tab-content');
      sections.forEach(sec => {
        if (sec.id === tabId) sec.classList.remove('hidden');
        else sec.classList.add('hidden');
      });

      // Redraw canvases on tab enter
      if (tabId === 'tab-direction-lab') {
        setTimeout(drawDigitalTwinCanvas, 50);
      } else if (tabId === 'tab-circuits-lab') {
        setTimeout(() => { drawHBridgeCanvas(); drawBldcBridgeCanvas(); drawBldcOscilloscope(); }, 50);
      } else if (tabId === 'tab-universal-lab') {
        setTimeout(calculateUniversalMotor, 50);
      } else if (tabId === 'tab-servo') {
        setTimeout(() => { drawEncoderCanvas(); drawResolverCanvas(); }, 50);
      } else if (tabId === 'tab-stepper') {
        setTimeout(calculateStepperValues, 50);
      }

      // Re-trigger KaTeX rendering
      setTimeout(renderKaTeX, 100);
    }

    function renderKaTeX() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }

    // =========================================================================
    // SYSTEM INITIALIZATION ON LOAD
    // =========================================================================
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Initialize 3D Engine
      init3DScene();

      // 2. Initialize Doc Manager IndexedDB
      initDocManagerDB();

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
