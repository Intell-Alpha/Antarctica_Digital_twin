/**
 * PolarAtmosphereSystem.ts
 * High-performance Three.js engine for extreme Antarctic atmospheric phenomena:
 * 1. Volumetric Undulating Aurora Australis (Southern Lights) Ribbon Shader
 * 2. GPU Katabatic Snow & Blizzard Particle Cloud (30,000 particles)
 * 3. Accurate 24-Hour Antarctic Polar Solar Arc (Midnight Sun & Polar Night)
 */

import * as THREE from "three";

export type PolarSeason = "SUMMER" | "WINTER";

export interface PolarAtmosphereConfig {
  season?: PolarSeason;
  solarHour?: number; // 0.0 to 24.0
  isBlizzard?: boolean;
  windSpeedKmh?: number;
  auroraIntensity?: number; // 0.0 to 1.0
}

export class PolarAtmosphereSystem {
  private scene: THREE.Scene;
  private sunLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;

  // Aurora Australis Objects
  private auroraGroup: THREE.Group = new THREE.Group();
  private auroraMaterial: THREE.ShaderMaterial | null = null;
  private auroraUniforms: {
    uTime: { value: number };
    uIntensity: { value: number };
    uBaseColor: { value: THREE.Color };
    uPeakColor: { value: THREE.Color };
  } = {
    uTime: { value: 0 },
    uIntensity: { value: 0.0 },
    uBaseColor: { value: new THREE.Color("#00ff9d") },
    uPeakColor: { value: new THREE.Color("#a855f7") },
  };

  // Katabatic Snow & Blizzard Particles
  private snowParticles: THREE.Points | null = null;
  private snowCount = 24000;
  private snowPositions: Float32Array = new Float32Array(0);
  private snowVelocities: Float32Array = new Float32Array(0);
  private snowBounds = { minX: -220, maxX: 220, minY: 0.2, maxY: 75, minZ: -220, maxZ: 220 };
  private snowMaterial: THREE.PointsMaterial | null = null;

  // State
  private season: PolarSeason = "SUMMER";
  private solarHour: number = 14.0; // 2:00 PM standard polar afternoon
  private isBlizzard: boolean = false;
  private windSpeedKmh: number = 28;
  private blizzardTransition: number = 0; // 0 (calm) to 1 (whiteout)

  constructor(scene: THREE.Scene, sunLight?: THREE.DirectionalLight | null, hemiLight?: THREE.HemisphereLight | null) {
    this.scene = scene;
    this.sunLight = sunLight || null;
    this.hemiLight = hemiLight || null;

    this.initAuroraCurtains();
    this.initSnowParticles();
    this.updateSolarPosition();
  }

  // ── 1. AURORA AUSTRALIS SHADER RIBBONS ──
  private initAuroraCurtains() {
    this.auroraGroup = new THREE.Group();
    this.auroraGroup.name = "Aurora_Australis_Curtain_System";

    // Create undulating wavy vertex & fragment shader
    const vertexShader = `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Multi-frequency sinusoidal undulating curtains
        float wave1 = sin(pos.x * 0.035 + uTime * 0.9) * cos(pos.z * 0.035 + uTime * 0.7);
        float wave2 = sin(pos.x * 0.08 - uTime * 1.4) * 0.35;
        float totalWave = wave1 + wave2;

        // Displace more strongly along the top of the curtain
        pos.y += totalWave * 12.0 * uv.y * uIntensity;
        pos.x += sin(pos.y * 0.05 + uTime) * 6.0 * uv.y;
        vWave = totalWave;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uBaseColor;
      uniform vec3 uPeakColor;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        if (uIntensity < 0.01) discard;

        // Vertical gradient: soft fade at bottom, brilliant ribbon in middle, ethereal violet at peak
        float verticalFade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);

        // Vertical ray fluting effect
        float rays = sin(vUv.x * 120.0 + vWave * 4.0) * 0.15 + 0.85;

        // Mix Emerald Green base to Violet top
        vec3 color = mix(uBaseColor, uPeakColor, smoothstep(0.3, 0.9, vUv.y));
        color *= rays;

        float alpha = verticalFade * uIntensity * 0.65;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    this.auroraMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.auroraUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    // Outer and Inner curved ribbons arching across polar sky
    const ribbonGeom = new THREE.CylinderGeometry(180, 160, 48, 64, 16, true, 0, Math.PI * 1.5);
    const ribbonMesh1 = new THREE.Mesh(ribbonGeom, this.auroraMaterial);
    ribbonMesh1.position.set(0, 55, -20);
    ribbonMesh1.rotation.y = 0.4;
    this.auroraGroup.add(ribbonMesh1);

    const ribbonGeom2 = new THREE.CylinderGeometry(140, 130, 40, 64, 16, true, Math.PI * 0.5, Math.PI * 1.4);
    const ribbonMesh2 = new THREE.Mesh(ribbonGeom2, this.auroraMaterial);
    ribbonMesh2.position.set(10, 65, 15);
    ribbonMesh2.rotation.y = -0.6;
    this.auroraGroup.add(ribbonMesh2);

    this.scene.add(this.auroraGroup);
  }

  // ── 2. GPU KATABATIC SNOW & BLIZZARD PARTICLE CLOUD ──
  private initSnowParticles() {
    const geom = new THREE.BufferGeometry();
    this.snowPositions = new Float32Array(this.snowCount * 3);
    this.snowVelocities = new Float32Array(this.snowCount * 3);

    for (let i = 0; i < this.snowCount; i++) {
      const idx = i * 3;
      // Random spread across station bounds
      this.snowPositions[idx] = THREE.MathUtils.randFloat(this.snowBounds.minX, this.snowBounds.maxX);
      this.snowPositions[idx + 1] = THREE.MathUtils.randFloat(this.snowBounds.minY, this.snowBounds.maxY);
      this.snowPositions[idx + 2] = THREE.MathUtils.randFloat(this.snowBounds.minZ, this.snowBounds.maxZ);

      // Katabatic wind velocity vector (-X, -Y, -Z downhill drift)
      this.snowVelocities[idx] = THREE.MathUtils.randFloat(-1.2, -0.4);
      this.snowVelocities[idx + 1] = THREE.MathUtils.randFloat(-0.8, -0.2); // falling downward
      this.snowVelocities[idx + 2] = THREE.MathUtils.randFloat(-0.6, 0.4);
    }

    geom.setAttribute("position", new THREE.BufferAttribute(this.snowPositions, 3));

    // Snowflake texture generation using procedural canvas
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.3, "rgba(230, 245, 255, 0.8)");
      grad.addColorStop(0.8, "rgba(200, 230, 255, 0.2)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    this.snowMaterial = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.snowParticles = new THREE.Points(geom, this.snowMaterial);
    this.snowParticles.name = "Katabatic_Snow_Particle_System";
    this.scene.add(this.snowParticles);
  }

  // ── 3. 24-HOUR POLAR SOLAR CALCULATOR (LATITUDE ~70°S) ──
  public updateSolarPosition() {
    // Hour angle: 0h = midnight, 12h = solar noon
    const hourRad = ((this.solarHour - 12) / 24) * Math.PI * 2;

    // Declination:
    // Summer (Dec/Jan): -23.4° (Sun high above horizon 24/7 = Midnight Sun)
    // Winter (Jun/Jul): +23.4° (Sun below horizon = Polar Night)
    const latRad = (-70.0 * Math.PI) / 180; // 70° South
    const decRad = (this.season === "SUMMER" ? -23.44 : 23.44) * (Math.PI / 180);

    // Solar elevation angle: sin(alt) = sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(hour)
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
    const elevation = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

    // Solar azimuth angle
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(elevation));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if (Math.sin(hourRad) > 0) {
      azimuth = Math.PI * 2 - azimuth;
    }

    // Convert (Elevation, Azimuth) to 3D Cartesian coordinates
    const distance = 200;
    const y = Math.sin(elevation) * distance;
    const groundDist = Math.cos(elevation) * distance;
    const x = Math.sin(azimuth) * groundDist;
    const z = Math.cos(azimuth) * groundDist;

    const isSunAboveHorizon = elevation > -0.05;

    if (this.sunLight) {
      this.sunLight.position.set(x, Math.max(8, y), z);

      if (isSunAboveHorizon) {
        // Natural polar sunlight scaling with solar height
        const intensity = Math.max(0.4, Math.sin(elevation) * 1.8);
        this.sunLight.intensity = intensity;

        // Golden hour warm glow near horizon vs crisp white-blue at noon
        if (elevation < 0.2) {
          this.sunLight.color.set(0xffd1a4); // Warm polar golden twilight
        } else {
          this.sunLight.color.set(0xfff7ee); // Crisp Antarctic sun
        }
      } else {
        // Deep twilight or moonlight
        this.sunLight.intensity = 0.15;
        this.sunLight.color.set(0x224466);
      }
    }

    if (this.hemiLight) {
      if (isSunAboveHorizon) {
        this.hemiLight.intensity = 0.65;
        this.hemiLight.color.set(0xdcf0ff);
        this.hemiLight.groundColor.set(0x8ea6ba);
      } else {
        this.hemiLight.intensity = 0.22;
        this.hemiLight.color.set(0x0c1a2e);
        this.hemiLight.groundColor.set(0x020814);
      }
    }

    // Adjust Aurora visibility automatically based on darkness unless forced
    if (this.auroraMaterial) {
      if (!isSunAboveHorizon || this.season === "WINTER") {
        this.auroraUniforms.uIntensity.value = Math.max(0.55, this.auroraUniforms.uIntensity.value);
      } else {
        // Faint in daylight
        this.auroraUniforms.uIntensity.value = Math.min(0.12, this.auroraUniforms.uIntensity.value);
      }
    }

    // Sky Background and Fog Tinting
    if (this.scene) {
      if (isSunAboveHorizon) {
        if (elevation < 0.15) {
          // Sunset / Sunrise Polar Twilight
          this.scene.background = new THREE.Color("#8fa8bf");
          if (this.scene.fog && !this.isBlizzard) {
            (this.scene.fog as any).color = new THREE.Color("#8fa8bf");
          }
        } else {
          // Bright Antarctic Polar Blue
          this.scene.background = new THREE.Color("#7db4db");
          if (this.scene.fog && !this.isBlizzard) {
            (this.scene.fog as any).color = new THREE.Color("#7db4db");
          }
        }
      } else {
        // Polar Night / Auroral Sky
        this.scene.background = new THREE.Color("#020712");
        if (this.scene.fog && !this.isBlizzard) {
          (this.scene.fog as any).color = new THREE.Color("#020712");
        }
      }
    }
  }

  // ── 4. TICK ANIMATION LOOP (Call in renderer tick) ──
  public update(deltaTime: number) {
    // 1. Update Aurora Curtains
    if (this.auroraMaterial) {
      this.auroraUniforms.uTime.value += deltaTime * 0.85;
    }

    // 2. Smooth Blizzard Transition
    const targetBlizzard = this.isBlizzard ? 1.0 : 0.0;
    this.blizzardTransition += (targetBlizzard - this.blizzardTransition) * Math.min(1.0, deltaTime * 2.5);

    // 3. Update Snow Particle Coordinates
    if (this.snowParticles) {
      const positions = this.snowParticles.geometry.attributes.position.array as Float32Array;
      const speedMultiplier = 1.0 + this.blizzardTransition * 3.8 + (this.windSpeedKmh / 50);

      // Katabatic wind directional velocity
      const katabaticX = -1.2 * speedMultiplier;
      const katabaticY = -0.55 * (1.0 + this.blizzardTransition * 0.6);
      const katabaticZ = -0.7 * speedMultiplier;

      for (let i = 0; i < this.snowCount; i++) {
        const idx = i * 3;

        positions[idx] += katabaticX * (0.8 + (i % 7) * 0.08);
        positions[idx + 1] += katabaticY * (0.8 + (i % 5) * 0.1);
        positions[idx + 2] += katabaticZ * (0.8 + (i % 9) * 0.06);

        // Wrap around boundaries
        if (positions[idx] < this.snowBounds.minX) positions[idx] = this.snowBounds.maxX;
        if (positions[idx + 1] < this.snowBounds.minY) positions[idx] = this.snowBounds.maxY;
        if (positions[idx + 2] < this.snowBounds.minZ) positions[idx] = this.snowBounds.maxZ;
      }

      this.snowParticles.geometry.attributes.position.needsUpdate = true;

      // Adjust particle size & opacity during blizzard
      if (this.snowMaterial) {
        this.snowMaterial.size = 0.45 + this.blizzardTransition * 0.45;
        this.snowMaterial.opacity = 0.5 + this.blizzardTransition * 0.4;
      }
    }

    // 4. Whiteout Fog Enforcement during Blizzard
    if (this.scene && this.scene.fog) {
      if (this.blizzardTransition > 0.05) {
        const whiteoutColor = new THREE.Color("#cbe1f0");
        const normalColor = (this.scene.background as THREE.Color) || new THREE.Color("#7db4db");
        (this.scene.fog as any).color.lerpColors(normalColor, whiteoutColor, this.blizzardTransition);
        (this.scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(0.0015, 0.016, this.blizzardTransition);
      }
    }
  }

  // ── PUBLIC CONFIGURATION API ──

  public setSolarHour(hour: number) {
    this.solarHour = Math.max(0, Math.min(24, hour));
    this.updateSolarPosition();
  }

  public getSolarHour(): number {
    return this.solarHour;
  }

  public setSeason(season: PolarSeason) {
    this.season = season;
    this.updateSolarPosition();
  }

  public getSeason(): PolarSeason {
    return this.season;
  }

  public setBlizzard(isBlizzard: boolean) {
    this.isBlizzard = isBlizzard;
  }

  public getIsBlizzard(): boolean {
    return this.isBlizzard;
  }

  public setWindSpeed(kmh: number) {
    this.windSpeedKmh = kmh;
  }

  public setAuroraIntensity(intensity: number) {
    this.auroraUniforms.uIntensity.value = Math.max(0, Math.min(1, intensity));
  }

  public getAuroraIntensity(): number {
    return this.auroraUniforms.uIntensity.value;
  }

  public dispose() {
    if (this.auroraGroup) {
      this.scene.remove(this.auroraGroup);
    }
    if (this.snowParticles) {
      this.scene.remove(this.snowParticles);
      this.snowParticles.geometry.dispose();
      if (this.snowMaterial) this.snowMaterial.dispose();
    }
  }
}
