PART6_JS = """
  <!-- ========================================== -->
  <!-- JAVASCRIPT SIMULATION LOGIC & ENGINES -->
  <!-- ========================================== -->
  <script>
    // --- GLOBAL SIMULATION STATE ---
    const state = {
      activeTab: 'tab-overview',
      // Motor parameters
      motorRunning: true,
      motorSpeedRpm: 1200,
      motorDirection: 1, // 1: CW, -1: CCW
      rotorAngle: 0,
      armatureCurrent: 5.0, // Amperes
      fluxDensity: 0.85, // Tesla
      conductorLength: 0.10, // 10 cm
      rotorRadius: 0.04, // 4 cm
      explodedRatio: 0,
      transparentCasing: false,
      cutawayMode: false,
      showVectors: {
        field: true,
        current: true,
        force: true,
        fluxLines: true
      },
      // Direction 2D Lab state
      dirLab: {
        northOnTop: true,
        currentOutSlot1: true,
        brushCrossed: false
      },
      // BLDC Lab state
      bldc: {
        step: 1,
        autoPlay: false,
        direction: 1,
        timer: null
      },
      // Stepper Lab state
      stepper: {
        mode: 'full', // 'wave', 'full', 'half', 'micro'
        stepIndex: 0,
        m: 4,
        nr: 50,
        targetRpm: 1200
      },
      // Encoder Lab state
      encoder: {
        ppr: 4200,
        direction: 1,
        angle: 0
      }
    };

    // --- TAB SWITCHING WITH AUTO KATEX RENDER ---
    function switchTab(tabId) {
      state.activeTab = tabId;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.remove('hidden');

      const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (activeBtn) activeBtn.classList.add('active');

      // Trigger redraws based on tab
      if (tabId === 'tab-3d-lab') {
        onWindowResize3D();
      } else if (tabId === 'tab-direction-lab') {
        drawDirection2DCanvas();
      } else if (tabId === 'tab-bldc') {
        drawBldcBridgeCanvas();
        drawBldcOscilloscope();
      } else if (tabId === 'tab-universal') {
        calculateUniversalMotor();
        drawUniversalPhasor();
      } else if (tabId === 'tab-servo') {
        drawEncoderCanvas();
        drawResolverCanvas();
      } else if (tabId === 'tab-stepper') {
        calculateStepper();
        drawStepperCanvas();
      }

      // Render math formulas
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
    // THREE.JS 3D MOTOR ENGINE
    // =========================================================================
    let scene3d, camera3d, renderer3d, controls3d;
    let motorGroup, statorGroup, poleShoesGroup, rotorGroup, armatureWindingsGroup, commutatorGroup, brushGroup, hallPcbGroup, vectorGroup, fluxLinesGroup;
    let arrowForce1, arrowForce2, arrowField1, arrowField2, arrowCurrent1, arrowCurrent2;
    let rightHandGizmoGroup;

    function init3DScene() {
      const container = document.getElementById('canvas3dContainer');
      const canvas = document.getElementById('motor3dCanvas');
      if (!container || !canvas) return;

      // 1. Scene & Camera
      scene3d = new THREE.Scene();
      scene3d.background = new THREE.Color(0x050b14);

      camera3d = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera3d.position.set(0.28, 0.22, 0.35);

      // 2. Renderer
      renderer3d = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer3d.setSize(container.clientWidth, container.clientHeight);
      renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer3d.shadowMap.enabled = true;
      renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;

      // 3. OrbitControls
      controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
      controls3d.enableDamping = true;
      controls3d.dampingFactor = 0.05;
      controls3d.minDistance = 0.1;
      controls3d.maxDistance = 1.5;
      controls3d.target.set(0, 0, 0);

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      scene3d.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
      dirLight1.position.set(0.5, 0.8, 0.5);
      dirLight1.castShadow = true;
      scene3d.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5);
      dirLight2.position.set(-0.5, -0.4, -0.3);
      scene3d.add(dirLight2);

      const cyanPoint = new THREE.PointLight(0x06b6d4, 1.2, 1.0);
      cyanPoint.position.set(0, 0.15, 0.1);
      scene3d.add(cyanPoint);

      // 5. Build Motor Assembly
      build3DMotor();

      // 6. Window resize handler
      window.addEventListener('resize', onWindowResize3D);

      // 7. Animation loop
      animate3D();
    }

    function build3DMotor() {
      motorGroup = new THREE.Group();
      scene3d.add(motorGroup);

      // Materials
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
      const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
      const northPoleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.35 }); // Red North
      const southPoleMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.35 }); // Blue South
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

      // --- A. STATOR OUTER CASING & FINS ---
      statorGroup = new THREE.Group();
      motorGroup.add(statorGroup);

      // Cylindrical Frame
      const casingGeom = new THREE.CylinderGeometry(0.082, 0.082, 0.12, 32, 1, true);
      const casingMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
        side: THREE.DoubleSide
      });
      const casingMesh = new THREE.Mesh(casingGeom, casingMat);
      casingMesh.rotation.x = Math.PI / 2;
      statorGroup.add(casingMesh);

      // Cooling Fins around stator
      const finGeom = new THREE.BoxGeometry(0.003, 0.012, 0.12);
      for (let i = 0; i < 24; i++) {
        const finAngle = (i / 24) * Math.PI * 2;
        const fin = new THREE.Mesh(finGeom, casingMat);
        fin.position.set(Math.cos(finAngle) * 0.086, Math.sin(finAngle) * 0.086, 0);
        fin.rotation.z = finAngle;
        statorGroup.add(fin);
      }

      // --- B. STATOR SALIENT POLES (N & S) & FIELD COILS ---
      poleShoesGroup = new THREE.Group();
      motorGroup.add(poleShoesGroup);

      // North Pole Shoe (Top)
      const poleNGeom = new THREE.BoxGeometry(0.045, 0.022, 0.10);
      const poleN = new THREE.Mesh(poleNGeom, northPoleMat);
      poleN.position.set(0, 0.062, 0);
      poleShoesGroup.add(poleN);

      // North Pole Coil (Copper Wrap)
      const coilNGeom = new THREE.TorusGeometry(0.025, 0.008, 12, 24);
      const coilN = new THREE.Mesh(coilNGeom, copperMat);
      coilN.rotation.x = Math.PI / 2;
      coilN.position.set(0, 0.065, 0);
      poleShoesGroup.add(coilN);

      // South Pole Shoe (Bottom)
      const poleSGeom = new THREE.BoxGeometry(0.045, 0.022, 0.10);
      const poleS = new THREE.Mesh(poleSGeom, southPoleMat);
      poleS.position.set(0, -0.062, 0);
      poleShoesGroup.add(poleS);

      // South Pole Coil (Copper Wrap)
      const coilS = new THREE.Mesh(coilNGeom, copperMat);
      coilS.rotation.x = Math.PI / 2;
      coilS.position.set(0, -0.065, 0);
      poleShoesGroup.add(coilS);

      // Pole labels "N" and "S" via small cylinders/cubes
      const labelN = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.002, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      labelN.position.set(0, 0.05, 0.052);
      poleShoesGroup.add(labelN);

      // --- C. ROTOR GROUP (ROTOR LAMINATIONS, SLOTS, WINDINGS, SHAFT) ---
      rotorGroup = new THREE.Group();
      motorGroup.add(rotorGroup);

      // Central Steel Shaft
      const shaftGeom = new THREE.CylinderGeometry(0.010, 0.010, 0.22, 24);
      const shaftMesh = new THREE.Mesh(shaftGeom, steelMat);
      shaftMesh.rotation.x = Math.PI / 2;
      rotorGroup.add(shaftMesh);

      // Laminated Rotor Core (with 8 realistic slots)
      const rotorCoreGeom = new THREE.CylinderGeometry(0.042, 0.042, 0.10, 32);
      const rotorCoreMesh = new THREE.Mesh(rotorCoreGeom, darkSteelMat);
      rotorCoreMesh.rotation.x = Math.PI / 2;
      rotorGroup.add(rotorCoreMesh);

      // 8 Slots and Copper Windings inside slots
      armatureWindingsGroup = new THREE.Group();
      rotorGroup.add(armatureWindingsGroup);

      for (let i = 0; i < 8; i++) {
        const slotAngle = (i / 8) * Math.PI * 2;
        const x = Math.cos(slotAngle) * 0.038;
        const y = Math.sin(slotAngle) * 0.038;

        // Copper Conductor Rod in slot
        const condGeom = new THREE.CylinderGeometry(0.0045, 0.0045, 0.102, 12);
        const condMesh = new THREE.Mesh(condGeom, copperMat);
        condMesh.rotation.x = Math.PI / 2;
        condMesh.position.set(x, y, 0);
        armatureWindingsGroup.add(condMesh);

        // End-turn loop connecting opposing conductors
        const endLoopGeom = new THREE.TorusGeometry(0.018, 0.004, 8, 16, Math.PI);
        const endLoopFront = new THREE.Mesh(endLoopGeom, copperMat);
        endLoopFront.position.set(0, 0, 0.052);
        endLoopFront.rotation.z = slotAngle;
        armatureWindingsGroup.add(endLoopFront);

        const endLoopBack = new THREE.Mesh(endLoopGeom, copperMat);
        endLoopBack.position.set(0, 0, -0.052);
        endLoopBack.rotation.z = slotAngle + Math.PI;
        armatureWindingsGroup.add(endLoopBack);
      }

      // --- D. COMMUTATOR CYLINDER WITH SEGMENTS ---
      commutatorGroup = new THREE.Group();
      rotorGroup.add(commutatorGroup);

      const commGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.028, 24);
      const commMesh = new THREE.Mesh(commGeom, brassMat);
      commMesh.rotation.x = Math.PI / 2;
      commMesh.position.set(0, 0, 0.072);
      commutatorGroup.add(commMesh);

      // Commutator segment lines
      const segLineGeom = new THREE.BoxGeometry(0.001, 0.023, 0.0285);
      for (let i = 0; i < 12; i++) {
        const segLine = new THREE.Mesh(segLineGeom, darkSteelMat);
        segLine.position.set(0, 0, 0.072);
        segLine.rotation.z = (i / 12) * Math.PI * 2;
        commutatorGroup.add(segLine);
      }

      // --- E. CARBON BRUSHES & SPRING HOLDERS (Stationary) ---
      brushGroup = new THREE.Group();
      motorGroup.add(brushGroup);

      // Left Brush
      const brushGeom = new THREE.BoxGeometry(0.008, 0.012, 0.014);
      const brushLeft = new THREE.Mesh(brushGeom, carbonMat);
      brushLeft.position.set(-0.028, 0, 0.072);
      brushGroup.add(brushLeft);

      // Left Holder
      const holderGeom = new THREE.BoxGeometry(0.012, 0.016, 0.016);
      const holderLeft = new THREE.Mesh(holderGeom, brassMat);
      holderLeft.position.set(-0.038, 0, 0.072);
      brushGroup.add(holderLeft);

      // Right Brush
      const brushRight = new THREE.Mesh(brushGeom, carbonMat);
      brushRight.position.set(0.028, 0, 0.072);
      brushGroup.add(brushRight);

      // Right Holder
      const holderRight = new THREE.Mesh(holderGeom, brassMat);
      holderRight.position.set(0.038, 0, 0.072);
      brushGroup.add(holderRight);

      // --- F. HALL SENSOR PCB (120 Degree Sensor Ring) ---
      hallPcbGroup = new THREE.Group();
      motorGroup.add(hallPcbGroup);

      const pcbGeom = new THREE.RingGeometry(0.048, 0.068, 32);
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, side: THREE.DoubleSide }); // Green PCB
      const pcbMesh = new THREE.Mesh(pcbGeom, pcbMat);
      pcbMesh.position.set(0, 0, -0.062);
      hallPcbGroup.add(pcbMesh);

      // 3 Hall Sensor ICs at 0°, 120°, 240°
      const icGeom = new THREE.BoxGeometry(0.006, 0.008, 0.004);
      const icMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      const ledMatOn = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120) * (Math.PI / 180);
        const ic = new THREE.Mesh(icGeom, icMat);
        ic.position.set(Math.cos(angle) * 0.058, Math.sin(angle) * 0.058, -0.065);
        ic.rotation.z = angle;
        hallPcbGroup.add(ic);

        const led = new THREE.Mesh(new THREE.SphereGeometry(0.002, 8, 8), ledMatOn);
        led.position.set(Math.cos(angle) * 0.063, Math.sin(angle) * 0.063, -0.066);
        hallPcbGroup.add(led);
      }

      // --- G. VECTOR OVERLAYS (Magnetic B, Current I, Force F) ---
      vectorGroup = new THREE.Group();
      motorGroup.add(vectorGroup);

      // 1. Magnetic Field Arrows (Downward from North to South)
      arrowField1 = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.015, 0.035, 0.02), 0.065, 0x06b6d4, 0.012, 0.008);
      arrowField2 = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.015, 0.035, 0.02), 0.065, 0x06b6d4, 0.012, 0.008);
      vectorGroup.add(arrowField1);
      vectorGroup.add(arrowField2);

      // 2. Current Arrows on Rotor Conductors (Slot 1 Out +Z, Slot 2 In -Z)
      arrowCurrent1 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-0.032, 0.025, -0.03), 0.06, 0xfacc15, 0.012, 0.008);
      arrowCurrent2 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0.032, -0.025, 0.03), 0.06, 0xfacc15, 0.012, 0.008);
      rotorGroup.add(arrowCurrent1);
      rotorGroup.add(arrowCurrent2);

      // 3. Lorentz Force Arrows (Tangential pushing rotor clockwise)
      arrowForce1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-0.032, 0.025, 0), 0.045, 0x10b981, 0.014, 0.010);
      arrowForce2 = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0.032, -0.025, 0), 0.045, 0x10b981, 0.014, 0.010);
      rotorGroup.add(arrowForce1);
      rotorGroup.add(arrowForce2);

      // --- H. MAGNETIC FLUX CURVE LINES ---
      fluxLinesGroup = new THREE.Group();
      vectorGroup.add(fluxLinesGroup);

      const fluxLineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.008,
        gapSize: 0.004,
        linewidth: 2
      });

      for (let i = -3; i <= 3; i++) {
        const points = [];
        const xOffset = i * 0.012;
        points.push(new THREE.Vector3(xOffset, 0.055, 0));
        points.push(new THREE.Vector3(xOffset * 0.85, 0.02, 0));
        points.push(new THREE.Vector3(xOffset * 0.85, -0.02, 0));
        points.push(new THREE.Vector3(xOffset, -0.055, 0));
        const curveGeom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(curveGeom, fluxLineMat);
        line.computeLineDistances();
        fluxLinesGroup.add(line);
      }
    }

    // --- 3D ANIMATION LOOP ---
    let lastTime3D = performance.now();

    function animate3D() {
      requestAnimationFrame(animate3D);

      const now = performance.now();
      const delta = (now - lastTime3D) / 1000;
      lastTime3D = now;

      if (state.motorRunning && rotorGroup) {
        // Calculate angular delta based on RPM
        const rpm = state.motorSpeedRpm * state.motorDirection;
        const omega = (rpm * 2 * Math.PI) / 60; // rad/s
        const deltaAngle = omega * delta;

        state.rotorAngle += deltaAngle;
        rotorGroup.rotation.z = state.rotorAngle;

        // Update HUD readouts
        const deg = ((state.rotorAngle * 180 / Math.PI) % 360 + 360) % 360;
        const hudRotor = document.getElementById('hudRotorAngle');
        const hudElec = document.getElementById('hudElecAngle');
        if (hudRotor) hudRotor.innerText = deg.toFixed(1) + '°';
        if (hudElec) hudElec.innerText = ((deg * 2) % 360).toFixed(1) + '°';
      }

      // Pulse flux lines animation
      if (fluxLinesGroup && fluxLinesGroup.visible) {
        fluxLinesGroup.children.forEach((l, idx) => {
          l.material.dashSize = 0.008 + Math.sin(now * 0.005 + idx) * 0.002;
        });
      }

      if (controls3d) controls3d.update();
      if (renderer3d && scene3d && camera3d) {
        renderer3d.render(scene3d, camera3d);
      }
    }

    function onWindowResize3D() {
      const container = document.getElementById('canvas3dContainer');
      if (!container || !renderer3d || !camera3d) return;

      const width = container.clientWidth;
      const height = container.clientHeight || 520;

      camera3d.aspect = width / height;
      camera3d.updateProjectionMatrix();
      renderer3d.setSize(width, height);
    }

    // --- 3D CAMERA PRESETS ---
    function setCameraView(preset) {
      if (!camera3d || !controls3d) return;
      if (preset === 'iso') {
        camera3d.position.set(0.28, 0.22, 0.35);
      } else if (preset === 'front') {
        camera3d.position.set(0, 0, 0.40);
      } else if (preset === 'top') {
        camera3d.position.set(0, 0.40, 0.001);
      } else if (preset === 'side') {
        camera3d.position.set(0.40, 0, 0);
      }
      controls3d.target.set(0, 0, 0);
      controls3d.update();
    }

    function resetCamera() {
      setCameraView('iso');
    }

    // --- 3D INTERACTIVE CONTROLS ---
    function toggleMotorPlay() {
      state.motorRunning = !state.motorRunning;
      const btn = document.getElementById('btnMotorPlay');
      const text = document.getElementById('btnMotorPlayText');
      const globalStatus = document.getElementById('globalMotorStatus');

      if (state.motorRunning) {
        if (btn) btn.className = 'px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition';
        if (text) text.innerText = 'Durdur';
        if (globalStatus) {
          globalStatus.innerText = 'ÇALIŞIYOR';
          globalStatus.className = 'font-bold text-emerald-400';
        }
      } else {
        if (btn) btn.className = 'px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 transition';
        if (text) text.innerText = 'Başlat';
        if (globalStatus) {
          globalStatus.innerText = 'DURDU';
          globalStatus.className = 'font-bold text-amber-400';
        }
      }
    }

    function stepMotorCommutation() {
      state.motorRunning = false;
      const stepAngle = (60 * Math.PI / 180) * state.motorDirection;
      state.rotorAngle += stepAngle;
      if (rotorGroup) rotorGroup.rotation.z = state.rotorAngle;

      const deg = ((state.rotorAngle * 180 / Math.PI) % 360 + 360) % 360;
      const hudRotor = document.getElementById('hudRotorAngle');
      if (hudRotor) hudRotor.innerText = deg.toFixed(1) + '°';

      // Update play button to "Başlat"
      const text = document.getElementById('btnMotorPlayText');
      if (text) text.innerText = 'Başlat';
    }

    function resetMotorPosition() {
      state.rotorAngle = 0;
      if (rotorGroup) rotorGroup.rotation.z = 0;
      const hudRotor = document.getElementById('hudRotorAngle');
      if (hudRotor) hudRotor.innerText = '0.0°';
    }

    function setMotorDirection(dir) {
      state.motorDirection = dir;
      const btnCW = document.getElementById('btnDirCW');
      const btnCCW = document.getElementById('btnDirCCW');
      const globalDir = document.getElementById('globalDirVal');

      if (dir === 1) {
        btnCW.className = 'px-2.5 py-1.5 rounded-lg bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition';
        btnCCW.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center gap-1 transition';
        if (globalDir) globalDir.innerText = 'CW (Saat Yönü)';
        if (arrowForce1) arrowForce1.setDirection(new THREE.Vector3(1, 0, 0));
        if (arrowForce2) arrowForce2.setDirection(new THREE.Vector3(-1, 0, 0));
      } else {
        btnCW.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center gap-1 transition';
        btnCCW.className = 'px-2.5 py-1.5 rounded-lg bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition';
        if (globalDir) globalDir.innerText = 'CCW (Ters Yön)';
        if (arrowForce1) arrowForce1.setDirection(new THREE.Vector3(-1, 0, 0));
        if (arrowForce2) arrowForce2.setDirection(new THREE.Vector3(1, 0, 0));
      }
    }

    function updateMotorSpeed(val) {
      state.motorSpeedRpm = parseFloat(val);
      const label = document.getElementById('labelSpeed');
      const globalRpm = document.getElementById('globalRpmVal');
      if (label) label.innerText = val + ' d/d';
      if (globalRpm) globalRpm.innerText = val + ' d/d';
      recalcEngineeringValues();
    }

    function updateMotorCurrent(val) {
      state.armatureCurrent = parseFloat(val);
      const label = document.getElementById('labelCurrent');
      const hud = document.getElementById('hudCurrent');
      if (label) label.innerText = parseFloat(val).toFixed(1) + ' A';
      if (hud) hud.innerText = parseFloat(val).toFixed(1) + ' A';
      recalcEngineeringValues();
    }

    function updateMotorFlux(val) {
      state.fluxDensity = parseFloat(val);
      const label = document.getElementById('labelFlux');
      const hud = document.getElementById('hudFlux');
      const globalFlux = document.getElementById('globalFluxVal');
      if (label) label.innerText = parseFloat(val).toFixed(2) + ' T';
      if (hud) hud.innerText = parseFloat(val).toFixed(2) + ' T';
      if (globalFlux) globalFlux.innerText = parseFloat(val).toFixed(2) + ' T';
      recalcEngineeringValues();
    }

    function updateExplodedView(val) {
      state.explodedRatio = parseFloat(val) / 100.0;
      const label = document.getElementById('labelExplode');
      if (label) label.innerText = val + '%';

      const d = state.explodedRatio * 0.12;

      // Displace parts along Z
      if (statorGroup) statorGroup.position.z = -d * 0.5;
      if (poleShoesGroup) poleShoesGroup.position.z = -d * 0.3;
      if (rotorGroup) rotorGroup.position.z = 0;
      if (commutatorGroup) commutatorGroup.position.z = d * 0.6;
      if (brushGroup) brushGroup.position.z = d * 0.8;
      if (hallPcbGroup) hallPcbGroup.position.z = -d * 0.9;
    }

    function toggleVectorLayer(layer, isVisible) {
      state.showVectors[layer] = isVisible;
      if (layer === 'field') {
        if (arrowField1) arrowField1.visible = isVisible;
        if (arrowField2) arrowField2.visible = isVisible;
      } else if (layer === 'current') {
        if (arrowCurrent1) arrowCurrent1.visible = isVisible;
        if (arrowCurrent2) arrowCurrent2.visible = isVisible;
      } else if (layer === 'force') {
        if (arrowForce1) arrowForce1.visible = isVisible;
        if (arrowForce2) arrowForce2.visible = isVisible;
      } else if (layer === 'fluxLines') {
        if (fluxLinesGroup) fluxLinesGroup.visible = isVisible;
      }
    }

    function toggleTransparentCasing(isTrans) {
      state.transparentCasing = isTrans;
      if (statorGroup) {
        statorGroup.children.forEach(child => {
          if (child.material) {
            child.material.transparent = isTrans;
            child.material.opacity = isTrans ? 0.25 : 1.0;
          }
        });
      }
    }

    function toggleCutaway(isCut) {
      state.cutawayMode = isCut;
      if (statorGroup) {
        statorGroup.position.x = isCut ? 0.04 : 0;
      }
    }

    function recalcEngineeringValues() {
      const B = state.fluxDensity;
      const I = state.armatureCurrent;
      const l = state.conductorLength;
      const r = state.rotorRadius;
      const rpm = state.motorSpeedRpm;
      const omega = (rpm * 2 * Math.PI) / 60;

      // F = B * I * l
      const F = B * I * l;
      // T = 2 * r * F (two active conductor sides)
      const T = 2 * r * F;
      // P_m = T * omega
      const P = T * omega;
      // E = ke * omega
      const ke = 0.068;
      const E = ke * omega;

      const elF = document.getElementById('calcForceVal');
      const elT = document.getElementById('calcTorqueVal');
      const elP = document.getElementById('calcPowerVal');
      const elE = document.getElementById('calcEmfVal');
      const hudForce = document.getElementById('hudForce');
      const hudOmega = document.getElementById('hudOmega');

      if (elF) elF.innerText = F.toFixed(2) + ' N';
      if (elT) elT.innerText = T.toFixed(2) + ' N·m';
      if (elP) elP.innerText = P.toFixed(1) + ' W';
      if (elE) elE.innerText = E.toFixed(2) + ' V';
      if (hudForce) hudForce.innerText = F.toFixed(2) + ' N';
      if (hudOmega) hudOmega.innerText = omega.toFixed(1) + ' rad/s';
    }

    // =========================================================================
    // 2D DIRECTION DETERMINATION LAB ENGINE (NOTEBOOK PAGE 1 TWIN)
    // =========================================================================
    function initDirection2DLab() {
      drawDirection2DCanvas();
    }

    function drawDirection2DCanvas() {
      const canvas = document.getElementById('direction2dCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 380;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const statorR = Math.min(w, h) * 0.40;
      const rotorR = statorR * 0.58;

      // 1. Draw Stator Outer Ring
      ctx.beginPath();
      ctx.arc(cx, cy, statorR, 0, Math.PI * 2);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // 2. Draw Poles (North & South)
      const poleH = statorR * 0.32;
      const poleW = statorR * 0.85;

      const isNorthTop = state.dirLab.northOnTop;

      // Top Pole
      ctx.fillStyle = isNorthTop ? '#b91c1c' : '#1d4ed8'; // Red if N, Blue if S
      ctx.beginPath();
      ctx.arc(cx, cy, statorR - 7, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.arc(cx, cy, statorR - 7 - poleH, -Math.PI * 0.22, -Math.PI * 0.78, true);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f8fafc';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNorthTop ? 'KUTUP (N)' : 'KUTUP (S)', cx, cy - statorR + 22);

      // Bottom Pole
      ctx.fillStyle = isNorthTop ? '#1d4ed8' : '#b91c1c';
      ctx.beginPath();
      ctx.arc(cx, cy, statorR - 7, Math.PI * 0.22, Math.PI * 0.78);
      ctx.arc(cx, cy, statorR - 7 - poleH, Math.PI * 0.78, Math.PI * 0.22, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.stroke();

      ctx.fillText(isNorthTop ? 'KUTUP (S)' : 'KUTUP (N)', cx, cy + statorR - 22);

      // 3. Draw Magnetic Flux Vector Lines (B)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      const fluxDir = isNorthTop ? 1 : -1; // 1: down, -1: up

      for (let x = -statorR * 0.35; x <= statorR * 0.35; x += 24) {
        ctx.beginPath();
        ctx.moveTo(cx + x, cy - (statorR - poleH - 8) * fluxDir);
        ctx.lineTo(cx + x, cy + (statorR - poleH - 8) * fluxDir);
        ctx.stroke();

        // Arrow head for B
        const arrowY = cy + 10 * fluxDir;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(cx + x, arrowY + 8 * fluxDir);
        ctx.lineTo(cx + x - 4, arrowY);
        ctx.lineTo(cx + x + 4, arrowY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.setLineDash([]);

      // Label B
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.fillText(isNorthTop ? 'Akı B (↓)' : 'Akı B (↑)', cx + statorR * 0.52, cy);

      // 4. Draw Rotor Core
      ctx.beginPath();
      ctx.arc(cx, cy, rotorR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#64748b';
      ctx.stroke();

      // Shaft circle
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      // 5. Draw Rotor Slots (Slot 1 at Top-Left, Slot 2 at Bottom-Right or Top/Bottom)
      const slotDist = rotorR * 0.65;
      const s1x = cx - slotDist * 0.45;
      const s1y = cy - slotDist * 0.70;
      const s2x = cx + slotDist * 0.45;
      const s2y = cy + slotDist * 0.70;

      // Slot 1
      ctx.beginPath();
      ctx.arc(s1x, s1y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Slot 2
      ctx.beginPath();
      ctx.arc(s2x, s2y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Conductor Symbols: Dot (out of page) or Cross (into page)
      const isOutSlot1 = state.dirLab.currentOutSlot1;

      // Slot 1 Symbol
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.fillText(isOutSlot1 ? '⊙' : '⊗', s1x, s1y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('1', s1x - 18, s1y - 12);

      // Slot 2 Symbol
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.fillText(isOutSlot1 ? '⊗' : '⊙', s2x, s2y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('2', s2x + 18, s2y + 12);

      // 6. Draw Lorentz Force Arrows (F1 and F2)
      // If B is down (1) and I1 is out (+z): F1 = z x (-y) = +x (Right)
      // If B is up (-1) and I1 is out (+z): F1 = z x (+y) = -x (Left)
      // If I1 is in (-z): F1 flips
      const f1Dir = (isNorthTop ? 1 : -1) * (isOutSlot1 ? 1 : -1); // 1: right, -1: left
      const f2Dir = -f1Dir; // Newton 3rd law / symmetric

      // Arrow F1 at Slot 1
      drawArrow2D(ctx, s1x, s1y, s1x + f1Dir * 55, s1y, '#10b981', 'F₁');
      // Arrow F2 at Slot 2
      drawArrow2D(ctx, s2x, s2y, s2x + f2Dir * 55, s2y, '#10b981', 'F₂');

      // 7. Draw Rotation Direction Arc & Badge
      const isCW = (f1Dir === 1);
      ctx.beginPath();
      ctx.arc(cx, cy, rotorR + 18, isCW ? -0.8 : 0.8, isCW ? 0.8 : -0.8, !isCW);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Arrow on rotation arc
      const arcEndX = cx + Math.cos(isCW ? 0.8 : -0.8) * (rotorR + 18);
      const arcEndY = cy + Math.sin(isCW ? 0.8 : -0.8) * (rotorR + 18);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(arcEndX, arcEndY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Update Text Badges & Analysis
      const badge = document.getElementById('badgeRotationDir');
      if (badge) {
        if (isCW) {
          badge.className = 'text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300';
          badge.innerHTML = '<i class="fa-solid fa-rotate-right"></i> DÖNÜŞ: SAAT İBRELERİ YÖNÜNDE (CW)';
        } else {
          badge.className = 'text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-950 border border-rose-700 text-rose-300';
          badge.innerHTML = '<i class="fa-solid fa-rotate-left"></i> DÖNÜŞ: SAATİN TERSİ YÖNÜNDE (CCW)';
        }
      }

      // Update Analysis Text in HTML
      updateDirectionAnalysis(isNorthTop, isOutSlot1, f1Dir, isCW);
    }

    function drawArrow2D(ctx, fromX, fromY, toX, toY, color, label) {
      const headlen = 8;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(label, toX + (toX > fromX ? 8 : -16), toY - 4);
    }

    function updateDirectionAnalysis(isNTop, isOut1, f1Dir, isCW) {
      const elSlot1 = document.getElementById('analysisSlot1');
      const elSlot2 = document.getElementById('analysisSlot2');
      const elTorque = document.getElementById('analysisTorque');

      const bDirText = isNTop ? 'AŞAĞI (↓, -y)' : 'YUKARI (↑, +y)';
      const i1Text = isOut1 ? 'sayfa düzleminden DIŞARI (⊙, +z)' : 'sayfa düzlemine İÇERİ (⊗, -z)';
      const f1Text = (f1Dir === 1) ? 'SOLDAN SAĞA (→, +x)' : 'SAĞDAN SOLA (←, -x)';
      const f2Text = (f1Dir === 1) ? 'SAĞDAN SOLA (←, -x)' : 'SOLDAN SAĞA (→, +x)';

      if (elSlot1) {
        elSlot1.innerHTML = `1 nolu olukta akım <strong>${i1Text}</strong> doğrudur. Manyetik alan $\\vec{B}$ <strong>${bDirText}</strong> yönlüdür.<br>Vidalama kuralına göre: $\\vec{F}_1 = i(\\vec{l}_1 \\times \\vec{B})$ işlemi başparmağı <strong class="text-emerald-400">${f1Text}</strong> yöneltir!`;
      }
      if (elSlot2) {
        elSlot2.innerHTML = `2 nolu olukta akım karşı yöndedir. Manyetik alan aynı olduğundan kuvvet <strong class="text-emerald-400">${f2Text}</strong> yöneltir!`;
      }
      if (elTorque) {
        elTorque.innerHTML = `Kuvvet çiftinin mil merkezine göre oluşturduğu net döndürme momenti:<br>$\\vec{T} = \\vec{r}_1 \\times \\vec{F}_1 + \\vec{r}_2 \\times \\vec{F}_2 \\implies$ <strong class="text-cyan-300">${isCW ? 'SAAT İBRELERİ YÖNÜNDE (CW)' : 'SAATİN TERSİ YÖNÜNDE (CCW)'}</strong>`;
      }
      renderKaTeX();
    }

    function flipMagneticPoles() {
      state.dirLab.northOnTop = !state.dirLab.northOnTop;
      drawDirection2DCanvas();
    }

    function flipCurrentDirection() {
      state.dirLab.currentOutSlot1 = !state.dirLab.currentOutSlot1;
      drawDirection2DCanvas();
    }

    function resetDirectionLab() {
      state.dirLab.northOnTop = true;
      state.dirLab.currentOutSlot1 = true;
      drawDirection2DCanvas();
    }

    function syncDirectionWith3D() {
      const isCW = (state.dirLab.northOnTop === state.dirLab.currentOutSlot1);
      setMotorDirection(isCW ? 1 : -1);
      switchTab('tab-3d-lab');
    }

    // =========================================================================
    // BLDC 6-STEP INVERTER & OSCILLOSCOPE ENGINE
    // =========================================================================
    const bldcStepData = [
      { step: 1, angle: '0° - 60°', h1: 1, h2: 0, h3: 1, pos: 'A', neg: 'B', float: 'C', name: 'A+ B-' },
      { step: 2, angle: '60° - 120°', h1: 1, h2: 0, h3: 0, pos: 'A', neg: 'C', float: 'B', name: 'A+ C-' },
      { step: 3, angle: '120° - 180°', h1: 1, h2: 1, h3: 0, pos: 'B', neg: 'C', float: 'A', name: 'B+ C-' },
      { step: 4, angle: '180° - 240°', h1: 0, h2: 1, h3: 0, pos: 'B', neg: 'A', float: 'C', name: 'B+ A-' },
      { step: 5, angle: '240° - 300°', h1: 0, h2: 1, h3: 1, pos: 'C', neg: 'A', float: 'B', name: 'C+ A-' },
      { step: 6, angle: '300° - 360°', h1: 0, h2: 0, h3: 1, pos: 'C', neg: 'B', float: 'A', name: 'C+ B-' }
    ];

    function initBldcLab() {
      drawBldcBridgeCanvas();
      drawBldcOscilloscope();
    }

    function drawBldcBridgeCanvas() {
      const canvas = document.getElementById('bldcBridgeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 650;
      const h = canvas.height = canvas.parentElement.clientHeight || 320;

      ctx.clearRect(0, 0, w, h);

      const curStep = bldcStepData[state.bldc.step - 1];

      // Update table highlight
      for (let i = 1; i <= 6; i++) {
        const row = document.getElementById(`row-step-${i}`);
        if (row) {
          if (i === state.bldc.step) {
            row.className = 'bg-cyan-950/70 text-cyan-300 font-bold border-l-4 border-cyan-400';
          } else {
            row.className = '';
          }
        }
      }

      const label = document.getElementById('bldcCurrentStepLabel');
      if (label) label.innerText = `Adım ${curStep.step} (${curStep.name})`;

      // Draw DC Rail Lines
      const topRailY = 40;
      const botRailY = 280;
      const leftX = 50;
      const rightX = w - 50;

      ctx.strokeStyle = '#ef4444'; // +VDC Red
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftX, topRailY);
      ctx.lineTo(rightX, topRailY);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText('+VDC (Bara)', leftX + 10, topRailY - 10);

      ctx.strokeStyle = '#3b82f6'; // -VDC Blue
      ctx.beginPath();
      ctx.moveTo(leftX, botRailY);
      ctx.lineTo(rightX, botRailY);
      ctx.stroke();

      ctx.fillStyle = '#3b82f6';
      ctx.fillText('GND / -VDC', leftX + 10, botRailY + 20);

      // 3 Inverter Legs: Phase A, Phase B, Phase C
      const legSpacing = (rightX - leftX) / 4;
      const phases = ['A', 'B', 'C'];

      phases.forEach((ph, idx) => {
        const legX = leftX + (idx + 1) * legSpacing;
        const isUpperOn = (curStep.pos === ph);
        const isLowerOn = (curStep.neg === ph);

        // Vertical leg wire
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legX, topRailY);
        ctx.lineTo(legX, botRailY);
        ctx.stroke();

        // Upper Switch (Q1, Q3, Q5)
        const qUpperY = 90;
        drawMosfetSymbol(ctx, legX, qUpperY, isUpperOn, `${ph}+ (Q${idx*2+1})`);

        // Lower Switch (Q2, Q4, Q6)
        const qLowerY = 220;
        drawMosfetSymbol(ctx, legX, qLowerY, isLowerOn, `${ph}- (Q${idx*2+2})`);

        // Center tap to Motor Phase Terminal
        const midY = (topRailY + botRailY) / 2;
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.fillText(`Faz ${ph}`, legX + 15, midY - 6);

        // Highlight active conduction current
        if (isUpperOn) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(legX, topRailY);
          ctx.lineTo(legX, midY);
          ctx.stroke();

          // Green Current Arrow into phase
          drawSmallArrow(ctx, legX, midY - 20, 0, 1, '#10b981');
        } else if (isLowerOn) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(legX, midY);
          ctx.lineTo(legX, botRailY);
          ctx.stroke();

          // Orange Current Arrow out of phase
          drawSmallArrow(ctx, legX, midY + 30, 0, 1, '#f59e0b');
        }
      });
    }

    function drawMosfetSymbol(ctx, x, y, isOn, label) {
      ctx.save();
      ctx.fillStyle = isOn ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.8)';
      ctx.strokeStyle = isOn ? '#10b981' : '#64748b';
      ctx.lineWidth = isOn ? 3 : 1.5;

      ctx.beginPath();
      ctx.roundRect(x - 24, y - 18, 48, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isOn ? '#34d399' : '#94a3b8';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y - 4);

      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = isOn ? '#10b981' : '#64748b';
      ctx.fillText(isOn ? 'ON (İletimde)' : 'OFF (Kesimde)', x, y + 9);
      ctx.restore();
    }

    function drawSmallArrow(ctx, x, y, dx, dy, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + dx * 8, y + dy * 8);
      ctx.lineTo(x - dy * 5, y + dx * 5);
      ctx.lineTo(x + dy * 5, y - dx * 5);
      ctx.closePath();
      ctx.fill();
    }

    function drawBldcOscilloscope() {
      const canvas = document.getElementById('bldcOscilloscopeCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 800;
      const h = canvas.height = canvas.parentElement.clientHeight || 220;

      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 35) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw 3-Phase Trapezoidal Back-EMF Waves
      const midY = h / 2;
      const amp = 45;

      const colors = ['#38bdf8', '#34d399', '#f59e0b']; // Ph A, Ph B, Ph C
      const phaseOffsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

      phases = ['e_A (Mavi)', 'e_B (Yeşil)', 'e_C (Sarı)'];

      for (let p = 0; p < 3; p++) {
        ctx.strokeStyle = colors[p];
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 0; x < w; x++) {
          const theta = (x / w) * (Math.PI * 4) + phaseOffsets[p];
          // Trapezoidal shape approximation
          const sinVal = Math.sin(theta);
          let trapVal = 0;
          if (sinVal > 0.5) trapVal = 1;
          else if (sinVal < -0.5) trapVal = -1;
          else trapVal = sinVal / 0.5;

          const y = midY - trapVal * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Current Commutation marker cursor line
      const curX = ((state.bldc.step - 0.5) / 6) * (w / 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`Adım ${state.bldc.step}`, curX + 5, 20);
    }

    function nextBldcStep() {
      if (state.bldc.direction === 1) {
        state.bldc.step = (state.bldc.step % 6) + 1;
      } else {
        state.bldc.step = state.bldc.step === 1 ? 6 : state.bldc.step - 1;
      }
      drawBldcBridgeCanvas();
      drawBldcOscilloscope();
    }

    function prevBldcStep() {
      if (state.bldc.direction === 1) {
        state.bldc.step = state.bldc.step === 1 ? 6 : state.bldc.step - 1;
      } else {
        state.bldc.step = (state.bldc.step % 6) + 1;
      }
      drawBldcBridgeCanvas();
      drawBldcOscilloscope();
    }

    function toggleBldcAutoPlay() {
      state.bldc.autoPlay = !state.bldc.autoPlay;
      const btn = document.getElementById('btnBldcAutoPlay');
      if (state.bldc.autoPlay) {
        if (btn) btn.className = 'px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Durdur';
        state.bldc.timer = setInterval(nextBldcStep, 700);
      } else {
        if (btn) btn.className = 'px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Otomatik Komütasyon';
        clearInterval(state.bldc.timer);
      }
    }

    function setBldcDirection(dir) {
      state.bldc.direction = dir;
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
    // UNIVERSAL MOTOR AC/DC CALCULATOR & PHASOR ENGINE
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

      // V^2 = (Eac + I*R)^2 + (I*X)^2
      const IX = I * X;
      const IR = I * R;
      const underRoot = (V * V) - (IX * IX);

      let Eac = 0;
      let cosPhi = 0;
      let Edc = 0;
      let Ndc = 0;

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
      const h = canvas.height = canvas.parentElement.clientHeight || 320;

      ctx.clearRect(0, 0, w, h);

      const originX = 60;
      const originY = h - 60;
      const scale = 1.9;

      // Base vector: Eac + IR (horizontal)
      const baseLen = (Eac + IR) * scale;
      const heightLen = IX * scale;

      // 1. Horizontal Component (Eac + IR)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + baseLen, originY);
      ctx.stroke();

      // Label Eac + IR
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(`E_a + I·R (${(Eac + IR).toFixed(1)} V)`, originX + baseLen / 2 - 30, originY + 20);

      // 2. Vertical Component (I*X_L)
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(originX + baseLen, originY);
      ctx.lineTo(originX + baseLen, originY - heightLen);
      ctx.stroke();

      // Label IX
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`I·X_L (${IX.toFixed(1)} V)`, originX + baseLen + 10, originY - heightLen / 2);

      // 3. Hypotenuse (Total Voltage V)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + baseLen, originY - heightLen);
      ctx.stroke();

      // Label V
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`V = ${V.toFixed(0)} V`, originX + baseLen / 2 - 20, originY - heightLen / 2 - 10);

      // Angle Arc (phi)
      ctx.beginPath();
      ctx.arc(originX, originY, 35, -Math.atan2(heightLen, baseLen), 0);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText('φ', originX + 40, originY - 10);
    }

    function testUniversalPolarity(type) {
      const res = document.getElementById('universalDirectionResult');
      if (type === 'line') {
        res.innerHTML = '<span class="text-amber-400 font-bold">L ve N şebeke uçları yer değiştirildi:</span> Hem armatür akımı $I_a$ hem de seri kutup akısı $\\Phi$ aynı anda ters döner. $(-I) \\times (-\\Phi) = +T \\implies$ <strong class="text-emerald-400">DÖNÜŞ YÖNÜ DEĞİŞMEZ!</strong> (AC şebekede sürekli dönebilme prensibi).';
      } else {
        res.innerHTML = '<span class="text-cyan-400 font-bold">Sadece Armatür Uçları Yer Değiştirildi:</span> Kutup akısı aynı kalırken sadece armatür akımının yönü ters çevrildi. $(+I) \\times (-\\Phi) = -T \\implies$ <strong class="text-rose-400">DÖNÜŞ YÖNÜ TERSİNE ÇEVRİLİR! (Saat Yönünün Tersi)</strong>';
      }
      renderKaTeX();
    }

    // =========================================================================
    // SERVO ENCODER & RESOLVER ENGINE
    // =========================================================================
    function initServoLab() {
      drawEncoderCanvas();
      drawResolverCanvas();
    }

    function drawEncoderCanvas() {
      const canvas = document.getElementById('encoderCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 280;

      ctx.clearRect(0, 0, w, h);

      // Quadrature Channels A, B, and Z waveforms
      const rowH = h / 3;
      const t = performance.now() * 0.003 * state.encoder.direction;

      const channels = [
        { name: 'Kanal A', color: '#38bdf8', offset: 0 },
        { name: 'Kanal B (90° Faz)', color: '#34d399', offset: (state.encoder.direction === 1) ? Math.PI / 2 : -Math.PI / 2 },
        { name: 'Kanal Z (Index Palsi)', color: '#f59e0b', offset: 0, isZ: true }
      ];

      channels.forEach((ch, idx) => {
        const yBase = idx * rowH + rowH * 0.75;
        ctx.fillStyle = ch.color;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(ch.name, 15, idx * rowH + 20);

        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 80; x < w; x++) {
          let val = 0;
          if (ch.isZ) {
            // Index pulse occurs once per revolution
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
      state.encoder.direction = dir;
      const badge = document.getElementById('encoderDirBadge');
      const btnCW = document.getElementById('btnEncCW');
      const btnCCW = document.getElementById('btnEncCCW');

      if (dir === 1) {
        badge.innerText = "CW (A, B'den 90° Önce)";
        badge.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300';
        btnCW.className = 'px-2 py-2 rounded-lg bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold transition';
        btnCCW.className = 'px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold transition';
      } else {
        badge.innerText = "CCW (B, A'dan 90° Önce)";
        badge.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300';
        btnCW.className = 'px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold transition';
        btnCCW.className = 'px-2 py-2 rounded-lg bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold transition';
      }
      drawEncoderCanvas();
    }

    function updateEncoderSim() {
      const ppr = parseInt(document.getElementById('selectEncoderPpr').value);
      state.encoder.ppr = ppr;
      const count4x = ppr * 4;
      const rpm = state.motorSpeedRpm;
      const fKhz = (ppr * rpm) / (60 * 1000);

      document.getElementById('enc4xCount').innerText = count4x.toLocaleString() + ' darbe/tur';
      document.getElementById('encPulseFreq').innerText = fKhz.toFixed(1) + ' kHz';
    }

    function drawResolverCanvas() {
      const canvas = document.getElementById('resolverCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 280;

      ctx.clearRect(0, 0, w, h);

      // Resolver Signals: Carrier sin(wc*t), Vsin = sin(theta)*sin(wc*t), Vcos = cos(theta)*sin(wc*t)
      const t = performance.now() * 0.002;
      const rotorAngle = t * 0.5; // slow mechanical rotation

      const rowH = h / 2;

      // 1. Vsin Waveform (Top Half)
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`V_sin = sin(θ)·sin(ω_c t) [θ = ${((rotorAngle * 180 / Math.PI) % 360).toFixed(0)}°]`, 15, 20);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.25);
        const mod = Math.sin(rotorAngle + (x * 0.015));
        const y = rowH * 0.5 - (carrier * mod) * 38;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Vcos Waveform (Bottom Half)
      ctx.fillStyle = '#a855f7';
      ctx.fillText('V_cos = cos(θ)·sin(ω_c t)', 15, rowH + 20);

      ctx.strokeStyle = '#a855f7';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const carrier = Math.sin(x * 0.25);
        const mod = Math.cos(rotorAngle + (x * 0.015));
        const y = rowH * 1.5 - (carrier * mod) * 38;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // =========================================================================
    // STEPPER MOTOR ENGINE
    // =========================================================================
    function initStepperLab() {
      calculateStepper();
      drawStepperCanvas();
    }

    function calculateStepper() {
      const m = parseInt(document.getElementById('sliderStepM').value);
      const nr = parseInt(document.getElementById('sliderStepNr').value);
      const rpm = parseInt(document.getElementById('sliderStepRpm').value);

      state.stepper.m = m;
      state.stepper.nr = nr;
      state.stepper.targetRpm = rpm;

      document.getElementById('labelStepM').innerText = m + ' Faz';
      document.getElementById('labelStepNr').innerText = nr + ' Diş';
      document.getElementById('labelStepRpm').innerText = rpm + ' d/d';

      let stepAngle = 360.0 / (m * nr);
      let stepsPerRev = m * nr;

      if (state.stepper.mode === 'half') {
        stepAngle /= 2.0;
        stepsPerRev *= 2;
      } else if (state.stepper.mode === 'micro') {
        stepAngle /= 8.0;
        stepsPerRev *= 8;
      }

      // f = (rpm * stepsPerRev) / 60
      const fStep = (rpm * stepsPerRev) / 60.0;
      const periodUs = (fStep > 0) ? (1.0 / fStep) * 1e6 : 0;

      document.getElementById('resStepAngle').innerText = stepAngle.toFixed(3) + '°';
      document.getElementById('resStepCount').innerText = stepsPerRev.toLocaleString() + ' adım/tur';
      document.getElementById('resStepFreq').innerText = (fStep >= 1000) ? (fStep / 1000).toFixed(2) + ' kHz' : fStep.toFixed(0) + ' Hz';
      document.getElementById('resStepPeriod').innerText = periodUs.toFixed(1) + ' µs';

      drawStepperCanvas();
    }

    function setStepperDriveMode(mode) {
      state.stepper.mode = mode;
      const modes = ['wave', 'full', 'half', 'micro'];
      modes.forEach(m => {
        const btn = document.getElementById(`btnStep${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (btn) {
          if (m === mode) {
            btn.className = 'px-2 py-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 font-bold transition';
          } else {
            btn.className = 'px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition';
          }
        }
      });

      const badge = document.getElementById('stepModeBadge');
      if (badge) {
        const names = { wave: 'Dalga (1 Faz)', full: 'Tam Adım (Full-Step)', half: 'Yarım Adım (Half-Step)', micro: 'Mikro Adım (1/8)' };
        badge.innerText = names[mode];
      }

      calculateStepper();
    }

    function drawStepperCanvas() {
      const canvas = document.getElementById('stepperCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.parentElement.clientWidth || 450;
      const h = canvas.height = canvas.parentElement.clientHeight || 320;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.40;

      // Draw Stator Ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.stroke();

      // 8 Stator Salient Poles
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * (r - 12);
        const py = cy + Math.sin(ang) * (r - 12);

        // Determine if pole is active
        const isActive = (i % 2 === (state.stepper.stepIndex % 2));

        ctx.fillStyle = isActive ? '#f59e0b' : '#1e293b';
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isActive ? '#fbbf24' : '#475569';
        ctx.stroke();

        ctx.fillStyle = isActive ? '#000000' : '#94a3b8';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String.fromCharCode(65 + (i % 4)), px, py);
      }

      // Draw Toothed Rotor
      const rotorR = r * 0.55;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(cx, cy, rotorR, 0, Math.PI * 2);
      ctx.fill();

      // 50 Rotor Teeth representation
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      for (let i = 0; i < 50; i++) {
        const tAng = (i / 50) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tAng) * (rotorR - 4), cy + Math.sin(tAng) * (rotorR - 4));
        ctx.lineTo(cx + Math.cos(tAng) * (rotorR + 5), cy + Math.sin(tAng) * (rotorR + 5));
        ctx.stroke();
      }

      // Center shaft
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
    }

    // --- WINDOW LOAD INITIALIZATION ---
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Initialize 3D Scene
      setTimeout(init3DScene, 100);

      // 2. Initialize 2D Direction Lab
      initDirection2DLab();

      // 3. Initialize BLDC Lab
      initBldcLab();

      // 4. Initialize Universal Motor Lab
      calculateUniversalMotor();

      // 5. Initialize Servo Lab
      initServoLab();

      // 6. Initialize Stepper Lab
      initStepperLab();

      // 7. Initial KaTeX Render
      setTimeout(renderKaTeX, 500);

      // Periodically redraw animated canvases
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
"""
