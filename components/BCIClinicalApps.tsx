"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   DATA — 6 Neurological Conditions with BCI Clinical Applications
   ═══════════════════════════════════════════════════════════════════════ */

interface PipelineStep {
  title: string;
  detail: string;
}

interface TreatmentStage {
  title: string;
  description: string;
  duration: string;
}

interface Reference {
  title: string;
  authors: string;
  journal: string;
  year: number;
  finding: string;
}

interface Disease {
  id: string;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  accentText: string;
  bgAccent: string;
  borderAccent: string;
  orbColor: string;
  overview: string;
  neuralBiomarkers: string[];
  waveform: { frequency: number; amplitude: number; label: string; description: string };
  assessmentPipeline: PipelineStep[];
  treatmentFlow: TreatmentStage[];
  technologies: {
    modalities: string[];
    hardware: string[];
    signalFeatures: string[];
    software: string[];
  };
  references: Reference[];
}

const diseases: Disease[] = [
  {
    id: "asd",
    name: "Autism Spectrum Disorder",
    shortName: "ASD",
    color: "from-blue-500 to-indigo-600",
    gradient: "linear-gradient(135deg, #3b82f6, #4f46e5)",
    accentText: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/30",
    orbColor: "bg-blue-500/8",
    overview:
      "ASD is a neurodevelopmental condition characterized by differences in social communication, repetitive behaviors, and sensory processing. EEG-based BCI research has identified distinct neural signatures including altered gamma-band coherence, atypical mu rhythm suppression during social observation, and reduced P300 amplitudes during social attention tasks. These biomarkers enable objective assessment and targeted neurofeedback interventions.",
    neuralBiomarkers: [
      "Reduced mu rhythm suppression (mirror neuron system dysfunction)",
      "Altered gamma-band (30-80 Hz) coherence in frontal-posterior networks",
      "Atypical alpha asymmetry during social processing",
      "Reduced P300 amplitude in social oddball paradigms",
      "Elevated theta/beta ratio (attention regulation deficit)",
      "Decreased inter-hemispheric coherence in temporal regions",
    ],
    waveform: { frequency: 3, amplitude: 35, label: "Elevated Theta / Reduced Mu", description: "Characteristic high-theta, low-mu pattern seen in ASD during social tasks" },
    assessmentPipeline: [
      { title: "High-density EEG Acquisition", detail: "64-128 channel recording during resting state, social video observation, and joint attention tasks. Simultaneous eye-tracking for gaze correlation. Electrode placement verified via 3D digitization." },
      { title: "Social Biomarker Extraction", detail: "Mu rhythm (8-13 Hz) suppression index over C3/C4 during action observation. Gamma coherence (30-80 Hz) between frontal (F3/F4) and temporal (T7/T8) regions. P300 latency and amplitude in social oddball paradigms." },
      { title: "Multi-feature Classification", detail: "Support Vector Machine (SVM) and Random Forest classifiers trained on combined spectral, connectivity, and ERP features. Cross-validated with leave-one-subject-out protocol. AUC typically 0.78-0.85 for ASD vs neurotypical." },
      { title: "Clinical Severity Mapping", detail: "Correlation of EEG biomarker profiles with ADOS-2 severity scores, Social Responsiveness Scale (SRS-2), and Vineland Adaptive Behavior Scales. Generation of individualized neural profile report." },
      { title: "Neurofeedback Protocol Design", detail: "Personalized protocol targeting weakest biomarker domains: mu enhancement for mirror neuron training, gamma coherence upregulation for connectivity, or theta/beta ratio normalization for attention." },
    ],
    treatmentFlow: [
      { title: "Patient Intake & Screening", description: "Comprehensive developmental history, ADOS-2 administration, sensory profile assessment, and informed consent. Screening for comorbid ADHD, anxiety, and epilepsy.", duration: "Week 1" },
      { title: "Baseline EEG Recording", description: "Three separate recording sessions: eyes-open resting state, social video paradigm (face processing, joint attention), and cognitive task battery. Minimum 20 minutes artifact-free data per condition.", duration: "Week 2" },
      { title: "Individualized Protocol Design", description: "Analysis of baseline data to identify primary deficits. Protocol selection: mu-rhythm enhancement (social), SMR training (sensorimotor), or theta/beta ratio training (attention). Reward paradigm customized to patient interests.", duration: "Week 3" },
      { title: "Neurofeedback Therapy Sessions", description: "30-40 sessions over 10-14 weeks, 2-3x per week. Each session: 25 minutes of active neurofeedback with visual/auditory reward feedback. Gamified interface adapted to developmental level. Parent present for younger children.", duration: "Weeks 4-17" },
      { title: "Progress Monitoring", description: "Weekly EEG biomarker tracking: mu suppression index, gamma coherence, theta/beta ratio. Behavioral measures every 4 weeks: SRS-2, ABC (Aberrant Behavior Checklist). Protocol adjustment based on learning curves.", duration: "Ongoing" },
      { title: "Outcome Evaluation", description: "Post-treatment full EEG reassessment and ADOS-2. 3-month and 6-month follow-up recordings. Quantification of biomarker changes, behavioral improvements, and durability of gains.", duration: "Week 18+" },
    ],
    technologies: {
      modalities: ["EEG (64-128 ch)", "fNIRS (prefrontal)", "Eye-tracking", "fMRI (baseline)"],
      hardware: ["Brain Products actiCHamp Plus", "g.tec g.Nautilus", "Tobii Pro Spectrum", "NIRx NIRSport2"],
      signalFeatures: ["Mu suppression index", "Gamma coherence (30-80 Hz)", "Theta/Beta ratio", "P300 amplitude", "Alpha asymmetry", "Phase-locking value"],
      software: ["MNE-Python", "EEGLAB/ERPLAB", "OpenViBE", "BCI2000", "NeurOptimal"],
    },
    references: [
      { title: "Mu rhythm suppression and autism: a meta-analysis", authors: "Fox NA, Bakermans-Kranenburg MJ, Yoo KH, et al.", journal: "Clinical Neurophysiology", year: 2016, finding: "Confirmed reduced mu suppression during action observation in ASD with moderate effect size (d=0.54), supporting mirror neuron theory." },
      { title: "EEG neurofeedback for autism spectrum disorder: a systematic review", authors: "Holtmann M, Steiner S, Hohmann S, et al.", journal: "Research in Autism Spectrum Disorders", year: 2011, finding: "Neurofeedback targeting theta/beta ratio showed improvements in attention, social behavior, and executive function in 70% of ASD participants." },
      { title: "Gamma-band abnormalities in autism", authors: "Rojas DC, Wilson LB.", journal: "Biomarkers in Medicine", year: 2014, finding: "Identified reduced evoked gamma power and altered gamma phase coherence as candidate biomarkers for ASD diagnosis." },
    ],
  },
  {
    id: "parkinsons",
    name: "Parkinson's Disease",
    shortName: "Parkinson's",
    color: "from-emerald-500 to-teal-600",
    gradient: "linear-gradient(135deg, #10b981, #0d9488)",
    accentText: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/30",
    orbColor: "bg-emerald-500/8",
    overview:
      "Parkinson's Disease is a progressive neurodegenerative disorder caused by dopaminergic neuron loss in the substantia nigra. BCI applications focus on deep brain stimulation (DBS) optimization, real-time tremor detection and suppression, motor symptom monitoring via EEG/EMG, and adaptive closed-loop neuromodulation. Beta-band oscillations (13-30 Hz) in the subthalamic nucleus serve as key biomarkers for motor state.",
    neuralBiomarkers: [
      "Excessive beta oscillations (13-30 Hz) in subthalamic nucleus (STN)",
      "Reduced movement-related cortical potentials (MRCP)",
      "4-6 Hz tremor-correlated oscillations in motor cortex",
      "Impaired beta desynchronization during movement initiation",
      "Abnormal cortico-basal ganglia-thalamocortical loop activity",
      "Altered high-gamma (60-90 Hz) during voluntary movement",
    ],
    waveform: { frequency: 5, amplitude: 45, label: "Pathological Beta Burst", description: "Exaggerated beta (13-30 Hz) oscillations characteristic of PD motor state" },
    assessmentPipeline: [
      { title: "Multi-modal Signal Acquisition", detail: "Simultaneous scalp EEG (C3/Cz/C4 focus), surface EMG from tremor-affected limbs, and accelerometry. For DBS patients: local field potentials (LFP) from implanted leads. Recordings during rest, postural hold, and voluntary movement tasks." },
      { title: "Motor Biomarker Extraction", detail: "Beta power spectral density (13-30 Hz) from STN-LFP or sensorimotor cortex EEG. Tremor frequency detection (4-6 Hz) via EMG envelope and accelerometry. Movement-related cortical potential (MRCP) morphology. Beta burst duration and rate analysis." },
      { title: "Motor State Classification", detail: "Hidden Markov Model (HMM) and deep learning (CNN-LSTM) classifiers for ON/OFF medication states. Real-time tremor vs. voluntary movement discrimination. Dyskinesia detection via high-frequency oscillations. Accuracy typically 85-92% for motor state." },
      { title: "DBS Parameter Optimization", detail: "Mapping beta suppression to stimulation amplitude, frequency, and contact configuration. Identification of therapeutic window between tremor suppression and side effects. Patient-specific impedance and volume of tissue activated modeling." },
      { title: "Adaptive Stimulation Protocol", detail: "Closed-loop DBS programming: beta power threshold triggers stimulation increase, normalized beta triggers reduction. Proportional control algorithms for smooth transitions. Energy savings of 30-50% compared to continuous stimulation." },
    ],
    treatmentFlow: [
      { title: "Neurological Evaluation", description: "UPDRS-III motor assessment in ON and OFF medication states. DBS candidacy evaluation (Hoehn & Yahr staging, cognitive screening, MRI). Levodopa challenge test quantification.", duration: "Week 1-2" },
      { title: "Baseline Neural Recording", description: "Intraoperative microelectrode recording during DBS implantation. Post-operative LFP recording from externalized leads over 3-5 days. Simultaneous scalp EEG, EMG, and motion capture.", duration: "Week 3-4" },
      { title: "Closed-loop System Design", description: "Selection of biomarker (beta power, beta burst rate, or combined). Algorithm training on patient-specific data. Stimulation parameter space exploration. Safety threshold programming.", duration: "Week 5-6" },
      { title: "Adaptive DBS Therapy", description: "Transition from open-loop to closed-loop stimulation. Daily motor diary combined with continuous LFP telemetry. Progressive refinement of control algorithm parameters over 8-12 weeks.", duration: "Weeks 7-18" },
      { title: "Remote Monitoring", description: "Wireless telemetry from implanted pulse generator (Medtronic Percept, Abbott Infinity). Cloud-based beta power trending and stimulation log analysis. Clinician alerts for parameter drift.", duration: "Ongoing" },
      { title: "Long-term Outcome Assessment", description: "UPDRS-III reassessment at 3, 6, and 12 months. Quality of life measures (PDQ-39). Stimulation energy consumption analysis. Battery life projection and replacement planning.", duration: "3-12 months" },
    ],
    technologies: {
      modalities: ["STN-LFP (implanted)", "EEG (sensorimotor)", "EMG (limb tremor)", "Accelerometry", "fMRI (pre-surgical)"],
      hardware: ["Medtronic Percept PC", "Abbott Infinity DBS", "Boston Scientific Vercise", "g.tec g.USBamp", "Delsys Trigno (EMG)"],
      signalFeatures: ["Beta power (13-30 Hz)", "Beta burst duration/rate", "Tremor frequency (4-6 Hz)", "MRCP amplitude", "Coherence (cortical-STN)", "High-gamma (60-90 Hz)"],
      software: ["MATLAB FieldTrip", "MNE-Python", "Lead-DBS (electrode localization)", "Custom closed-loop firmware", "Patient programmer app"],
    },
    references: [
      { title: "Adaptive deep brain stimulation in Parkinson's disease", authors: "Little S, Pogosyan A, Neal S, et al.", journal: "Annals of Neurology", year: 2013, finding: "First demonstration of adaptive DBS using beta oscillatory biomarker, achieving 50% energy reduction with equivalent or superior motor outcomes." },
      { title: "Beta oscillations in the subthalamic nucleus", authors: "Brown P.", journal: "Experimental Neurology", year: 2003, finding: "Established excessive beta synchrony in STN as a hallmark of Parkinson's akinesia-rigidity, forming the basis for biomarker-driven DBS." },
      { title: "Chronic embedded sensing and stimulation in Parkinson's disease", authors: "Gilron R, Little S, Perrone R, et al.", journal: "Nature Biotechnology", year: 2021, finding: "Demonstrated long-term (months) home-based adaptive DBS with Percept PC, showing feasibility of chronic closed-loop neuromodulation." },
    ],
  },
  {
    id: "schizophrenia",
    name: "Schizophrenia",
    shortName: "Schizophrenia",
    color: "from-violet-500 to-purple-600",
    gradient: "linear-gradient(135deg, #8b5cf6, #9333ea)",
    accentText: "text-violet-400",
    bgAccent: "bg-violet-500/10",
    borderAccent: "border-violet-500/30",
    orbColor: "bg-violet-500/8",
    overview:
      "Schizophrenia is a severe psychiatric disorder involving disruptions in thought, perception, and cognition. EEG research reveals robust biomarkers including reduced P300 amplitude (indexing attention allocation deficits), impaired mismatch negativity (MMN) reflecting auditory prediction errors, and gamma-band (40 Hz) oscillation abnormalities linked to binding and cognitive control deficits. BCI-based cognitive remediation offers a novel therapeutic approach targeting these specific neural deficits.",
    neuralBiomarkers: [
      "Reduced auditory P300 amplitude (Pz electrode, ~50% reduction)",
      "Impaired mismatch negativity (MMN) — auditory deviance detection deficit",
      "Reduced 40 Hz auditory steady-state response (ASSR)",
      "Gamma-band (30-80 Hz) power and phase-locking deficits",
      "Increased resting-state delta and theta power (frontal)",
      "Reduced N1 amplitude in auditory ERPs",
    ],
    waveform: { frequency: 7, amplitude: 20, label: "Reduced Gamma / Elevated Theta", description: "Diminished 40 Hz gamma with excess frontal theta in schizophrenia" },
    assessmentPipeline: [
      { title: "Clinical EEG Protocol", detail: "32-64 channel EEG during auditory oddball (P300), duration-deviant MMN paradigm, 40 Hz click-train ASSR, and eyes-open resting state. Minimum 200 artifact-free trials per ERP condition. Concurrent clinical assessment (PANSS, BACS)." },
      { title: "ERP & Spectral Biomarker Extraction", detail: "P300 amplitude and latency at Pz/Cz. MMN difference waveform at Fz/FCz. 40 Hz ASSR inter-trial coherence (ITC) and evoked power. Resting-state theta (4-8 Hz) and gamma (30-80 Hz) power topography. Source localization using eLORETA." },
      { title: "Deficit Profile Classification", detail: "K-means clustering on multivariate biomarker space to identify patient subgroups: predominantly P300-deficit (attention), MMN-deficit (prediction), or gamma-deficit (binding). Machine learning classification (SVM, gradient boosting) with 75-82% accuracy for schizophrenia vs. controls." },
      { title: "Cognitive Domain Mapping", detail: "Correlation of EEG biomarkers with MATRICS Consensus Cognitive Battery (MCCB) domains: processing speed, attention/vigilance, working memory, verbal learning, reasoning. Identification of primary cognitive target for remediation." },
      { title: "BCI Remediation Protocol Selection", detail: "Gamma entrainment training for binding deficits, P300-based attention training using BCI speller paradigm, or auditory discrimination training targeting MMN generators. Session frequency, difficulty progression, and reward schedules calibrated to individual learning rate." },
    ],
    treatmentFlow: [
      { title: "Psychiatric Evaluation", description: "PANSS symptom assessment, medication review (antipsychotic type and dose), MCCB cognitive battery, functional capacity assessment (UCSD Performance-Based Skills Assessment). Confirmation of clinical stability for 4+ weeks.", duration: "Week 1" },
      { title: "Baseline Neurophysiology", description: "Full ERP battery (P300, MMN, ASSR, N1) and resting-state EEG. Two sessions on separate days for test-retest reliability. Concurrent clinical ratings and self-report measures.", duration: "Week 2-3" },
      { title: "Cognitive BCI Protocol Design", description: "Based on biomarker profile: if P300 < 5 uV, prioritize attention training. If ASSR ITC < 0.3, prioritize gamma entrainment. If MMN < 2 uV, prioritize auditory discrimination. Combined protocols for multi-deficit profiles.", duration: "Week 4" },
      { title: "BCI Cognitive Remediation Sessions", description: "36-40 sessions over 12-14 weeks, 3x per week. Each session: 45 minutes of BCI-guided cognitive exercises with real-time neural feedback. Adaptive difficulty based on EEG performance metrics. Bridging exercises for real-world transfer.", duration: "Weeks 5-18" },
      { title: "Mid-treatment Assessment", description: "Abbreviated ERP battery at session 18-20. PANSS reassessment. Cognitive testing on trained and untrained tasks (near and far transfer). Protocol modification if biomarker trajectory is flat.", duration: "Week 11-12" },
      { title: "Post-treatment Outcomes", description: "Full ERP reassessment, MCCB repeat, PANSS, functional capacity evaluation. Effect size calculation for each biomarker and cognitive domain. 3-month and 6-month follow-up to assess durability.", duration: "Week 19+" },
    ],
    technologies: {
      modalities: ["EEG (32-64 ch)", "ERP paradigms (oddball, MMN)", "Auditory stimulation (40 Hz)", "fMRI (research)"],
      hardware: ["BioSemi ActiveTwo", "Brain Products actiCHamp", "g.tec g.USBamp", "ER-1 insert earphones (Etymotic)"],
      signalFeatures: ["P300 amplitude/latency", "MMN peak amplitude", "40 Hz ASSR ITC", "Gamma power (30-80 Hz)", "Theta power (frontal)", "Phase-amplitude coupling"],
      software: ["EEGLAB + ERPLAB", "MNE-Python", "BCI2000", "Presentation (NBS)", "LORETA/eLORETA"],
    },
    references: [
      { title: "P300 amplitude as a biomarker in schizophrenia", authors: "Jeon YW, Polich J.", journal: "Clinical Neurophysiology", year: 2003, finding: "Meta-analysis confirming P300 amplitude reduction (Cohen's d = 0.85) at Pz as one of the most robust electrophysiological findings in schizophrenia." },
      { title: "Gamma oscillation deficits and the onset of schizophrenia", authors: "Uhlhaas PJ, Singer W.", journal: "Schizophrenia Bulletin", year: 2010, finding: "Demonstrated that impaired gamma-band synchronization reflects disrupted neural coordination and serves as a biomarker for cognitive deficits." },
      { title: "EEG-based cognitive remediation in schizophrenia", authors: "Subramaniam K, Luks TL, Fisher M, et al.", journal: "American Journal of Psychiatry", year: 2012, finding: "BCI-augmented cognitive training improved auditory and prefrontal neural activity alongside working memory gains in schizophrenia patients." },
    ],
  },
  {
    id: "epilepsy",
    name: "Epilepsy",
    shortName: "Epilepsy",
    color: "from-red-500 to-orange-600",
    gradient: "linear-gradient(135deg, #ef4444, #ea580c)",
    accentText: "text-red-400",
    bgAccent: "bg-red-500/10",
    borderAccent: "border-red-500/30",
    orbColor: "bg-red-500/8",
    overview:
      "Epilepsy affects over 50 million people worldwide with recurrent unprovoked seizures. BCI technology has transformed epilepsy care through closed-loop responsive neurostimulation (RNS), real-time seizure detection algorithms, and predictive models that can forecast seizures minutes to hours in advance. Intracranial EEG (ECoG) and scalp EEG analysis reveals high-frequency oscillations (HFOs), interictal epileptiform discharges (IEDs), and pre-ictal state changes as actionable biomarkers.",
    neuralBiomarkers: [
      "Interictal epileptiform discharges (IEDs) — spikes, sharp waves",
      "High-frequency oscillations (HFOs): ripples (80-250 Hz), fast ripples (250-500 Hz)",
      "Pre-ictal spectral power shifts (increased theta/delta, decreased alpha)",
      "Ictal rhythmic activity (onset patterns: low-voltage fast, rhythmic spikes)",
      "Phase-amplitude coupling changes before seizure onset",
      "Long-range desynchronization in interictal period",
    ],
    waveform: { frequency: 12, amplitude: 50, label: "Epileptiform Spike-Wave", description: "Characteristic 3 Hz spike-and-wave complex seen in generalized epilepsy" },
    assessmentPipeline: [
      { title: "Continuous EEG Monitoring", detail: "Long-term video-EEG monitoring (LTM) over 3-7 days using 32-64 channel scalp EEG or intracranial electrode grids/strips (ECoG). Simultaneous video for seizure semiology correlation. Reduction of antiepileptic medications to capture events." },
      { title: "Seizure & Interictal Pattern Detection", detail: "Automated IED detection using template matching and deep learning (CNN on time-frequency images). HFO detection in intracranial recordings (80-500 Hz bandpass, amplitude threshold). Seizure onset zone localization via earliest ictal pattern propagation." },
      { title: "Seizure Prediction Modeling", detail: "Feature extraction: spectral power across bands, line length, Lyapunov exponents, phase-amplitude coupling. Pre-ictal state classification using LSTM networks, achieving 80-90% sensitivity with 15-60 minute prediction horizons in patient-specific models." },
      { title: "Surgical/Stimulation Planning", detail: "Integration of EEG source localization with structural MRI, PET, and SPECT for epileptogenic zone definition. Stimulation target selection: anterior nucleus of thalamus (ANT) for generalized, seizure onset zone for focal. RNS lead placement planning." },
      { title: "Responsive Stimulation Calibration", detail: "RNS System (NeuroPace) programming: detection algorithm tuning using half-wave, line-length, and area features on ECoG. Stimulation parameters: biphasic pulses, 1-12 mA, 100-333 Hz. Continuous cloud-based data review and algorithm refinement." },
    ],
    treatmentFlow: [
      { title: "Epilepsy Workup", description: "Comprehensive seizure history, AED trial documentation, routine EEG, 3T MRI with epilepsy protocol (FLAIR, 3D T1, thin coronal cuts), neuropsychological testing. Determination of drug-resistant status (failure of 2+ appropriate AEDs).", duration: "Weeks 1-4" },
      { title: "Invasive Monitoring", description: "Phase II intracranial EEG with subdural grids, strips, or SEEG depth electrodes. 5-14 days of continuous recording to capture habitual seizures. Cortical stimulation mapping for eloquent cortex identification.", duration: "Weeks 5-7" },
      { title: "RNS/DBS System Implantation", description: "NeuroPace RNS System implantation with leads targeting seizure onset zone, or Medtronic DBS targeting anterior nucleus of thalamus. Intraoperative testing of sensing and stimulation. Post-operative CT for lead verification.", duration: "Week 8-9" },
      { title: "Detection Algorithm Training", description: "Initial 1-3 months of sensing-only mode to collect baseline data and train detection algorithms. Progressive activation of responsive stimulation. Pattern library refinement based on captured electrographic seizures.", duration: "Weeks 10-22" },
      { title: "Chronic Responsive Therapy", description: "Ongoing closed-loop stimulation with periodic remote data uploads. Quarterly in-person programming visits. AED optimization alongside neurostimulation. Typical 50-70% seizure frequency reduction over first 2 years.", duration: "Ongoing" },
      { title: "Long-term Efficacy Assessment", description: "Annual comprehensive evaluation: seizure diary analysis, ECoG data review, quality of life (QOLIE-89), neuropsychological testing. RNS shows progressive improvement over years with continued algorithm optimization.", duration: "Annual" },
    ],
    technologies: {
      modalities: ["Scalp EEG (32-64 ch)", "ECoG (subdural grids/strips)", "SEEG (depth electrodes)", "Foramen ovale electrodes"],
      hardware: ["NeuroPace RNS System", "Medtronic SANTE DBS", "Natus Xltek LTM", "Nihon Kohden EEG-1200", "Micromed Brain Quick"],
      signalFeatures: ["IED rate (spikes/min)", "HFOs (ripples, fast ripples)", "Line length", "Spectral power ratio", "Phase-amplitude coupling", "Seizure onset pattern"],
      software: ["Persyst Seizure Detection", "ENCEVIS (AIT)", "BESA", "Brainstorm", "iEEG.org (open data)"],
    },
    references: [
      { title: "NeuroPace RNS System long-term treatment results", authors: "Nair DR, Laxer KD, Weber PB, et al.", journal: "Epilepsia", year: 2020, finding: "9-year follow-up of RNS System showing progressive improvement with median 75% seizure reduction and 35% of patients achieving 90%+ reduction." },
      { title: "Seizure prediction: ready for a new era", authors: "Kuhlmann L, Lehnertz K, Richardson MP, et al.", journal: "Nature Reviews Neurology", year: 2018, finding: "Comprehensive review establishing that seizure prediction is possible with patient-specific algorithms, with sensitivity above 80% and clinically useful prediction horizons." },
      { title: "High-frequency oscillations as biomarkers of epileptogenic brain", authors: "Jacobs J, Staba R, Asano E, et al.", journal: "Neurology", year: 2012, finding: "Demonstrated that HFOs (particularly fast ripples > 250 Hz) have higher specificity than IEDs for delineating the epileptogenic zone." },
    ],
  },
  {
    id: "drowsiness",
    name: "Drowsiness Detection",
    shortName: "Drowsiness",
    color: "from-amber-500 to-yellow-600",
    gradient: "linear-gradient(135deg, #f59e0b, #ca8a04)",
    accentText: "text-amber-400",
    bgAccent: "bg-amber-500/10",
    borderAccent: "border-amber-500/30",
    orbColor: "bg-amber-500/8",
    overview:
      "Drowsiness detection via BCI is a critical safety application, particularly for drivers, pilots, and shift workers. As alertness decreases, EEG shows characteristic shifts: increased theta (4-8 Hz) and alpha (8-13 Hz) power with decreased beta activity. The alpha/theta ratio serves as the primary drowsiness biomarker. Modern systems combine EEG with EOG (eye blinks, slow eye movements) and behavioral metrics for robust real-time alertness monitoring and intervention.",
    neuralBiomarkers: [
      "Increased theta power (4-8 Hz) — frontal and central regions",
      "Alpha power increase then dropout (8-13 Hz) — occipital progression",
      "Decreased beta power (13-30 Hz) — reduced cortical arousal",
      "Theta/Alpha ratio increase (drowsiness index)",
      "Increased eye blink frequency and duration (EOG)",
      "Slow rolling eye movements (SEM) — hallmark of stage N1 sleep onset",
    ],
    waveform: { frequency: 2, amplitude: 40, label: "Alpha-Theta Transition", description: "Progressive alpha slowing into theta dominance during drowsiness onset" },
    assessmentPipeline: [
      { title: "Wearable EEG + EOG Acquisition", detail: "Minimal-channel EEG (Fp1, Fp2, Oz, Pz) with integrated EOG from frontal electrodes. Dry electrode headband or in-ear EEG for practical deployment. Sampling at 256 Hz with wireless Bluetooth streaming. Simultaneous vehicle/equipment telemetry integration." },
      { title: "Vigilance Feature Extraction", detail: "Sliding window (2-5 sec) power spectral density for theta (4-8 Hz), alpha (8-13 Hz), and beta (13-30 Hz). Alpha/theta ratio computation. EOG-derived metrics: blink rate, blink duration (>200ms = microsleep), PERCLOS (percentage eye closure). Reaction time from secondary task." },
      { title: "Drowsiness Level Classification", detail: "5-level alertness scale: Alert, Mild drowsiness, Moderate drowsiness, Severe drowsiness, Microsleep. Multi-class classifiers: CNN on spectrograms, ensemble methods on hand-crafted features. Cross-session accuracy 82-90% with subject-specific calibration." },
      { title: "Real-time Alerting & Intervention", detail: "Sub-second classification with sliding window processing. Multi-modal alert cascade: Level 2 = gentle audio tone, Level 3 = seat vibration + warning display, Level 4 = loud alarm + vehicle speed reduction, Level 5 = emergency stop initiation. False alarm rate < 5% critical for user acceptance." },
      { title: "Adaptive Threshold Learning", detail: "Personalized drowsiness thresholds accounting for individual alpha frequency, circadian phase, and chronic sleep debt. Transfer learning from population model to individual. Continuous model updating from labeled drowsy events." },
    ],
    treatmentFlow: [
      { title: "Use Case Assessment", description: "Identify operational context: commercial trucking, aviation, maritime, shift work, military. Baseline fatigue risk assessment (FAID, FAST). Regulatory requirements review (FMCSA, FAA, IMO).", duration: "Week 1" },
      { title: "Baseline Alertness Profiling", description: "24-hour circadian alertness monitoring. Psychomotor Vigilance Test (PVT) correlation with EEG states. Individual alpha frequency determination. Sleep quality assessment (Pittsburgh Sleep Quality Index).", duration: "Week 2" },
      { title: "System Configuration", description: "Hardware selection (headband, in-ear, or cap based on use case). Alert modality configuration. Integration with vehicle/equipment telematics. Threshold calibration from baseline data.", duration: "Week 3" },
      { title: "Deployment & Calibration", description: "Field deployment with 2-week supervised calibration period. Operator training on device use and alert response protocols. Collection of ground truth drowsiness labels via observer ratings and PVT.", duration: "Weeks 4-5" },
      { title: "Operational Monitoring", description: "Continuous real-time monitoring during operational shifts. Cloud dashboard for fleet/team alertness visualization. Fatigue event logging and trend analysis. Compliance reporting for regulatory requirements.", duration: "Ongoing" },
      { title: "Efficacy & Safety Review", description: "Monthly analysis: drowsiness event rates, intervention effectiveness, false alarm rates. Incident correlation analysis. Operator feedback surveys. Model refinement based on accumulated data.", duration: "Monthly" },
    ],
    technologies: {
      modalities: ["EEG (1-8 ch)", "EOG (blink/saccade)", "Heart rate variability (ECG/PPG)", "Head pose tracking (camera)", "Steering/input behavior"],
      hardware: ["Muse S (headband)", "IDUN Guardian (in-ear)", "SmartCap LifeBand", "Drowsiness Alert (DA) systems", "Fleet camera systems (Seeing Machines)"],
      signalFeatures: ["Alpha/theta ratio", "Theta power (Fz/Cz)", "PERCLOS", "Blink duration", "Heart rate variability", "Reaction time (PVT)"],
      software: ["Custom edge ML (TFLite/ONNX)", "AWS IoT Greengrass", "Fleet management dashboards", "MATLAB Simulink (prototyping)", "OpenBCI GUI"],
    },
    references: [
      { title: "EEG-based drowsiness detection: a comprehensive survey", authors: "Kaida K, Takahashi M, Akerstedt T, et al.", journal: "Accident Analysis & Prevention", year: 2006, finding: "Established theta/alpha power ratio as the most reliable single EEG predictor of subjective sleepiness and performance impairment." },
      { title: "Real-time EEG-based drowsiness detection using deep learning", authors: "Cui J, Lan Z, Sourina O, et al.", journal: "IEEE Transactions on Neural Systems and Rehabilitation Engineering", year: 2022, finding: "Demonstrated CNN-LSTM architecture achieving 91% drowsiness detection accuracy with sub-second latency on wearable EEG, suitable for real-time deployment." },
      { title: "Microsleep episodes and driver fatigue", authors: "Golz M, Sommer D, Mandic D, et al.", journal: "Journal of Sleep Research", year: 2007, finding: "Identified specific EEG signatures (alpha dropout followed by theta burst) preceding microsleep episodes by 5-15 seconds, enabling predictive alerting." },
    ],
  },
  {
    id: "dyslexia",
    name: "Dyslexia",
    shortName: "Dyslexia",
    color: "from-pink-500 to-rose-600",
    gradient: "linear-gradient(135deg, #ec4899, #e11d48)",
    accentText: "text-pink-400",
    bgAccent: "bg-pink-500/10",
    borderAccent: "border-pink-500/30",
    orbColor: "bg-pink-500/8",
    overview:
      "Dyslexia is a specific learning disability affecting reading fluency, decoding, and spelling despite adequate intelligence and instruction. Neurophysiological research reveals altered event-related potentials (ERPs) during phonological and orthographic processing, including reduced mismatch negativity (MMN) to speech sounds, atypical N170 lateralization for print, and impaired P200 during phonological awareness tasks. BCI-based neurofeedback targets these specific neural pathways to complement traditional reading interventions.",
    neuralBiomarkers: [
      "Reduced speech MMN — impaired phonological discrimination",
      "Atypical N170 lateralization (reduced left-hemisphere specialization for print)",
      "Reduced P200 amplitude during phonological tasks",
      "Altered theta-gamma coupling during reading (phonological binding)",
      "Elevated alpha power in left temporal regions (underactivation)",
      "Reduced auditory steady-state response to speech-rate modulations (4 Hz)",
    ],
    waveform: { frequency: 4, amplitude: 30, label: "Altered Theta-Gamma Coupling", description: "Disrupted theta (4-7 Hz) envelope modulation of gamma during reading in dyslexia" },
    assessmentPipeline: [
      { title: "Linguistic ERP Recording", detail: "64-channel EEG during speech MMN paradigm (standard /ba/ vs. deviant /da/), visual word recognition (word vs. pseudoword N170), phonological oddball (rhyming task P200), and rapid auditory processing (tone sequence discrimination). Age-matched norms comparison." },
      { title: "Reading-related Biomarker Extraction", detail: "Speech MMN amplitude at Fz/FCz (deviant-standard difference wave). N170 amplitude and lateralization index at P7/P8 for visual words. P200 amplitude during phonological awareness tasks. Theta (4-7 Hz) and gamma (30-50 Hz) power and phase-amplitude coupling during sentence reading." },
      { title: "Deficit Subtype Classification", detail: "Clustering analysis identifying deficit profiles: phonological deficit (reduced MMN, poor phonological awareness), rapid naming deficit (altered N170 timing, slow processing), or double deficit (both). Machine learning classification with 78-86% accuracy for dyslexia vs. typical readers." },
      { title: "Reading Assessment Correlation", detail: "Mapping ERP biomarkers to standardized reading measures: TOWRE-2 (word/pseudoword reading efficiency), CTOPP-2 (phonological processing), Gray Oral Reading Test (fluency/comprehension). Identification of specific phonological vs. orthographic processing bottlenecks." },
      { title: "Neurofeedback Target Selection", detail: "For phonological deficit: SMR/theta ratio training at temporal sites to enhance auditory processing. For N170 deficit: left occipitotemporal neurofeedback to strengthen visual word form area. For attention comorbidity: theta/beta ratio training at Cz. Combined protocol for complex profiles." },
    ],
    treatmentFlow: [
      { title: "Educational & Clinical Assessment", description: "Standardized reading battery (TOWRE-2, CTOPP-2, Gray Oral), IQ testing (WISC-V), attention screening (Conners), visual processing assessment. Detailed educational and family history. Confirmation of specific learning disability diagnosis.", duration: "Week 1-2" },
      { title: "Baseline Neurophysiology", description: "Full ERP battery during linguistic tasks (speech MMN, N170, P200, reading). Resting-state EEG for theta/beta ratio and alpha asymmetry. Two sessions for reliability. Correlation with behavioral reading measures.", duration: "Week 3-4" },
      { title: "Individualized Intervention Design", description: "Neurofeedback protocol selection based on ERP profile. Integration with evidence-based reading intervention (Orton-Gillingham, Wilson Reading). Session schedule: neurofeedback immediately before reading tutoring for neural priming.", duration: "Week 5" },
      { title: "Neurofeedback + Reading Intervention", description: "30-40 sessions over 10-14 weeks, 3x per week. Each session: 20 min neurofeedback (phonological processing enhancement) followed by 30 min structured reading intervention. Gamified feedback calibrated to child's age and interests.", duration: "Weeks 6-19" },
      { title: "Mid-treatment Progress Check", description: "Abbreviated ERP assessment at session 15-20. Curriculum-based reading measurement (DIBELS, AIMSweb). Neurofeedback learning curve analysis. Protocol adjustment if ERP changes plateau.", duration: "Week 12-13" },
      { title: "Outcome Evaluation & Maintenance", description: "Full ERP reassessment and reading battery. Effect size calculation (reading fluency gains, ERP amplitude changes). Home-based maintenance neurofeedback protocol (2x/week for 3 months). 6-month follow-up assessment.", duration: "Week 20+" },
    ],
    technologies: {
      modalities: ["EEG (64 ch)", "ERP paradigms (linguistic)", "Eye-tracking (reading)", "MEG (research)"],
      hardware: ["BioSemi ActiveTwo", "Brain Products actiCHamp", "EGI HydroCel Geodesic", "Tobii Pro Spectrum (eye-tracking)"],
      signalFeatures: ["Speech MMN amplitude", "N170 lateralization index", "P200 amplitude", "Theta-gamma PAC", "Alpha power (left temporal)", "Auditory P1-N1 complex"],
      software: ["EEGLAB + ERPLAB", "MNE-Python", "E-Prime (paradigm design)", "NeurOptimal", "Brain-Trainer"],
    },
    references: [
      { title: "Atypical brain responses to speech sounds in dyslexia", authors: "Schulte-Korne G, Deimel W, Bartling J, et al.", journal: "NeuroReport", year: 1998, finding: "First demonstration of reduced MMN to speech-sound contrasts in dyslexic children, establishing phonological processing deficit at the neurophysiological level." },
      { title: "Neurofeedback training for reading disability", authors: "Breteler MH, Arns M, Peters S, et al.", journal: "Journal of Neurotherapy", year: 2010, finding: "Controlled study showing neurofeedback targeting theta/beta ratio improved reading fluency by 0.5 grade levels beyond traditional intervention alone." },
      { title: "N170 and reading: a meta-analysis", authors: "Maurer U, Brandeis D, McCandliss BD.", journal: "NeuroImage", year: 2005, finding: "Established that N170 left-lateralization for print develops with reading expertise and is reduced/absent in dyslexia, reflecting impaired visual word form specialization." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Summary statistics
   ═══════════════════════════════════════════════════════════════════════ */
const summaryStats = [
  { value: "6", label: "Neurological Conditions" },
  { value: "36", label: "Neural Biomarkers" },
  { value: "30", label: "Assessment Steps" },
  { value: "36", label: "Treatment Stages" },
  { value: "18", label: "Landmark References" },
  { value: "24+", label: "Hardware Platforms" },
];

/* ═══════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* Animated brain wave SVG unique per disease */
function BrainWaveAnimation({ frequency, amplitude, color }: { frequency: number; amplitude: number; color: string }) {
  const width = 400;
  const height = 80;
  const midY = height / 2;
  const points: string[] = [];

  for (let x = 0; x <= width; x += 2) {
    const y = midY + amplitude * Math.sin((x / width) * frequency * Math.PI * 2) * (0.6 + 0.4 * Math.sin((x / width) * Math.PI));
    points.push(`${x},${y.toFixed(1)}`);
  }
  const pathData = `M${points.join(" L")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 md:h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`wave-grad-${frequency}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Static baseline */}
      <line x1="0" y1={midY} x2={width} y2={midY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* Animated wave */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={`url(#wave-grad-${frequency})`}
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Glow copy */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="4"
        opacity={0.15}
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* Color extractor from gradient class */
function getColorHex(disease: Disease): string {
  const map: Record<string, string> = {
    asd: "#6366f1",
    parkinsons: "#10b981",
    schizophrenia: "#8b5cf6",
    epilepsy: "#ef4444",
    drowsiness: "#f59e0b",
    dyslexia: "#ec4899",
  };
  return map[disease.id] || "#0891b2";
}

/* SVG Processing Pipeline with animated nodes and flowing dots */
function PipelineVisualization({
  steps,
  activeNode,
  onNodeClick,
  color,
  colorHex,
}: {
  steps: { title: string; detail: string }[];
  activeNode: number | null;
  onNodeClick: (i: number) => void;
  color: string;
  colorHex: string;
}) {
  const nodeRadius = 24;
  const horizontalGap = 160;
  const startX = 60;
  const centerY = 55;

  return (
    <>
      {/* Desktop horizontal */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <svg
          viewBox={`0 0 ${startX * 2 + horizontalGap * (steps.length - 1)} 110`}
          className="w-full min-w-[800px] h-28"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Connecting lines with flowing dots */}
          {steps.map((_, i) => {
            if (i === steps.length - 1) return null;
            const x1 = startX + i * horizontalGap + nodeRadius;
            const x2 = startX + (i + 1) * horizontalGap - nodeRadius;
            return (
              <g key={`line-${i}`}>
                <line x1={x1} y1={centerY} x2={x2} y2={centerY} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                {/* Flowing dot */}
                <motion.circle
                  r="3"
                  fill={colorHex}
                  opacity={0.8}
                  initial={{ cx: x1, cy: centerY }}
                  animate={{ cx: [x1, x2], cy: centerY }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
                />
              </g>
            );
          })}
          {/* Nodes */}
          {steps.map((step, i) => {
            const cx = startX + i * horizontalGap;
            const isActive = activeNode === i;
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                style={{ cursor: "pointer" }}
                onClick={() => onNodeClick(i)}
              >
                {/* Pulse ring on active */}
                {isActive && (
                  <motion.circle
                    cx={cx}
                    cy={centerY}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke={colorHex}
                    strokeWidth="2"
                    opacity={0.3}
                    animate={{ r: [nodeRadius + 4, nodeRadius + 12], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={cx}
                  cy={centerY}
                  r={nodeRadius}
                  fill={isActive ? colorHex : "rgba(255,255,255,0.06)"}
                  stroke={isActive ? colorHex : "rgba(255,255,255,0.15)"}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? "url(#glow)" : undefined}
                />
                {/* Step number */}
                <text
                  x={cx}
                  y={centerY + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? "#ffffff" : "rgba(255,255,255,0.5)"}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {i + 1}
                </text>
                {/* Label */}
                <text
                  x={cx}
                  y={centerY + nodeRadius + 16}
                  textAnchor="middle"
                  fill={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
                  fontSize="9"
                  fontWeight="600"
                >
                  {step.title.length > 18 ? step.title.slice(0, 18) + "..." : step.title}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Mobile vertical */}
      <div className="lg:hidden space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Vertical connector */}
            <div className="flex flex-col items-center">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                onClick={() => onNodeClick(i)}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${
                  activeNode === i
                    ? `bg-gradient-to-br ${color} text-white shadow-lg`
                    : "bg-white/[0.06] text-white/50 border border-white/10"
                }`}
              >
                {i + 1}
              </motion.button>
              {i < steps.length - 1 && (
                <div className="w-px h-8 bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="w-full h-2 rounded-full"
                    style={{ backgroundColor: colorHex }}
                    animate={{ y: ["-100%", "400%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => onNodeClick(i)}
              className={`text-left pb-4 pt-2 ${activeNode === i ? "text-white" : "text-white/50"}`}
            >
              <p className="text-xs font-semibold">{step.title}</p>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* Treatment flow timeline */
function TreatmentTimeline({
  stages,
  color,
  colorHex,
}: {
  stages: TreatmentStage[];
  color: string;
  colorHex: string;
}) {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <button
            onClick={() => setExpandedStage(expandedStage === i ? null : i)}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
              expandedStage === i
                ? `bg-white/[0.08] border-white/20`
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  expandedStage === i ? `bg-gradient-to-br ${color} text-white` : "bg-white/[0.08] text-white/50"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${expandedStage === i ? "text-white" : "text-white/70"}`}>
                    {stage.title}
                  </p>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                  >
                    {stage.duration}
                  </span>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${expandedStage === i ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <AnimatePresence>
            {expandedStage === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 ml-11">
                  <p className="text-xs text-white/50 leading-relaxed">{stage.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════ */
export default function BCIClinicalApps() {
  const [activeDisease, setActiveDisease] = useState(0);
  const [activePipelineNode, setActivePipelineNode] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "pipeline" | "treatment" | "tech" | "refs">("overview");

  const disease = diseases[activeDisease];
  const colorHex = getColorHex(disease);

  const handleDiseaseChange = useCallback(
    (idx: number) => {
      setActiveDisease(idx);
      setActivePipelineNode(null);
      setActiveSection("overview");
    },
    []
  );

  const togglePipelineNode = useCallback((idx: number) => {
    setActivePipelineNode((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section id="bci-clinical" className="py-24 bg-primary relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        key={`orb-${disease.id}`}
        className={`absolute top-20 right-0 w-[500px] h-[500px] ${disease.orbColor} rounded-full blur-3xl translate-x-1/3`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        key={`orb2-${disease.id}`}
        className={`absolute bottom-20 left-0 w-[400px] h-[400px] ${disease.orbColor} rounded-full blur-3xl -translate-x-1/3`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Clinical Neurotechnology
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            BCI <span className="text-accent">Clinical Applications</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Comprehensive assessment pipelines, treatment protocols, and technology stacks for
            BCI-driven diagnosis and therapy across six major neurological conditions.
          </p>
        </motion.div>

        {/* ── Disease Pill Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex bg-white/[0.04] rounded-2xl p-1.5 gap-1 flex-wrap justify-center border border-white/[0.08]">
            {diseases.map((d, i) => (
              <button
                key={d.id}
                onClick={() => handleDiseaseChange(i)}
                className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  i === activeDisease
                    ? `bg-gradient-to-r ${d.color} text-white shadow-lg shadow-black/20`
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {d.shortName}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Disease Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={disease.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Disease header card */}
            <div className={`rounded-2xl border ${disease.borderAccent} ${disease.bgAccent} p-6 mb-6`}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{disease.name}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">{disease.overview}</p>
                  {/* Biomarker tags */}
                  <div className="flex flex-wrap gap-2">
                    {disease.neuralBiomarkers.slice(0, 4).map((b, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-white/[0.06] border border-white/10 text-white/60 px-2.5 py-1 rounded-full"
                      >
                        {b.length > 50 ? b.slice(0, 50) + "..." : b}
                      </span>
                    ))}
                    {disease.neuralBiomarkers.length > 4 && (
                      <span className="text-[10px] text-white/30 px-2 py-1">
                        +{disease.neuralBiomarkers.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                {/* Brain wave visualization */}
                <div className="lg:w-80 flex-shrink-0">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">
                    Characteristic EEG Pattern
                  </p>
                  <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3">
                    <BrainWaveAnimation
                      frequency={disease.waveform.frequency}
                      amplitude={disease.waveform.amplitude}
                      color={colorHex}
                    />
                    <p className={`text-[10px] font-semibold mt-1 ${disease.accentText}`}>
                      {disease.waveform.label}
                    </p>
                    <p className="text-[9px] text-white/30">{disease.waveform.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-navigation */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {(
                [
                  { key: "overview", label: "Biomarkers" },
                  { key: "pipeline", label: "Assessment Pipeline" },
                  { key: "treatment", label: "Treatment Flow" },
                  { key: "tech", label: "Technologies" },
                  { key: "refs", label: "Research" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeSection === tab.key
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Biomarkers ── */}
            {activeSection === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                  Neural Biomarkers
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {disease.neuralBiomarkers.map((biomarker, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${disease.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                        >
                          {i + 1}
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">{biomarker}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── TAB: Assessment Pipeline ── */}
            {activeSection === "pipeline" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">
                  Assessment Pipeline — Click a node to expand
                </h4>

                <PipelineVisualization
                  steps={disease.assessmentPipeline}
                  activeNode={activePipelineNode}
                  onNodeClick={togglePipelineNode}
                  color={disease.color}
                  colorHex={colorHex}
                />

                {/* Expanded detail */}
                <AnimatePresence>
                  {activePipelineNode !== null && (
                    <motion.div
                      key={`detail-${activePipelineNode}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div
                        className="rounded-2xl border bg-white/[0.06] p-6"
                        style={{ borderColor: `${colorHex}40` }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${disease.color} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {activePipelineNode + 1}
                          </div>
                          <h5 className="text-base font-bold text-white">
                            {disease.assessmentPipeline[activePipelineNode].title}
                          </h5>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">
                          {disease.assessmentPipeline[activePipelineNode].detail}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── TAB: Treatment Flow ── */}
            {activeSection === "treatment" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">
                  End-to-End BCI Treatment Journey
                </h4>

                {/* SVG treatment flow visualization (desktop) */}
                <div className="hidden lg:block mb-6">
                  <svg
                    viewBox={`0 0 ${80 + 150 * disease.treatmentFlow.length} 60`}
                    className="w-full h-14"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {disease.treatmentFlow.map((stage, i) => {
                      const cx = 50 + i * 150;
                      return (
                        <g key={i}>
                          {i < disease.treatmentFlow.length - 1 && (
                            <>
                              <line
                                x1={cx + 35}
                                y1={25}
                                x2={cx + 115}
                                y2={25}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="2"
                              />
                              <motion.circle
                                r="2.5"
                                fill={colorHex}
                                opacity={0.7}
                                initial={{ cx: cx + 35, cy: 25 }}
                                animate={{ cx: [cx + 35, cx + 115], cy: 25 }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35, ease: "linear" }}
                              />
                            </>
                          )}
                          <motion.g
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 180 }}
                          >
                            <rect
                              x={cx - 30}
                              y={8}
                              width="60"
                              height="34"
                              rx="8"
                              fill="rgba(255,255,255,0.05)"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="1"
                            />
                            <text
                              x={cx}
                              y={22}
                              textAnchor="middle"
                              fill={colorHex}
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {i + 1}
                            </text>
                            <text
                              x={cx}
                              y={36}
                              textAnchor="middle"
                              fill="rgba(255,255,255,0.45)"
                              fontSize="6"
                            >
                              {stage.title.length > 14 ? stage.title.slice(0, 14) + ".." : stage.title}
                            </text>
                          </motion.g>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <TreatmentTimeline
                  stages={disease.treatmentFlow}
                  color={disease.color}
                  colorHex={colorHex}
                />
              </motion.div>
            )}

            {/* ── TAB: Technologies ── */}
            {activeSection === "tech" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Signal Modalities", items: disease.technologies.modalities, icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" },
                    { title: "Hardware Platforms", items: disease.technologies.hardware, icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" },
                    { title: "Signal Features", items: disease.technologies.signalFeatures, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { title: "Software & Tools", items: disease.technologies.software, icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
                  ].map((category, ci) => (
                    <motion.div
                      key={category.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.08 }}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${disease.color} flex items-center justify-center`}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                          </svg>
                        </div>
                        <h5 className="text-sm font-bold text-white">{category.title}</h5>
                      </div>
                      <div className="space-y-2">
                        {category.items.map((item, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorHex }} />
                            <span className="text-xs text-white/55">{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── TAB: References ── */}
            {activeSection === "refs" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                  Key Research References
                </h4>
                <div className="space-y-3">
                  {disease.references.map((ref, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] transition-colors"
                    >
                      <h5 className="text-sm font-bold text-white mb-1">{ref.title}</h5>
                      <p className="text-[11px] text-white/40 mb-2">
                        {ref.authors} — <span className="italic">{ref.journal}</span> ({ref.year})
                      </p>
                      <div className="flex items-start gap-2 bg-white/[0.04] rounded-lg p-3">
                        <svg
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: colorHex }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        <p className="text-xs text-white/50 leading-relaxed">{ref.finding}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Summary Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {summaryStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-dark rounded-xl p-4 text-center hover:bg-white/[0.08] transition-colors"
            >
              <p className="text-2xl font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
