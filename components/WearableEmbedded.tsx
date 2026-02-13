"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Wearable Platforms ─── */
const wearables = [
  {
    id: "smartwatch",
    name: "Smartwatch & Fitness Bands",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-600",
    platforms: ["Wear OS (Google)", "watchOS (Apple)", "Tizen (Samsung)", "RTOS-based custom"],
    sensors: ["PPG (heart rate)", "SpO2", "Accelerometer / Gyroscope", "Barometer", "Skin temperature"],
    protocols: ["BLE 5.x", "Wi-Fi", "NFC", "ANT+"],
    useCases: ["Health monitoring", "Activity tracking", "Medication reminders", "Fall detection", "Contactless payments"],
  },
  {
    id: "medical",
    name: "Medical Wearables",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: "from-red-500 to-rose-600",
    platforms: ["FDA-class II certified", "IEC 62304 compliant", "Custom RTOS / Zephyr"],
    sensors: ["ECG (single/multi-lead)", "EEG", "EMG", "Continuous glucose (CGM)", "Blood pressure (tonometry)"],
    protocols: ["BLE Medical Profile", "Bluetooth Classic (SPP)", "LoRa (remote patient)", "Cellular (LTE-M/NB-IoT)"],
    useCases: ["Remote patient monitoring", "Cardiac arrhythmia detection", "Epilepsy seizure alerts", "Post-surgical recovery tracking", "Clinical trials data collection"],
  },
  {
    id: "industrial-wear",
    name: "Industrial Wearables",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-600",
    platforms: ["Rugged Android", "Custom Linux / Yocto", "Zephyr RTOS", "FreeRTOS"],
    sensors: ["IMU (9-axis)", "Gas detection (CO, H2S, VOC)", "Noise dosimeter", "UV exposure", "Fatigue / drowsiness (EEG)"],
    protocols: ["BLE Mesh", "UWB (precise location)", "LoRaWAN", "Wi-Fi HaLow", "5G NR"],
    useCases: ["Worker safety & lone worker alerts", "Proximity / collision avoidance", "Fatigue & heat stress monitoring", "Hazardous environment alerts", "Hands-free task guidance (AR glasses)"],
  },
  {
    id: "ar-vr",
    name: "AR / VR / Smart Glasses",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: "from-purple-500 to-violet-600",
    platforms: ["Android XR", "Qualcomm XR2 / Snapdragon AR", "Custom Linux", "visionOS"],
    sensors: ["RGB + depth cameras", "LiDAR / ToF", "Eye tracking", "Hand tracking (6DoF)", "Spatial audio microphones"],
    protocols: ["Wi-Fi 6/6E", "BLE 5.x", "USB-C (tethered)", "SLAM / Visual-inertial odometry"],
    useCases: ["Remote expert assistance", "Assembly guidance overlay", "Digital twin visualization", "Warehouse pick-by-vision", "Training & simulation"],
  },
  {
    id: "hearable",
    name: "Hearables & Smart Audio",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
    color: "from-teal-500 to-cyan-600",
    platforms: ["Qualcomm QCC series", "Custom DSP (Cadence / Synopsys)", "nRF5340 (Nordic)", "BES2600 (Bestechnic)"],
    sensors: ["MEMS microphones (beamforming)", "In-ear PPG (heart rate)", "Bone conduction", "Inertial (head tracking)", "Ambient noise"],
    protocols: ["Bluetooth LE Audio (LC3)", "Auracast broadcast", "BLE Classic (A2DP/HFP)", "Proprietary 2.4 GHz low-latency"],
    useCases: ["Active noise cancellation (ANC)", "Real-time translation", "Hearing health & audiometry", "Voice-controlled AI assistant", "Industrial noise protection + comms"],
  },
];

/* ─── Embedded System Platforms ─── */
const embedded = [
  {
    id: "mcu",
    name: "Microcontroller (MCU)",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: "from-emerald-500 to-green-600",
    families: ["STM32 (ARM Cortex-M)", "ESP32 / ESP32-S3", "Nordic nRF52 / nRF53", "NXP i.MX RT", "TI MSP432 / CC series", "Microchip SAM / PIC32"],
    rtos: ["FreeRTOS", "Zephyr RTOS", "ThreadX (Azure RTOS)", "Mbed OS", "RIOT OS", "Bare-metal (HAL)"],
    useCases: ["Sensor hubs & data acquisition", "Motor control & actuators", "Battery-powered IoT nodes", "Wearable device cores", "Industrial edge controllers"],
  },
  {
    id: "mpu",
    name: "Microprocessor (MPU / SoC)",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-600",
    families: ["NXP i.MX 8 / i.MX 9", "TI AM62x / AM64x Sitara", "Raspberry Pi Compute Module", "Qualcomm QCS / QRB series", "Rockchip RK3588", "Renesas RZ/G series"],
    rtos: ["Embedded Linux (Yocto / Buildroot)", "Android (AOSP)", "QNX Neutrino", "VxWorks", "Ubuntu Core"],
    useCases: ["HMI & touch displays", "Edge AI / ML inference", "Gateway & protocol translation", "Video analytics & vision", "Robotics control units"],
  },
  {
    id: "fpga",
    name: "FPGA & Programmable Logic",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    families: ["Xilinx / AMD Zynq UltraScale+", "Intel / Altera Cyclone V / Arria 10", "Lattice iCE40 / ECP5", "Microchip PolarFire SoC", "Gowin GW2A"],
    rtos: ["Bare-metal + custom HDL", "PetaLinux (Xilinx)", "Nios II + FreeRTOS (Intel)", "Hybrid FPGA + ARM Linux"],
    useCases: ["Real-time signal processing", "High-speed data acquisition", "Custom communication protocols", "Hardware-accelerated AI inference", "Motor control & power electronics"],
  },
  {
    id: "edge-ai",
    name: "Edge AI & NPU Platforms",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "from-pink-500 to-rose-600",
    families: ["NVIDIA Jetson (Orin / Xavier / Nano)", "Google Coral (Edge TPU)", "Hailo-8 / Hailo-15", "Qualcomm QCS8550 (Hexagon NPU)", "STM32N6 (NPU built-in)", "Kendryte K510 (RISC-V + KPU)"],
    rtos: ["JetPack (NVIDIA)", "Mendel Linux (Coral)", "Yocto + TFLite / ONNX", "Android NNAPI"],
    useCases: ["On-device computer vision", "Anomaly detection at the edge", "Voice / NLP processing", "Predictive maintenance", "Autonomous navigation"],
  },
  {
    id: "connectivity",
    name: "Wireless & Connectivity Modules",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
    color: "from-cyan-500 to-blue-600",
    families: ["Nordic nRF9160 (LTE-M / NB-IoT)", "Quectel BG96 / BG770A", "Sierra Wireless HL78xx", "u-blox NINA / SARA", "Semtech SX126x (LoRa)", "Silicon Labs EFR32 (Thread / Zigbee / BLE)"],
    rtos: ["Zephyr + nRF Connect SDK", "FreeRTOS + AWS IoT", "mbedOS", "Mongoose OS"],
    useCases: ["LPWAN sensor networks", "Asset tracking & geofencing", "Cellular IoT gateways", "Matter / Thread smart home", "Satellite IoT (Iridium, Swarm)"],
  },
];

/* ─── Services ─── */
const services = [
  {
    id: "hw-design",
    title: "Hardware Design & PCB",
    tagline: "Schematic to production-ready boards",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: "from-emerald-500 to-green-600",
    steps: [
      "Requirements & component selection",
      "Schematic capture (Altium / KiCad)",
      "Multi-layer PCB layout & signal integrity",
      "DFM review, Gerber generation & prototyping",
    ],
    deliverables: ["Schematic & BOM", "PCB Layout (Gerber/ODB++)", "3D STEP Model", "DFM/DFA Report"],
  },
  {
    id: "firmware",
    title: "Firmware & BSP Development",
    tagline: "Bare-metal to RTOS to embedded Linux",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-600",
    steps: [
      "BSP bring-up & driver development",
      "RTOS task architecture & scheduling",
      "Peripheral drivers (SPI, I2C, UART, ADC)",
      "OTA update & secure boot implementation",
    ],
    deliverables: ["Firmware Binary & Source", "BSP Package", "Driver Documentation", "OTA Update System"],
  },
  {
    id: "embedded-software",
    title: "Embedded Application Software",
    tagline: "Sensor fusion, DSP, and control algorithms",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    steps: [
      "Sensor fusion algorithms (Kalman, complementary)",
      "DSP pipeline (filtering, FFT, feature extraction)",
      "Control loops (PID, state machines, motion planning)",
      "Power management & ultra-low-power optimization",
    ],
    deliverables: ["Application Source Code", "Algorithm Documentation", "Power Profile Report", "Test Suite"],
  },
  {
    id: "connectivity-sw",
    title: "Connectivity & Protocol Stack",
    tagline: "BLE, Wi-Fi, LoRa, cellular, and mesh",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
    color: "from-cyan-500 to-teal-600",
    steps: [
      "BLE GATT service design & pairing",
      "Wi-Fi provisioning & cloud connectivity (MQTT/HTTP)",
      "LoRaWAN / NB-IoT device integration",
      "Mesh networking (Thread / Zigbee / BLE Mesh)",
    ],
    deliverables: ["Protocol Stack Integration", "BLE Profile Spec", "Cloud Connector Module", "Interoperability Test Report"],
  },
  {
    id: "mobile-companion",
    title: "Companion App Development",
    tagline: "iOS & Android apps for your device",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "from-pink-500 to-rose-600",
    steps: [
      "BLE / Wi-Fi device pairing & onboarding",
      "Real-time data visualization & dashboards",
      "Device configuration & firmware OTA from app",
      "Health / fitness data sync (Apple Health, Google Fit)",
    ],
    deliverables: ["iOS & Android App", "BLE SDK / Library", "App Store Submission Package", "User Guide"],
  },
  {
    id: "cloud-backend",
    title: "Cloud & Data Platform",
    tagline: "Device-to-cloud data pipeline",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    color: "from-indigo-500 to-blue-600",
    steps: [
      "IoT hub setup (AWS IoT Core / Azure IoT Hub)",
      "Time-series ingestion & storage (InfluxDB / TimescaleDB)",
      "Analytics dashboard & alerting engine",
      "AI/ML pipeline for predictive insights",
    ],
    deliverables: ["Cloud Infrastructure (IaC)", "Data Pipeline", "Analytics Dashboard", "API Documentation"],
  },
  {
    id: "certification",
    title: "Certification & Compliance",
    tagline: "FCC, CE, medical, and safety approvals",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-600",
    steps: [
      "Pre-compliance testing (EMC, RF, safety)",
      "Test lab coordination (FCC, CE, IC, MIC)",
      "Medical device classification (FDA 510(k), IEC 60601)",
      "Documentation package & submission support",
    ],
    deliverables: ["Test Reports (EMC/RF/Safety)", "Certification Marks (FCC/CE/UL)", "Technical File / 510(k)", "Declaration of Conformity"],
  },
  {
    id: "manufacturing",
    title: "Manufacturing & DFM Support",
    tagline: "Prototype to mass production",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "from-gray-500 to-slate-600",
    steps: [
      "DFM / DFA review with CM (contract manufacturer)",
      "SMT line setup, stencil & reflow profile",
      "Functional test jig design & ATE programming",
      "Production pilot run → mass production ramp",
    ],
    deliverables: ["Production BOM & AVL", "Test Jig & ATE Scripts", "Quality Control Plan", "Production Line Qualification Report"],
  },
];

export default function WearableEmbedded() {
  const [tab, setTab] = useState<"wearable" | "embedded" | "services">("wearable");
  const [activeWearable, setActiveWearable] = useState(0);
  const [activeEmbedded, setActiveEmbedded] = useState(0);
  const [activeService, setActiveService] = useState<number | null>(null);

  const toggleService = useCallback((idx: number) => {
    setActiveService((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section id="wearable-embedded" className="py-24 bg-primary relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Hardware & Firmware Engineering
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Wearable & <span className="text-accent">Embedded Systems</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            From concept to certified product — we design, develop, and deploy wearable devices
            and embedded systems across medical, industrial, consumer, and IoT domains.
          </p>
        </motion.div>

        {/* Main tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/5 rounded-2xl p-1.5 gap-1 border border-white/10">
            {[
              { key: "wearable" as const, label: "Wearable Platforms", count: wearables.length },
              { key: "embedded" as const, label: "Embedded Platforms", count: embedded.length },
              { key: "services" as const, label: "Engineering Services", count: services.length },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  tab === t.key
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {t.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/20" : "bg-white/10"
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB: Wearable Platforms ─── */}
        {tab === "wearable" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              {/* Sidebar */}
              <div className="space-y-2">
                {wearables.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => setActiveWearable(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      i === activeWearable
                        ? `bg-white/[0.08] border border-accent/30 shadow-lg shadow-accent/10`
                        : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${w.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {w.icon}
                    </div>
                    <span className={`text-sm font-semibold ${i === activeWearable ? "text-white" : "text-white/60"}`}>
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={wearables[activeWearable].id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                >
                  {(() => {
                    const w = wearables[activeWearable];
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center text-white shadow-lg`}>
                            {w.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{w.name}</h3>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                          {[
                            { label: "Platforms & OS", items: w.platforms, accent: "text-blue-400" },
                            { label: "Sensors & Inputs", items: w.sensors, accent: "text-emerald-400" },
                            { label: "Connectivity", items: w.protocols, accent: "text-cyan-400" },
                            { label: "Use Cases", items: w.useCases, accent: "text-amber-400" },
                          ].map((section) => (
                            <div key={section.label}>
                              <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${section.accent}`}>
                                {section.label}
                              </h4>
                              <ul className="space-y-1.5">
                                {section.items.map((item, j) => (
                                  <li key={j} className="flex items-start gap-2">
                                    <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                    <span className="text-[11px] text-white/55">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ─── TAB: Embedded Platforms ─── */}
        {tab === "embedded" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              {/* Sidebar */}
              <div className="space-y-2">
                {embedded.map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => setActiveEmbedded(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      i === activeEmbedded
                        ? `bg-white/[0.08] border border-accent/30 shadow-lg shadow-accent/10`
                        : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${e.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {e.icon}
                    </div>
                    <span className={`text-sm font-semibold ${i === activeEmbedded ? "text-white" : "text-white/60"}`}>
                      {e.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={embedded[activeEmbedded].id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                >
                  {(() => {
                    const e = embedded[activeEmbedded];
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${e.color} flex items-center justify-center text-white shadow-lg`}>
                            {e.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{e.name}</h3>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {/* Families */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-blue-400">
                              Chip Families
                            </h4>
                            <ul className="space-y-1.5">
                              {e.families.map((f, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span className="text-[11px] text-white/55">{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* RTOS / OS */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-emerald-400">
                              RTOS / OS
                            </h4>
                            <ul className="space-y-1.5">
                              {e.rtos.map((r, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span className="text-[11px] text-white/55">{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Use Cases */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-amber-400">
                              Use Cases
                            </h4>
                            <ul className="space-y-1.5">
                              {e.useCases.map((u, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span className="text-[11px] text-white/55">{u}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ─── TAB: Services ─── */}
        {tab === "services" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {services.map((svc, i) => (
                <motion.button
                  key={svc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  onClick={() => toggleService(i)}
                  className={`group rounded-xl border p-4 text-left transition-all ${
                    activeService === i
                      ? "bg-white/[0.08] border-accent/40 shadow-lg shadow-accent/10"
                      : "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                    {svc.icon}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-0.5">{svc.title}</h4>
                  <p className="text-[10px] text-white/40">{svc.tagline}</p>
                </motion.button>
              ))}
            </div>

            {/* Expanded service detail */}
            <AnimatePresence>
              {activeService !== null && (
                <motion.div
                  key={services[activeService].id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-accent/30 bg-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${services[activeService].color} flex items-center justify-center text-white`}>
                        {services[activeService].icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{services[activeService].title}</h4>
                        <p className="text-xs text-white/40">{services[activeService].tagline}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Process */}
                      <div>
                        <h5 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-4">Process</h5>
                        <div className="space-y-3">
                          {services[activeService].steps.map((step, j) => (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.08, duration: 0.2 }}
                              className="flex gap-3"
                            >
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${services[activeService].color} text-white text-[10px] font-bold flex items-center justify-center`}>
                                  {j + 1}
                                </div>
                                {j < services[activeService].steps.length - 1 && (
                                  <div className="w-px flex-1 bg-white/10 mt-1" />
                                )}
                              </div>
                              <p className="text-sm text-white/60 pb-3">{step}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <h5 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-4">Deliverables</h5>
                        <div className="space-y-2">
                          {services[activeService].deliverables.map((d, j) => (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: j * 0.06, duration: 0.2 }}
                              className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3"
                            >
                              <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-white/70">{d}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { value: "5", label: "Wearable Categories" },
            { value: "5", label: "Embedded Platforms" },
            { value: "8", label: "Engineering Services" },
            { value: "32", label: "Deliverables" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center hover:bg-white/[0.08] transition-colors"
            >
              <p className="text-xl font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
