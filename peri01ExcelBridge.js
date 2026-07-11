(function (root) {
  'use strict';

  // Excel Sayfa1 kaynak değerleri.
  // Veri akışı artık Excel'deki gibi: Ana form -> Sayfa1 dönüşümü -> WebDXF.
  const SAYFA1_DEFAULTS = {
    // Üst opsiyon tablosu. VBA/LISP data dosyasında I sütunu kullanılıyor.
    tabloRowH: 180,
    tabloCol1W: 1150,
    tabloCol2W: 1800,
    tabloTxtX: 60,
    tabloTxtY: 130,
    tabloTxtH: 90,

    // Alt antet tablosu. LISP aynı değerleri PERGO RISE yazı yüksekliğine göre ölçekliyor.
    alttabloRowH: 10,
    alttabloCol1W: 10,
    alttabloCol2W: 25,
    alttabloCol3W: 10,
    alttabloCol4W: 25,
    alttabloCol5W: 10,
    alttabloCol6W: 20,
    alttabloTxtX: 7.2,
    alttabloTxtY: 15.6,
    alttabloTxtH: 10.8,

    genislikOptimizeNormalBosluk: 25,
    genislikTekDegerDeductNoGlass: 12,
    genislikListeKenarDeductNoGlass: 6,
    noGapWidthDeductNoGlass: 12,
    noGapWidthDeductGlassEdge: 6,
    noGapWidthDeductGlassMiddle: 12,
    normalSystemGapForAutoRay: 13,

    calcOpeningCorrection: 71.1,
    calcHeightCorrection: 278
  };

  const HELP_TEXT = `WEB KULLANIM KILAVUZU
Pülümür Automation Studio web sürümü Pergo Rise Module 1 için DXF ve A0 PDF üretir. Form Excel Sayfa1 mantığına göre çalışır; turuncu hücre karşılığı olan alanlarda listeden seçim yapabilir veya aynı kutuya manuel değer yazabilirsiniz.

1) TEMEL KULLANIM
- Müşteri ve proje bilgilerini girin.
- Sistem adedi, genişlik, açılım, arka yükseklik ve ön yükseklik alanlarını doldurun.
- Önizleme otomatik güncellenir. DXF Oluştur ve İndir veya PDF Oluştur ve İndir butonlarını kullanın.
- Değerleri Resetle, formu Excel açılış/default haline döndürür.

2) AÇILIR LİSTE + MANUEL YAZMA
- Parapet, Cam Kaydı, Üçgen Doğrama, Su Çıkışı, Motor, Remote gibi alanlarda sağdaki ok butonu listeyi açar.
- Listede olmayan değer gerekiyorsa kutuya doğrudan manuel yazabilirsiniz.
- Yazılan metinler çizimde üst tabloya aktarılır.

3) ÇOKLU POZ GİRİŞİ
- Birden fazla poz için değerleri noktalı virgül (;) ile ayırın.
- Örnek genişlik: 3929;7995;6429
- Örnek açılım: 4500;6000;5750
- Tek değer yazılırsa tüm pozlar için ortak kabul edilir.

4) ;NO MODU
- Genişlik sonunda ;NO varsa sistem arası boşlukları kullanıcı belirler.
- Format: Gen1;Boşluk1;Gen2;Boşluk2;Gen3;NO
- Bu modda tek sıradaki değerler sistem genişliği, çift sıradaki değerler ara boşluktur.

5) RAY VE DİKME OTOMATİK HESABI
- Ray sayısı otomatik hesaplanır: 0-4000 mm = 2 ray, 4001-8000 mm = 3 ray, 8001-12000 mm = 4 ray.
- Dikme sayısı = Toplam Ray Sayısı - (Poz Sayısı - 1).
- Ray veya dikme sayısını manuel yazarsanız girilen değer esas alınır.
- Ön yükseklik 0 ise dikme sayısı otomatik 0 yapılır.

6) CAM KAYDI ETKİSİ
- Cam Kaydı EVET olduğunda ray dıştan dış yerleşim alanı daralır.
- Otomatik ray hesabı ham genişliği değil, çizimdeki efektif ray dıştan dış ölçüsünü esas alır.
- Örnek: Genişlik 8060 ve Cam Kaydı EVET ise ray hesabında efektif ölçü yaklaşık 7940 mm kabul edilir; bu nedenle 3 ray gelir.
- Çoklu pozlarda ve ;NO modunda bu kural poz bazlı uygulanır.

7) ÖNİZLEME
- Mouse tekerleği ile yakınlaş / uzaklaş.
- Sol tık basılı sürükleyerek çizim üzerinde gez.
- Çift tık hızlı zoom yapar.
- Çizimi Sığdır butonu görünümü tekrar ekrana oturtur.

8) PDF VE DXF
- DXF çizim verisini indirir.
- PDF çıktısı A0 boyutunda, vektörel ve DXF renklerine uyumlu oluşturulur.

9) DİKKAT
- Sayısal değerlerde mm birimi kabul edilir.
- Birden fazla değer yazarken sadece noktalı virgül (;) kullanın.
- ;NO modunda son token mutlaka NO olmalıdır.`

  function trUpper(s) {
    return String(s ?? '')
      .trim()
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .toUpperCase();
  }

  function splitSemi(value) {
    return String(value ?? '').split(';').map(s => s.trim()).filter(Boolean);
  }

  function isMissingValue(value) {
    const s = String(value ?? '').trim();
    return s === '' || s === '?' || trUpper(s) === 'X';
  }

  function isNoToken(value) { return trUpper(value) === 'NO'; }

  function numericToken(value) {
    const n = Number(String(value ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
  }

  function firstNumericToken(value) {
    const token = splitSemi(value).find(t => !isNoToken(t));
    return numericToken(token);
  }

  function onlyNumericTokens(value) {
    return splitSemi(value).filter(t => !isNoToken(t) && Number.isFinite(Number(String(t).replace(',', '.')))).map(numericToken);
  }

  function formatNum(value, digits = 6) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    let s = n.toFixed(digits);
    s = s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    if (s === '-0') s = '0';
    return s;
  }

  function listToText(list) { return list.map(v => formatNum(v)).join(';'); }

  function noGapModeActive(value) {
    const parts = splitSemi(value);
    const clean = parts.filter(p => !isNoToken(p));
    return parts.length > 0 && isNoToken(parts[parts.length - 1]) && clean.length >= 3 && clean.length % 2 === 1;
  }

  function noGapParts(value) {
    return splitSemi(value).filter(p => !isNoToken(p));
  }

  function rayCountForWidth(width) {
    const w = Number(width) || 0;
    if (w <= 0) return 0;
    if (w <= 4000) return 2;
    if (w <= 8000) return 3;
    if (w <= 12000) return 4;
    return 4;
  }

  function isYesValue(value) {
    return ['EVET', 'YES', 'E', 'Y'].includes(trUpper(value));
  }

  function effectiveRayWidthForAuto(width, glassTrackRaw) {
    const w = Number(width) || 0;
    if (w <= 0) return 0;
    // Web DXF çiziminde cam kaydı açıkken rayların dıştan dış yerleşim alanı yan profillerden dolayı daralır.
    // Otomatik ray hesabı da ham G8 genişliği yerine bu efektif ray dıştan dış ölçüsünü esas alır.
    return Math.max(0, isYesValue(glassTrackRaw) ? w - 120 : w);
  }

  function postCountFromRayText(rayTextRaw, systemCountRaw, widthRaw, frontHeightRaw) {
    const rayText = String(rayTextRaw ?? '').trim();
    if (!rayText) return '';
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));
    const rayParts = splitSemi(rayText).filter(t => trUpper(t) !== 'NO');
    if (!rayParts.length) return '';

    let posCount;
    let rayList;
    if (rayParts.length === 1) {
      const r = Math.max(0, Math.round(numericToken(rayParts[0]) || 0));
      const widthText = String(widthRaw ?? '').trim();
      if (noGapModeActive(widthText)) posCount = noGapParts(widthText).filter((_, i) => i % 2 === 0).length || systemCount;
      else {
        const wParts = splitSemi(widthText);
        posCount = wParts.length > 1 ? wParts.length : systemCount;
      }
      rayList = Array.from({ length: Math.max(1, posCount) }, () => r);
    } else {
      rayList = rayParts.map(t => Math.max(0, Math.round(numericToken(t) || 0)));
      posCount = rayList.length;
    }

    let postCount = rayList.reduce((a, b) => a + b, 0) - Math.max(0, posCount - 1);
    const frontTokens = onlyNumericTokens(frontHeightRaw);
    if (frontTokens.length && frontTokens.every(v => Math.abs(v) <= 0.000001)) postCount = 0;
    return Math.max(0, postCount);
  }

  function autoRayPostCount(systemCountRaw, widthRaw, frontHeightRaw, glassTrackRaw) {
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));
    const widthText = String(widthRaw ?? '').trim();
    if (!widthText) return { rayText: '', postCount: '', rayList: [], positionCount: 0 };

    const noMode = noGapModeActive(widthText);
    let rayList = [];
    if (noMode) {
      const parts = noGapParts(widthText);
      for (let i = 0; i < parts.length; i += 2) {
        rayList.push(rayCountForWidth(effectiveRayWidthForAuto(numericToken(parts[i]), glassTrackRaw)));
      }
    } else {
      const parts = splitSemi(widthText);
      if (parts.length <= 1) {
        const totalW = firstNumericToken(widthText);
        const oneW = systemCount > 1 ? (totalW - ((systemCount - 1) * SAYFA1_DEFAULTS.normalSystemGapForAutoRay)) / systemCount : totalW;
        const ray = rayCountForWidth(effectiveRayWidthForAuto(oneW, glassTrackRaw));
        rayList = Array.from({ length: systemCount }, () => ray);
      } else {
        rayList = parts.map(t => rayCountForWidth(effectiveRayWidthForAuto(numericToken(t), glassTrackRaw)));
      }
    }

    const totalRay = rayList.reduce((a, b) => a + b, 0);
    const posCount = rayList.length || systemCount;
    let postCount = totalRay - Math.max(0, posCount - 1);

    const frontTokens = onlyNumericTokens(frontHeightRaw);
    if (frontTokens.length && frontTokens.every(v => Math.abs(v) <= 0.000001)) postCount = 0;

    return {
      rayText: (noMode || splitSemi(widthText).length > 1) ? rayList.join(';') : String(rayList[0] || 0),
      postCount,
      rayList,
      positionCount: posCount
    };
  }

  function optimizeWidthForSayfa1(widthRaw, glassTrackRaw, systemCountRaw) {
    const widthText = String(widthRaw ?? '').trim();
    if (!widthText) return '';
    const camVar = ['EVET', 'YES', 'E', 'Y'].includes(trUpper(glassTrackRaw));
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));

    if (noGapModeActive(widthText)) {
      const parts = noGapParts(widthText);
      let genCount = 0;
      for (let i = 0; i < parts.length; i += 2) genCount += 1;
      const out = [];
      let sayac = 0;
      for (const token of parts) {
        if (sayac % 2 === 0) {
          const idx = (sayac / 2) + 1;
          const v = numericToken(token);
          if (camVar) {
            out.push(v - (idx === 1 || idx === genCount ? SAYFA1_DEFAULTS.noGapWidthDeductGlassEdge : SAYFA1_DEFAULTS.noGapWidthDeductGlassMiddle));
          } else {
            out.push(v - SAYFA1_DEFAULTS.noGapWidthDeductNoGlass);
          }
        } else {
          out.push(numericToken(token));
        }
        sayac += 1;
      }
      return `${listToText(out)};NO`;
    }

    const parts = splitSemi(widthText);
    if (parts.length > 1) {
      const n = parts.length;
      const pay = ((n - 1) * SAYFA1_DEFAULTS.genislikOptimizeNormalBosluk) / n;
      const out = parts.map((token, i) => {
        const gen = numericToken(token);
        if (camVar) return gen - pay;
        return gen - ((i === 0 || i === n - 1) ? SAYFA1_DEFAULTS.genislikListeKenarDeductNoGlass : 0) - pay;
      });
      return listToText(out);
    }

    const gen = numericToken(widthText);
    return formatNum(camVar ? gen : gen - SAYFA1_DEFAULTS.genislikTekDegerDeductNoGlass);
  }

  function normalizeYesNo(value) {
    return ['EVET', 'E', 'YES', 'Y'].includes(trUpper(value)) ? 'EVET' : 'HAYIR';
  }

  function safeLine(value) {
    return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim() || '-';
  }

  function buildSayfa1Data(raw) {
    const auto = autoRayPostCount(raw.systemCount, raw.width, raw.frontHeight, raw.glassTrack);
    // Excel mantığı: ray sayısı boşsa genişlikten otomatik hesaplanır;
    // kullanıcı 3;2;4 gibi manuel yazdıysa bu değer aynen esas alınır.
    const rayManual = String(raw.rayCount ?? '').trim();
    const rayText = rayManual ? rayManual : auto.rayText;
    // Dikme sayısı boşsa, manuel/otomatik ray metnine göre toplam ray - (poz-1) formülü uygulanır.
    const postCount = String(raw.postCount ?? '').trim() ? firstNumericToken(raw.postCount) : postCountFromRayText(rayText, raw.systemCount, raw.width, raw.frontHeight);

    const sayfa1 = {
      B1_width: optimizeWidthForSayfa1(raw.width, raw.glassTrack, raw.systemCount),
      B2_opening: safeLine(raw.opening),
      B3_rearHeight: safeLine(raw.rearHeight),
      B4_frontHeight: firstNumericToken(raw.frontHeight),
      B5_parapet: normalizeYesNo(raw.parapet),
      B6_parapetHeight: firstNumericToken(raw.parapetHeight),
      B7_rayCount: rayText,
      B8_postCount: postCount,
      B9_glassTrack: normalizeYesNo(raw.glassTrack),
      B9b_sideTrack: normalizeYesNo(raw.sideTrack),
      B10_waterStandard: normalizeYesNo(raw.waterStandard),
      B12_structureColor: safeLine(raw.structureColor),
      B13_fabric: safeLine(raw.fabric),
      B14_fabricProfiles: safeLine(raw.fabricProfiles),
      B15_motor: safeLine(raw.motor),
      B16_remote: safeLine(raw.remote),
      B17_led: safeLine(raw.led),
      B18_dimmer: safeLine(raw.dimmer),
      B19_extras: safeLine(raw.extras),
      B21_customer: safeLine(raw.customer),
      B22_project: safeLine(raw.project),
      B23_version: safeLine(raw.version),
      B24_drawnBy: safeLine(raw.drawnBy),
      B25_date: safeLine(raw.date),
      B27_systemCount: Math.max(1, Math.round(numericToken(raw.systemCount) || 1)),
      B29_triangleJoinery: normalizeYesNo(raw.triangleJoinery),
      row31_widthTokens: onlyNumericTokens(raw.width),
      layout: { ...SAYFA1_DEFAULTS },
      auto
    };
    return sayfa1;
  }

  function splitCalcValues(value) {
    if (isMissingValue(value)) return [];
    return splitSemi(value);
  }
  function arrayCount(arr) { return Array.isArray(arr) ? arr.length : 0; }
  function maxPozCount(...arrs) { return Math.max(1, ...arrs.map(arrayCount)); }
  function validPozCount(arr, n) { return arr.length === 0 || arr.length === 1 || arr.length === n; }
  function getPozNumber(arr, idx) {
    if (arr.length === 1) return numericToken(arr[0]);
    return numericToken(arr[idx - 1]);
  }
  function roundUp0(x) {
    const n = Number(x);
    if (!Number.isFinite(n)) return 0;
    if (n === Math.trunc(n)) return Math.trunc(n);
    return n > 0 ? Math.trunc(n) + 1 : Math.trunc(n);
  }
  function calculateSystem(values) {
    const vAci = String(values.angle ?? '').trim();
    const vAcilim = String(values.opening ?? '').trim();
    const vArka = String(values.rear ?? '').trim();
    const vOn = String(values.front ?? '').trim();
    const missing = [vAci, vAcilim, vArka, vOn].map(isMissingValue);
    if (missing.filter(Boolean).length !== 1) throw new Error('Hesaplama için tam olarak 1 hücre boş olmalı.');

    const arrAci = splitCalcValues(vAci);
    const arrAcilim = splitCalcValues(vAcilim);
    const arrArka = splitCalcValues(vArka);
    const arrOn = splitCalcValues(vOn);
    const pozSay = maxPozCount(arrAci, arrAcilim, arrArka, arrOn);
    if (![arrAci, arrAcilim, arrArka, arrOn].every(arr => validPozCount(arr, pozSay))) {
      throw new Error('Poz sayılarında uyumsuzluk var. Tek değer tüm pozlara uygulanır; çoklu değerler aynı sayıda olmalı.');
    }

    const out = [];
    for (let i = 1; i <= pozSay; i += 1) {
      if (missing[0]) {
        const acilim = getPozNumber(arrAcilim, i);
        const arkaY = getPozNumber(arrArka, i);
        const onY = getPozNumber(arrOn, i);
        if (Math.abs(acilim - SAYFA1_DEFAULTS.calcOpeningCorrection) < 0.000001) throw new Error('Açılım 71.1 olamaz.');
        const aci = Math.atan((arkaY - onY - SAYFA1_DEFAULTS.calcHeightCorrection) / (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection)) * 180 / Math.PI;
        out.push(formatNum(Math.abs(aci), 2));
      } else if (missing[1]) {
        const aci = getPozNumber(arrAci, i);
        const arkaY = getPozNumber(arrArka, i);
        const onY = getPozNumber(arrOn, i);
        const t = Math.tan(aci * Math.PI / 180);
        if (Math.abs(t) < 0.0000001) throw new Error('Açı 0 olursa açılım hesaplanamaz.');
        out.push(String(roundUp0(((arkaY - onY - SAYFA1_DEFAULTS.calcHeightCorrection) / t) + SAYFA1_DEFAULTS.calcOpeningCorrection)));
      } else if (missing[2]) {
        const aci = getPozNumber(arrAci, i);
        const acilim = getPozNumber(arrAcilim, i);
        const onY = getPozNumber(arrOn, i);
        out.push(String(roundUp0(onY + SAYFA1_DEFAULTS.calcHeightCorrection + Math.tan(aci * Math.PI / 180) * (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection))));
      } else if (missing[3]) {
        const aci = getPozNumber(arrAci, i);
        const acilim = getPozNumber(arrAcilim, i);
        const arkaY = getPozNumber(arrArka, i);
        out.push(String(roundUp0(arkaY - SAYFA1_DEFAULTS.calcHeightCorrection - Math.tan(aci * Math.PI / 180) * (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection))));
      }
    }
    return {
      missingIndex: missing.findIndex(Boolean),
      resultText: out.join(';'),
      pozSay
    };
  }

  const api = {
    SAYFA1_DEFAULTS,
    HELP_TEXT,
    trUpper,
    splitSemi,
    numericToken,
    onlyNumericTokens,
    noGapModeActive,
    rayCountForWidth,
    autoRayPostCount,
    postCountFromRayText,
    optimizeWidthForSayfa1,
    buildSayfa1Data,
    calculateSystem
  };

  root.PulumurExcelBridge = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
