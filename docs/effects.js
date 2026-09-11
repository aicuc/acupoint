import * as T from './three.module.js';
// Target positions represent symptom regions, not organs or causal pathways.
export const associations={
 LI4:{kind:'传统主治关联',source:'https://zh.wikipedia.org/wiki/合谷穴',note:'传统资料涉及头面、口齿与胃肠不适。连线仅将这些描述转换为区域示意，不表示作用机制或疗效保证。',targets:[['头面部',[0,7.46,.5]],['口齿区域',[.12,7.19,.5]],['腹部',[0,5.35,.58]]]},
 PC6:{kind:'症状关联',source:'https://www.mskcc.org/cancer-care/patient-education/acupressure-nausea-and-vomiting',note:'MSK 患者教育介绍内关按压与缓解恶心、呕吐的关系。图中上腹部是症状表达位置，不表示穴位直接作用于胃。',targets:[['上腹部 · 恶心相关',[0,5.7,.57]]]},
 ST36:{kind:'传统主治关联',source:'https://zh.wikipedia.org/wiki/足三里穴',note:'传统资料涉及胃肠不适及下肢症状。连线表示传统描述中的区域关联，并非解剖通路。',targets:[['上腹部',[0,5.65,.55]],['腹部',[0,5.18,.57]],['下肢',[.47,2.4,.48]]]},
 LI20:{kind:'传统主治关联',source:'https://zh.wikipedia.org/wiki/迎香穴',note:'传统资料主要涉及鼻部症状。目标光圈为鼻部区域示意，不表示确切生理作用范围。',targets:[['鼻部',[0,7.34,.53]]]}
};

// Per-point regional summaries of the linked traditional indications (reviewed 2026-09-11).
// These are educational associations, not anatomical pathways or evidence of efficacy.
const regions={
 "head": [
  "头部",
  [
   0,
   7.75,
   0.34
  ]
 ],
 "face": [
  "面部",
  [
   0.16,
   7.32,
   0.43
  ]
 ],
 "eye": [
  "眼周",
  [
   0.17,
   7.49,
   0.38
  ]
 ],
 "nose": [
  "鼻部",
  [
   0,
   7.34,
   0.48
  ]
 ],
 "mouth": [
  "口齿区域",
  [
   0.1,
   7.18,
   0.4
  ]
 ],
 "throat": [
  "咽喉区域",
  [
   0,
   6.9,
   0.3
  ]
 ],
 "neck": [
  "后颈",
  [
   0.12,
   6.95,
   -0.31
  ]
 ],
 "chest": [
  "胸部",
  [
   0,
   6.18,
   0.52
  ]
 ],
 "breast": [
  "胸外侧",
  [
   0.45,
   6.12,
   0.43
  ]
 ],
 "ribs": [
  "胸胁",
  [
   0.58,
   5.91,
   0.29
  ]
 ],
 "stomach": [
  "上腹部",
  [
   0,
   5.65,
   0.47
  ]
 ],
 "abdomen": [
  "腹部",
  [
   0,
   5.25,
   0.45
  ]
 ],
 "pelvis": [
  "下腹及盆腔区域",
  [
   0,
   4.72,
   0.46
  ]
 ],
 "shoulder": [
  "肩部",
  [
   0.8,
   6.4,
   0.27
  ]
 ],
 "arm": [
  "上肢",
  [
   1.21,
   5.69,
   0.24
  ]
 ],
 "wrist": [
  "腕部",
  [
   1.64,
   4.56,
   0.22
  ]
 ],
 "hand": [
  "手部",
  [
   1.75,
   4.26,
   0.21
  ]
 ],
 "back": [
  "背部",
  [
   0.2,
   5.97,
   -0.45
  ]
 ],
 "waist": [
  "腰骶部",
  [
   0.2,
   5.02,
   -0.44
  ]
 ],
 "leg": [
  "下肢",
  [
   0.47,
   2.2,
   0.33
  ]
 ],
 "knee": [
  "膝部",
  [
   0.46,
   3.04,
   0.37
  ]
 ],
 "ankle": [
  "踝足部",
  [
   0.48,
   0.64,
   0.33
  ]
 ],
 "ear": [
  "耳部",
  [
   0.4,
   7.35,
   0.1
  ]
 ]
};
const regionalAssociations={
 "LU1": {
  "source": "https://www.acupuncture.com/education/points/lung/lu1.htm",
  "regions": [
   "chest",
   "shoulder",
   "abdomen"
  ]
 },
 "LU2": {
  "source": "https://www.acupuncture.com/education/points/lung/lu2.htm",
  "regions": [
   "chest",
   "shoulder",
   "back"
  ]
 },
 "LU3": {
  "source": "https://www.acupuncture.com/education/points/lung/lu3.htm",
  "regions": [
   "nose",
   "chest",
   "arm"
  ]
 },
 "LU5": {
  "source": "https://www.acupuncture.com/education/points/lung/lu5.htm",
  "regions": [
   "chest",
   "throat",
   "arm"
  ]
 },
 "LU6": {
  "source": "https://www.acupuncture.com/education/points/lung/lu6.htm",
  "regions": [
   "chest",
   "throat",
   "arm"
  ]
 },
 "LU7": {
  "source": "https://www.acupuncture.com/education/points/lung/lu7.htm",
  "regions": [
   "head",
   "neck",
   "chest"
  ]
 },
 "LU8": {
  "source": "https://www.acupuncture.com/education/points/lung/lu8.htm",
  "regions": [
   "chest",
   "throat",
   "wrist"
  ]
 },
 "LU9": {
  "source": "https://www.acupuncture.com/education/points/lung/lu9.htm",
  "regions": [
   "chest",
   "wrist"
  ]
 },
 "LU10": {
  "source": "https://www.acupuncture.com/education/points/lung/lu10.htm",
  "regions": [
   "chest",
   "throat"
  ]
 },
 "LU11": {
  "source": "https://www.acupuncture.com/education/points/lung/lu11.htm",
  "regions": [
   "throat",
   "nose",
   "hand"
  ]
 },
 "LI1": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li1.htm",
  "regions": [
   "throat",
   "mouth",
   "ear"
  ]
 },
 "LI2": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li2.htm",
  "regions": [
   "mouth",
   "throat",
   "eye"
  ]
 },
 "LI3": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li3.htm",
  "regions": [
   "eye",
   "mouth",
   "hand"
  ]
 },
 "LI5": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li5.htm",
  "regions": [
   "head",
   "eye",
   "wrist"
  ]
 },
 "LI6": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li6.htm",
  "regions": [
   "mouth",
   "ear",
   "face"
  ]
 },
 "LI10": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li10.htm",
  "regions": [
   "abdomen",
   "arm"
  ]
 },
 "LI11": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li11.htm",
  "regions": [
   "throat",
   "shoulder",
   "eye"
  ]
 },
 "LI14": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li14.htm",
  "regions": [
   "eye",
   "shoulder",
   "arm"
  ]
 },
 "LI15": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li15.htm",
  "regions": [
   "shoulder",
   "arm"
  ]
 },
 "LI16": {
  "source": "https://www.acupuncture.com/education/points/largeintestine/li16.htm",
  "regions": [
   "shoulder",
   "back",
   "arm"
  ]
 },
 "ST2": {
  "source": "https://www.acupuncture.com/education/points/stomach/st2.htm",
  "regions": [
   "eye",
   "face"
  ]
 },
 "ST4": {
  "source": "https://www.acupuncture.com/education/points/stomach/st4.htm",
  "regions": [
   "mouth",
   "eye"
  ]
 },
 "ST6": {
  "source": "https://www.acupuncture.com/education/points/stomach/st6.htm",
  "regions": [
   "mouth",
   "face"
  ]
 },
 "ST7": {
  "source": "https://www.acupuncture.com/education/points/stomach/st7.htm",
  "regions": [
   "ear",
   "mouth",
   "face"
  ]
 },
 "ST8": {
  "source": "https://www.acupuncture.com/education/points/stomach/st8.htm",
  "regions": [
   "head",
   "eye"
  ]
 },
 "ST21": {
  "source": "https://www.acupuncture.com/education/points/stomach/st21.htm",
  "regions": [
   "stomach",
   "abdomen"
  ]
 },
 "ST25": {
  "source": "https://www.acupuncture.com/education/points/stomach/st25.htm",
  "regions": [
   "abdomen",
   "pelvis"
  ]
 },
 "ST32": {
  "source": "https://www.acupuncture.com/education/points/stomach/st32.htm",
  "regions": [
   "waist",
   "knee",
   "leg"
  ]
 },
 "ST34": {
  "source": "https://www.acupuncture.com/education/points/stomach/st34.htm",
  "regions": [
   "stomach",
   "knee",
   "leg"
  ]
 },
 "ST35": {
  "source": "https://www.acupuncture.com/education/points/stomach/st35.htm",
  "regions": [
   "knee"
  ]
 },
 "ST37": {
  "source": "https://www.acupuncture.com/education/points/stomach/st37.htm",
  "regions": [
   "abdomen",
   "leg"
  ]
 },
 "ST39": {
  "source": "https://www.acupuncture.com/education/points/stomach/st39.htm",
  "regions": [
   "pelvis",
   "waist",
   "leg"
  ]
 },
 "ST40": {
  "source": "https://www.acupuncture.com/education/points/stomach/st40.htm",
  "regions": [
   "chest",
   "head",
   "leg"
  ]
 },
 "ST41": {
  "source": "https://www.acupuncture.com/education/points/stomach/st41.htm",
  "regions": [
   "ankle",
   "head",
   "abdomen"
  ]
 },
 "ST44": {
  "source": "https://www.acupuncture.com/education/points/stomach/st44.htm",
  "regions": [
   "mouth",
   "stomach",
   "ankle"
  ]
 },
 "SP3": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp3.htm",
  "regions": [
   "stomach",
   "abdomen"
  ]
 },
 "SP4": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp4.htm",
  "regions": [
   "stomach",
   "abdomen",
   "chest"
  ]
 },
 "SP5": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp5.htm",
  "regions": [
   "ankle",
   "abdomen"
  ]
 },
 "SP6": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp6.htm",
  "regions": [
   "pelvis",
   "abdomen",
   "ankle"
  ]
 },
 "SP8": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp8.htm",
  "regions": [
   "abdomen",
   "pelvis",
   "waist"
  ]
 },
 "SP9": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp9.htm",
  "regions": [
   "pelvis",
   "abdomen",
   "knee"
  ]
 },
 "SP10": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp10.htm",
  "regions": [
   "pelvis"
  ]
 },
 "SP15": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp15.htm",
  "regions": [
   "abdomen"
  ]
 },
 "SP21": {
  "source": "https://www.acupuncture.com/education/points/spleen/sp21.htm",
  "regions": [
   "chest",
   "ribs"
  ]
 },
 "HT1": {
  "source": "https://www.acupuncture.com/education/points/heart/ht1.htm",
  "regions": [
   "chest",
   "shoulder",
   "arm"
  ]
 },
 "HT3": {
  "source": "https://www.acupuncture.com/education/points/heart/ht3.htm",
  "regions": [
   "chest",
   "arm",
   "ribs"
  ]
 },
 "HT5": {
  "source": "https://www.acupuncture.com/education/points/heart/ht5.htm",
  "regions": [
   "throat",
   "wrist",
   "chest"
  ]
 },
 "HT7": {
  "source": "https://www.acupuncture.com/education/points/heart/ht7.htm",
  "regions": [
   "chest"
  ]
 },
 "HT8": {
  "source": "https://www.acupuncture.com/education/points/heart/ht8.htm",
  "regions": [
   "chest",
   "hand",
   "pelvis"
  ]
 },
 "HT9": {
  "source": "https://www.acupuncture.com/education/points/heart/ht9.htm",
  "regions": [
   "chest",
   "ribs"
  ]
 },
 "SI1": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si1.htm",
  "regions": [
   "breast",
   "throat",
   "eye"
  ]
 },
 "SI3": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si3.htm",
  "regions": [
   "neck",
   "waist",
   "arm"
  ]
 },
 "SI4": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si4.htm",
  "regions": [
   "waist",
   "wrist",
   "neck"
  ]
 },
 "SI6": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si6.htm",
  "regions": [
   "eye",
   "shoulder",
   "waist"
  ]
 },
 "SI8": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si8.htm",
  "regions": [
   "arm"
  ]
 },
 "SI9": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si9.htm",
  "regions": [
   "shoulder",
   "arm",
   "ear"
  ]
 },
 "SI11": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si11.htm",
  "regions": [
   "shoulder",
   "arm",
   "chest"
  ]
 },
 "SI19": {
  "source": "https://www.acupuncture.com/education/points/smallintestine/si19.htm",
  "regions": [
   "ear",
   "mouth"
  ]
 },
 "BL2": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub2.htm",
  "regions": [
   "eye"
  ]
 },
 "BL10": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub10.htm",
  "regions": [
   "head",
   "neck",
   "shoulder"
  ]
 },
 "BL11": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub11.htm",
  "regions": [
   "shoulder",
   "back",
   "knee"
  ]
 },
 "BL12": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub12.htm",
  "regions": [
   "head",
   "neck",
   "chest"
  ]
 },
 "BL13": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub13.htm",
  "regions": [
   "chest",
   "nose"
  ]
 },
 "BL15": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub15.htm",
  "regions": [
   "chest"
  ]
 },
 "BL17": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub17.htm",
  "regions": [
   "stomach",
   "throat",
   "chest"
  ]
 },
 "BL18": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub18.htm",
  "regions": [
   "ribs",
   "eye",
   "back"
  ]
 },
 "BL20": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub20.htm",
  "regions": [
   "abdomen",
   "stomach"
  ]
 },
 "BL21": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub21.htm",
  "regions": [
   "stomach",
   "abdomen"
  ]
 },
 "BL23": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub23.htm",
  "regions": [
   "pelvis",
   "ear",
   "waist"
  ]
 },
 "BL25": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub25.htm",
  "regions": [
   "abdomen",
   "waist"
  ]
 },
 "BL28": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub28.htm",
  "regions": [
   "pelvis",
   "waist",
   "leg"
  ]
 },
 "BL32": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub32.htm",
  "regions": [
   "pelvis",
   "waist",
   "leg"
  ]
 },
 "BL36": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub36.htm",
  "regions": [
   "waist",
   "leg"
  ]
 },
 "BL37": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub37.htm",
  "regions": [
   "waist",
   "leg"
  ]
 },
 "BL40": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub40.htm",
  "regions": [
   "waist",
   "leg",
   "abdomen"
  ]
 },
 "BL57": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub57.htm",
  "regions": [
   "waist",
   "leg",
   "abdomen"
  ]
 },
 "BL62": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub62.htm",
  "regions": [
   "head",
   "neck",
   "waist"
  ]
 },
 "BL67": {
  "source": "https://www.acupuncture.com/education/points/urinarybladder/ub67.htm",
  "regions": [
   "head",
   "eye",
   "nose"
  ]
 },
 "KI1": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid1.htm",
  "regions": [
   "head",
   "throat",
   "stomach"
  ]
 },
 "KI2": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid2.htm",
  "regions": [
   "pelvis",
   "ankle"
  ]
 },
 "KI3": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid3.htm",
  "regions": [
   "waist",
   "ear",
   "throat"
  ]
 },
 "KI6": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid6.htm",
  "regions": [
   "throat",
   "pelvis",
   "eye"
  ]
 },
 "KI7": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid7.htm",
  "regions": [
   "abdomen",
   "leg"
  ]
 },
 "KI10": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid10.htm",
  "regions": [
   "pelvis",
   "knee"
  ]
 },
 "KI16": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid16.htm",
  "regions": [
   "abdomen",
   "stomach"
  ]
 },
 "KI27": {
  "source": "https://www.acupuncture.com/education/points/kidney/kid27.htm",
  "regions": [
   "chest",
   "stomach"
  ]
 },
 "PC1": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc1.htm",
  "regions": [
   "breast",
   "ribs",
   "chest"
  ]
 },
 "PC3": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc3.htm",
  "regions": [
   "chest",
   "stomach"
  ]
 },
 "PC4": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc4.htm",
  "regions": [
   "chest"
  ]
 },
 "PC5": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc5.htm",
  "regions": [
   "chest",
   "stomach"
  ]
 },
 "PC7": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc7.htm",
  "regions": [
   "chest",
   "stomach",
   "ankle"
  ]
 },
 "PC8": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc8.htm",
  "regions": [
   "mouth",
   "hand",
   "stomach"
  ]
 },
 "PC9": {
  "source": "https://www.acupuncture.com/education/points/pericardium/pc9.htm",
  "regions": [
   "chest",
   "mouth"
  ]
 },
 "TE3": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj3.htm",
  "regions": [
   "head",
   "ear",
   "throat"
  ]
 },
 "TE4": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj4.htm",
  "regions": [
   "wrist",
   "ear"
  ]
 },
 "TE5": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj5.htm",
  "regions": [
   "head",
   "ear",
   "arm"
  ]
 },
 "TE6": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj6.htm",
  "regions": [
   "abdomen",
   "ribs",
   "ear"
  ]
 },
 "TE10": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj10.htm",
  "regions": [
   "head",
   "ear"
  ]
 },
 "TE14": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj14.htm",
  "regions": [
   "shoulder",
   "arm"
  ]
 },
 "TE17": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj17.htm",
  "regions": [
   "ear",
   "face",
   "mouth"
  ]
 },
 "TE21": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj21.htm",
  "regions": [
   "ear",
   "mouth"
  ]
 },
 "TE23": {
  "source": "https://www.acupuncture.com/education/points/sanjiao/sj23.htm",
  "regions": [
   "eye"
  ]
 },
 "GB1": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb1.htm",
  "regions": [
   "head",
   "eye"
  ]
 },
 "GB2": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb2.htm",
  "regions": [
   "ear",
   "mouth"
  ]
 },
 "GB8": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb8.htm",
  "regions": [
   "head",
   "stomach"
  ]
 },
 "GB14": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb14.htm",
  "regions": [
   "face",
   "eye",
   "head"
  ]
 },
 "GB20": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb20.htm",
  "regions": [
   "head",
   "eye",
   "neck"
  ]
 },
 "GB21": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb21.htm",
  "regions": [
   "breast",
   "head",
   "neck"
  ]
 },
 "GB24": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb24.htm",
  "regions": [
   "ribs",
   "stomach"
  ]
 },
 "GB26": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb26.htm",
  "regions": [
   "abdomen",
   "pelvis",
   "waist"
  ]
 },
 "GB30": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb30.htm",
  "regions": [
   "waist",
   "leg"
  ]
 },
 "GB31": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb31.htm",
  "regions": [
   "leg",
   "ear"
  ]
 },
 "GB34": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb34.htm",
  "regions": [
   "shoulder",
   "knee",
   "ribs"
  ]
 },
 "GB37": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb37.htm",
  "regions": [
   "eye",
   "leg",
   "breast"
  ]
 },
 "GB39": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb39.htm",
  "regions": [
   "neck",
   "ribs",
   "leg"
  ]
 },
 "GB40": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb40.htm",
  "regions": [
   "chest",
   "leg",
   "ankle"
  ]
 },
 "GB41": {
  "source": "https://www.acupuncture.com/education/points/gallbladder/gb41.htm",
  "regions": [
   "head",
   "eye",
   "ankle"
  ]
 },
 "LR2": {
  "source": "https://www.acupuncture.com/education/points/liver/liv2.htm",
  "regions": [
   "eye",
   "pelvis"
  ]
 },
 "LR3": {
  "source": "https://www.acupuncture.com/education/points/liver/liv3.htm",
  "regions": [
   "head",
   "eye",
   "leg"
  ]
 },
 "LR5": {
  "source": "https://www.acupuncture.com/education/points/liver/liv5.htm",
  "regions": [
   "pelvis",
   "ankle"
  ]
 },
 "LR8": {
  "source": "https://www.acupuncture.com/education/points/liver/liv8.htm",
  "regions": [
   "pelvis",
   "knee"
  ]
 },
 "LR13": {
  "source": "https://www.acupuncture.com/education/points/liver/liv13.htm",
  "regions": [
   "abdomen",
   "ribs"
  ]
 },
 "LR14": {
  "source": "https://www.acupuncture.com/education/points/liver/liv14.htm",
  "regions": [
   "chest",
   "ribs",
   "abdomen"
  ]
 },
 "GV3": {
  "source": "https://www.acupuncture.com/education/points/du/du3.htm",
  "regions": [
   "pelvis",
   "waist",
   "leg"
  ]
 },
 "GV4": {
  "source": "https://www.acupuncture.com/education/points/du/du4.htm",
  "regions": [
   "pelvis",
   "abdomen",
   "waist"
  ]
 },
 "GV9": {
  "source": "https://www.acupuncture.com/education/points/du/du9.htm",
  "regions": [
   "stomach",
   "chest",
   "back"
  ]
 },
 "GV12": {
  "source": "https://www.acupuncture.com/education/points/du/du12.htm",
  "regions": [
   "chest",
   "back"
  ]
 },
 "GV14": {
  "source": "https://www.acupuncture.com/education/points/du/du14.htm",
  "regions": [
   "eye",
   "neck",
   "chest"
  ]
 },
 "GV16": {
  "source": "https://www.acupuncture.com/education/points/du/du16.htm",
  "regions": [
   "neck",
   "throat"
  ]
 },
 "GV20": {
  "source": "https://www.acupuncture.com/education/points/du/du20.htm",
  "regions": [
   "head",
   "pelvis"
  ]
 },
 "GV23": {
  "source": "https://www.acupuncture.com/education/points/du/du23.htm",
  "regions": [
   "head",
   "eye",
   "nose"
  ]
 },
 "GV24": {
  "source": "https://www.acupuncture.com/education/points/du/du24.htm",
  "regions": [
   "head",
   "nose",
   "chest"
  ]
 },
 "GV26": {
  "source": "https://www.acupuncture.com/education/points/du/du26.htm",
  "regions": [
   "waist",
   "stomach",
   "face"
  ]
 },
 "CV3": {
  "source": "https://www.acupuncture.com/education/points/ren/ren3.htm",
  "regions": [
   "pelvis"
  ]
 },
 "CV4": {
  "source": "https://www.acupuncture.com/education/points/ren/ren4.htm",
  "regions": [
   "pelvis",
   "abdomen"
  ]
 },
 "CV6": {
  "source": "https://www.acupuncture.com/education/points/ren/ren6.htm",
  "regions": [
   "abdomen",
   "pelvis"
  ]
 },
 "CV8": {
  "source": "https://www.acupuncture.com/education/points/ren/ren8.htm",
  "regions": [
   "abdomen"
  ]
 },
 "CV9": {
  "source": "https://www.acupuncture.com/education/points/ren/ren9.htm",
  "regions": [
   "pelvis",
   "abdomen"
  ]
 },
 "CV10": {
  "source": "https://www.acupuncture.com/education/points/ren/ren10.htm",
  "regions": [
   "stomach",
   "abdomen"
  ]
 },
 "CV12": {
  "source": "https://www.acupuncture.com/education/points/ren/ren12.htm",
  "regions": [
   "stomach",
   "abdomen",
   "chest"
  ]
 },
 "CV13": {
  "source": "https://www.acupuncture.com/education/points/ren/ren13.htm",
  "regions": [
   "stomach",
   "abdomen"
  ]
 },
 "CV14": {
  "source": "https://www.acupuncture.com/education/points/ren/ren14.htm",
  "regions": [
   "chest",
   "stomach"
  ]
 },
 "CV17": {
  "source": "https://www.acupuncture.com/education/points/ren/ren17.htm",
  "regions": [
   "chest",
   "breast",
   "throat"
  ]
 },
 "CV22": {
  "source": "https://www.acupuncture.com/education/points/ren/ren22.htm",
  "regions": [
   "chest",
   "throat"
  ]
 },
 "CV24": {
  "source": "https://www.acupuncture.com/education/points/ren/ren24.htm",
  "regions": [
   "face",
   "mouth",
   "pelvis"
  ]
 }
};
for(const [code,entry] of Object.entries(regionalAssociations)){
 const targets=entry.regions.map(key=>regions[key]);
 associations[code]={kind:'传统主治区域示意',source:entry.source,targets,note:'传统资料选录关联：'+targets.map(t=>t[0]).join('、')+'。动态线用于展示区域关联，不代表神经、血管或已证实的生理作用路径；完整描述见资料来源。'};
}

export function createEffects(scene,container){
 const group=new T.Group();scene.add(group);let paths=[],labels=[],paused=false,enabled=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let elapsed=0,lastTime=null;
 function clear(){for(const l of labels)l.remove();labels=[];group.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});group.clear();paths=[];}
 function show(point,start,side=1){clear();const info=associations[point.code];if(!info||!start)return;info.targets.forEach(([name,raw],i)=>{const end=new T.Vector3(...raw);end.x*=side;const middle=start.clone().lerp(end,.5);middle.x+=side*(.55+i*.13);middle.z=start.z<0&&end.z<0?Math.min(start.z,end.z)-.65-i*.12:Math.max(start.z,end.z)+.65+i*.12;const curve=new T.QuadraticBezierCurve3(start,middle,end);const line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(70)),new T.LineBasicMaterial({color:0x56e4d2,transparent:true,opacity:.62,depthTest:false}));line.renderOrder=9;group.add(line);const beads=[];for(let j=0;j<5;j++){const bead=new T.Mesh(new T.SphereGeometry(.032,10,8),new T.MeshBasicMaterial({color:j===0?0xffffff:0x77ffdf,transparent:true,opacity:1-j*.13,depthTest:false}));bead.renderOrder=11;group.add(bead);beads.push(bead);}
 const halo=new T.Mesh(new T.RingGeometry(.12,.15,48),new T.MeshBasicMaterial({color:0x5eead4,side:T.DoubleSide,transparent:true,opacity:.7,depthTest:false}));halo.position.copy(end);halo.renderOrder=10;group.add(halo);const label=document.createElement('span');label.className='effect-label';label.textContent=name;container.appendChild(label);labels.push(label);paths.push({curve,end,beads,halo,label,index:i});});group.visible=enabled;}
 function update(time,camera,w,h){if(lastTime===null)lastTime=time;const dt=Math.min(100,time-lastTime);lastTime=time;if(!paused&&!reduced)elapsed+=dt;const occupied=[];for(const p of paths){const phase=(elapsed/2400+p.index*.18)%1;p.beads.forEach((b,j)=>b.position.copy(p.curve.getPoint((phase-j*.035+1)%1)));p.halo.quaternion.copy(camera.quaternion);p.halo.scale.setScalar(paused||reduced?1:1+.18*Math.sin(elapsed/350));const s=p.end.clone().project(camera),x=(s.x*.5+.5)*w;let y=(-s.y*.5+.5)*h;for(const r of occupied)if(Math.abs(r.x-x)<145&&Math.abs(r.y-y)<32)y=r.y+34;occupied.push({x,y});p.label.hidden=!enabled||s.z<-1||s.z>1||x<0||x>w||y<0||y>h;p.label.style.left=Math.max(5,Math.min(w-145,x+15))+'px';p.label.style.top=Math.max(5,Math.min(h-35,y))+'px';}}
 return {show,clear,update,setEnabled(v){enabled=v;group.visible=v;for(const l of labels)l.hidden=!v;},setPaused(v){paused=v;},get active(){return paths.length>0;}};
}
