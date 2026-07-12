(function () {
  'use strict';

  const APP_VERSION = '8.9.16';
  const PROJECT_FORMAT = 'PULUMUR_PROJECT';
  const PROJECT_SCHEMA_VERSION = 1;

  const ids = [
    'product', 'moduleName', 'engine', 'customer', 'project', 'version', 'drawnBy', 'date',
    'systemCount', 'width', 'opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount',
    'parapet', 'parapetHeight', 'glassTrack', 'sideTrack', 'structureColor', 'fabric', 'fabricProfiles',
    'motor', 'remote', 'led', 'dimmer', 'extras', 'triangleJoinery', 'waterStandard'
  ];

  const $ = id => document.getElementById(id);
  const statusText = $('statusText');
  const preview = $('preview');
  const previewPanel = document.querySelector('.preview-panel');
  let lastDrawing = null;
  let lastCalc = null;
  const upperTableFieldIds = ['structureColor', 'fabric', 'fabricProfiles', 'motor', 'remote', 'led', 'dimmer', 'extras'];

  const BOOLEAN_FIELD_IDS = ['parapet', 'glassTrack', 'triangleJoinery', 'waterStandard'];
  const BOOLEAN_CANONICAL = {
    EVET: { tr: 'EVET', en: 'YES' },
    HAYIR: { tr: 'HAYIR', en: 'NO' }
  };
  let currentLanguage = 'tr';
  let deferredInstallPrompt = null;
  let pendingDimensionEdit = null;
  let suppressFormPreviewUpdate = false;

  let wrappingFields = false;
  const previewState = { zoom: 1, baseScale: 1, minZoom: 0.20, maxZoom: 18, dragActive: false, dragStartX: 0, dragStartY: 0, dragScrollLeft: 0, dragScrollTop: 0, pointerId: null };
  const previewDimensionFilter = { main: true, all: false };
  let manualPostPlacementMode = 'standard';
  let glassTrackProfileState = { mode: 'standard', en: 100, boy: 100, et: 2 };
  let glassSupportProfileState = { left: null, right: null };
  let customFrontPostCenters = null;
  let customSideSupportCenters = {};
  let customSidePosts = {};
  let frontPostProfiles = [];
  let slidingPlacements = [];
  let sideSlidingPlacements = [];
  let pendingSlidingPlacementMeta = null;
  let guillotinePlacements = [];
  let sideGuillotinePlacements = [];
  let pendingGuillotinePlacementMeta = null;
  let toolboxSelectionMode = null;
  let toolboxSelectionItems = new Map();
  let toolboxContextMenu = null;
  let toolboxSelectionBanner = null;
  const projectHistory = { entries: [], index: -1, restoring: false, suspendDepth: 0, dirtyWhileSuspended: false };
  let currentProjectRecord = { projectId: null, projectCode: null, revisionNo: 1 };
  const EXCEL_COMBO_OPTIONS = {
    motor: ['-', 'RISING MOTOR', 'SOMFY RTS', 'SOMFY IO'],
    fabric: [
      '-',
      'C 1602 - 3D (8118-1622)',
      'C 3017 - 3D',
      'C 3105 - 3D',
      'C 6001 - 3D',
      'C 7019 - 3D (8118-7024)',
      'C 7075 - 3D (8118-7340)',
      'C 7995 - 3D (8118-7999)',
      'C 9012 - 3D (8118-9002)',
      'C 1602 - M (8116-1622)',
      'C 1638 - M',
      'C 7009 - M',
      'C 9012 - M (8116-9002)',
      'C 1602 - K (8290-1622)',
      'C 9012 - D (8290-9002)'
    ]
  };
  const REMOTE_OPTIONS_BY_MOTOR = {
    'RISING MOTOR': ['-', 'RISING 6 CHANNELS'],
    'SOMFY RTS': ['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS'],
    'SOMFY IO': ['-', 'SITUO 2 IO', 'SITUO 5 IO'],
    '-': ['-'],
    '': ['-']
  };
  const EXCEL_DEFAULT_INPUT = {
    product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF',
    customer: '', project: '', version: '01', drawnBy: 'AYETULLAH KILINC', date: '',
    systemCount: '', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '',
    parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', sideTrack: 'HAYIR',
    structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-',
    triangleJoinery: 'HAYIR', waterStandard: 'EVET'
  };

  // V8.2.66: Ölçü -> Zone -> Profil / Ürün -> görünüş ilişkisi için UI altyapısı
  const SMART_ACTION_LABELS = {
    tr: { resize: 'Sadece ölçüyü değiştir', addSameProfile: 'Bu aralığa aynı profilden ekle', addDifferentProfile: 'Bu aralığa farklı profil ekle', placeProduct: 'Bu alana ürün yerleştir', editProfile: 'Mevcut ürünü düzenle', removeElement: 'Mevcut elemanı kaldır' },
    en: { resize: 'Resize this dimension only', addSameProfile: 'Add same profile to this gap', addDifferentProfile: 'Add different profile to this gap', placeProduct: 'Place product in this zone', editProfile: 'Edit existing product', removeElement: 'Remove current element' }
  };
  const SMART_PRODUCT_OPTIONS = [
    { id: 'sliding_glass', tr: 'Sürme Cam', en: 'Sliding Glass' },
    { id: 'guillotine_glass', tr: 'Giyotin Cam', en: 'Guillotine' }
  ];
  const SMART_PROFILE_OPTIONS = [
    { id: 'same_post', tr: 'Aynı dikme profili', en: 'Same post profile', side: 100, top: 100 },
    { id: 'side_register_100', tr: 'Yan Kayıt 100', en: 'Side register 100', side: 100, top: 100 },
    { id: 'side_register_40x130', tr: 'Yan Kayıt 40x130', en: 'Side register 40x130', side: 40, top: 130 }
  ];


  function sanitizeGlassTrackProfile(profile) {
    const raw = profile || {};
    let mode = String(raw.mode || 'standard').trim().toLowerCase();
    let en = Number(raw.en);
    let boy = Number(raw.boy);
    let et = Number(raw.et);
    if (mode === '40x130x2' || mode === '40x130') {
      en = 40; boy = 130; et = 2; mode = '40x130x2';
    } else if (mode !== 'other') {
      en = 100; boy = 100; et = 2; mode = 'standard';
    }
    en = Math.max(5, Number.isFinite(en) ? en : 100);
    boy = Math.max(5, Number.isFinite(boy) ? boy : 100);
    et = Math.max(0, Number.isFinite(et) ? et : 2);
    et = Math.min(et, Math.max(0, Math.min(en, boy) / 2 - 0.1));
    return { mode, en, boy, et };
  }

  function sanitizeOptionalGlassTrackProfile(profile) {
    if (!profile) return null;
    return sanitizeGlassTrackProfile(profile);
  }

  function supportProfileScopeLabel(scope, isEn) {
    if (scope === 'left') return isEn ? 'first position support' : 'ilk poz destek dikmesi';
    if (scope === 'right') return isEn ? 'last position support' : 'son poz destek dikmesi';
    return isEn ? 'support post' : 'destek dikmesi';
  }

  const UI_TEXT = {
    tr: {
      langLabel: 'Dil', helpBtn: 'Yardım', installBtn: 'Ana Ekrana Ekle',
      appTitleMain: 'Pülümür Automation Studio', appTitleSub: '| Parametrik Çizim ve Proje Otomasyonu | Hazırlayan / Geliştiren : Ayetullah KILINÇ',
      labelProduct: 'Ürün', labelModule: 'Modül', labelEngine: 'Çizim Motoru',
      legendProject: 'Proje Bilgileri', legendSystem: 'Sistem Ölçüleri <b>*(mm)</b>', legendOptions: 'Opsiyonlar', legendExtra: 'Ek Opsiyonlar',
      labelSystemCount: 'Sistem Adedi', labelWidth: 'Genişlik', labelOpening: 'Açılım',
      labelRearHeight: 'Arka H', labelFrontHeight: 'Ön H <em>Oluk Altı</em>',
      labelRayCount: 'Ray Sayısı <b>Bir Sistem</b>', labelPostCount: 'Dikme Sayısı <b>Tüm Sistem</b>',
      project_customer: 'Müşteri', project_project: 'Proje', project_version: 'Versiyon', project_drawnBy: 'Çizen', project_date: 'Tarih',
      options_parapet: 'Parapet', options_parapetHeight: 'Parapet H <b>*(mm)</b>', options_glassTrack: 'Cam Kaydı',
      options_structureColor: 'Taşıyıcı Rengi', options_fabric: 'Kumaş', options_fabricProfiles: 'Kumaş Profilleri',
      options_motor: 'Motor', options_remote: 'Kumanda', options_led: 'LED', options_dimmer: 'Dimmer', options_extras: 'Ekstralar / Notlar',
      extra_triangleJoinery: 'Üçgen Doğrama', extra_waterStandard: 'Su Çıkışı Standart mı?', quickTestsHead: 'Hızlı Testler',
      previewTitle: 'Çizim Ön İzleme', previewBtn: 'Önizlemeyi Yenile', expandPreviewBtn: 'Önizlemeyi Büyüt', fitPreviewBtn: 'Çizimi Sığdır', undoPreviewBtn: 'Geri Al', redoPreviewBtn: 'İleri Al', historyGroupLabel: 'Çizim geçmişi', shrinkPreviewBtn: 'Önizlemeyi Küçült', showMainDimsLabel: 'Ana ölçüleri göster', showAllDimsLabel: 'Tüm ölçüleri göster',
      pdfBtn: 'PDF İndir', generateBtn: 'DXF İndir', resetBtn: 'Değerleri Resetle', calcBtn: 'Pülümür Hesaplayıcı', projectExportBtn: 'Proje Dosyası İndir', previewProjectExportBtn: 'Proje Dosyası İndir', projectImportBtn: 'Proje Dosyası Aç', multiProductBtn: 'Çoklu Ürün Ekleme', multiDimensionBtn: 'Çoklu Ölçü Düzenleme', multiDeleteBtn: 'Çoklu Ürün Silme', deleteAllProductsBtn: 'Tüm Ürünleri Sil',
      calcTitle: 'Pülümür Hesaplayıcı', calcSub: '4 satırdan herhangi 3 tanesini doldur. Boş olan değer hesaplanır.',
      calcGuide: '<strong>TR</strong><ul><li>4 alandan 3 tanesini doldur.</li><li>Hesaplanacak alanı boş bırak.</li><li>Hesapla’ya bas.</li><li>Sonucu ana forma aktar.</li></ul>',
      calcWaiting: 'Sonuç bekleniyor.', calcReady: 'Sonuç', calcPoz: 'poz', calcOpenNote: 'Ana formdaki açılım / arka / ön değerleri aktarıldı. Açıyı hesaplamak için Hesapla’ya bas.',
      calcAngleLabel: 'Sistem Açısı (°)', calcOpeningLabel: 'Açılım *(mm)', calcRearLabel: 'Arka H *(mm)', calcFrontLabel: 'Ön H *(mm)',
      calcComputeBtn: 'Hesapla', calcTransferBtn: 'Sonucu Hücrelere Aktar', calcClearBtn: 'Sıfırla', helpTitle: 'Yardım / Kullanım Kılavuzu', helpCloseBtn: 'Kapat', emptyPreview: 'Önizleme için zorunlu ölçüleri doldur.',
      placeholders: {
        systemCount: 'Örn. 1', width: 'Örn. 4000 veya 3000;100;2500;NO', opening: 'Örn. 6000 veya 4500;5200', rearHeight: 'Örn. 3200 veya 3200;3400', frontHeight: 'Örn. 2600',
        rayCount: 'Örn. 2 veya 2;3;2', postCount: 'Örn. 2 veya boş: otomatik', calcAngle: 'Örn. 4.16 veya boş', calcOpening: 'Örn. 4500;5200 veya boş', calcRear: 'Örn. 3200;3400 veya boş', calcFront: 'Örn. 2600 veya boş'
      }
    },
    en: {
      langLabel: 'Language', helpBtn: 'Help', installBtn: 'Add to Home Screen',
      appTitleMain: 'Pülümür Automation Studio', appTitleSub: '| Parametric Drawing and Project Automation | Prepared / Developed by: Ayetullah KILINÇ',
      labelProduct: 'Product', labelModule: 'Module', labelEngine: 'Drawing Engine',
      legendProject: 'Project Info', legendSystem: 'System Dimensions <b>*(mm)</b>', legendOptions: 'Options', legendExtra: 'Extra Options',
      labelSystemCount: 'System Count', labelWidth: 'Width', labelOpening: 'Projection',
      labelRearHeight: 'Rear H', labelFrontHeight: 'Front H <em>Gutter Bottom</em>',
      labelRayCount: 'Rail Count <b>Per System</b>', labelPostCount: 'Post Count <b>All Systems</b>',
      project_customer: 'Customer', project_project: 'Project', project_version: 'Version', project_drawnBy: 'Drawn By', project_date: 'Date',
      options_parapet: 'Parapet', options_parapetHeight: 'Parapet H <b>*(mm)</b>', options_glassTrack: 'Glass Track',
      options_structureColor: 'Structure Color', options_fabric: 'Fabric', options_fabricProfiles: 'Fabric Profiles',
      options_motor: 'Motor', options_remote: 'Remote', options_led: 'LED', options_dimmer: 'Dimmer', options_extras: 'Extras / Notes',
      extra_triangleJoinery: 'Triangle Joinery', extra_waterStandard: 'Standard Water Outlet?', quickTestsHead: 'Quick Tests',
      previewTitle: 'Drawing Preview', previewBtn: 'Refresh Preview', expandPreviewBtn: 'Expand Preview', fitPreviewBtn: 'Fit Drawing', undoPreviewBtn: 'Undo', redoPreviewBtn: 'Redo', historyGroupLabel: 'Drawing history', shrinkPreviewBtn: 'Collapse Preview', showMainDimsLabel: 'Show main dimensions', showAllDimsLabel: 'Show all dimensions',
      pdfBtn: 'Download PDF', generateBtn: 'Download DXF', resetBtn: 'Reset Values', calcBtn: 'Pulumur Calculator', projectExportBtn: 'Download Project File', previewProjectExportBtn: 'Download Project File', projectImportBtn: 'Open Project File', multiProductBtn: 'Multiple Product Placement', multiDimensionBtn: 'Multiple Dimension Editing', multiDeleteBtn: 'Delete Multiple Products', deleteAllProductsBtn: 'Delete All Products',
      calcTitle: 'Pulumur Calculator', calcSub: 'Fill any 3 of the 4 rows. The empty value will be calculated.',
      calcGuide: '<strong>EN</strong><ul><li>Fill 3 of the 4 fields.</li><li>Leave one field empty.</li><li>Click Calculate.</li><li>Transfer the result to the main form.</li></ul>',
      calcWaiting: 'Waiting for result.', calcReady: 'Result', calcPoz: 'position', calcOpenNote: 'Projection / rear H / front H values were copied from the main form. Click Calculate to calculate the angle.',
      calcAngleLabel: 'System Angle (°)', calcOpeningLabel: 'Projection *(mm)', calcRearLabel: 'Rear H *(mm)', calcFrontLabel: 'Front H *(mm)',
      calcComputeBtn: 'Calculate', calcTransferBtn: 'Transfer Result', calcClearBtn: 'Clear', helpTitle: 'Help / User Guide', helpCloseBtn: 'Close', emptyPreview: 'Fill the required dimensions for preview.',
      placeholders: {
        systemCount: 'Ex. 1', width: 'Ex. 4000 or 3000;100;2500;NO', opening: 'Ex. 6000 or 4500;5200', rearHeight: 'Ex. 3200 or 3200;3400', frontHeight: 'Ex. 2600',
        rayCount: 'Ex. 2 or 2;3;2', postCount: 'Ex. 2 or blank: auto', calcAngle: 'Ex. 4.16 or blank', calcOpening: 'Ex. 4500;5200 or blank', calcRear: 'Ex. 3200;3400 or blank', calcFront: 'Ex. 2600 or blank'
      }
    }
  };


  const SLIDING_UI_TEXT = {
    tr: {
      title: 'Sürme Detayları', productSeries: 'Ürün Serisi', type: 'Tip', openingType: 'Açılım Tipi',
      glassThickness: 'Cam Kalınlığı', glassColor: 'Cam Rengi', aSeries: 'A Serisi', kSeries: 'K Serisi',
      withThreshold: 'Eşikli', withoutThreshold: 'Eşiksiz', sideOpening: 'Yana Açılım', centerOpening: 'Ortadan Açılım',
      mm8: '8 mm', mm10: '10 mm', insulatedGlass: 'Yalıtımlı Cam', transparent: 'Şeffaf', grey: 'Gri',
      bronze: 'Bronz', lowEGlass: 'Low-e Cam', other: 'Diğer', otherPlaceholder: 'Özel cam rengini yazın',
      pozNo: 'Poz No', width: 'Genişlik *', height: 'Yükseklik *', panelCount: 'Panel Sayısı',
      cancel: 'İptal', confirm: 'Tamam', close: 'Kapat',
      otherRequired: 'Diğer seçildiğinde cam rengini yazmalısın.',
      placed: (poz, left, right) => `${poz} sürme cam, Dikme ${left} ile Dikme ${right} arasına yerleştirildi.`
    },
    en: {
      title: 'Sliding Details', productSeries: 'Product Series', type: 'Type', openingType: 'Opening Type',
      glassThickness: 'Glass Thickness', glassColor: 'Glass Color', aSeries: 'A Series', kSeries: 'K Series',
      withThreshold: 'With Threshold', withoutThreshold: 'Without Threshold', sideOpening: 'Side Opening', centerOpening: 'Center Opening',
      mm8: '8 mm', mm10: '10 mm', insulatedGlass: 'Insulated Glass', transparent: 'Transparent', grey: 'Grey',
      bronze: 'Bronze', lowEGlass: 'Low-e Glass', other: 'Other', otherPlaceholder: 'Enter custom glass color',
      pozNo: 'Position No.', width: 'Width *', height: 'Height *', panelCount: 'Panel Count',
      cancel: 'Cancel', confirm: 'Confirm', close: 'Close',
      otherRequired: 'Enter a glass color when Other is selected.',
      placed: (poz, left, right) => `${poz} sliding glass was placed between Post ${left} and Post ${right}.`
    }
  };


  const GUILLOTINE_UI_TEXT = {
    tr: {
      title: 'Giyotin Detayları', productSeries: 'Ürün Serisi', type: 'Tip', mechanism: 'Mekanizma',
      glassThickness: 'Cam Kalınlığı', glassColor: 'Cam Rengi', panelCount: 'Panel Tipi',
      motorDirection: 'Motor Yönü', view: 'Görünüş', motorType: 'Motor Tipi', remoteControl: 'Kumanda',
      aSeries: 'A Serisi', kSeries: 'K Serisi', standard: 'Standart', cleanable: 'Temizlenebilir',
      upwardCollecting: 'Yukarı Toplanan', chain: 'Zincir', belt: 'Kayış', mm8: '8 mm',
      insulatedGlass: 'Yalıtımlı Cam', transparent: 'Şeffaf', grey: 'Gri', bronze: 'Bronz',
      lowEGlass: 'Low-e Cam', other: 'Diğer', otherPlaceholder: 'Özel cam rengini yazın',
      panel11: '1+1', panel12: '1+2', right: 'Sağ', left: 'Sol', insideView: 'İç Görünüş',
      outsideView: 'Dış Görünüş', somfyRts: 'Somfy RTS', somfyIo: 'Somfy IO', rising: 'Rising',
      ch1: '1 Kanal', ch2: '2 Kanal', ch4: '4 Kanal', ch6: '6 Kanal', ch16: '16 Kanal', ch40: '40 Kanal',
      pozNo: 'Poz No', width: 'Genişlik *', height: 'Yükseklik *', cancel: 'İptal', confirm: 'Tamam', close: 'Kapat',
      otherRequired: 'Diğer seçildiğinde cam rengini yazmalısın.',
      placed: (poz, leftPost, rightPost) => `${poz} giyotin cam, Dikme ${leftPost} ile Dikme ${rightPost} arasına yerleştirildi.`
    },
    en: {
      title: 'Guillotine Details', productSeries: 'Product Series', type: 'Type', mechanism: 'Mechanism',
      glassThickness: 'Glass Thickness', glassColor: 'Glass Color', panelCount: 'Panel Type',
      motorDirection: 'Motor Direction', view: 'View', motorType: 'Motor Type', remoteControl: 'Remote Control',
      aSeries: 'A Series', kSeries: 'K Series', standard: 'Standard', cleanable: 'Cleanable',
      upwardCollecting: 'Upward Collecting', chain: 'Chain', belt: 'Belt', mm8: '8 mm',
      insulatedGlass: 'Insulated Glass', transparent: 'Transparent', grey: 'Grey', bronze: 'Bronze',
      lowEGlass: 'Low-e Glass', other: 'Other', otherPlaceholder: 'Enter custom glass color',
      panel11: '1+1', panel12: '1+2', right: 'Right', left: 'Left', insideView: 'Inside View',
      outsideView: 'Outside View', somfyRts: 'Somfy RTS', somfyIo: 'Somfy IO', rising: 'Rising',
      ch1: '1 Channel', ch2: '2 Channels', ch4: '4 Channels', ch6: '6 Channels', ch16: '16 Channels', ch40: '40 Channels',
      pozNo: 'Position No.', width: 'Width *', height: 'Height *', cancel: 'Cancel', confirm: 'Confirm', close: 'Close',
      otherRequired: 'Enter a glass color when Other is selected.',
      placed: (poz, leftPost, rightPost) => `${poz} guillotine was placed between Post ${leftPost} and Post ${rightPost}.`
    }
  };

  function translateGuillotineDetailsOverlay(overlay = $('guillotineDetailsOverlay')) {
    if (!overlay) return;
    const txt = GUILLOTINE_UI_TEXT[currentLanguage] || GUILLOTINE_UI_TEXT.tr;
    overlay.querySelectorAll('[data-guillotine-text]').forEach(el => {
      const key = el.dataset.guillotineText;
      if (Object.prototype.hasOwnProperty.call(txt, key) && typeof txt[key] === 'string') el.textContent = txt[key];
    });
    const otherInput = overlay.querySelector('#guillotineOtherColor');
    if (otherInput) otherInput.placeholder = txt.otherPlaceholder;
    const closeButton = overlay.querySelector('#guillotineDetailsClose');
    if (closeButton) closeButton.setAttribute('aria-label', txt.close);
    const form = overlay.querySelector('#guillotineDetailsForm');
    if (form) form.setAttribute('aria-label', txt.title);
  }

  function translateSlidingDetailsOverlay(overlay = $('slidingDetailsOverlay')) {
    if (!overlay) return;
    const txt = SLIDING_UI_TEXT[currentLanguage] || SLIDING_UI_TEXT.tr;
    overlay.querySelectorAll('[data-sliding-text]').forEach(el => {
      const key = el.dataset.slidingText;
      if (Object.prototype.hasOwnProperty.call(txt, key) && typeof txt[key] === 'string') el.textContent = txt[key];
    });
    const otherInput = overlay.querySelector('#slidingOtherColor');
    if (otherInput) otherInput.placeholder = txt.otherPlaceholder;
    const closeButton = overlay.querySelector('#slidingDetailsClose');
    if (closeButton) closeButton.setAttribute('aria-label', txt.close);
    const form = overlay.querySelector('#slidingDetailsForm');
    if (form) form.setAttribute('aria-label', txt.title);
  }

  const QUICK_TEST_PRESETS = [
    { name: 'Test 1', title: '1 adet · 2 ray · aynı ölçüler · otomatik dikme', values: { customer: 'TEST', project: 'TEST 1', systemCount: '1', width: '4000', opening: '4500', rearHeight: '3200', frontHeight: '2600' } },
    { name: 'Test 2', title: '1 adet · Cam kaydı EVET · 8060 => 3 ray', values: { customer: 'TEST', project: 'TEST 2', systemCount: '1', width: '8060', opening: '4500', rearHeight: '3200', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 3', title: '2 adet · aynı genişlik · 2;2 ray', values: { customer: 'TEST', project: 'TEST 3', systemCount: '2', width: '3000;3000', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 4', title: '2 adet · farklı genişlik/açılım · Cam kaydı EVET', values: { customer: 'TEST', project: 'TEST 4', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 5', title: '2 adet · NO boşluk modu', values: { customer: 'TEST', project: 'TEST 5', systemCount: '2', width: '3000;100;3000;NO', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 6', title: '3 adet · aynı açılım · otomatik', values: { customer: 'TEST', project: 'TEST 6', systemCount: '3', width: '3200;3200;3200', opening: '4500;4500;4500', rearHeight: '3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 7', title: '3 adet · farklı genişlik/açılım/arka yükseklik', values: { customer: 'TEST', project: 'TEST 7', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600' } },
    { name: 'Test 8', title: '3 adet · dikme sayısı otomatikten 2 eksik', values: { customer: 'TEST', project: 'TEST 8', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', postCount: '4' } },
    { name: 'Test 9', title: '5 adet · aynı genişlik/açılım', values: { customer: 'TEST', project: 'TEST 9', systemCount: '5', width: '4000;4000;4000;4000;4000', opening: '4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 10', title: '5 adet · farklı genişlik/açılım · 3 raylar', values: { customer: 'TEST', project: 'TEST 10', systemCount: '5', width: '6000;6200;6400;6600;6800', opening: '4500;4600;4700;4800;4900', rearHeight: '3200;3300;3400;3500;3600', frontHeight: '2600' } },
    { name: 'Test 11', title: '7 adet · aynı genişlik · 2 raylar', values: { customer: 'TEST', project: 'TEST 11', systemCount: '7', width: '3000;3000;3000;3000;3000;3000;3000', opening: '4500;4500;4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 12', title: '7 adet · farklı genişlik · karışık 2/3 ray', values: { customer: 'TEST', project: 'TEST 12', systemCount: '7', width: '4000;4200;4400;4600;4800;5000;5200', opening: '4500;4550;4600;4650;4700;4750;4800', rearHeight: '3200;3250;3300;3350;3400;3450;3500', frontHeight: '2600' } },
    { name: 'Test 13', title: 'Parapet EVET · 600 mm', values: { customer: 'TEST', project: 'TEST 13', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600' } },
    { name: 'Test 14', title: 'Üçgen doğrama EVET', values: { customer: 'TEST', project: 'TEST 14', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', triangleJoinery: 'EVET' } },
    { name: 'Test 15', title: 'Su çıkışı standart HAYIR', values: { customer: 'TEST', project: 'TEST 15', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', waterStandard: 'HAYIR' } },
    { name: 'Test 16', title: 'Kombine test · parapet+cam+üçgen', values: { customer: 'TEST', project: 'TEST 16', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600', glassTrack: 'EVET', triangleJoinery: 'EVET', waterStandard: 'HAYIR' } }
  ];

  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  function normalizeYesNo(value) {
    const upper = String(value ?? '').trim().toLocaleUpperCase('tr-TR');
    if (['EVET', 'YES'].includes(upper)) return 'EVET';
    if (['HAYIR', 'HAYR', 'NO'].includes(upper)) return 'HAYIR';
    return String(value ?? '').trim();
  }

  function setBooleanSelectTexts(lang) {
    BOOLEAN_FIELD_IDS.forEach(id => {
      const el = $(id);
      if (!el) return;
      Array.from(el.options).forEach(opt => {
        const canonical = normalizeYesNo(opt.value || opt.textContent);
        if (BOOLEAN_CANONICAL[canonical]) opt.textContent = BOOLEAN_CANONICAL[canonical][lang];
      });
    });
  }

  function setText(id, value, html = false) {
    const el = $(id);
    if (!el) return;
    if (html) el.innerHTML = value; else el.textContent = value;
  }

  function labelSpan(id) {
    const el = $(id);
    const label = el && el.closest('label');
    return label ? label.querySelector('span') : null;
  }

  function translateUI(lang) {
    currentLanguage = (lang === 'en') ? 'en' : 'tr';
    const txt = UI_TEXT[currentLanguage];
    document.documentElement.lang = currentLanguage;
    setText('langLabel', txt.langLabel);
    setText('helpBtn', txt.helpBtn);
    setText('installBtn', txt.installBtn);
    setText('appTitleMain', txt.appTitleMain);
    setText('appTitleSub', txt.appTitleSub);
    setText('labelProduct', txt.labelProduct);
    setText('labelModule', txt.labelModule);
    setText('labelEngine', txt.labelEngine);
    setText('legendProject', txt.legendProject);
    setText('legendSystem', txt.legendSystem, true);
    setText('legendOptions', txt.legendOptions);
    setText('legendExtra', txt.legendExtra);
    setText('labelSystemCount', txt.labelSystemCount);
    setText('labelWidth', txt.labelWidth, true);
    setText('labelOpening', txt.labelOpening, true);
    setText('labelRearHeight', txt.labelRearHeight, true);
    setText('labelFrontHeight', txt.labelFrontHeight, true);
    setText('labelRayCount', txt.labelRayCount, true);
    setText('labelPostCount', txt.labelPostCount, true);
    const projectMap = {customer:'project_customer', project:'project_project', version:'project_version', drawnBy:'project_drawnBy', date:'project_date'};
    Object.entries(projectMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) s.textContent = txt[key]; });
    const optionMap = {parapet:'options_parapet', parapetHeight:'options_parapetHeight', glassTrack:'options_glassTrack', structureColor:'options_structureColor', fabric:'options_fabric', fabricProfiles:'options_fabricProfiles', motor:'options_motor', remote:'options_remote', led:'options_led', dimmer:'options_dimmer', extras:'options_extras', triangleJoinery:'extra_triangleJoinery'};
    Object.entries(optionMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) { if (key.endsWith('Height')) s.innerHTML = txt[key]; else s.textContent = txt[key]; } });
    setText('labelWaterStandard', txt.extra_waterStandard);
    setText('quickTestsHead', txt.quickTestsHead);
    setText('previewTitle', txt.previewTitle);
    setText('previewBtn', txt.previewBtn);
    const expandText = previewPanel.classList.contains('is-expanded') ? txt.shrinkPreviewBtn : txt.expandPreviewBtn;
    setText('expandPreviewBtn', expandText);
    setText('fitPreviewBtn', txt.fitPreviewBtn);
    setText('undoPreviewBtn', txt.undoPreviewBtn);
    setText('redoPreviewBtn', txt.redoPreviewBtn);
    updateHistoryControls();
    if ($('historyControlGroup')) $('historyControlGroup').setAttribute('aria-label', txt.historyGroupLabel);
    setText('pdfBtn', txt.pdfBtn);
    setText('generateBtn', txt.generateBtn);
    setText('resetBtn', txt.resetBtn);
    setText('calcBtn', txt.calcBtn);
    setText('projectExportBtn', txt.projectExportBtn);
    setText('previewProjectExportBtn', txt.previewProjectExportBtn);
    setText('projectImportBtn', txt.projectImportBtn);
    setText('multiProductBtn', txt.multiProductBtn);
    setText('multiDimensionBtn', txt.multiDimensionBtn);
    setText('multiDeleteBtn', txt.multiDeleteBtn);
    setText('deleteAllProductsBtn', txt.deleteAllProductsBtn);
    syncToolboxBooleanButtons();
    setText('calcTitle', txt.calcTitle);
    setText('calcSub', txt.calcSub);
    setText('calcGuide', txt.calcGuide, true);
    const calcMap = {calcAngle:'calcAngleLabel', calcOpening:'calcOpeningLabel', calcRear:'calcRearLabel', calcFront:'calcFrontLabel'};
    Object.entries(calcMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) s.textContent = txt[key]; });
    setText('calcComputeBtn', txt.calcComputeBtn);
    setText('calcTransferBtn', txt.calcTransferBtn);
    setText('calcClearBtn', txt.calcClearBtn);
    setText('helpTitle', txt.helpTitle);
    setText('showMainDimsLabel', txt.showMainDimsLabel);
    setText('showAllDimsLabel', txt.showAllDimsLabel);
    const helpClose = document.querySelector('#helpDialog .modal-actions button');
    if (helpClose) helpClose.textContent = txt.helpCloseBtn;
    Object.entries(txt.placeholders).forEach(([id,val]) => { if ($(id)) $(id).placeholder = val; });
    setBooleanSelectTexts(currentLanguage);
    translateSlidingDetailsOverlay();
    translateGuillotineDetailsOverlay();
    try { localStorage.setItem('pulumur_lang', currentLanguage); } catch (e) {}
  }

  function setupPwaInstall() {
    const btn = $('installBtn');
    if (!btn) return;

    const isStandalone = () =>
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;

    const syncInstallButton = () => {
      btn.hidden = isStandalone();
    };

    syncInstallButton();

    window.addEventListener('beforeinstallprompt', evt => {
      evt.preventDefault();
      deferredInstallPrompt = evt;
      syncInstallButton();
    });

    btn.addEventListener('click', async () => {
      if (isStandalone()) {
        btn.hidden = true;
        return;
      }
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try { await deferredInstallPrompt.userChoice; } catch (e) {}
        deferredInstallPrompt = null;
        syncInstallButton();
        return;
      }
      const isEn = currentLanguage === 'en';
      window.alert(isEn
        ? 'To use it like an app: open the browser menu and choose “Install app” or “Add to Home screen”.'
        : 'Uygulama gibi kullanmak için tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullan.');
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      btn.hidden = true;
    });

    if (window.matchMedia) {
      const mq = window.matchMedia('(display-mode: standalone)');
      if (mq && typeof mq.addEventListener === 'function') mq.addEventListener('change', syncInstallButton);
      else if (mq && typeof mq.addListener === 'function') mq.addListener(syncInstallButton);
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=8.9.16').catch(() => {}), { once: true });
    }
  }

  function fillInitial() {
    const d = { ...EXCEL_DEFAULT_INPUT, date: today() };
    ids.forEach(id => {
      if ($(id) && d[id] !== undefined) $(id).value = d[id];
    });
    if ($('date')) $('date').value = d.date;
    updateRemoteOptions(false);
    ['rayCount', 'postCount'].forEach(id => {
      if ($(id)) $(id).dataset.userEdited = 'false';
    });
    manualPostPlacementMode = 'standard';
    glassTrackProfileState = { mode: 'standard', en: 100, boy: 100, et: 2 };
    glassSupportProfileState = { left: null, right: null };
    customFrontPostCenters = null;
    customSideSupportCenters = {};
    customSidePosts = {};
    frontPostProfiles = [];
    slidingPlacements = [];
    sideSlidingPlacements = [];
    pendingSlidingPlacementMeta = null;
    guillotinePlacements = [];
    sideGuillotinePlacements = [];
    pendingGuillotinePlacementMeta = null;
    toolboxSelectionMode = null;
    toolboxSelectionItems = new Map();
    currentProjectRecord = { projectId: null, projectCode: null, revisionNo: 1 };
    applyAutoRayPost(true);
  }

  function applyAutoRayPost(force = false) {
    const br = window.PulumurExcelBridge;
    if (!br || typeof br.autoRayPostCount !== 'function') return;
    const raw = collectForm();
    const auto = br.autoRayPostCount(raw.systemCount, raw.width, raw.frontHeight, raw.glassTrack);
    const rayEl = $('rayCount');
    const postEl = $('postCount');
    const rayWasManual = rayEl && rayEl.dataset.userEdited === 'true';
    const postWasManual = postEl && postEl.dataset.userEdited === 'true';

    if (rayEl && (force || !rayWasManual || String(rayEl.value || '').trim() === '')) {
      rayEl.value = auto.rayText || '';
      rayEl.dataset.userEdited = 'false';
    }

    const currentRayText = rayEl ? rayEl.value : auto.rayText;
    const autoPost = br.postCountFromRayText ? br.postCountFromRayText(currentRayText, raw.systemCount, raw.width, raw.frontHeight) : auto.postCount;
    if (postEl && (force || !postWasManual || String(postEl.value || '').trim() === '')) {
      postEl.value = autoPost === '' || autoPost === null || autoPost === undefined ? '' : String(autoPost);
      postEl.dataset.userEdited = 'false';
    }
  }

  function collectForm() {
    return ids.reduce((acc, id) => {
      const el = $(id);
      if (!el) return acc;
      const value = el.value;
      let normalized = upperTableFieldIds.includes(id)
        ? String(value || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        : value;
      if (BOOLEAN_FIELD_IDS.includes(id)) normalized = normalizeYesNo(normalized);
      acc[id] = normalized;
      return acc;
    }, {
      sideTrack: 'HAYIR',
      __manualPostPlacementMode: manualPostPlacementMode,
      __glassTrackProfile: sanitizeGlassTrackProfile(glassTrackProfileState),
      __glassTrackSupportProfiles: {
        left: sanitizeOptionalGlassTrackProfile(glassSupportProfileState.left),
        right: sanitizeOptionalGlassTrackProfile(glassSupportProfileState.right)
      },
      __frontPostCenters: Array.isArray(customFrontPostCenters) ? customFrontPostCenters.slice() : null,
      __sideSupportCenters: { ...customSideSupportCenters },
      __sidePosts: deepCloneJson(customSidePosts) || {},
      __frontPostProfiles: deepCloneJson(frontPostProfiles) || [],
      __slidingPlacements: slidingPlacements.map(item => ({ ...item })),
      __sideSlidingPlacements: sideSlidingPlacements.map(item => ({ ...item })),
      __guillotinePlacements: guillotinePlacements.map(item => ({ ...item })),
      __sideGuillotinePlacements: sideGuillotinePlacements.map(item => ({ ...item }))
    });
  }


  function historySignature(snapshot) {
    return JSON.stringify({
      formData: snapshot && snapshot.formData ? snapshot.formData : {},
      drawingState: snapshot && snapshot.drawingState ? snapshot.drawingState : {}
    });
  }

  function createHistoryEntry() {
    const snapshot = createProjectSnapshot();
    snapshot.savedAt = '';
    return { snapshot, signature: historySignature(snapshot) };
  }

  function updateHistoryControls() {
    const undoBtn = $('undoPreviewBtn');
    const redoBtn = $('redoPreviewBtn');
    const canUndo = projectHistory.index > 0;
    const canRedo = projectHistory.index >= 0 && projectHistory.index < projectHistory.entries.length - 1;
    const step = projectHistory.index >= 0 ? projectHistory.index + 1 : 0;
    const total = projectHistory.entries.length;
    if (undoBtn) {
      undoBtn.disabled = !canUndo;
      undoBtn.setAttribute('aria-disabled', canUndo ? 'false' : 'true');
      undoBtn.title = currentLanguage === 'en'
        ? `Undo (Ctrl+Z) · Step ${step}/${total}`
        : `Geri Al (Ctrl+Z) · Adım ${step}/${total}`;
    }
    if (redoBtn) {
      redoBtn.disabled = !canRedo;
      redoBtn.setAttribute('aria-disabled', canRedo ? 'false' : 'true');
      redoBtn.title = currentLanguage === 'en'
        ? `Redo (Ctrl+Y / Ctrl+Shift+Z) · Step ${step}/${total}`
        : `İleri Al (Ctrl+Y / Ctrl+Shift+Z) · Adım ${step}/${total}`;
    }
  }

  function resetProjectHistory(captureCurrent = false) {
    projectHistory.entries = [];
    projectHistory.index = -1;
    projectHistory.suspendDepth = 0;
    projectHistory.dirtyWhileSuspended = false;
    if (captureCurrent && lastDrawing) recordProjectHistoryState({ force: true });
    else updateHistoryControls();
  }

  function recordProjectHistoryState(options = {}) {
    if (projectHistory.restoring) return;
    if (projectHistory.suspendDepth > 0) {
      projectHistory.dirtyWhileSuspended = true;
      return;
    }
    let entry;
    try { entry = createHistoryEntry(); }
    catch (_) { return; }
    const current = projectHistory.entries[projectHistory.index];
    if (!options.force && current && current.signature === entry.signature) {
      updateHistoryControls();
      return;
    }
    if (projectHistory.index < projectHistory.entries.length - 1) {
      projectHistory.entries.splice(projectHistory.index + 1);
    }
    projectHistory.entries.push(entry);
    projectHistory.index = projectHistory.entries.length - 1;
    updateHistoryControls();
  }

  function beginHistoryTransaction() {
    projectHistory.suspendDepth += 1;
  }

  function endHistoryTransaction(commit = true) {
    if (projectHistory.suspendDepth > 0) projectHistory.suspendDepth -= 1;
    if (projectHistory.suspendDepth > 0) return;
    const shouldRecord = commit && projectHistory.dirtyWhileSuspended;
    projectHistory.dirtyWhileSuspended = false;
    if (shouldRecord) recordProjectHistoryState();
    else updateHistoryControls();
  }

  function clearPendingPreviewTimers() {
    ids.forEach(id => {
      const el = $(id);
      if (!el || !el._previewTimer) return;
      window.clearTimeout(el._previewTimer);
      el._previewTimer = null;
    });
  }

  function closeTransientPreviewEditorsForHistory() {
    toolboxSelectionMode = null;
    toolboxSelectionItems = new Map();
    if (toolboxContextMenu) toolboxContextMenu.hidden = true;
    if (toolboxSelectionBanner) toolboxSelectionBanner.hidden = true;
    pendingSlidingPlacementMeta = null;
    pendingGuillotinePlacementMeta = null;
    if (previewPanel) previewPanel.querySelectorAll('.dim-edit-overlay').forEach(node => { node.hidden = true; });
    refreshToolboxSelectionDecorations();
  }

  function snapshotForHistoryRestore(entry) {
    const snapshot = deepCloneJson(entry.snapshot);
    snapshot.record = deepCloneJson(currentProjectRecord);
    snapshot.uiSettings = {
      language: currentLanguage,
      dimensions: {
        main: isPreviewToggleOn($('showMainDims')),
        all: isPreviewToggleOn($('showAllDims'))
      }
    };
    return snapshot;
  }

  function restoreHistoryIndex(nextIndex, direction) {
    const entry = projectHistory.entries[nextIndex];
    if (!entry) return false;
    clearPendingPreviewTimers();
    closeTransientPreviewEditorsForHistory();
    projectHistory.restoring = true;
    let drawing = null;
    try {
      drawing = restoreProjectSnapshot(snapshotForHistoryRestore(entry), { resetZoom: false, requireValidDrawing: true });
    } catch (err) {
      statusText.textContent = err.message;
      console.error(err);
      return false;
    } finally {
      projectHistory.restoring = false;
    }
    if (!drawing) return false;
    projectHistory.index = nextIndex;
    updateHistoryControls();
    const step = projectHistory.index + 1;
    const total = projectHistory.entries.length;
    statusText.textContent = direction === 'redo'
      ? (currentLanguage === 'en' ? `Redone. History step ${step}/${total}.` : `İleri alındı. Geçmiş adımı ${step}/${total}.`)
      : (currentLanguage === 'en' ? `Undone. History step ${step}/${total}.` : `Geri alındı. Geçmiş adımı ${step}/${total}.`);
    focusPreviewCanvas();
    return true;
  }

  function flushCurrentStateBeforeHistoryMove() {
    if (projectHistory.restoring) return;
    clearPendingPreviewTimers();
    updatePreview(false);
  }

  function undoProjectHistory() {
    flushCurrentStateBeforeHistoryMove();
    if (projectHistory.index <= 0) {
      updateHistoryControls();
      return;
    }
    restoreHistoryIndex(projectHistory.index - 1, 'undo');
  }

  function redoProjectHistory() {
    flushCurrentStateBeforeHistoryMove();
    if (projectHistory.index < 0 || projectHistory.index >= projectHistory.entries.length - 1) {
      updateHistoryControls();
      return;
    }
    restoreHistoryIndex(projectHistory.index + 1, 'redo');
  }

  function bindHistoryKeyboardShortcuts() {
    document.addEventListener('keydown', evt => {
      if (!previewPanel || !previewPanel.classList.contains('is-expanded')) return;
      if (!(evt.ctrlKey || evt.metaKey) || evt.altKey) return;
      const active = document.activeElement;
      const tag = active && active.tagName ? active.tagName.toLowerCase() : '';
      if (active && (active.isContentEditable || ['input', 'textarea', 'select'].includes(tag))) return;
      const key = String(evt.key || '').toLowerCase();
      if (key === 'z') {
        evt.preventDefault();
        if (evt.shiftKey) redoProjectHistory();
        else undoProjectHistory();
      } else if (key === 'y') {
        evt.preventDefault();
        redoProjectHistory();
      }
    });
  }

  function firstNumber(value) {
    const token = String(value ?? '').split(';').map(s => s.trim()).find(s => s && s.toLocaleUpperCase('tr-TR') !== 'NO');
    const parsed = Number(String(token ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function validateInput(d) {
    const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
    const fieldNames = currentLanguage === 'en'
      ? { width: 'Width', opening: 'Projection', rearHeight: 'Rear H', frontHeight: 'Front H' }
      : { width: 'Genişlik', opening: 'Açılım', rearHeight: 'Arka H', frontHeight: 'Ön H' };
    const missing = [];
    if (firstNumber(d.width) <= 0) missing.push(fieldNames.width);
    if (firstNumber(d.opening) <= 0) missing.push(fieldNames.opening);
    if (firstNumber(d.rearHeight) <= 0) missing.push(fieldNames.rearHeight);
    if (firstNumber(d.frontHeight) <= 0) missing.push(fieldNames.frontHeight);
    if (missing.length) throw new Error(currentLanguage === 'en' ? `Fill: ${missing.join(', ')}.` : `${missing.join(', ')} alanlarını doldur.`);
  }

  function autosizeTextarea(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = Math.max(42, el.scrollHeight) + 'px';
  }

  function syncUpperInputWrap(data) {
    if (wrappingFields || !window.PulumurGeometry || typeof window.PulumurGeometry.wrapTextForUpperInput !== 'function') return;
    wrappingFields = true;
    try {
      upperTableFieldIds.forEach(id => {
        const el = $(id);
        if (!el || el.tagName !== 'TEXTAREA') return;
        const plain = String(el.value || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const wrapped = window.PulumurGeometry.wrapTextForUpperInput(plain, data);
        if (el.value !== wrapped) el.value = wrapped;
        autosizeTextarea(el);
      });
    } finally {
      wrappingFields = false;
    }
  }

  function updatePreview(resetZoom = false) {
    try {
      applyAutoRayPost(false);
      const data = collectForm();
      validateInput(data);
      const drawing = window.PulumurGeometry.buildDrawing(data);
      syncUpperInputWrap(data);
      lastDrawing = drawing;
      renderPreview(drawing, resetZoom);
      applyPreviewDimensionFilter();
      syncToolboxBooleanButtons();
      refreshToolboxSelectionDecorations();
      recordProjectHistoryState();
      const d = drawing.input;
      statusText.textContent = currentLanguage === 'en'
        ? `Ready: Page1 B1=${d.sayfa1 ? d.sayfa1.B1_width : Math.round(d.width)} | ${Math.round(d.opening)} mm projection, ${d.systems.map(s => s.rayCount).join(';')} rails, ${d.postCount} posts, angle ${window.PulumurGeometry.formatDeg(d.angle)}. Use the mouse wheel to zoom and drag with the left button to pan. V8.9.16: session-wide Undo/Redo history, centered bulk selectors, persistent expanded preview/zoom and per-position editable product dimensions are active; wall/fabric hatch scale is identical in preview, PDF and DXF; zoom extents and MESUT-MM remain active.`
        : `Hazır: Sayfa1 B1=${d.sayfa1 ? d.sayfa1.B1_width : Math.round(d.width)} | ${Math.round(d.opening)} mm açılım, ${d.systems.map(s => s.rayCount).join(';')} ray, ${d.postCount} dikme, açı ${window.PulumurGeometry.formatDeg(d.angle)}. Tekerlek ile zoom, sol tuş basılı sürükle ile pan. V8.9.16: oturum boyu Geri Al/İleri Al geçmişi, ortalanmış çoklu seçim kutuları, kalıcı büyük önizleme/zoom ve poz bazlı düzenlenebilir ürün ölçüleri aktiftir; duvar/kumaş tarama ölçeği önizleme, PDF ve DXF'te aynıdır; zoom extents ve MESUT-MM aktiftir.`;
      return drawing;
    } catch (err) {
      const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
      // Geçici/yanlış bir form değeri mevcut çizimi ve kullanıcının zoom/pan konumunu silmesin.
      if (!getPreviewSvg()) preview.innerHTML = `<div class="empty-state">${escapeHtml(txt.emptyPreview)}</div>`;
      statusText.textContent = err.message;
      return null;
    }
  }


  function isPreviewToggleOn(el) {
    return !!(el && el.classList.contains('is-on'));
  }

  function setPreviewToggleState(el, on) {
    if (!el) return;
    el.classList.toggle('is-on', !!on);
    el.classList.toggle('is-off', !on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function applyPreviewDimensionFilter() {
    const mainEl = $('showMainDims');
    const allEl = $('showAllDims');
    const showMain = isPreviewToggleOn(mainEl);
    const showAll = showMain && isPreviewToggleOn(allEl);
    previewDimensionFilter.main = showMain;
    previewDimensionFilter.all = showAll;

    preview.querySelectorAll('.editable-dimension, .preview-dimension-plain').forEach(node => {
      const type = (node.dataset.dimensionType || 'main').toLowerCase();
      const isDetail = type === 'detail';
      const visible = showMain ? (showAll ? true : !isDetail) : false;
      node.style.display = visible ? '' : 'none';
    });
  }

  function bindPreviewFilterControls() {
    const mainEl = $('showMainDims');
    const allEl = $('showAllDims');
    if (!mainEl || !allEl) return;

    const applyState = () => {
      if (!isPreviewToggleOn(mainEl)) setPreviewToggleState(allEl, false);
      applyPreviewDimensionFilter();
    };

    mainEl.onclick = () => {
      const next = !isPreviewToggleOn(mainEl);
      setPreviewToggleState(mainEl, next);
      if (!next) setPreviewToggleState(allEl, false);
      applyState();
    };

    allEl.onclick = () => {
      const next = !isPreviewToggleOn(allEl);
      if (next) setPreviewToggleState(mainEl, true);
      setPreviewToggleState(allEl, next);
      applyState();
    };

    setPreviewToggleState(mainEl, true);
    setPreviewToggleState(allEl, false);
    applyState();
  }

  function getPreviewStage() {
    return preview.querySelector('.preview-stage');
  }

  function getPreviewSvg() {
    return preview.querySelector('svg');
  }

  function getSvgViewBoxSize(svg) {
    const vb = svg && svg.viewBox && svg.viewBox.baseVal;
    return {
      width: Math.max(1, vb && vb.width ? vb.width : (svg ? (svg.clientWidth || 1000) : 1000)),
      height: Math.max(1, vb && vb.height ? vb.height : (svg ? (svg.clientHeight || 1000) : 1000))
    };
  }

  function computePreviewFitScale(svg) {
    const box = getSvgViewBoxSize(svg);
    const padding = 24;
    const availableW = Math.max(120, preview.clientWidth - padding * 2);
    const availableH = Math.max(120, preview.clientHeight - padding * 2);
    return Math.max(0.01, Math.min(availableW / box.width, availableH / box.height));
  }

  function applyPreviewScale() {
    const stage = getPreviewStage();
    const svg = getPreviewSvg();
    if (!stage || !svg) return;
    const box = getSvgViewBoxSize(svg);
    previewState.baseScale = computePreviewFitScale(svg);
    const totalScale = previewState.baseScale * previewState.zoom;
    stage.style.width = `${Math.max(80, box.width * totalScale)}px`;
    stage.style.height = `${Math.max(80, box.height * totalScale)}px`;
  }

  function renderPreview(drawing, resetZoom = false) {
    const svg = window.PulumurGeometry.renderSvg(drawing);
    const oldStage = getPreviewStage();
    const oldSvg = getPreviewSvg();

    // KALICI ÖNİZLEME KURALI (v8.9.15+): İlk çizim veya kullanıcının açıkça
    // “Çizimi Sığdır” komutu dışında zoom/pan yeniden hesaplanmaz.
    if (resetZoom || !oldStage || !oldSvg) {
      preview.innerHTML = `<div class="preview-stage">${svg}</div>`;
      previewState.zoom = 1;
      preview.scrollLeft = 0;
      preview.scrollTop = 0;
      window.requestAnimationFrame(() => applyPreviewScale());
      return;
    }

    // Dinamik güncellemelerde mevcut zoom/pan sahnesini bozmadan sadece SVG içeriğini yenile.
    const keepLeftRatio = preview.scrollLeft / Math.max(1, preview.scrollWidth - preview.clientWidth);
    const keepTopRatio = preview.scrollTop / Math.max(1, preview.scrollHeight - preview.clientHeight);
    const totalScale = Math.max(0.0001, (Number(previewState.baseScale) || 1) * (Number(previewState.zoom) || 1));
    const keepWorldCenterX = (preview.scrollLeft + preview.clientWidth / 2) / totalScale;
    const keepWorldCenterY = (preview.scrollTop + preview.clientHeight / 2) / totalScale;
    const keepScrollLeft = preview.scrollLeft;
    const keepScrollTop = preview.scrollTop;

    if (oldStage && oldSvg) {
      const temp = document.createElement('div');
      temp.innerHTML = svg;
      const nextSvg = temp.firstElementChild;
      if (nextSvg) {
        oldSvg.replaceWith(nextSvg);
        // Yeni çizimin viewBox ölçüsü değişse bile aynı gerçek ölçek korunur.
        // Böylece ürün/ölçü düzenleme sonrasında kullanıcının zoom seviyesi değişmez.
        const nextBox = getSvgViewBoxSize(nextSvg);
        oldStage.style.width = `${Math.max(80, nextBox.width * totalScale)}px`;
        oldStage.style.height = `${Math.max(80, nextBox.height * totalScale)}px`;
        const restore = () => {
          preview.scrollLeft = Math.max(0, keepWorldCenterX * totalScale - preview.clientWidth / 2);
          preview.scrollTop = Math.max(0, keepWorldCenterY * totalScale - preview.clientHeight / 2);
        };
        restore();
        window.requestAnimationFrame(restore);
        return;
      }
    }

    // Yedek yol: stage yoksa kur ama zoom resetleme.
    preview.innerHTML = `<div class="preview-stage">${svg}</div>`;
    const stage = getPreviewStage();
    const newSvg = getPreviewSvg();
    if (stage && newSvg) {
      const box = getSvgViewBoxSize(newSvg);
      const totalScale = Math.max(0.0001, (Number(previewState.baseScale) || 1) * (Number(previewState.zoom) || 1));
      stage.style.width = `${Math.max(80, box.width * totalScale)}px`;
      stage.style.height = `${Math.max(80, box.height * totalScale)}px`;
    }
    preview.scrollLeft = keepScrollLeft;
    preview.scrollTop = keepScrollTop;
    window.requestAnimationFrame(() => {
      preview.scrollLeft = keepScrollLeft || keepLeftRatio * Math.max(1, preview.scrollWidth - preview.clientWidth);
      preview.scrollTop = keepScrollTop || keepTopRatio * Math.max(1, preview.scrollHeight - preview.clientHeight);
    });
  }

  function fitPreview() {
    previewState.zoom = 1;
    preview.scrollLeft = 0;
    preview.scrollTop = 0;
    applyPreviewScale();
  }

  function setPreviewZoom(nextZoom, clientX, clientY) {
    const svg = getPreviewSvg();
    if (!svg) return;
    const rect = preview.getBoundingClientRect();
    const oldScale = Math.max(0.0001, previewState.baseScale * previewState.zoom);
    const localX = (clientX ?? (rect.left + rect.width / 2)) - rect.left;
    const localY = (clientY ?? (rect.top + rect.height / 2)) - rect.top;
    const worldX = (preview.scrollLeft + localX) / oldScale;
    const worldY = (preview.scrollTop + localY) / oldScale;
    previewState.zoom = Math.max(previewState.minZoom, Math.min(previewState.maxZoom, nextZoom));
    applyPreviewScale();
    const newScale = Math.max(0.0001, previewState.baseScale * previewState.zoom);
    preview.scrollLeft = Math.max(0, worldX * newScale - localX);
    preview.scrollTop = Math.max(0, worldY * newScale - localY);
  }


  function splitEditableList(value) {
    return String(value ?? '').split(';').map(x => x.trim()).filter(Boolean);
  }

  function updateEditableListValue(field, index, value, silent = false) {
    const el = $(field);
    if (!el || String(field || '').startsWith('__')) return;
    const clean = String(value ?? '').replace(/[^0-9]/g, '');
    if (!clean || Number(clean) <= 0) return;
    if (field === 'frontHeight') {
      el.value = clean;
      if (!silent) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    const list = splitEditableList(el.value);
    const count = Math.max(index + 1, list.length, lastDrawing && lastDrawing.input ? (lastDrawing.input.sidePositionCount || 1) : 1);
    const fallback = list[0] || clean;
    while (list.length < count) list.push(fallback);
    list[index] = clean;
    el.value = count > 1 ? list.join(';') : clean;
    if (field === 'width') { const postEl = $('postCount'); const rayEl = $('rayCount'); if (postEl) postEl.dataset.userEdited = 'false'; if (rayEl) rayEl.dataset.userEdited = 'false'; }
    if (!silent) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function currentEditableListValue(field, index, fallback) {
    const el = $(field);
    if (!el || String(field || '').startsWith('__')) return fallback || '';
    if (field === 'frontHeight') return String(el.value || fallback || '').trim();
    const list = splitEditableList(el.value);
    return String(list[index] || list[0] || fallback || '').trim();
  }

  function smartText(key, fallback) {
    const lang = currentLanguage === 'en' ? 'en' : 'tr';
    return key && key[lang] ? key[lang] : fallback;
  }

  function dimensionMetaFromHit(hit) {
    return {
      dimId: hit.dataset.dimId || '',
      field: hit.dataset.editField || '',
      index: Math.max(0, Number(hit.dataset.editIndex || 0) || 0),
      label: hit.dataset.editLabel || 'Ölçü',
      value: hit.dataset.editValue || '',
      view: hit.dataset.view || '',
      zoneId: hit.dataset.zoneId || '',
      editable: hit.dataset.editable !== 'false',
      dimensionType: hit.dataset.dimensionType || 'main',
      actionType: hit.dataset.actionType || 'main_resize',
      canResize: hit.dataset.canResize === 'true',
      canAddSameProfile: hit.dataset.canAddSameProfile === 'true',
      canAddDifferentProfile: hit.dataset.canAddDifferentProfile === 'true',
      canPlaceProduct: hit.dataset.canPlaceProduct === 'true',
      canRemoveElement: hit.dataset.canRemoveElement === 'true',
      passiveReason: hit.dataset.passiveReason || '',
      profileInstanceId: hit.dataset.profileInstanceId || '',
      sideGapIndex: Math.max(0, Number(hit.dataset.sideGapIndex || 0) || 0),
      sidePostId: hit.dataset.sidePostId || '',
      layer: hit.dataset.layer || ''
    };
  }

  function viewLabel(view) {
    const isEn = currentLanguage === 'en';
    const map = isEn
      ? { Top: 'Top View', Front: 'Front View', Side: 'Side View', Right: 'Right View' }
      : { Top: 'Üst Görünüş', Front: 'Ön Görünüş', Side: 'Yan Görünüş', Right: 'Sağ Görünüş' };
    return map[view] || view || (isEn ? 'Drawing' : 'Çizim');
  }

  function isFrontPostGapMeta(meta) {
    return !!meta && meta.view === 'Front' && /^front_post_gap_\d+$/i.test(String(meta.dimId || ''));
  }

  function isLeftSideSupportGapMeta(meta) {
    if (!meta || meta.view !== 'Side' || Number(meta.index) !== 0) return false;
    return /^side_(?:gap_0_\d+|wall_to_support_0|support_to_post_0|wall_to_post_0)$/i.test(String(meta.dimId || ''));
  }

  function currentSideSupportGeometry(meta) {
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : null;
    const map = d && d.sideSupportGeometry ? d.sideSupportGeometry : null;
    const geom = map ? (map[String(Number(meta && meta.index) || 0)] || map[Number(meta && meta.index) || 0]) : null;
    return geom && geom.exists ? geom : null;
  }

  function currentSideGap(meta) {
    const geom = currentSideSupportGeometry(meta);
    if (!geom || !Array.isArray(geom.gaps)) return null;
    const idx = Math.max(0, Number(meta && meta.sideGapIndex) || 0);
    return geom.gaps[idx] || null;
  }

  function materializeSidePosts(meta) {
    const key = String(Number(meta && meta.index) || 0);
    if (Object.prototype.hasOwnProperty.call(customSidePosts, key)) {
      return Array.isArray(customSidePosts[key]) ? customSidePosts[key].map(item => ({ ...item, profile: sanitizeGlassTrackProfile(item.profile) })) : [];
    }
    const geom = currentSideSupportGeometry(meta);
    const posts = geom && Array.isArray(geom.posts) ? geom.posts.map((post, i) => ({
      id: String(post.id || `side_${key}_${i}`),
      centerX: Number(post.centerX),
      profile: sanitizeGlassTrackProfile(post.profile || { mode: 'standard', en: post.width || 100, boy: 100, et: 2 })
    })) : [];
    customSidePosts[key] = posts;
    return posts.map(item => ({ ...item, profile: { ...item.profile } }));
  }

  function storeSidePosts(meta, posts) {
    const key = String(Number(meta && meta.index) || 0);
    customSidePosts[key] = posts.map(item => ({
      id: String(item.id || `side_${key}_${Date.now()}`),
      centerX: Number(item.centerX),
      profile: sanitizeGlassTrackProfile(item.profile)
    })).sort((a, b) => a.centerX - b.centerX);
    delete customSideSupportCenters[key];
  }

  function reindexSidePlacementsAfterInsert(sideIndex, gapIndex) {
    const shift = item => {
      if (Number(item.sideIndex) !== Number(sideIndex)) return item;
      const idx = Number(item.sideGapIndex ?? 0);
      if (idx === gapIndex) return null;
      return { ...item, sideGapIndex: idx > gapIndex ? idx + 1 : idx, sideZone: `gap_${idx > gapIndex ? idx + 1 : idx}` };
    };
    sideSlidingPlacements = sideSlidingPlacements.map(shift).filter(Boolean);
    sideGuillotinePlacements = sideGuillotinePlacements.map(shift).filter(Boolean);
  }

  function resizeLeftSideSupportGap(meta, targetGap) {
    const geom = currentSideSupportGeometry(meta);
    const gap = currentSideGap(meta);
    if (!geom || !gap || !Array.isArray(geom.posts) || !geom.posts.length) throw new Error(currentLanguage === 'en' ? 'No movable support post exists in this side view.' : 'Bu yan görünüşte hareket ettirilebilir destek dikmesi yok.');
    const target = Number(targetGap);
    if (!Number.isFinite(target) || target < 0) throw new Error(currentLanguage === 'en' ? 'Enter zero or a positive number.' : 'Sıfır veya pozitif bir sayı gir.');
    const posts = materializeSidePosts(meta);
    const gapIndex = Math.max(0, Math.min(posts.length, Number(meta.sideGapIndex) || 0));
    const movingIndex = gapIndex < posts.length ? gapIndex : posts.length - 1;
    const moving = posts[movingIndex];
    const width = Number(moving.profile && moving.profile.en) || 100;
    let nextCenter;
    if (gapIndex < posts.length) nextCenter = Number(gap.left) + target + width / 2;
    else nextCenter = Number(gap.right) - target - width / 2;
    const leftLimit = movingIndex === 0 ? Number(geom.wallX) : posts[movingIndex - 1].centerX + (Number(posts[movingIndex - 1].profile.en) || 100) / 2;
    const rightLimit = movingIndex === posts.length - 1 ? Number(geom.frontPostRearFace) : posts[movingIndex + 1].centerX - (Number(posts[movingIndex + 1].profile.en) || 100) / 2;
    if (nextCenter - width / 2 < leftLimit - 0.001 || nextCenter + width / 2 > rightLimit + 0.001) {
      throw new Error(currentLanguage === 'en' ? 'The support post would overlap another post, the wall or the front post.' : 'Destek dikmesi başka bir dikmeyle, duvarla veya ön dikmeyle üst üste gelir.');
    }
    moving.centerX = nextCenter;
    storeSidePosts(meta, posts);
  }

  function addSidePostToGap(meta, profile) {
    const geom = currentSideSupportGeometry(meta);
    const gap = currentSideGap(meta);
    if (!geom || !gap) throw new Error(currentLanguage === 'en' ? 'Side gap not found.' : 'Yan görünüş aralığı bulunamadı.');
    const nextProfile = sanitizeGlassTrackProfile(profile || { mode: 'standard', en: 100, boy: 100, et: 2 });
    const gapWidth = Number(gap.width) || (Number(gap.right) - Number(gap.left));
    if (gapWidth + 0.001 < nextProfile.en) throw new Error(currentLanguage === 'en' ? 'The selected gap is narrower than the profile.' : 'Seçilen aralık profil genişliğinden daha dar.');
    const posts = materializeSidePosts(meta);
    const gapIndex = Math.max(0, Number(meta.sideGapIndex) || 0);
    posts.push({ id: `side_${Number(meta.index) || 0}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, centerX: (Number(gap.left) + Number(gap.right)) / 2, profile: nextProfile });
    storeSidePosts(meta, posts);
    reindexSidePlacementsAfterInsert(Number(meta.index) || 0, gapIndex);
  }

  function deleteSidePost(sideIndex, postId) {
    const meta = { index: Number(sideIndex) || 0 };
    const posts = materializeSidePosts(meta);
    const next = posts.filter(item => String(item.id) !== String(postId));
    if (next.length === posts.length) throw new Error(currentLanguage === 'en' ? 'Support post not found.' : 'Destek dikmesi bulunamadı.');
    storeSidePosts(meta, next);
    sideSlidingPlacements = sideSlidingPlacements.filter(item => Number(item.sideIndex) !== Number(sideIndex));
    sideGuillotinePlacements = sideGuillotinePlacements.filter(item => Number(item.sideIndex) !== Number(sideIndex));
  }

  function sideProductMeta(meta) {
    const geom = currentSideSupportGeometry(meta);
    const gap = currentSideGap(meta);
    if (!geom || !gap) return null;
    const gapIndex = Math.max(0, Number(meta.sideGapIndex) || 0);
    const zoneWidth = Number(gap.width) || Math.max(0, Number(gap.right) - Number(gap.left));
    const placementHeight = Math.max(1, Number(geom.productClearHeight || 0) - 5);
    return {
      ...meta,
      placementView: 'side-left',
      sideIndex: Number(meta.index) || 0,
      sideGapIndex: gapIndex,
      sideZone: `gap_${gapIndex}`,
      value: zoneWidth,
      placementWidth: Math.max(1, zoneWidth - 5),
      placementHeight
    };
  }

  function productRecordForMeta(meta) {
    if (!meta) return null;
    const isSide = meta.placementView === 'side-left' || (meta.view === 'Side' && isLeftSideSupportGapMeta(meta));
    if (isSide) {
      const sideIndex = Number(meta.sideIndex ?? meta.index) || 0;
      const sideGapIndex = Number(meta.sideGapIndex) || 0;
      const sideZone = String(meta.sideZone || `gap_${sideGapIndex}`);
      const sliding = sideSlidingPlacements.find(item => Number(item.sideIndex) === sideIndex && (String(item.sideZone || '') === sideZone || Number(item.sideGapIndex) === sideGapIndex));
      if (sliding) return { type: 'sliding_glass', placement: sliding, collection: 'sideSlidingPlacements', isSide: true };
      const guillotine = sideGuillotinePlacements.find(item => Number(item.sideIndex) === sideIndex && (String(item.sideZone || '') === sideZone || Number(item.sideGapIndex) === sideGapIndex));
      if (guillotine) return { type: 'guillotine_glass', placement: guillotine, collection: 'sideGuillotinePlacements', isSide: true };
      return null;
    }
    const gapIndex = Number(meta.gapIndex ?? meta.index) || 0;
    const sliding = slidingPlacements.find(item => Number(item.gapIndex) === gapIndex);
    if (sliding) return { type: 'sliding_glass', placement: sliding, collection: 'slidingPlacements', isSide: false };
    const guillotine = guillotinePlacements.find(item => Number(item.gapIndex) === gapIndex);
    if (guillotine) return { type: 'guillotine_glass', placement: guillotine, collection: 'guillotinePlacements', isSide: false };
    return null;
  }

  function findProductForMeta(meta) {
    return productRecordForMeta(meta);
  }

  function findProductByInteraction(meta) {
    if (!meta) return null;
    const id = String(meta.placementId || '');
    const all = [
      ['sliding_glass', 'slidingPlacements', slidingPlacements],
      ['sliding_glass', 'sideSlidingPlacements', sideSlidingPlacements],
      ['guillotine_glass', 'guillotinePlacements', guillotinePlacements],
      ['guillotine_glass', 'sideGuillotinePlacements', sideGuillotinePlacements]
    ];
    for (const [type, collection, items] of all) {
      const placement = items.find(item => String(item.id || '') === id);
      if (placement) return { type, collection, placement, isSide: collection.startsWith('side') };
    }
    return productRecordForMeta(meta);
  }

  function deleteProductRecord(record) {
    if (!record || !record.placement) return false;
    const id = String(record.placement.id || '');
    const remove = items => items.filter(item => id ? String(item.id || '') !== id : item !== record.placement);
    if (record.collection === 'slidingPlacements') slidingPlacements = remove(slidingPlacements);
    else if (record.collection === 'sideSlidingPlacements') sideSlidingPlacements = remove(sideSlidingPlacements);
    else if (record.collection === 'guillotinePlacements') guillotinePlacements = remove(guillotinePlacements);
    else if (record.collection === 'sideGuillotinePlacements') sideGuillotinePlacements = remove(sideGuillotinePlacements);
    else return false;
    return true;
  }

  function setRadioGroupValue(overlay, name, value, fallback) {
    let matched = false;
    overlay.querySelectorAll(`input[name="${name}"]`).forEach(el => {
      el.checked = String(el.value) === String(value);
      if (el.checked) matched = true;
    });
    if (!matched && fallback !== undefined) {
      overlay.querySelectorAll(`input[name="${name}"]`).forEach(el => { el.checked = String(el.value) === String(fallback); });
    }
  }

  function allocatePozNos(prefix, count) {
    const source = prefix === 'S'
      ? [...slidingPlacements, ...sideSlidingPlacements]
      : [...guillotinePlacements, ...sideGuillotinePlacements];
    const used = new Set(source.map(item => String(item.pozNo || '').toUpperCase()));
    const result = [];
    let n = 1;
    while (result.length < count) {
      const candidate = `${prefix}${String(n).padStart(2, '0')}`;
      if (!used.has(candidate)) { result.push(candidate); used.add(candidate); }
      n += 1;
    }
    return result;
  }

  function frontProductMeta(meta) {
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : {};
    const clearWidth = Math.max(1, Number(meta.value) || 1);
    return {
      ...meta,
      placementView: 'front',
      gapIndex: Number(meta.index) || 0,
      placementWidth: Math.max(1, Number(meta.placementWidth) || clearWidth - 5),
      placementHeight: Math.max(1, Number(meta.placementHeight) || (Number(d.frontHeight || 0) - Number(d.parapetHeight || 0) - 5))
    };
  }

  function normalizedProductMeta(meta) {
    if (!meta) return null;
    if (meta.placementView === 'side-left' || isLeftSideSupportGapMeta(meta)) return sideProductMeta(meta);
    if (meta.placementView === 'front' || isFrontPostGapMeta(meta)) return frontProductMeta(meta);
    return null;
  }

  function interactionMetaToProductMeta(interactionMeta, record) {
    const placement = record && record.placement ? record.placement : {};
    if (interactionMeta.placementView === 'side-left' || record && record.isSide) {
      const sideIndex = Number(interactionMeta.sideIndex ?? placement.sideIndex) || 0;
      const sideGapIndex = Number(interactionMeta.sideGapIndex ?? placement.sideGapIndex) || 0;
      const node = preview.querySelector(`[data-dim-id="side_gap_${sideIndex}_${sideGapIndex}"]`);
      const fromDim = node ? sideProductMeta(dimensionMetaFromHit(node)) : null;
      return fromDim || {
        placementView: 'side-left', view: 'Side', index: sideIndex, sideIndex, sideGapIndex,
        sideZone: String(interactionMeta.sideZone || placement.sideZone || `gap_${sideGapIndex}`),
        value: Number(placement.width || 1) + 5, placementWidth: Number(placement.width || 1), placementHeight: Number(placement.height || 1)
      };
    }
    const gapIndex = Number(interactionMeta.gapIndex ?? placement.gapIndex) || 0;
    const node = preview.querySelector(`[data-dim-id="front_post_gap_${gapIndex + 1}"]`);
    const fromDim = node ? dimensionMetaFromHit(node) : null;
    return fromDim ? frontProductMeta(fromDim) : {
      placementView: 'front', view: 'Front', index: gapIndex, gapIndex,
      value: Number(placement.width || 1) + 5, placementWidth: Number(placement.width || 1), placementHeight: Number(placement.height || 1)
    };
  }

  function syncToolboxBooleanButtons() {
    const text = UI_TEXT[currentLanguage] || UI_TEXT.tr;
    const labels = {
      glassTrack: text.options_glassTrack,
      triangleJoinery: text.extra_triangleJoinery,
      waterStandard: text.extra_waterStandard
    };
    document.querySelectorAll('[data-boolean-field]').forEach(btn => {
      const field = btn.dataset.booleanField;
      const select = $(field);
      if (!select) return;
      const value = normalizeYesNo(select.value) === 'EVET' ? 'EVET' : 'HAYIR';
      const labelEl = btn.querySelector('.boolean-quick-label');
      const stateEl = btn.querySelector('.boolean-quick-state');
      if (labelEl) labelEl.textContent = labels[field] || field;
      if (stateEl) stateEl.textContent = BOOLEAN_CANONICAL[value][currentLanguage];
      btn.classList.toggle('is-yes', value === 'EVET');
      btn.classList.toggle('is-no', value !== 'EVET');
      btn.setAttribute('aria-pressed', value === 'EVET' ? 'true' : 'false');
    });
  }

  function toggleToolboxBoolean(field) {
    const select = $(field);
    if (!select) return;
    select.value = normalizeYesNo(select.value) === 'EVET' ? 'HAYIR' : 'EVET';
    syncToolboxBooleanButtons();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function toolboxSelectionKey(type, meta) {
    if (type === 'product') {
      const id = String(meta.placementId || '').trim();
      if (id) return `product:${id}`;
      const view = String(meta.placementView || 'front');
      const zone = view === 'side-left'
        ? `${Number(meta.sideIndex) || 0}:${String(meta.sideZone || `gap_${Number(meta.sideGapIndex) || 0}`)}`
        : String(Number(meta.gapIndex) || 0);
      return `product:${String(meta.productType || 'product')}:${view}:${zone}`;
    }
    return `dimension:${String(meta.dimId || '')}`;
  }

  function isEligibleToolboxDimension(meta, mode) {
    if (!meta) return false;
    if (mode === 'multi-product') {
      const productMeta = normalizedProductMeta(meta);
      return !!productMeta && !!meta.canPlaceProduct && !productRecordForMeta(productMeta);
    }
    if (mode === 'multi-dimension') {
      if (!meta.editable || !meta.canResize) return false;
      if (isFrontPostGapMeta(meta)) {
        const count = lastDrawing && lastDrawing.input ? Number(lastDrawing.input.postCount) || 0 : 0;
        return count > 2;
      }
      return true;
    }
    return false;
  }

  function createToolboxMarker(hit, selected) {
    const ns = 'http://www.w3.org/2000/svg';
    const host = hit.closest('g') || hit.parentNode;
    if (!host || !host.appendChild) return;
    const x = Number(hit.getAttribute('x') || 0);
    const y = Number(hit.getAttribute('y') || 0);
    const w = Math.max(1, Number(hit.getAttribute('width') || 0));
    const h = Math.max(1, Number(hit.getAttribute('height') || 0));
    const size = Math.max(110, Math.min(220, Math.max(110, Math.min(w, h) * 0.22)));
    // Çoklu seçim kutusu ölçünün/ürünün tam orta noktasında gösterilir.
    const markerX = x + (w - size) / 2;
    const markerY = y + (h - size) / 2;
    const marker = document.createElementNS(ns, 'g');
    marker.setAttribute('class', `toolbox-selection-marker${selected ? ' is-selected' : ''}`);
    marker.setAttribute('pointer-events', 'none');
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(markerX)); rect.setAttribute('y', String(markerY));
    rect.setAttribute('width', String(size)); rect.setAttribute('height', String(size));
    rect.setAttribute('rx', String(size * 0.18)); rect.setAttribute('ry', String(size * 0.18));
    const check = document.createElementNS(ns, 'path');
    check.setAttribute('d', `M ${markerX + size * 0.25} ${markerY + size * 0.58} L ${markerX + size * 0.48} ${markerY + size * 0.82} L ${markerX + size * 0.88} ${markerY + size * 0.30}`);
    marker.append(rect, check);
    host.appendChild(marker);
  }

  function refreshToolboxSelectionDecorations() {
    preview.querySelectorAll('.toolbox-selection-marker').forEach(node => node.remove());
    preview.querySelectorAll('.toolbox-selectable,.toolbox-selected').forEach(node => node.classList.remove('toolbox-selectable', 'toolbox-selected'));
    preview.classList.toggle('toolbox-selection-active', !!toolboxSelectionMode);
    updateToolboxSelectionBanner();
    ['multiProductBtn','multiDimensionBtn','multiDeleteBtn'].forEach(id => {
      const btn = $(id); if (btn) btn.classList.toggle('is-active-command',
        (id === 'multiProductBtn' && toolboxSelectionMode === 'multi-product') ||
        (id === 'multiDimensionBtn' && toolboxSelectionMode === 'multi-dimension') ||
        (id === 'multiDeleteBtn' && toolboxSelectionMode === 'multi-delete'));
    });
    if (!toolboxSelectionMode) return;
    if (toolboxSelectionMode === 'multi-delete') {
      preview.querySelectorAll('[data-interaction-type="productEditor"]').forEach(hit => {
        const meta = previewInteractionMetaFromHit(hit);
        const key = toolboxSelectionKey('product', meta);
        hit.classList.add('toolbox-selectable');
        if (toolboxSelectionItems.has(key)) hit.classList.add('toolbox-selected');
        createToolboxMarker(hit, toolboxSelectionItems.has(key));
      });
      return;
    }
    preview.querySelectorAll('.editable-dimension').forEach(group => {
      const meta = dimensionMetaFromHit(group);
      if (!isEligibleToolboxDimension(meta, toolboxSelectionMode)) return;
      const key = toolboxSelectionKey('dimension', meta);
      const hit = group.querySelector('.editable-dimension-hit') || group;
      group.classList.add('toolbox-selectable');
      if (toolboxSelectionItems.has(key)) group.classList.add('toolbox-selected');
      createToolboxMarker(hit, toolboxSelectionItems.has(key));
    });
  }

  function selectionMetaFromTarget(target) {
    if (!toolboxSelectionMode || !target || !target.closest) return null;
    if (toolboxSelectionMode === 'multi-delete') {
      const hit = target.closest('[data-interaction-type="productEditor"]');
      if (!hit) return null;
      const meta = previewInteractionMetaFromHit(hit);
      return { type: 'product', meta, key: toolboxSelectionKey('product', meta) };
    }
    const group = target.closest('.editable-dimension');
    if (!group) return null;
    const meta = dimensionMetaFromHit(group);
    if (!isEligibleToolboxDimension(meta, toolboxSelectionMode)) return null;
    return { type: 'dimension', meta, key: toolboxSelectionKey('dimension', meta) };
  }

  function toggleToolboxSelectionFromHit(target) {
    const candidate = selectionMetaFromTarget(target);
    if (!candidate) return;
    if (toolboxSelectionItems.has(candidate.key)) toolboxSelectionItems.delete(candidate.key);
    else toolboxSelectionItems.set(candidate.key, candidate.meta);
    refreshToolboxSelectionDecorations();
    const count = toolboxSelectionItems.size;
    statusText.textContent = currentLanguage === 'en' ? `${count} item(s) selected. Press Enter or right-click to finish.` : `${count} öğe seçildi. Bitirmek için Enter'a bas veya sağ tıkla.`;
  }

  function hideToolboxContextMenu() {
    if (toolboxContextMenu) toolboxContextMenu.hidden = true;
  }

  function ensureToolboxSelectionBanner() {
    if (toolboxSelectionBanner) return toolboxSelectionBanner;
    toolboxSelectionBanner = document.createElement('div');
    toolboxSelectionBanner.className = 'toolbox-selection-banner';
    toolboxSelectionBanner.hidden = true;
    toolboxSelectionBanner.innerHTML = `<span class="toolbox-selection-banner-text"></span><span class="toolbox-selection-banner-actions"><button type="button" data-action="finish">Tamam / Enter</button><button type="button" data-action="cancel">İptal / Esc</button></span>`;
    const host = previewPanel.querySelector('.preview-workspace') || previewPanel;
    host.appendChild(toolboxSelectionBanner);
    toolboxSelectionBanner.addEventListener('click', evt => {
      const action = evt.target && evt.target.dataset ? evt.target.dataset.action : '';
      if (action === 'finish') finishToolboxSelection();
      else if (action === 'cancel') cancelToolboxSelection(currentLanguage === 'en' ? 'Selection cancelled.' : 'Seçim iptal edildi.');
    });
    return toolboxSelectionBanner;
  }

  function updateToolboxSelectionBanner() {
    const banner = ensureToolboxSelectionBanner();
    if (!toolboxSelectionMode) { banner.hidden = true; return; }
    const count = toolboxSelectionItems.size;
    const modeText = {
      'multi-product': currentLanguage === 'en' ? 'Select product placement dimensions.' : 'Ürün eklenecek ölçüleri seç.',
      'multi-dimension': currentLanguage === 'en' ? 'Select dimensions to edit.' : 'Düzenlenecek ölçüleri seç.',
      'multi-delete': currentLanguage === 'en' ? 'Select products to delete.' : 'Silinecek ürünleri seç.'
    }[toolboxSelectionMode] || '';
    const countText = currentLanguage === 'en' ? `${count} selected` : `${count} seçili`;
    banner.querySelector('.toolbox-selection-banner-text').textContent = `${modeText} ${countText}`;
    const buttons = banner.querySelectorAll('button');
    if (buttons[0]) buttons[0].textContent = currentLanguage === 'en' ? 'Finish / Enter' : 'Tamam / Enter';
    if (buttons[1]) buttons[1].textContent = currentLanguage === 'en' ? 'Cancel / Esc' : 'İptal / Esc';
    banner.hidden = false;
  }

  function ensureToolboxContextMenu() {
    if (toolboxContextMenu) return toolboxContextMenu;
    toolboxContextMenu = document.createElement('div');
    toolboxContextMenu.className = 'toolbox-context-menu';
    toolboxContextMenu.hidden = true;
    toolboxContextMenu.innerHTML = `<button type="button" data-action="finish">Tamam / Enter</button><button type="button" data-action="cancel">İptal / Escape</button>`;
    document.body.appendChild(toolboxContextMenu);
    toolboxContextMenu.addEventListener('click', evt => {
      const action = evt.target && evt.target.dataset ? evt.target.dataset.action : '';
      if (action === 'finish') finishToolboxSelection();
      else if (action === 'cancel') cancelToolboxSelection();
    });
    document.addEventListener('mousedown', evt => { if (toolboxContextMenu && !toolboxContextMenu.contains(evt.target)) hideToolboxContextMenu(); });
    return toolboxContextMenu;
  }

  function showToolboxContextMenu(x, y) {
    const menu = ensureToolboxContextMenu();
    const buttons = menu.querySelectorAll('button');
    if (buttons[0]) buttons[0].textContent = currentLanguage === 'en' ? 'Finish / Enter' : 'Tamam / Enter';
    if (buttons[1]) buttons[1].textContent = currentLanguage === 'en' ? 'Cancel / Escape' : 'İptal / Escape';
    menu.style.left = `${Math.max(8, Math.min(window.innerWidth - 210, x))}px`;
    menu.style.top = `${Math.max(8, Math.min(window.innerHeight - 110, y))}px`;
    menu.hidden = false;
  }

  function startToolboxSelection(mode) {
    if (toolboxSelectionMode === mode) {
      cancelToolboxSelection(currentLanguage === 'en' ? 'Selection cancelled.' : 'Seçim iptal edildi.');
      return;
    }
    if (!lastDrawing) updatePreview(false);
    if (!lastDrawing) return;
    toolboxSelectionMode = mode;
    toolboxSelectionItems = new Map();
    hideToolboxContextMenu();
    refreshToolboxSelectionDecorations();
    const messages = {
      'multi-product': currentLanguage === 'en' ? 'Select product placement dimensions, then press Enter or right-click.' : 'Ürün eklenecek ölçüleri seç; sonra Enter’a bas veya sağ tıkla.',
      'multi-dimension': currentLanguage === 'en' ? 'Select dimensions to edit, then press Enter or right-click.' : 'Düzenlenecek ölçüleri seç; sonra Enter’a bas veya sağ tıkla.',
      'multi-delete': currentLanguage === 'en' ? 'Select products to delete, then press Enter or right-click.' : 'Silinecek ürünleri seç; sonra Enter’a bas veya sağ tıkla.'
    };
    statusText.textContent = messages[mode] || '';
    focusPreviewCanvas();
  }

  function cancelToolboxSelection(message = '') {
    toolboxSelectionMode = null;
    toolboxSelectionItems = new Map();
    hideToolboxContextMenu();
    refreshToolboxSelectionDecorations();
    if (message) statusText.textContent = message;
  }

  function ensureBulkProductChooser() {
    let overlay = $('bulkProductChooserOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'bulkProductChooserOverlay';
    overlay.className = 'dim-edit-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<form class="dim-edit-card bulk-product-chooser-card"><div class="dim-edit-title" id="bulkProductChooserTitle">Çoklu Ürün Ekleme</div><div id="bulkProductChooserRows" class="bulk-selection-list"></div><label class="dim-edit-label"><span id="bulkProductTypeLabel">Ürün</span><select id="bulkProductType"><option value="sliding_glass">Sürme Cam</option><option value="guillotine_glass">Giyotin Cam</option></select></label><div class="dim-edit-actions"><button id="bulkProductChooserCancel" type="button" class="dim-edit-cancel">İptal</button><button type="submit" class="dim-edit-apply">Tamam</button></div></form>`;
    previewPanel.appendChild(overlay);
    overlay.querySelector('#bulkProductChooserCancel').addEventListener('click', () => { overlay.hidden = true; });
    overlay.addEventListener('mousedown', evt => { if (evt.target === overlay) overlay.hidden = true; });
    overlay.querySelector('form').addEventListener('submit', evt => {
      evt.preventDefault();
      const metas = Array.isArray(overlay._metas) ? overlay._metas : [];
      const product = overlay.querySelector('#bulkProductType').value;
      overlay.hidden = true;
      if (product === 'guillotine_glass') showGuillotineDetailsOverlay({ batchMetas: metas, bulk: true });
      else showSlidingDetailsOverlay({ batchMetas: metas, bulk: true });
    });
    return overlay;
  }

  function showBulkProductChooser(metas) {
    const overlay = ensureBulkProductChooser();
    overlay._metas = metas.map(meta => ({ ...meta }));
    const isEn = currentLanguage === 'en';
    overlay.querySelector('#bulkProductChooserTitle').textContent = isEn ? 'Multiple Product Placement' : 'Çoklu Ürün Ekleme';
    overlay.querySelector('#bulkProductTypeLabel').textContent = isEn ? 'Product' : 'Ürün';
    overlay.querySelector('#bulkProductChooserCancel').textContent = isEn ? 'Cancel' : 'İptal';
    const options = overlay.querySelectorAll('#bulkProductType option');
    if (options[0]) options[0].textContent = isEn ? 'Sliding Glass' : 'Sürme Cam';
    if (options[1]) options[1].textContent = isEn ? 'Guillotine' : 'Giyotin Cam';
    overlay.querySelector('#bulkProductChooserRows').innerHTML = metas.map((meta, i) => `<div><b>${i + 1}.</b> ${escapeHtml(viewLabel(meta.view))} · ${escapeHtml(meta.label || '')} · ${Math.round(Number(meta.placementWidth || 0))} × ${Math.round(Number(meta.placementHeight || 0))} mm</div>`).join('');
    overlay.hidden = false;
    window.setTimeout(() => overlay.querySelector('#bulkProductType').focus({ preventScroll: true }), 20);
  }

  function captureBulkEditState() {
    return createProjectSnapshot();
  }

  function applyDimensionValueForBulk(meta, value) {
    if (isLeftSideSupportGapMeta(meta)) resizeLeftSideSupportGap(meta, value);
    else if (isFrontPostGapMeta(meta)) resizeFrontPostGap(meta, value);
    else {
      if (!meta.canResize || String(meta.field || '').startsWith('__')) throw new Error(currentLanguage === 'en' ? `${meta.label}: not directly editable.` : `${meta.label}: doğrudan düzenlenebilir değil.`);
      updateEditableListValue(meta.field, meta.index, String(value), true);
    }
    const drawing = updatePreview(false);
    if (!drawing) throw new Error(statusText.textContent || (currentLanguage === 'en' ? 'Drawing could not be rebuilt.' : 'Çizim yeniden oluşturulamadı.'));
  }

  function ensureBulkDimensionOverlay() {
    let overlay = $('bulkDimensionOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'bulkDimensionOverlay';
    overlay.className = 'dim-edit-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<form class="dim-edit-card bulk-dimension-card"><div class="dim-edit-title" id="bulkDimensionTitle">Çoklu Ölçü Düzenleme</div><div id="bulkDimensionRows" class="bulk-selection-list"></div><label class="dim-edit-label"><span id="bulkDimensionValueLabel">Yeni ölçü *(mm)</span><input id="bulkDimensionValue" type="text" inputmode="numeric" autocomplete="off"></label><div id="bulkDimensionError" class="dim-edit-error"></div><div class="dim-edit-actions"><button id="bulkDimensionCancel" type="button" class="dim-edit-cancel">İptal</button><button type="submit" class="dim-edit-apply">Tamam</button></div></form>`;
    previewPanel.appendChild(overlay);
    const input = overlay.querySelector('#bulkDimensionValue');
    input.addEventListener('input', () => { input.value = String(input.value || '').replace(/[^0-9]/g, ''); overlay.querySelector('#bulkDimensionError').textContent = ''; });
    overlay.querySelector('#bulkDimensionCancel').addEventListener('click', () => { overlay.hidden = true; });
    overlay.addEventListener('mousedown', evt => { if (evt.target === overlay) overlay.hidden = true; });
    overlay.querySelector('form').addEventListener('submit', evt => {
      evt.preventDefault();
      const metas = Array.isArray(overlay._metas) ? overlay._metas : [];
      const value = Number(input.value || 0);
      const error = overlay.querySelector('#bulkDimensionError');
      if (!(value > 0)) { error.textContent = currentLanguage === 'en' ? 'Enter a positive number.' : 'Pozitif bir sayı gir.'; return; }
      const rollback = captureBulkEditState();
      suppressFormPreviewUpdate = true;
      beginHistoryTransaction();
      let commitHistory = false;
      try {
        metas.forEach(meta => applyDimensionValueForBulk(meta, value));
        overlay.hidden = true;
        commitHistory = true;
        statusText.textContent = currentLanguage === 'en' ? `${metas.length} dimensions updated.` : `${metas.length} ölçü güncellendi.`;
      } catch (err) {
        projectHistory.restoring = true;
        try { restoreProjectSnapshot(rollback, { resetZoom: false }); } catch (_) {}
        finally { projectHistory.restoring = false; }
        error.textContent = err.message;
      } finally {
        suppressFormPreviewUpdate = false;
        endHistoryTransaction(commitHistory);
      }
    });
    return overlay;
  }

  function showBulkDimensionOverlay(metas) {
    const overlay = ensureBulkDimensionOverlay();
    const isEn = currentLanguage === 'en';
    overlay._metas = metas.map(meta => ({ ...meta }));
    overlay.querySelector('#bulkDimensionTitle').textContent = isEn ? 'Multiple Dimension Editing' : 'Çoklu Ölçü Düzenleme';
    overlay.querySelector('#bulkDimensionValueLabel').textContent = isEn ? 'New dimension *(mm)' : 'Yeni ölçü *(mm)';
    overlay.querySelector('#bulkDimensionCancel').textContent = isEn ? 'Cancel' : 'İptal';
    overlay.querySelector('#bulkDimensionRows').innerHTML = metas.map((meta, i) => `<div><b>${i + 1}.</b> ${escapeHtml(viewLabel(meta.view))} · ${escapeHtml(meta.label || '')} · ${escapeHtml(String(meta.value || ''))} mm</div>`).join('');
    overlay.querySelector('#bulkDimensionValue').value = '';
    overlay.querySelector('#bulkDimensionError').textContent = '';
    overlay.hidden = false;
    window.setTimeout(() => overlay.querySelector('#bulkDimensionValue').focus({ preventScroll: true }), 20);
  }

  function finishToolboxSelection() {
    hideToolboxContextMenu();
    if (!toolboxSelectionMode) return;
    if (!toolboxSelectionItems.size) {
      statusText.textContent = currentLanguage === 'en' ? 'Select at least one item.' : 'En az bir öğe seç.';
      return;
    }
    const mode = toolboxSelectionMode;
    const items = Array.from(toolboxSelectionItems.values());
    cancelToolboxSelection();
    if (mode === 'multi-product') {
      const metas = items.map(normalizedProductMeta).filter(Boolean);
      showBulkProductChooser(metas);
      return;
    }
    if (mode === 'multi-dimension') {
      showBulkDimensionOverlay(items);
      return;
    }
    if (mode === 'multi-delete') {
      const records = items.map(findProductByInteraction).filter(Boolean);
      const ok = window.confirm(currentLanguage === 'en' ? `Delete ${records.length} selected product(s)?` : `${records.length} seçili ürün silinsin mi?`);
      if (!ok) return;
      records.forEach(deleteProductRecord);
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en' ? `${records.length} products deleted.` : `${records.length} ürün silindi.`;
    }
  }

  function deleteAllProducts() {
    if (toolboxSelectionMode) cancelToolboxSelection();
    const count = slidingPlacements.length + sideSlidingPlacements.length + guillotinePlacements.length + sideGuillotinePlacements.length + (normalizeYesNo($('triangleJoinery') && $('triangleJoinery').value) === 'EVET' ? 1 : 0);
    if (!count) {
      statusText.textContent = currentLanguage === 'en' ? 'There are no added products to delete.' : 'Silinecek eklenmiş ürün yok.';
      return;
    }
    if (!window.confirm(currentLanguage === 'en' ? 'Delete all sliding, guillotine and triangle joinery products?' : 'Tüm sürme, giyotin ve üçgen doğrama ürünleri silinsin mi?')) return;
    slidingPlacements = [];
    sideSlidingPlacements = [];
    guillotinePlacements = [];
    sideGuillotinePlacements = [];
    if ($('triangleJoinery')) $('triangleJoinery').value = 'HAYIR';
    syncToolboxBooleanButtons();
    updatePreview(false);
    statusText.textContent = currentLanguage === 'en' ? 'All added products were deleted.' : 'Sonradan eklenen tüm ürünler silindi.';
  }

  function currentFrontPostCenters() {
    const fromDrawing = lastDrawing && lastDrawing.input && Array.isArray(lastDrawing.input.postCenterXs)
      ? lastDrawing.input.postCenterXs.map(Number)
      : [];
    if (Array.isArray(customFrontPostCenters) && customFrontPostCenters.length === fromDrawing.length) {
      return customFrontPostCenters.map(Number);
    }
    return fromDrawing;
  }


  function currentFrontPostProfiles(count = null) {
    const n = count == null ? currentFrontPostCenters().length : Math.max(0, Number(count) || 0);
    return Array.from({ length: n }, (_, i) => frontPostProfiles[i] ? sanitizeGlassTrackProfile(frontPostProfiles[i]) : null);
  }

  function frontPostWidthAt(index) {
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : {};
    const widths = Array.isArray(d.frontPostWidths) ? d.frontPostWidths : [];
    return Math.max(1, Number(widths[index]) || 100);
  }

  function shiftFrontPlacementsAfterInsert(gapIndex) {
    const shift = item => {
      const idx = Number(item.gapIndex) || 0;
      if (idx === gapIndex) return null;
      return { ...item, gapIndex: idx > gapIndex ? idx + 1 : idx };
    };
    slidingPlacements = slidingPlacements.map(shift).filter(Boolean);
    guillotinePlacements = guillotinePlacements.map(shift).filter(Boolean);
  }

  function insertFrontPostInGap(meta, profile = null) {
    const centers = currentFrontPostCenters();
    const gapIndex = Math.max(0, Number(meta.index) || 0);
    if (gapIndex >= centers.length - 1) throw new Error(currentLanguage === 'en' ? 'Front post gap not found.' : 'Ön dikme aralığı bulunamadı.');
    const leftFace = centers[gapIndex] + frontPostWidthAt(gapIndex) / 2;
    const rightFace = centers[gapIndex + 1] - frontPostWidthAt(gapIndex + 1) / 2;
    const nextProfile = profile ? sanitizeGlassTrackProfile(profile) : null;
    const nextWidth = nextProfile ? nextProfile.en : 100;
    if (rightFace - leftFace + 0.001 < nextWidth) throw new Error(currentLanguage === 'en' ? 'The selected gap is narrower than the post profile.' : 'Seçilen aralık dikme profilinden daha dar.');
    const center = (leftFace + rightFace) / 2;
    centers.splice(gapIndex + 1, 0, center);
    const profiles = currentFrontPostProfiles(centers.length - 1);
    profiles.splice(gapIndex + 1, 0, nextProfile);
    customFrontPostCenters = centers;
    frontPostProfiles = profiles;
    const postEl = $('postCount');
    if (postEl) { postEl.value = String(centers.length); postEl.dataset.userEdited = 'true'; }
    shiftFrontPlacementsAfterInsert(gapIndex);
  }

  function deleteFrontPost(postIndex) {
    const centers = currentFrontPostCenters();
    const idx = Math.max(0, Number(postIndex) || 0);
    if (centers.length <= 2) throw new Error(currentLanguage === 'en' ? 'At least two front posts must remain.' : 'En az iki ön dikme kalmalıdır.');
    if (idx >= centers.length) throw new Error(currentLanguage === 'en' ? 'Front post not found.' : 'Ön dikme bulunamadı.');
    centers.splice(idx, 1);
    const profiles = currentFrontPostProfiles(centers.length + 1);
    profiles.splice(idx, 1);
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : {};
    if (centers.length) {
      if (Number.isFinite(Number(d.solX))) centers[0] = Number(d.solX);
      if (Number.isFinite(Number(d.sagX))) centers[centers.length - 1] = Number(d.sagX);
    }
    const remap = item => {
      const gap = Number(item.gapIndex) || 0;
      const leftAdjacent = Math.max(0, idx - 1);
      if (gap === leftAdjacent || gap === idx) return null;
      return { ...item, gapIndex: gap > idx ? gap - 1 : gap };
    };
    slidingPlacements = slidingPlacements.map(remap).filter(Boolean);
    guillotinePlacements = guillotinePlacements.map(remap).filter(Boolean);
    customFrontPostCenters = centers;
    frontPostProfiles = profiles;
    const postEl = $('postCount');
    if (postEl) { postEl.value = String(centers.length); postEl.dataset.userEdited = 'true'; }
  }

  function nextSlidingPozNo() {
    const used = new Set([...slidingPlacements, ...sideSlidingPlacements].map(item => String(item.pozNo || '').toUpperCase()));
    let n = 1;
    while (used.has(`S${String(n).padStart(2, '0')}`)) n += 1;
    return `S${String(n).padStart(2, '0')}`;
  }

  function slidingPanelCount(width, openingType) {
    let count = Math.max(2, Math.ceil(Math.max(1, Number(width) || 1) / 1200));
    if (String(openingType || '').toUpperCase() === 'CENTER OPENING') {
      count = Math.max(4, count);
      if (count % 2 !== 0) count += 1;
    }
    return count;
  }

  function resizeFrontPostGap(meta, targetGap) {
    const centers = currentFrontPostCenters();
    const gapIndex = Math.max(0, Number(meta.index) || 0);
    if (centers.length < 3) {
      throw new Error(currentLanguage === 'en' ? 'The gap cannot be resized in a two-post system because the first and last posts are fixed.' : 'İki dikmeli sistemde ilk ve son dikme sabit olduğu için aralık değiştirilemez.');
    }
    if (gapIndex >= centers.length - 1) throw new Error(currentLanguage === 'en' ? 'Post gap not found.' : 'Dikme aralığı bulunamadı.');
    const isLastGap = gapIndex === centers.length - 2;
    const leftWidth = frontPostWidthAt(gapIndex);
    const rightWidth = frontPostWidthAt(gapIndex + 1);
    if (isLastGap) {
      const nextX = centers[gapIndex + 1] - rightWidth / 2 - targetGap - leftWidth / 2;
      if (gapIndex > 0) {
        const previousRight = centers[gapIndex - 1] + frontPostWidthAt(gapIndex - 1) / 2;
        if (nextX - leftWidth / 2 < previousRight - 0.001) throw new Error(currentLanguage === 'en' ? 'The entered dimension overlaps the previous post.' : 'Girilen ölçü bir önceki dikmeyle çakışmaya neden oluyor.');
      }
      centers[gapIndex] = nextX;
    } else {
      const nextX = centers[gapIndex] + leftWidth / 2 + targetGap + rightWidth / 2;
      if (gapIndex + 2 < centers.length) {
        const nextLeft = centers[gapIndex + 2] - frontPostWidthAt(gapIndex + 2) / 2;
        if (nextX + rightWidth / 2 > nextLeft + 0.001) throw new Error(currentLanguage === 'en' ? 'The entered dimension overlaps the next post.' : 'Girilen ölçü bir sonraki dikmeyle çakışmaya neden oluyor.');
      }
      centers[gapIndex + 1] = nextX;
    }
    customFrontPostCenters = centers;
    slidingPlacements = slidingPlacements.map(item => {
      if (Number(item.gapIndex) !== gapIndex) return item;
      const width = Math.max(1, targetGap - 5);
      return { ...item, width, panelCount: slidingPanelCount(width, item.openingType) };
    });
    guillotinePlacements = guillotinePlacements.map(item => Number(item.gapIndex) === gapIndex
      ? { ...item, width: Math.max(1, targetGap - 5) }
      : item);
  }

  function placementIsSide(meta) {
    return !!meta && meta.placementView === 'side-left';
  }

  function placementMetasFromPending(meta) {
    return Array.isArray(meta && meta.batchMetas) ? meta.batchMetas : (meta ? [meta] : []);
  }

  function storeSlidingPlacement(placement) {
    const isSide = placement.placementView === 'side-left';
    if (isSide) {
      sideSlidingPlacements = sideSlidingPlacements.filter(item => !(Number(item.sideIndex) === Number(placement.sideIndex) && String(item.sideZone) === String(placement.sideZone)) && String(item.id || '') !== String(placement.id || ''));
      sideGuillotinePlacements = sideGuillotinePlacements.filter(item => !(Number(item.sideIndex) === Number(placement.sideIndex) && String(item.sideZone) === String(placement.sideZone)));
      sideSlidingPlacements.push(placement);
    } else {
      slidingPlacements = slidingPlacements.filter(item => Number(item.gapIndex) !== Number(placement.gapIndex) && String(item.id || '') !== String(placement.id || ''));
      guillotinePlacements = guillotinePlacements.filter(item => Number(item.gapIndex) !== Number(placement.gapIndex));
      slidingPlacements.push(placement);
    }
  }

  function storeGuillotinePlacement(placement) {
    const isSide = placement.placementView === 'side-left';
    if (isSide) {
      sideGuillotinePlacements = sideGuillotinePlacements.filter(item => !(Number(item.sideIndex) === Number(placement.sideIndex) && String(item.sideZone) === String(placement.sideZone)) && String(item.id || '') !== String(placement.id || ''));
      sideSlidingPlacements = sideSlidingPlacements.filter(item => !(Number(item.sideIndex) === Number(placement.sideIndex) && String(item.sideZone) === String(placement.sideZone)));
      sideGuillotinePlacements.push(placement);
    } else {
      guillotinePlacements = guillotinePlacements.filter(item => Number(item.gapIndex) !== Number(placement.gapIndex) && String(item.id || '') !== String(placement.id || ''));
      slidingPlacements = slidingPlacements.filter(item => Number(item.gapIndex) !== Number(placement.gapIndex));
      guillotinePlacements.push(placement);
    }
  }

  function ensureSlidingDetailsOverlay() {
    let overlay = $('slidingDetailsOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'slidingDetailsOverlay';
    overlay.className = 'dim-edit-overlay sliding-details-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <form id="slidingDetailsForm" class="dim-edit-card sliding-details-card">
        <div class="sliding-modal-head">
          <div class="sliding-modal-title"><span class="sliding-title-icon" aria-hidden="true"></span><span data-sliding-text="title">Sliding Details</span></div>
          <button id="slidingDetailsClose" class="sliding-modal-close" type="button" aria-label="Close"><span aria-hidden="true"></span></button>
        </div>
        <div class="sliding-details-grid">
          <section class="sliding-choice-group sliding-series-group" role="group" aria-labelledby="slidingSeriesTitle">
            <div id="slidingSeriesTitle" class="sliding-group-title"><span class="sliding-group-icon icon-series" aria-hidden="true"></span><span data-sliding-text="productSeries">Product Series</span></div>
            <label><input type="radio" name="slidingSeries" value="A SERIES" checked><span data-sliding-text="aSeries">A Series</span></label>
            <label><input type="radio" name="slidingSeries" value="K SERIES"><span data-sliding-text="kSeries">K Series</span></label>
          </section>
          <section class="sliding-choice-group sliding-type-group" role="group" aria-labelledby="slidingTypeTitle">
            <div id="slidingTypeTitle" class="sliding-group-title"><span class="sliding-group-icon icon-type" aria-hidden="true"></span><span data-sliding-text="type">Type</span></div>
            <label><input type="radio" name="slidingType" value="WITH THRESHOLD" checked><span data-sliding-text="withThreshold">With Threshold</span></label>
            <label><input type="radio" name="slidingType" value="WITHOUT THRESHOLD"><span data-sliding-text="withoutThreshold">Without Threshold</span></label>
          </section>
          <section class="sliding-choice-group sliding-opening-group" role="group" aria-labelledby="slidingOpeningTitle">
            <div id="slidingOpeningTitle" class="sliding-group-title"><span class="sliding-group-icon icon-opening" aria-hidden="true"></span><span data-sliding-text="openingType">Opening Type</span></div>
            <label><input type="radio" name="slidingOpening" value="SIDE OPENING" checked><span data-sliding-text="sideOpening">Side Opening</span></label>
            <label><input type="radio" name="slidingOpening" value="CENTER OPENING"><span data-sliding-text="centerOpening">Center Opening</span></label>
          </section>
          <section class="sliding-choice-group sliding-thickness-group" role="group" aria-labelledby="slidingThicknessTitle">
            <div id="slidingThicknessTitle" class="sliding-group-title"><span class="sliding-group-icon icon-thickness" aria-hidden="true"></span><span data-sliding-text="glassThickness">Glass Thickness</span></div>
            <label><input type="radio" name="slidingThickness" value="8 MM"><span data-sliding-text="mm8">8 mm</span></label>
            <label id="slidingThickness10Wrap"><input type="radio" name="slidingThickness" value="10 MM" checked><span data-sliding-text="mm10">10 mm</span></label>
            <label><input type="radio" name="slidingThickness" value="INSULATED GLASS"><span data-sliding-text="insulatedGlass">Insulated Glass</span></label>
          </section>
          <section class="sliding-choice-group sliding-color-group" role="group" aria-labelledby="slidingColorTitle">
            <div id="slidingColorTitle" class="sliding-group-title"><span class="sliding-group-icon icon-color" aria-hidden="true"></span><span data-sliding-text="glassColor">Glass Color</span></div>
            <label><input type="radio" name="slidingColor" value="TRANSPARENT" checked><span data-sliding-text="transparent">Transparent</span></label>
            <label><input type="radio" name="slidingColor" value="GREY"><span data-sliding-text="grey">Grey</span></label>
            <label><input type="radio" name="slidingColor" value="BRONZE"><span data-sliding-text="bronze">Bronze</span></label>
            <label id="slidingLowEWrap"><input type="radio" name="slidingColor" value="LOW-E GLASS" disabled><span data-sliding-text="lowEGlass">Low-e Glass</span></label>
            <label><input type="radio" name="slidingColor" value="OTHER"><span data-sliding-text="other">Other</span></label>
            <div id="slidingOtherRow" class="sliding-other-row" hidden>
              <input id="slidingOtherColor" class="sliding-other-input" type="text" placeholder="Enter custom glass color" autocomplete="off">
            </div>
          </section>
          <div class="sliding-auto-fields">
            <label class="sliding-summary-field sliding-poz-field"><span data-sliding-text="pozNo">Position No.</span><input id="slidingPozNo" type="text" readonly></label>
            <label class="sliding-summary-field"><span><span data-sliding-text="width">Width *</span> <small>(mm)</small></span><input id="slidingWidth" type="text" inputmode="numeric" autocomplete="off"></label>
            <label class="sliding-summary-field"><span><span data-sliding-text="height">Height *</span> <small>(mm)</small></span><input id="slidingHeight" type="text" inputmode="numeric" autocomplete="off"></label>
            <label class="sliding-summary-field sliding-panel-field"><span data-sliding-text="panelCount">Panel Count</span><input id="slidingPanelCount" type="text" readonly></label>
          </div>
          <div id="slidingBatchList" class="bulk-selection-list product-batch-list" hidden></div>
        </div>
        <input id="slidingQuantity" type="hidden" value="1">
        <div id="slidingDetailsError" class="dim-edit-error sliding-details-error" aria-live="polite"></div>
        <div class="dim-edit-actions sliding-details-actions">
          <button id="slidingDetailsDelete" type="button" class="dim-edit-delete" hidden>Mevcut Ürünü Sil</button>
          <button id="slidingDetailsCancel" type="button" class="dim-edit-cancel" data-sliding-text="cancel">Cancel</button>
          <button type="submit" class="dim-edit-apply" data-sliding-text="confirm">Confirm</button>
        </div>
      </form>`;
    previewPanel.appendChild(overlay);
    translateSlidingDetailsOverlay(overlay);

    const form = overlay.querySelector('#slidingDetailsForm');
    const otherInput = overlay.querySelector('#slidingOtherColor');
    const error = overlay.querySelector('#slidingDetailsError');

    const checkedValue = name => (overlay.querySelector(`input[name="${name}"]:checked`) || {}).value || '';
    const refreshRules = () => {
      const series = checkedValue('slidingSeries');
      const thickness10 = overlay.querySelector('input[name="slidingThickness"][value="10 MM"]');
      const isK = series === 'K SERIES';
      thickness10.disabled = isK;
      overlay.querySelector('#slidingThickness10Wrap').classList.toggle('is-disabled', isK);
      if (isK && thickness10.checked) overlay.querySelector('input[name="slidingThickness"][value="8 MM"]').checked = true;
      const thickness = checkedValue('slidingThickness');
      const lowE = overlay.querySelector('input[name="slidingColor"][value="LOW-E GLASS"]');
      const lowEActive = thickness === 'INSULATED GLASS';
      lowE.disabled = !lowEActive;
      overlay.querySelector('#slidingLowEWrap').classList.toggle('is-disabled', !lowEActive);
      if (!lowEActive && lowE.checked) overlay.querySelector('input[name="slidingColor"][value="TRANSPARENT"]').checked = true;
      const color = checkedValue('slidingColor');
      overlay.querySelector('#slidingOtherRow').hidden = color !== 'OTHER';
      const openingType = checkedValue('slidingOpening');
      const width = Number(overlay.querySelector('#slidingWidth').value) || 1;
      overlay.querySelector('#slidingPanelCount').value = String(slidingPanelCount(width, openingType));
      const batchList = overlay.querySelector('#slidingBatchList');
      if (batchList) {
        batchList.querySelectorAll('.product-batch-row').forEach(row => {
          const widthInput = row.querySelector('[data-batch-field="width"]');
          const panelInput = row.querySelector('[data-batch-field="panel"]');
          if (widthInput && panelInput) panelInput.value = String(slidingPanelCount(Number(widthInput.value) || 1, openingType));
        });
      }
      error.textContent = '';
    };

    overlay.querySelectorAll('input[type="radio"]').forEach(radio => radio.addEventListener('change', refreshRules));
    const cleanDimensionInput = input => {
      const clean = String(input.value || '').replace(/[^0-9]/g, '');
      if (input.value !== clean) input.value = clean;
      error.textContent = '';
    };
    [overlay.querySelector('#slidingWidth'), overlay.querySelector('#slidingHeight')].forEach(input => {
      input.addEventListener('input', () => { cleanDimensionInput(input); refreshRules(); });
    });
    overlay.querySelector('#slidingBatchList').addEventListener('input', evt => {
      const input = evt.target && evt.target.matches && evt.target.matches('[data-batch-field="width"],[data-batch-field="height"]') ? evt.target : null;
      if (!input) return;
      cleanDimensionInput(input);
      if (input.dataset.batchField === 'width') {
        const row = input.closest('.product-batch-row');
        const panel = row && row.querySelector('[data-batch-field="panel"]');
        if (panel) panel.value = String(slidingPanelCount(Number(input.value) || 1, checkedValue('slidingOpening')));
      }
    });
    otherInput.addEventListener('input', () => { error.textContent = ''; });

    const close = () => {
      overlay.hidden = true;
      pendingSlidingPlacementMeta = null;
      focusPreviewCanvas();
    };
    overlay.querySelector('#slidingDetailsCancel').addEventListener('click', close);
    overlay.querySelector('#slidingDetailsClose').addEventListener('click', close);
    overlay.querySelector('#slidingDetailsDelete').addEventListener('click', () => {
      const record = pendingSlidingPlacementMeta && pendingSlidingPlacementMeta.editRecord;
      if (!record) return;
      if (!window.confirm(currentLanguage === 'en' ? 'Delete this existing sliding product?' : 'Bu mevcut sürme ürünü silinsin mi?')) return;
      deleteProductRecord(record);
      close();
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en' ? 'Existing product deleted.' : 'Mevcut ürün silindi.';
    });
    overlay.addEventListener('mousedown', evt => { if (evt.target === overlay) close(); });
    overlay.addEventListener('keydown', evt => { if (evt.key === 'Escape') { evt.preventDefault(); close(); } });

    form.addEventListener('submit', evt => {
      evt.preventDefault();
      if (!pendingSlidingPlacementMeta) return;
      const qty = 1;
      let glassColor = checkedValue('slidingColor');
      if (glassColor === 'OTHER') {
        glassColor = String(otherInput.value || '').trim().toUpperCase();
        if (!glassColor) {
          error.textContent = (SLIDING_UI_TEXT[currentLanguage] || SLIDING_UI_TEXT.tr).otherRequired;
          otherInput.focus();
          return;
        }
      }
      const meta = pendingSlidingPlacementMeta;
      const metas = placementMetasFromPending(meta);
      const openingType = checkedValue('slidingOpening');
      const editRecord = meta.editRecord || null;
      const pozNos = Array.isArray(meta.batchPozNos) ? meta.batchPozNos : [editRecord ? editRecord.placement.pozNo : overlay.querySelector('#slidingPozNo').value];
      const dimensionInputs = metas.map((item, index) => {
        const widthInput = index === 0
          ? overlay.querySelector('#slidingWidth')
          : overlay.querySelector(`#slidingBatchList [data-batch-index="${index}"][data-batch-field="width"]`);
        const heightInput = index === 0
          ? overlay.querySelector('#slidingHeight')
          : overlay.querySelector(`#slidingBatchList [data-batch-index="${index}"][data-batch-field="height"]`);
        const width = Number(widthInput && widthInput.value);
        const height = Number(heightInput && heightInput.value);
        if (!(width > 0) || !(height > 0)) return { invalid: true, input: !(width > 0) ? widthInput : heightInput, index };
        return { width, height };
      });
      const invalidDimension = dimensionInputs.find(item => item.invalid);
      if (invalidDimension) {
        const poz = String(pozNos[invalidDimension.index] || '');
        error.textContent = currentLanguage === 'en' ? `Enter positive width and height values for ${poz}.` : `${poz} için pozitif genişlik ve yükseklik gir.`;
        if (invalidDimension.input) invalidDimension.input.focus();
        return;
      }
      const placements = metas.map((item, index) => {
        const isSidePlacement = placementIsSide(item);
        const width = dimensionInputs[index].width;
        const height = dimensionInputs[index].height;
        const existing = editRecord && index === 0 ? editRecord.placement : null;
        return {
          id: existing && existing.id ? existing.id : (isSidePlacement ? `sliding_side_${Date.now()}_${index}_${item.sideIndex}_${item.sideZone}` : `sliding_${Date.now()}_${index}_${item.index}`),
          gapIndex: Number(item.index) || 0,
          placementView: isSidePlacement ? 'side-left' : 'front',
          sideIndex: isSidePlacement ? (Number(item.sideIndex) || 0) : null,
          sideZone: isSidePlacement ? String(item.sideZone || '') : '',
          sideGapIndex: isSidePlacement ? (Number(item.sideGapIndex) || 0) : null,
          series: checkedValue('slidingSeries'),
          type: checkedValue('slidingType'),
          openingType,
          glassThickness: checkedValue('slidingThickness'),
          glassColor,
          width,
          height,
          panelCount: slidingPanelCount(width, openingType),
          quantity: Math.round(qty),
          pozNo: String(pozNos[index] || pozNos[0] || nextSlidingPozNo()),
          leftPostStandard: isSidePlacement ? true : !frontPostProfiles[Number(item.index) || 0]
        };
      });
      placements.forEach(storeSlidingPlacement);
      overlay.hidden = true;
      pendingSlidingPlacementMeta = null;
      suppressFormPreviewUpdate = true;
      try { updatePreview(false); }
      finally { window.setTimeout(() => { suppressFormPreviewUpdate = false; }, 450); }
      if (editRecord) statusText.textContent = currentLanguage === 'en' ? `${placements[0].pozNo} updated.` : `${placements[0].pozNo} güncellendi.`;
      else if (placements.length > 1) statusText.textContent = currentLanguage === 'en' ? `${placements.length} sliding products placed.` : `${placements.length} sürme ürün yerleştirildi.`;
      else {
        const placement = placements[0];
        const slidingTxt = SLIDING_UI_TEXT[currentLanguage] || SLIDING_UI_TEXT.tr;
        statusText.textContent = placement.placementView === 'side-left'
          ? (currentLanguage === 'en' ? `${placement.pozNo} placed in the left side view.` : `${placement.pozNo} sol yan görünüşe yerleştirildi.`)
          : slidingTxt.placed(placement.pozNo, placement.gapIndex + 1, placement.gapIndex + 2);
      }
    });
    return overlay;
  }

  function showSlidingDetailsOverlay(meta, options = {}) {
    const overlay = ensureSlidingDetailsOverlay();
    translateSlidingDetailsOverlay(overlay);
    const batchMetas = Array.isArray(meta && meta.batchMetas) ? meta.batchMetas.map(normalizedProductMeta).filter(Boolean) : null;
    const baseMeta = batchMetas && batchMetas.length ? batchMetas[0] : normalizedProductMeta(meta) || { ...meta };
    const record = options.editExisting || meta.editProduct || meta.placementId ? (meta.placementId ? findProductByInteraction(meta) : productRecordForMeta(baseMeta)) : null;
    const existing = record && record.type === 'sliding_glass' ? record.placement : null;
    pendingSlidingPlacementMeta = { ...baseMeta, batchMetas: batchMetas || undefined, editRecord: existing ? record : null };
    const allMetas = batchMetas || [baseMeta];
    const gap = Math.max(1, Number(baseMeta.value) || 1);
    const width = Math.max(1, Number(baseMeta.placementWidth) || (gap - 5));
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : {};
    const height = Math.max(1, Number(baseMeta.placementHeight) || (Number(d.frontHeight || 0) - Number(d.parapetHeight || 0) - 5));
    setRadioGroupValue(overlay, 'slidingSeries', existing && existing.series, 'A SERIES');
    setRadioGroupValue(overlay, 'slidingType', existing && existing.type, 'WITH THRESHOLD');
    setRadioGroupValue(overlay, 'slidingOpening', existing && existing.openingType, 'SIDE OPENING');
    setRadioGroupValue(overlay, 'slidingThickness', existing && existing.glassThickness, '10 MM');
    const knownColors = ['TRANSPARENT','GREY','BRONZE','LOW-E GLASS'];
    const existingColor = existing ? String(existing.glassColor || 'TRANSPARENT') : 'TRANSPARENT';
    setRadioGroupValue(overlay, 'slidingColor', knownColors.includes(existingColor) ? existingColor : (existing ? 'OTHER' : 'TRANSPARENT'), 'TRANSPARENT');
    overlay.querySelector('#slidingOtherColor').value = knownColors.includes(existingColor) ? '' : existingColor;
    overlay.querySelector('#slidingOtherRow').hidden = knownColors.includes(existingColor);
    overlay.querySelector('#slidingWidth').value = String(Math.round(existing ? existing.width : width));
    overlay.querySelector('#slidingHeight').value = String(Math.round(existing ? existing.height : height));
    overlay.querySelector('#slidingPanelCount').value = String(slidingPanelCount(existing ? existing.width : width, existing ? existing.openingType : 'SIDE OPENING'));
    overlay.querySelector('#slidingQuantity').value = '1';
    const pozNos = batchMetas ? allocatePozNos('S', batchMetas.length) : [existing ? existing.pozNo : nextSlidingPozNo()];
    pendingSlidingPlacementMeta.batchPozNos = pozNos;
    overlay.querySelector('#slidingPozNo').value = pozNos[0];
    const batchList = overlay.querySelector('#slidingBatchList');
    const slidingTxt = SLIDING_UI_TEXT[currentLanguage] || SLIDING_UI_TEXT.tr;
    batchList.hidden = !(batchMetas && batchMetas.length > 1);
    batchList.innerHTML = batchMetas && batchMetas.length > 1 ? batchMetas.slice(1).map((item, offset) => {
      const index = offset + 1;
      const itemWidth = Math.max(1, Math.round(Number(item.placementWidth) || 1));
      const itemHeight = Math.max(1, Math.round(Number(item.placementHeight) || 1));
      return `<div class="product-batch-row product-batch-row-sliding" data-batch-index="${index}">
        <label class="product-batch-field product-batch-poz"><span>${escapeHtml(slidingTxt.pozNo)}</span><input type="text" value="${escapeHtml(pozNos[index])}" readonly></label>
        <label class="product-batch-field"><span>${escapeHtml(slidingTxt.width)} <small>(mm)</small></span><input type="text" inputmode="numeric" autocomplete="off" data-batch-index="${index}" data-batch-field="width" value="${itemWidth}"></label>
        <label class="product-batch-field"><span>${escapeHtml(slidingTxt.height)} <small>(mm)</small></span><input type="text" inputmode="numeric" autocomplete="off" data-batch-index="${index}" data-batch-field="height" value="${itemHeight}"></label>
        <label class="product-batch-field product-batch-panel"><span>${escapeHtml(slidingTxt.panelCount)}</span><input type="text" data-batch-index="${index}" data-batch-field="panel" value="${slidingPanelCount(itemWidth, existing ? existing.openingType : 'SIDE OPENING')}" readonly></label>
      </div>`;
    }).join('') : '';
    const deleteBtn = overlay.querySelector('#slidingDetailsDelete');
    deleteBtn.hidden = !existing;
    deleteBtn.textContent = currentLanguage === 'en' ? 'Delete Existing Product' : 'Mevcut Ürünü Sil';
    overlay.querySelector('#slidingDetailsError').textContent = '';
    overlay.hidden = false;
    const active = overlay.querySelector('input[name="slidingSeries"]:checked');
    if (active) active.dispatchEvent(new Event('change', { bubbles: true }));
    window.setTimeout(() => { const first = overlay.querySelector('input[name="slidingSeries"]:checked'); if (first) first.focus({ preventScroll: true }); }, 20);
  }


  function nextGuillotinePozNo() {
    const used = new Set([...guillotinePlacements, ...sideGuillotinePlacements].map(item => String(item.pozNo || '').toUpperCase()));
    let n = 1;
    while (used.has(`G${String(n).padStart(2, '0')}`)) n += 1;
    return `G${String(n).padStart(2, '0')}`;
  }

  function ensureGuillotineDetailsOverlay() {
    let overlay = $('guillotineDetailsOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'guillotineDetailsOverlay';
    overlay.className = 'dim-edit-overlay sliding-details-overlay guillotine-details-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <form id="guillotineDetailsForm" class="dim-edit-card sliding-details-card guillotine-details-card">
        <div class="sliding-modal-head">
          <div class="sliding-modal-title"><span class="guillotine-title-icon" aria-hidden="true"></span><span data-guillotine-text="title">Guillotine Details</span></div>
          <button id="guillotineDetailsClose" class="sliding-modal-close" type="button" aria-label="Close"><span aria-hidden="true"></span></button>
        </div>
        <div class="guillotine-details-grid">
          <section class="sliding-choice-group guillotine-series-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-series" aria-hidden="true"></span><span data-guillotine-text="productSeries">Product Series</span></div>
            <label><input type="radio" name="guillotineSeries" value="A SERIES" checked><span data-guillotine-text="aSeries">A Series</span></label>
            <label><input type="radio" name="guillotineSeries" value="K SERIES"><span data-guillotine-text="kSeries">K Series</span></label>
          </section>
          <section class="sliding-choice-group guillotine-type-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-type" aria-hidden="true"></span><span data-guillotine-text="type">Type</span></div>
            <label><input type="radio" name="guillotineType" value="STANDARD" checked><span data-guillotine-text="standard">Standard</span></label>
            <label><input type="radio" name="guillotineType" value="CLEANABLE"><span data-guillotine-text="cleanable">Cleanable</span></label>
            <label id="guillotineUpwardWrap"><input type="radio" name="guillotineType" value="UPWARD COLLECTING"><span data-guillotine-text="upwardCollecting">Upward Collecting</span></label>
          </section>
          <section class="sliding-choice-group guillotine-mechanism-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-mechanism" aria-hidden="true"></span><span data-guillotine-text="mechanism">Mechanism</span></div>
            <label id="guillotineChainWrap"><input type="radio" name="guillotineMechanism" value="CHAIN" checked><span data-guillotine-text="chain">Chain</span></label>
            <label><input type="radio" name="guillotineMechanism" value="BELT"><span data-guillotine-text="belt">Belt</span></label>
          </section>
          <section class="sliding-choice-group guillotine-thickness-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-thickness" aria-hidden="true"></span><span data-guillotine-text="glassThickness">Glass Thickness</span></div>
            <label id="guillotine8mmWrap"><input type="radio" name="guillotineThickness" value="8 MM" checked><span data-guillotine-text="mm8">8 mm</span></label>
            <label><input type="radio" name="guillotineThickness" value="INSULATED GLASS"><span data-guillotine-text="insulatedGlass">Insulated Glass</span></label>
          </section>
          <section class="sliding-choice-group guillotine-panel-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-panel" aria-hidden="true"></span><span data-guillotine-text="panelCount">Panel Type</span></div>
            <label><input type="radio" name="guillotinePanel" value="1+1" checked><span data-guillotine-text="panel11">1+1</span></label>
            <label><input type="radio" name="guillotinePanel" value="1+2"><span data-guillotine-text="panel12">1+2</span></label>
          </section>
          <section class="sliding-choice-group guillotine-motor-direction-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-direction" aria-hidden="true"></span><span data-guillotine-text="motorDirection">Motor Direction</span></div>
            <label><input type="radio" name="guillotineMotorDirection" value="RIGHT" checked><span data-guillotine-text="right">Right</span></label>
            <label><input type="radio" name="guillotineMotorDirection" value="LEFT"><span data-guillotine-text="left">Left</span></label>
          </section>
          <section class="sliding-choice-group guillotine-view-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-view" aria-hidden="true"></span><span data-guillotine-text="view">View</span></div>
            <label><input type="radio" name="guillotineView" value="INSIDE VIEW" checked><span data-guillotine-text="insideView">Inside View</span></label>
            <label><input type="radio" name="guillotineView" value="OUTSIDE VIEW"><span data-guillotine-text="outsideView">Outside View</span></label>
          </section>
          <section class="sliding-choice-group guillotine-motor-type-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-motor" aria-hidden="true"></span><span data-guillotine-text="motorType">Motor Type</span></div>
            <label><input type="radio" name="guillotineMotorType" value="SOMFY RTS" checked><span data-guillotine-text="somfyRts">Somfy RTS</span></label>
            <label><input type="radio" name="guillotineMotorType" value="SOMFY IO"><span data-guillotine-text="somfyIo">Somfy IO</span></label>
            <label><input type="radio" name="guillotineMotorType" value="RISING"><span data-guillotine-text="rising">Rising</span></label>
          </section>
          <section class="sliding-choice-group sliding-color-group guillotine-color-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-color" aria-hidden="true"></span><span data-guillotine-text="glassColor">Glass Color</span></div>
            <label><input type="radio" name="guillotineColor" value="TRANSPARENT" checked><span data-guillotine-text="transparent">Transparent</span></label>
            <label><input type="radio" name="guillotineColor" value="GREY"><span data-guillotine-text="grey">Grey</span></label>
            <label><input type="radio" name="guillotineColor" value="BRONZE"><span data-guillotine-text="bronze">Bronze</span></label>
            <label id="guillotineLowEWrap"><input type="radio" name="guillotineColor" value="LOW-E GLASS" disabled><span data-guillotine-text="lowEGlass">Low-e Glass</span></label>
            <label><input type="radio" name="guillotineColor" value="OTHER"><span data-guillotine-text="other">Other</span></label>
            <div id="guillotineOtherRow" class="sliding-other-row" hidden><input id="guillotineOtherColor" class="sliding-other-input" type="text" autocomplete="off"></div>
          </section>
          <section class="sliding-choice-group guillotine-remote-group" role="group">
            <div class="sliding-group-title"><span class="sliding-group-icon icon-remote" aria-hidden="true"></span><span data-guillotine-text="remoteControl">Remote Control</span></div>
            <label><input type="radio" name="guillotineRemote" value="1 CHANNEL" checked><span data-guillotine-text="ch1">1 Channel</span></label>
            <label><input type="radio" name="guillotineRemote" value="2 CHANNELS"><span data-guillotine-text="ch2">2 Channels</span></label>
            <label><input type="radio" name="guillotineRemote" value="4 CHANNELS"><span data-guillotine-text="ch4">4 Channels</span></label>
            <label><input type="radio" name="guillotineRemote" value="6 CHANNELS"><span data-guillotine-text="ch6">6 Channels</span></label>
            <label><input type="radio" name="guillotineRemote" value="16 CHANNELS"><span data-guillotine-text="ch16">16 Channels</span></label>
            <label><input type="radio" name="guillotineRemote" value="40 CHANNELS"><span data-guillotine-text="ch40">40 Channels</span></label>
          </section>
          <div class="sliding-auto-fields guillotine-auto-fields">
            <label class="sliding-summary-field sliding-poz-field"><span data-guillotine-text="pozNo">Position No.</span><input id="guillotinePozNo" type="text" readonly></label>
            <label class="sliding-summary-field"><span><span data-guillotine-text="width">Width *</span> <small>(mm)</small></span><input id="guillotineWidth" type="text" inputmode="numeric" autocomplete="off"></label>
            <label class="sliding-summary-field"><span><span data-guillotine-text="height">Height *</span> <small>(mm)</small></span><input id="guillotineHeight" type="text" inputmode="numeric" autocomplete="off"></label>
          </div>
          <div id="guillotineBatchList" class="bulk-selection-list product-batch-list" hidden></div>
        </div>
        <div id="guillotineDetailsError" class="dim-edit-error sliding-details-error" aria-live="polite"></div>
        <div class="dim-edit-actions sliding-details-actions">
          <button id="guillotineDetailsDelete" type="button" class="dim-edit-delete" hidden>Mevcut Ürünü Sil</button>
          <button id="guillotineDetailsCancel" type="button" class="dim-edit-cancel" data-guillotine-text="cancel">Cancel</button>
          <button type="submit" class="dim-edit-apply" data-guillotine-text="confirm">Confirm</button>
        </div>
      </form>`;
    previewPanel.appendChild(overlay);
    translateGuillotineDetailsOverlay(overlay);

    const form = overlay.querySelector('#guillotineDetailsForm');
    const error = overlay.querySelector('#guillotineDetailsError');
    const otherInput = overlay.querySelector('#guillotineOtherColor');
    const checkedValue = name => (overlay.querySelector(`input[name="${name}"]:checked`) || {}).value || '';
    const setDisabled = (wrapId, input, disabled) => {
      input.disabled = disabled;
      overlay.querySelector(`#${wrapId}`).classList.toggle('is-disabled', disabled);
    };
    const refreshRules = () => {
      const isK = checkedValue('guillotineSeries') === 'K SERIES';
      const mm8 = overlay.querySelector('input[name="guillotineThickness"][value="8 MM"]');
      const insulated = overlay.querySelector('input[name="guillotineThickness"][value="INSULATED GLASS"]');
      setDisabled('guillotine8mmWrap', mm8, isK);
      if (isK && mm8.checked) insulated.checked = true;
      const upward = overlay.querySelector('input[name="guillotineType"][value="UPWARD COLLECTING"]');
      setDisabled('guillotineUpwardWrap', upward, isK);
      if (isK && upward.checked) overlay.querySelector('input[name="guillotineType"][value="STANDARD"]').checked = true;
      const chain = overlay.querySelector('input[name="guillotineMechanism"][value="CHAIN"]');
      setDisabled('guillotineChainWrap', chain, isK);
      if (isK && chain.checked) overlay.querySelector('input[name="guillotineMechanism"][value="BELT"]').checked = true;
      const lowE = overlay.querySelector('input[name="guillotineColor"][value="LOW-E GLASS"]');
      const lowEActive = checkedValue('guillotineThickness') === 'INSULATED GLASS';
      setDisabled('guillotineLowEWrap', lowE, !lowEActive);
      if (!lowEActive && lowE.checked) overlay.querySelector('input[name="guillotineColor"][value="TRANSPARENT"]').checked = true;
      overlay.querySelector('#guillotineOtherRow').hidden = checkedValue('guillotineColor') !== 'OTHER';
      error.textContent = '';
    };
    overlay.querySelectorAll('input[type="radio"]').forEach(radio => radio.addEventListener('change', refreshRules));
    const cleanDimensionInput = input => {
      const clean = String(input.value || '').replace(/[^0-9]/g, '');
      if (input.value !== clean) input.value = clean;
      error.textContent = '';
    };
    [overlay.querySelector('#guillotineWidth'), overlay.querySelector('#guillotineHeight')].forEach(input => {
      input.addEventListener('input', () => cleanDimensionInput(input));
    });
    overlay.querySelector('#guillotineBatchList').addEventListener('input', evt => {
      const input = evt.target && evt.target.matches && evt.target.matches('[data-batch-field="width"],[data-batch-field="height"]') ? evt.target : null;
      if (input) cleanDimensionInput(input);
    });
    otherInput.addEventListener('input', () => { error.textContent = ''; });
    const close = () => { overlay.hidden = true; pendingGuillotinePlacementMeta = null; focusPreviewCanvas(); };
    overlay.querySelector('#guillotineDetailsCancel').addEventListener('click', close);
    overlay.querySelector('#guillotineDetailsClose').addEventListener('click', close);
    overlay.querySelector('#guillotineDetailsDelete').addEventListener('click', () => {
      const record = pendingGuillotinePlacementMeta && pendingGuillotinePlacementMeta.editRecord;
      if (!record) return;
      if (!window.confirm(currentLanguage === 'en' ? 'Delete this existing guillotine product?' : 'Bu mevcut giyotin ürünü silinsin mi?')) return;
      deleteProductRecord(record);
      close();
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en' ? 'Existing product deleted.' : 'Mevcut ürün silindi.';
    });
    overlay.addEventListener('mousedown', evt => { if (evt.target === overlay) close(); });
    overlay.addEventListener('keydown', evt => { if (evt.key === 'Escape') { evt.preventDefault(); close(); } });
    form.addEventListener('submit', evt => {
      evt.preventDefault();
      if (!pendingGuillotinePlacementMeta) return;
      let glassColor = checkedValue('guillotineColor');
      if (glassColor === 'OTHER') {
        glassColor = String(otherInput.value || '').trim().toUpperCase();
        if (!glassColor) {
          error.textContent = (GUILLOTINE_UI_TEXT[currentLanguage] || GUILLOTINE_UI_TEXT.tr).otherRequired;
          otherInput.focus();
          return;
        }
      }
      const meta = pendingGuillotinePlacementMeta;
      const metas = placementMetasFromPending(meta);
      const editRecord = meta.editRecord || null;
      const pozNos = Array.isArray(meta.batchPozNos) ? meta.batchPozNos : [editRecord ? editRecord.placement.pozNo : overlay.querySelector('#guillotinePozNo').value];
      const dimensionInputs = metas.map((item, index) => {
        const widthInput = index === 0
          ? overlay.querySelector('#guillotineWidth')
          : overlay.querySelector(`#guillotineBatchList [data-batch-index="${index}"][data-batch-field="width"]`);
        const heightInput = index === 0
          ? overlay.querySelector('#guillotineHeight')
          : overlay.querySelector(`#guillotineBatchList [data-batch-index="${index}"][data-batch-field="height"]`);
        const width = Number(widthInput && widthInput.value);
        const height = Number(heightInput && heightInput.value);
        if (!(width > 0) || !(height > 0)) return { invalid: true, input: !(width > 0) ? widthInput : heightInput, index };
        return { width, height };
      });
      const invalidDimension = dimensionInputs.find(item => item.invalid);
      if (invalidDimension) {
        const poz = String(pozNos[invalidDimension.index] || '');
        error.textContent = currentLanguage === 'en' ? `Enter positive width and height values for ${poz}.` : `${poz} için pozitif genişlik ve yükseklik gir.`;
        if (invalidDimension.input) invalidDimension.input.focus();
        return;
      }
      const placements = metas.map((item, index) => {
        const isSidePlacement = placementIsSide(item);
        const existing = editRecord && index === 0 ? editRecord.placement : null;
        return {
          id: existing && existing.id ? existing.id : (isSidePlacement ? `guillotine_side_${Date.now()}_${index}_${item.sideIndex}_${item.sideZone}` : `guillotine_${Date.now()}_${index}_${item.index}`),
          gapIndex: Number(item.index) || 0,
          placementView: isSidePlacement ? 'side-left' : 'front',
          sideIndex: isSidePlacement ? (Number(item.sideIndex) || 0) : null,
          sideZone: isSidePlacement ? String(item.sideZone || '') : '',
          sideGapIndex: isSidePlacement ? (Number(item.sideGapIndex) || 0) : null,
          series: checkedValue('guillotineSeries'),
          type: checkedValue('guillotineType'),
          mechanism: checkedValue('guillotineMechanism'),
          glassThickness: checkedValue('guillotineThickness'),
          glassColor,
          panelCount: checkedValue('guillotinePanel'),
          motorDirection: checkedValue('guillotineMotorDirection'),
          view: checkedValue('guillotineView'),
          motorType: checkedValue('guillotineMotorType'),
          remoteControl: checkedValue('guillotineRemote'),
          width: dimensionInputs[index].width,
          height: dimensionInputs[index].height,
          quantity: 1,
          pozNo: String(pozNos[index] || pozNos[0] || nextGuillotinePozNo()),
          leftPostStandard: isSidePlacement ? true : !frontPostProfiles[Number(item.index) || 0]
        };
      });
      placements.forEach(storeGuillotinePlacement);
      overlay.hidden = true;
      pendingGuillotinePlacementMeta = null;
      suppressFormPreviewUpdate = true;
      try { updatePreview(false); }
      finally { window.setTimeout(() => { suppressFormPreviewUpdate = false; }, 450); }
      if (editRecord) statusText.textContent = currentLanguage === 'en' ? `${placements[0].pozNo} updated.` : `${placements[0].pozNo} güncellendi.`;
      else if (placements.length > 1) statusText.textContent = currentLanguage === 'en' ? `${placements.length} guillotine products placed.` : `${placements.length} giyotin ürün yerleştirildi.`;
      else {
        const placement = placements[0];
        const txt = GUILLOTINE_UI_TEXT[currentLanguage] || GUILLOTINE_UI_TEXT.tr;
        statusText.textContent = placement.placementView === 'side-left'
          ? (currentLanguage === 'en' ? `${placement.pozNo} placed in the left side view.` : `${placement.pozNo} sol yan görünüşe yerleştirildi.`)
          : txt.placed(placement.pozNo, placement.gapIndex + 1, placement.gapIndex + 2);
      }
    });
    return overlay;
  }

  function showGuillotineDetailsOverlay(meta, options = {}) {
    const overlay = ensureGuillotineDetailsOverlay();
    translateGuillotineDetailsOverlay(overlay);
    const batchMetas = Array.isArray(meta && meta.batchMetas) ? meta.batchMetas.map(normalizedProductMeta).filter(Boolean) : null;
    const baseMeta = batchMetas && batchMetas.length ? batchMetas[0] : normalizedProductMeta(meta) || { ...meta };
    const record = options.editExisting || meta.editProduct || meta.placementId ? (meta.placementId ? findProductByInteraction(meta) : productRecordForMeta(baseMeta)) : null;
    const existing = record && record.type === 'guillotine_glass' ? record.placement : null;
    pendingGuillotinePlacementMeta = { ...baseMeta, batchMetas: batchMetas || undefined, editRecord: existing ? record : null };
    const gap = Math.max(1, Number(baseMeta.value) || 1);
    const width = Math.max(1, Number(baseMeta.placementWidth) || (gap - 5));
    const d = lastDrawing && lastDrawing.input ? lastDrawing.input : {};
    const height = Math.max(1, Number(baseMeta.placementHeight) || (Number(d.frontHeight || 0) - Number(d.parapetHeight || 0) - 5));
    const defaults = {
      guillotineSeries: 'A SERIES', guillotineType: 'STANDARD', guillotineMechanism: 'CHAIN',
      guillotineThickness: '8 MM', guillotineColor: 'TRANSPARENT', guillotinePanel: '1+1',
      guillotineMotorDirection: 'RIGHT', guillotineView: 'INSIDE VIEW', guillotineMotorType: 'SOMFY RTS', guillotineRemote: '1 CHANNEL'
    };
    const values = existing ? {
      guillotineSeries: existing.series, guillotineType: existing.type, guillotineMechanism: existing.mechanism,
      guillotineThickness: existing.glassThickness, guillotineColor: existing.glassColor, guillotinePanel: existing.panelCount,
      guillotineMotorDirection: existing.motorDirection, guillotineView: existing.view, guillotineMotorType: existing.motorType, guillotineRemote: existing.remoteControl
    } : defaults;
    const knownColors = ['TRANSPARENT','GREY','BRONZE','LOW-E GLASS'];
    Object.entries(defaults).forEach(([name, fallback]) => {
      let value = values[name] || fallback;
      if (name === 'guillotineColor' && !knownColors.includes(String(value))) value = 'OTHER';
      setRadioGroupValue(overlay, name, value, fallback);
    });
    const existingColor = existing ? String(existing.glassColor || 'TRANSPARENT') : 'TRANSPARENT';
    overlay.querySelector('#guillotineOtherColor').value = knownColors.includes(existingColor) ? '' : existingColor;
    overlay.querySelector('#guillotineOtherRow').hidden = knownColors.includes(existingColor);
    overlay.querySelector('#guillotineWidth').value = String(Math.round(existing ? existing.width : width));
    overlay.querySelector('#guillotineHeight').value = String(Math.round(existing ? existing.height : height));
    const pozNos = batchMetas ? allocatePozNos('G', batchMetas.length) : [existing ? existing.pozNo : nextGuillotinePozNo()];
    pendingGuillotinePlacementMeta.batchPozNos = pozNos;
    overlay.querySelector('#guillotinePozNo').value = pozNos[0];
    const batchList = overlay.querySelector('#guillotineBatchList');
    const guillotineTxt = GUILLOTINE_UI_TEXT[currentLanguage] || GUILLOTINE_UI_TEXT.tr;
    batchList.hidden = !(batchMetas && batchMetas.length > 1);
    batchList.innerHTML = batchMetas && batchMetas.length > 1 ? batchMetas.slice(1).map((item, offset) => {
      const index = offset + 1;
      const itemWidth = Math.max(1, Math.round(Number(item.placementWidth) || 1));
      const itemHeight = Math.max(1, Math.round(Number(item.placementHeight) || 1));
      return `<div class="product-batch-row product-batch-row-guillotine" data-batch-index="${index}">
        <label class="product-batch-field product-batch-poz"><span>${escapeHtml(guillotineTxt.pozNo)}</span><input type="text" value="${escapeHtml(pozNos[index])}" readonly></label>
        <label class="product-batch-field"><span>${escapeHtml(guillotineTxt.width)} <small>(mm)</small></span><input type="text" inputmode="numeric" autocomplete="off" data-batch-index="${index}" data-batch-field="width" value="${itemWidth}"></label>
        <label class="product-batch-field"><span>${escapeHtml(guillotineTxt.height)} <small>(mm)</small></span><input type="text" inputmode="numeric" autocomplete="off" data-batch-index="${index}" data-batch-field="height" value="${itemHeight}"></label>
      </div>`;
    }).join('') : '';
    const deleteBtn = overlay.querySelector('#guillotineDetailsDelete');
    deleteBtn.hidden = !existing;
    deleteBtn.textContent = currentLanguage === 'en' ? 'Delete Existing Product' : 'Mevcut Ürünü Sil';
    overlay.querySelector('#guillotineDetailsError').textContent = '';
    overlay.hidden = false;
    const active = overlay.querySelector('input[name="guillotineSeries"]:checked');
    if (active) active.dispatchEvent(new Event('change', { bubbles: true }));
    window.setTimeout(() => { const first = overlay.querySelector('input[name="guillotineSeries"]:checked'); if (first) first.focus({ preventScroll: true }); }, 20);
  }

  function ensureDimensionEditOverlay() {
    let overlay = $('dimensionEditOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'dimensionEditOverlay';
    overlay.className = 'dim-edit-overlay v66-smart-dim-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <form id="dimensionEditForm" class="dim-edit-card v66-smart-dim-card">
        <div class="dim-edit-title" id="dimensionEditTitle">Ölçü Düzenle</div>
        <div class="dim-edit-meta" id="dimensionEditMeta"></div>
        <label class="dim-edit-label" id="dimensionValueWrap">
          <span id="dimensionEditLabel">Yeni değer</span>
          <input id="dimensionEditInput" type="text" inputmode="numeric" autocomplete="off" />
        </label>
        <fieldset class="v66-action-fieldset">
          <legend id="dimensionActionLegend">İşlem</legend>
          <label><input type="radio" name="dimensionAction" value="resize" checked /> <span id="dimActionResize">Sadece ölçüyü değiştir</span></label>
          <label><input type="radio" name="dimensionAction" value="addSameProfile" /> <span id="dimActionAddSame">Bu aralığa aynı profilden ekle</span></label>
          <label><input type="radio" name="dimensionAction" value="addDifferentProfile" /> <span id="dimActionAddDifferent">Bu aralığa farklı profil ekle</span></label>
          <label><input type="radio" name="dimensionAction" value="placeProduct" /> <span id="dimActionProduct">Bu alana ürün yerleştir</span></label>
          <label><input type="radio" name="dimensionAction" value="editProduct" /> <span id="dimActionProfile">Mevcut ürünü düzenle</span></label>
        </fieldset>
        <div class="v66-action-options" id="dimensionActionOptions">
          <label id="productOptionWrap">Ürün
            <select id="dimensionProductSelect"></select>
          </label>
          <label id="profileOptionWrap">Profil
            <select id="dimensionProfileSelect"></select>
          </label>
          <div id="dimensionCustomProfileFields" class="dimension-custom-profile-fields" hidden>
            <label><span>En</span><input id="dimensionProfileEn" type="text" inputmode="numeric" autocomplete="off" value="100" /></label>
            <label><span>Boy</span><input id="dimensionProfileBoy" type="text" inputmode="numeric" autocomplete="off" value="100" /></label>
            <label><span>Et</span><input id="dimensionProfileEt" type="text" inputmode="numeric" autocomplete="off" value="2" /></label>
          </div>
          <div class="v66-profile-hint" id="dimensionProfileHint"></div>
        </div>
        <div id="dimensionEditError" class="dim-edit-error" aria-live="polite"></div>
        <div class="dim-edit-actions">
          <button id="dimensionEditCancel" type="button" class="dim-edit-cancel">İptal</button>
          <button id="dimensionEditApply" type="submit" class="dim-edit-apply">Tamam</button>
        </div>
      </form>`;
    previewPanel.appendChild(overlay);

    const input = overlay.querySelector('#dimensionEditInput');
    const form = overlay.querySelector('#dimensionEditForm');
    const cancel = overlay.querySelector('#dimensionEditCancel');
    const productSelect = overlay.querySelector('#dimensionProductSelect');
    const profileSelect = overlay.querySelector('#dimensionProfileSelect');
    SMART_PRODUCT_OPTIONS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = currentLanguage === 'en' ? p.en : p.tr;
      productSelect.appendChild(opt);
    });
    SMART_PROFILE_OPTIONS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = currentLanguage === 'en' ? p.en : p.tr;
      profileSelect.appendChild(opt);
    });

    const closeOverlay = () => {
      overlay.hidden = true;
      pendingDimensionEdit = null;
      focusPreviewCanvas();
    };

    const refreshActionOptions = () => {
      const action = (overlay.querySelector('input[name="dimensionAction"]:checked') || {}).value || 'resize';
      overlay.querySelector('#productOptionWrap').hidden = action !== 'placeProduct';
      overlay.querySelector('#profileOptionWrap').hidden = true;
      profileSelect.disabled = true;
      overlay.querySelector('#dimensionCustomProfileFields').hidden = action !== 'addDifferentProfile';
      overlay.querySelector('#dimensionProfileHint').textContent = '';
      input.disabled = action !== 'resize';
    };

    overlay.querySelectorAll('input[name="dimensionAction"]').forEach(r => r.addEventListener('change', refreshActionOptions));
    profileSelect.addEventListener('change', refreshActionOptions);

    overlay.querySelectorAll('#dimensionProfileEn,#dimensionProfileBoy,#dimensionProfileEt').forEach(profileInput => {
      profileInput.addEventListener('input', () => {
        const clean = String(profileInput.value || '').replace(/[^0-9]/g, '');
        if (profileInput.value !== clean) profileInput.value = clean;
        overlay.querySelector('#dimensionEditError').textContent = '';
      });
    });

    input.addEventListener('input', () => {
      const clean = String(input.value || '').replace(/[^0-9]/g, '');
      if (input.value !== clean) input.value = clean;
      overlay.querySelector('#dimensionEditError').textContent = '';
    });

    cancel.addEventListener('click', closeOverlay);
    overlay.addEventListener('mousedown', evt => { if (evt.target === overlay) closeOverlay(); });

    form.addEventListener('submit', evt => {
      evt.preventDefault();
      evt.stopPropagation();
      if (!pendingDimensionEdit) return;
      const meta = pendingDimensionEdit;
      const action = (overlay.querySelector('input[name="dimensionAction"]:checked') || {}).value || 'resize';
      const clean = String(input.value || '').replace(/[^0-9]/g, '');
      const error = overlay.querySelector('#dimensionEditError');

      const finishUpdate = (message) => {
        overlay.hidden = true;
        pendingDimensionEdit = null;
        suppressFormPreviewUpdate = true;
        try { updatePreview(false); }
        finally { window.setTimeout(() => { suppressFormPreviewUpdate = false; }, 450); }
        if (message) statusText.textContent = message;
      };

      if (action === 'resize') {
        const sideSupportGap = isLeftSideSupportGapMeta(meta);
        if (!clean || (!sideSupportGap && Number(clean) <= 0) || (sideSupportGap && Number(clean) < 0)) {
          error.textContent = sideSupportGap
            ? (currentLanguage === 'en' ? 'Enter zero or a positive number.' : 'Sıfır veya pozitif bir sayı gir.')
            : (currentLanguage === 'en' ? 'Enter a positive number.' : 'Pozitif bir sayı gir.');
          input.focus();
          return;
        }
        if (sideSupportGap) {
          try {
            resizeLeftSideSupportGap(meta, Number(clean));
          } catch (err) {
            error.textContent = err.message;
            return;
          }
          finishUpdate(currentLanguage === 'en' ? 'Support post position updated.' : 'Destek dikmesi konumu güncellendi.');
          return;
        }
        if (isFrontPostGapMeta(meta)) {
          try {
            resizeFrontPostGap(meta, Number(clean));
          } catch (err) {
            error.textContent = err.message;
            return;
          }
          finishUpdate(currentLanguage === 'en' ? 'Post gap updated.' : 'Dikme aralığı güncellendi.');
          return;
        }
        if (!meta.canResize || String(meta.field || '').startsWith('__')) {
          error.textContent = currentLanguage === 'en' ? 'This dimension is not connected to a direct resize field yet.' : 'Bu ölçü henüz doğrudan ölçü değiştirme alanına bağlı değil.';
          return;
        }
        const editedEl = $(meta.field);
        if (editedEl && editedEl._previewTimer) window.clearTimeout(editedEl._previewTimer);
        updateEditableListValue(meta.field, meta.index, clean, true);
        finishUpdate(currentLanguage === 'en' ? 'Dimension updated.' : 'Ölçü güncellendi.');
        return;
      }

      if (action === 'addSameProfile' || action === 'addDifferentProfile') {
        const sideGap = isLeftSideSupportGapMeta(meta);
        const frontGap = isFrontPostGapMeta(meta);
        if (!sideGap && !frontGap) {
          error.textContent = currentLanguage === 'en' ? 'Profile insertion is not available in this zone.' : 'Bu bölgeye profil ekleme aktif değil.';
          return;
        }
        let profile = null;
        if (action === 'addDifferentProfile') {
          const rawEn = Number(overlay.querySelector('#dimensionProfileEn').value || 0);
          const rawBoy = Number(overlay.querySelector('#dimensionProfileBoy').value || 0);
          const rawEt = Number(overlay.querySelector('#dimensionProfileEt').value || 0);
          if (!(rawEn > 0) || !(rawBoy > 0) || !(rawEt > 0) || rawEt * 2 >= Math.min(rawEn, rawBoy)) {
            error.textContent = currentLanguage === 'en'
              ? 'Enter positive width, depth and wall thickness values. Thickness must be less than half of the smaller side.'
              : 'En, Boy ve Et Kalınlığı pozitif olmalı; et kalınlığı küçük kenarın yarısından az olmalıdır.';
            return;
          }
          profile = sanitizeGlassTrackProfile({ mode: 'other', en: rawEn, boy: rawBoy, et: rawEt });
        }
        try {
          if (sideGap) addSidePostToGap(meta, profile || { mode: 'standard', en: 100, boy: 100, et: 2 });
          else insertFrontPostInGap(meta, profile);
        } catch (err) {
          error.textContent = err.message;
          return;
        }
        finishUpdate(currentLanguage === 'en' ? 'Post added at the center of the selected gap.' : 'Dikme seçilen aralığın tam ortasına eklendi.');
        return;
      }

      if (action === 'editProduct') {
        const productMeta = normalizedProductMeta(meta);
        const record = productRecordForMeta(productMeta);
        if (!record) {
          error.textContent = currentLanguage === 'en' ? 'No existing product was found in this zone.' : 'Bu alanda düzenlenecek mevcut ürün bulunamadı.';
          return;
        }
        overlay.hidden = true;
        pendingDimensionEdit = null;
        const editMeta = { ...productMeta, editProduct: true, placementId: record.placement.id, productType: record.type };
        if (record.type === 'guillotine_glass') showGuillotineDetailsOverlay(editMeta, { editExisting: true });
        else showSlidingDetailsOverlay(editMeta, { editExisting: true });
        return;
      }

      if (action === 'placeProduct') {
        const frontGap = isFrontPostGapMeta(meta);
        const sideGap = isLeftSideSupportGapMeta(meta);
        if (!frontGap && !sideGap) {
          error.textContent = currentLanguage === 'en' ? 'This zone is not ready for product placement.' : 'Bu bölge ürün yerleşimine hazır değil.';
          return;
        }
        const placementMeta = sideGap ? sideProductMeta(meta) : meta;
        if (!placementMeta || Number(placementMeta.placementWidth || placementMeta.value || 0) <= 0 || (sideGap && Number(placementMeta.placementHeight || 0) <= 0)) {
          error.textContent = currentLanguage === 'en' ? 'The selected zone is too small for a product.' : 'Seçilen bölge ürün yerleşimi için çok küçük.';
          return;
        }
        const selectedProduct = productSelect.value || 'sliding_glass';
        overlay.hidden = true;
        pendingDimensionEdit = null;
        if (selectedProduct === 'guillotine_glass') showGuillotineDetailsOverlay(placementMeta);
        else showSlidingDetailsOverlay(placementMeta);
      }
    });

    overlay.addEventListener('keydown', evt => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        closeOverlay();
      }
    });

    return overlay;
  }

  function showDimensionEditOverlay(meta) {
    const overlay = ensureDimensionEditOverlay();
    pendingDimensionEdit = meta;
    const isEn = currentLanguage === 'en';
    const labels = SMART_ACTION_LABELS[isEn ? 'en' : 'tr'];
    overlay.querySelector('#dimensionEditTitle').textContent = isEn ? 'Edit Smart Dimension' : 'Akıllı Ölçü Düzenle';
    overlay.querySelector('#dimensionEditMeta').innerHTML = `
      <b>${isEn ? 'View' : 'Görünüş'}:</b> ${escapeHtml(viewLabel(meta.view))}<br>
      <b>${isEn ? 'Dimension' : 'Ölçü'}:</b> ${escapeHtml(meta.label || '')}<br>
      <b>${isEn ? 'Current value' : 'Mevcut değer'}:</b> ${escapeHtml(meta.value || '')} mm<br>
      <b>Zone:</b> ${escapeHtml(meta.zoneId || '-')}`;
    overlay.querySelector('#dimensionEditLabel').textContent = isEn ? `${meta.label} value *(mm)` : `${meta.label} değeri *(mm)`;
    overlay.querySelector('#dimensionActionLegend').textContent = isEn ? 'Action' : 'İşlem';
    overlay.querySelector('#dimActionResize').textContent = labels.resize;
    overlay.querySelector('#dimActionAddSame').textContent = labels.addSameProfile;
    overlay.querySelector('#dimActionAddDifferent').textContent = labels.addDifferentProfile;
    overlay.querySelector('#dimActionProduct').textContent = labels.placeProduct;
    overlay.querySelector('#dimActionProfile').textContent = labels.editProfile;
    overlay.querySelector('#dimensionEditCancel').textContent = isEn ? 'Cancel' : 'İptal';
    overlay.querySelector('#dimensionEditApply').textContent = isEn ? 'OK' : 'Tamam';
    overlay.querySelector('#dimensionEditError').textContent = '';
    overlay.querySelector('#dimensionProductSelect').querySelectorAll('option').forEach((opt, i) => { const p = SMART_PRODUCT_OPTIONS[i]; if (p) opt.textContent = isEn ? p.en : p.tr; });
    overlay.querySelector('#dimensionProfileSelect').querySelectorAll('option').forEach((opt, i) => { const p = SMART_PROFILE_OPTIONS[i]; if (p) opt.textContent = isEn ? p.en : p.tr; });

    const frontPostGap = isFrontPostGapMeta(meta);
    const sideSupportGap = isLeftSideSupportGapMeta(meta);
    const postCountForGap = lastDrawing && lastDrawing.input ? Number(lastDrawing.input.postCount) || 0 : 0;
    const existingProduct = productRecordForMeta(normalizedProductMeta(meta));
    const actionMap = {
      resize: sideSupportGap ? !!meta.canResize : (frontPostGap ? (!!meta.canResize && postCountForGap > 2) : !!meta.canResize),
      addSameProfile: (frontPostGap || sideSupportGap) && !!meta.canAddSameProfile,
      addDifferentProfile: (frontPostGap || sideSupportGap) && !!meta.canAddDifferentProfile,
      placeProduct: (frontPostGap || sideSupportGap) && !!meta.canPlaceProduct && !existingProduct,
      editProduct: !!existingProduct
    };
    overlay.querySelectorAll('input[name="dimensionAction"]').forEach(r => {
      r.disabled = !actionMap[r.value];
      r.closest('label').classList.toggle('disabled', r.disabled);
      r.checked = false;
    });
    const firstAllowed = Array.from(overlay.querySelectorAll('input[name="dimensionAction"]')).find(r => !r.disabled);
    if (firstAllowed) firstAllowed.checked = true;
    const input = overlay.querySelector('#dimensionEditInput');
    input.value = String(currentEditableListValue(meta.field, meta.index, meta.value) || '').replace(/[^0-9]/g, '');
    input.disabled = !(firstAllowed && firstAllowed.value === 'resize');
    overlay.querySelectorAll('input[name="dimensionAction"]').forEach(r => {
      r.onchange = () => {
        input.disabled = r.value !== 'resize' || r.disabled;
        overlay.querySelector('#productOptionWrap').hidden = r.value !== 'placeProduct';
        overlay.querySelector('#dimensionCustomProfileFields').hidden = r.value !== 'addDifferentProfile';
      };
    });
    overlay.querySelector('#dimensionProfileSelect').disabled = true;
    overlay.querySelector('#dimensionCustomProfileFields').hidden = !(firstAllowed && firstAllowed.value === 'addDifferentProfile');
    overlay.querySelector('#profileOptionWrap').classList.add('is-disabled');
    overlay.hidden = false;
    const profileSelect = overlay.querySelector('#dimensionProfileSelect');
    profileSelect.dispatchEvent(new Event('change'));
    window.setTimeout(() => {
      if (!input.disabled) {
        input.focus({ preventScroll: true });
        input.select();
      }
    }, 20);
  }

  function showPassiveDimensionInfo(meta) {
    const overlay = ensureDimensionEditOverlay();
    pendingDimensionEdit = meta;
    const isEn = currentLanguage === 'en';
    overlay.querySelector('#dimensionEditTitle').textContent = isEn ? 'Information Dimension' : 'Bilgi Ölçüsü';
    overlay.querySelector('#dimensionEditMeta').innerHTML = `
      <b>${isEn ? 'View' : 'Görünüş'}:</b> ${escapeHtml(viewLabel(meta.view))}<br>
      <b>${isEn ? 'Dimension' : 'Ölçü'}:</b> ${escapeHtml(meta.label || '')}<br>
      <b>${isEn ? 'Current value' : 'Mevcut değer'}:</b> ${escapeHtml(meta.value || '')} mm<br>
      <b>${isEn ? 'Note' : 'Not'}:</b> ${escapeHtml(meta.passiveReason || (isEn ? 'This dimension is for information only.' : 'Bu ölçü şu an sadece bilgi amaçlıdır.'))}`;
    overlay.querySelector('#dimensionValueWrap').hidden = true;
    overlay.querySelector('.v66-action-fieldset').hidden = true;
    overlay.querySelector('#dimensionActionOptions').hidden = true;
    overlay.querySelector('#dimensionEditError').textContent = '';
    overlay.querySelector('#dimensionEditCancel').textContent = isEn ? 'Close' : 'Kapat';
    overlay.querySelector('#dimensionEditApply').hidden = true;
    overlay.hidden = false;
  }

  function restoreActiveDimensionPanelParts() {
    const overlay = ensureDimensionEditOverlay();
    overlay.querySelector('#dimensionValueWrap').hidden = false;
    overlay.querySelector('.v66-action-fieldset').hidden = false;
    overlay.querySelector('#dimensionActionOptions').hidden = false;
    overlay.querySelector('#dimensionEditApply').hidden = false;
  }


  function previewInteractionMetaFromHit(hit) {
    return {
      interactionType: hit.dataset.interactionType || '',
      postIndex: Math.max(0, Number(hit.dataset.postIndex || 0) || 0),
      currentPostCount: Math.max(0, Number(hit.dataset.currentPostCount || 0) || 0),
      totalRayCount: Math.max(0, Number(hit.dataset.totalRayCount || 0) || 0),
      placementMode: (hit.dataset.placementMode || 'standard').toLowerCase() === 'equal' ? 'equal' : 'standard',
      profileMode: hit.dataset.profileMode || '',
      profilePart: hit.dataset.profilePart || '',
      profileScope: hit.dataset.profileScope || '',
      en: Number(hit.dataset.en || 0) || 0,
      boy: Number(hit.dataset.boy || 0) || 0,
      et: Number(hit.dataset.et || 0) || 0,
      sidePostId: hit.dataset.sidePostId || '',
      sideIndex: Math.max(0, Number(hit.dataset.sideIndex || 0) || 0),
      placementId: hit.dataset.placementId || '',
      productType: hit.dataset.productType || '',
      placementView: hit.dataset.placementView || '',
      gapIndex: Math.max(0, Number(hit.dataset.gapIndex || 0) || 0),
      sideGapIndex: Math.max(0, Number(hit.dataset.sideGapIndex || 0) || 0),
      sideZone: hit.dataset.sideZone || ''
    };
  }


  function ensureGlassTrackEditorOverlay() {
    let overlay = $('glassTrackEditorOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'glassTrackEditorOverlay';
    overlay.className = 'dim-edit-overlay glass-track-editor-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <form id="glassTrackEditorForm" class="dim-edit-card glass-track-editor-card">
        <div class="dim-edit-title" id="glassTrackEditorTitle">Cam Kaydı Profili Düzenle</div>
        <div class="dim-edit-meta" id="glassTrackEditorMeta"></div>
        <div class="glass-profile-options">
          <label><input type="radio" name="glassProfileMode" value="standard" checked /> <span id="glassProfileStandard">Standart 100x100x2</span></label>
          <label><input type="radio" name="glassProfileMode" value="40x130x2" /> <span id="glassProfile40130">40x130x2</span></label>
          <label><input type="radio" name="glassProfileMode" value="other" /> <span id="glassProfileOther">Diğer</span></label>
        </div>
        <div id="glassProfileCustomFields" class="glass-profile-custom-fields" hidden>
          <label><span>En</span><input id="glassProfileEn" type="text" inputmode="numeric" autocomplete="off" /></label>
          <label><span>Boy</span><input id="glassProfileBoy" type="text" inputmode="numeric" autocomplete="off" /></label>
          <label><span>Et</span><input id="glassProfileEt" type="text" inputmode="numeric" autocomplete="off" /></label>
        </div>
        <div id="glassTrackEditorNote" class="post-editor-note"></div>
        <div id="glassTrackEditorError" class="dim-edit-error" aria-live="polite"></div>
        <div class="dim-edit-actions">
          <button id="glassTrackEditorDelete" type="button" class="dim-edit-delete" hidden>Dikmeyi Sil</button>
          <button id="glassTrackEditorCancel" type="button" class="dim-edit-cancel">İptal</button>
          <button id="glassTrackEditorApply" type="submit" class="dim-edit-apply">Tamam</button>
        </div>
      </form>`;
    previewPanel.appendChild(overlay);

    const customWrap = overlay.querySelector('#glassProfileCustomFields');
    const refresh = () => {
      const mode = (overlay.querySelector('input[name="glassProfileMode"]:checked') || {}).value || 'standard';
      customWrap.hidden = mode !== 'other';
    };
    overlay.querySelectorAll('input[name="glassProfileMode"]').forEach(r => r.addEventListener('change', refresh));
    overlay.querySelectorAll('#glassProfileEn,#glassProfileBoy,#glassProfileEt').forEach(input => {
      input.addEventListener('input', () => {
        const clean = String(input.value || '').replace(/[^0-9]/g, '');
        if (input.value !== clean) input.value = clean;
        overlay.querySelector('#glassTrackEditorError').textContent = '';
      });
    });
    const close = () => { overlay.hidden = true; focusPreviewCanvas(); };
    overlay.querySelector('#glassTrackEditorCancel').addEventListener('click', close);
    overlay.querySelector('#glassTrackEditorDelete').addEventListener('click', () => {
      const postId = overlay.dataset.sidePostId || '';
      const sideIndex = Number(overlay.dataset.sideIndex || 0) || 0;
      if (!postId) return;
      const message = currentLanguage === 'en' ? 'Delete this support post?' : 'Bu destek dikmesi silinsin mi?';
      if (!window.confirm(message)) return;
      try { deleteSidePost(sideIndex, postId); }
      catch (err) { overlay.querySelector('#glassTrackEditorError').textContent = err.message; return; }
      close();
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en' ? 'Support post deleted.' : 'Destek dikmesi silindi.';
    });
    overlay.addEventListener('click', evt => { if (evt.target === overlay) close(); });
    overlay.addEventListener('keydown', evt => { if (evt.key === 'Escape') { evt.preventDefault(); close(); } });
    overlay.querySelector('#glassTrackEditorForm').addEventListener('submit', evt => {
      evt.preventDefault();
      const mode = (overlay.querySelector('input[name="glassProfileMode"]:checked') || {}).value || 'standard';
      let next = { mode, en: 100, boy: 100, et: 2 };
      if (mode === '40x130x2') next = { mode, en: 40, boy: 130, et: 2 };
      if (mode === 'other') {
        next = {
          mode,
          en: Number(overlay.querySelector('#glassProfileEn').value || 0),
          boy: Number(overlay.querySelector('#glassProfileBoy').value || 0),
          et: Number(overlay.querySelector('#glassProfileEt').value || 0)
        };
      }
      next = sanitizeGlassTrackProfile(next);
      const err = overlay.querySelector('#glassTrackEditorError');
      if (!Number.isFinite(next.en) || !Number.isFinite(next.boy) || next.en <= 0 || next.boy <= 0) {
        err.textContent = currentLanguage === 'en' ? 'Enter positive profile dimensions.' : 'Profil ölçüleri pozitif olmalı.';
        return;
      }
      const modeType = overlay.dataset.profilePart || 'track';
      const scope = overlay.dataset.profileScope || '';
      if (modeType === 'support') {
        const sidePostId = overlay.dataset.sidePostId || '';
        const sideIndex = Number(overlay.dataset.sideIndex || 0) || 0;
        if (sidePostId) {
          const meta = { index: sideIndex };
          const posts = materializeSidePosts(meta);
          const target = posts.find(item => String(item.id) === String(sidePostId));
          if (target) { target.profile = next; storeSidePosts(meta, posts); }
        } else if (scope === 'left' || scope === 'right') glassSupportProfileState[scope] = next;
      } else {
        glassTrackProfileState = next;
        glassSupportProfileState = { left: null, right: null };
      }
      overlay.hidden = true;
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en'
        ? (modeType === 'support'
            ? `${supportProfileScopeLabel(scope, true)} profile set to ${Math.round(next.en)}x${Math.round(next.boy)}x${Math.round(next.et)}.`
            : `Glass profile set to ${Math.round(next.en)}x${Math.round(next.boy)}x${Math.round(next.et)}.`)
        : (modeType === 'support'
            ? `${supportProfileScopeLabel(scope, false)} profili ${Math.round(next.en)}x${Math.round(next.boy)}x${Math.round(next.et)} olarak ayarlandı.`
            : `Cam kaydı profili ${Math.round(next.en)}x${Math.round(next.boy)}x${Math.round(next.et)} olarak ayarlandı.`);
    });
    return overlay;
  }

  function showGlassTrackEditorOverlay(meta) {
    const overlay = ensureGlassTrackEditorOverlay();
    const isEn = currentLanguage === 'en';
    const isSupport = (meta.profilePart || '') === 'support';
    const scope = meta.profileScope || '';
    const current = sanitizeGlassTrackProfile(isSupport
      ? ({ mode: meta.profileMode || 'other', en: meta.en || 100, boy: meta.boy || 100, et: meta.et || 2 })
      : glassTrackProfileState);
    overlay.dataset.sidePostId = isSupport ? (meta.sidePostId || '') : '';
    overlay.dataset.sideIndex = isSupport ? String(Number(meta.sideIndex) || 0) : '0';
    overlay.dataset.profilePart = isSupport ? 'support' : 'track';
    overlay.dataset.profileScope = scope;
    overlay.querySelector('#glassTrackEditorTitle').textContent = isSupport
      ? (isEn ? 'Edit Support Profile' : 'Destek Dikmesi Profili Düzenle')
      : (isEn ? 'Edit Glass Track Profile' : 'Cam Kaydı Profili Düzenle');
    overlay.querySelector('#glassProfileStandard').textContent = isEn ? 'Standard 100x100x2' : 'Standart 100x100x2';
    overlay.querySelector('#glassProfile40130').textContent = '40x130x2';
    overlay.querySelector('#glassProfileOther').textContent = isEn ? 'Other' : 'Diğer';
    overlay.querySelector('#glassTrackEditorCancel').textContent = isEn ? 'Cancel' : 'İptal';
    overlay.querySelector('#glassTrackEditorApply').textContent = isEn ? 'OK' : 'Tamam';
    const deleteBtn = overlay.querySelector('#glassTrackEditorDelete');
    deleteBtn.hidden = !isSupport || !meta.sidePostId;
    deleteBtn.textContent = isEn ? 'Delete Post' : 'Dikmeyi Sil';
    overlay.querySelector('#glassTrackEditorMeta').innerHTML = `
      <b>${isEn ? 'Clicked area' : 'Tıklanan alan'}:</b> ${escapeHtml(isSupport ? supportProfileScopeLabel(scope, isEn) : (isEn ? 'glass track - whole system' : 'cam kaydı - tüm sistem'))}<br>
      <b>${isEn ? 'Effect' : 'Etki'}:</b> ${escapeHtml(isSupport ? (isEn ? 'only this support and its top-view section' : 'sadece bu destek dikmesi ve üst görünüş kesiti') : (isEn ? 'all glass tracks + default support profiles' : 'tüm cam kayıtları + varsayılan destek profilleri'))}<br>
      <b>${isEn ? 'Current' : 'Mevcut'}:</b> ${Math.round(current.en)}x${Math.round(current.boy)}x${Math.round(current.et)}`;
    overlay.querySelector('#glassTrackEditorNote').textContent = isSupport
      ? (isEn
          ? 'Support edit changes the section only. The support length stays fixed; the main glass track profile is not affected.'
          : 'Destek düzenleme yalnızca kesiti değiştirir. Destek dikmesi uzunluğu sabit kalır; ana cam kaydı profili etkilenmez.')
      : (isEn
          ? 'Glass-track edit applies to the whole drawing. Only the first left side-view glass track is used as the main edit handle.'
          : 'Cam kaydı düzenleme tüm çizime uygulanır. Ana düzenleme noktası sadece 1. poz sol yan görünüş cam kaydıdır.');
    overlay.querySelector('#glassTrackEditorError').textContent = '';
    overlay.querySelectorAll('input[name="glassProfileMode"]').forEach(r => {
      r.checked = r.value === current.mode || (current.mode === '40x130' && r.value === '40x130x2');
    });
    if (!overlay.querySelector('input[name="glassProfileMode"]:checked')) overlay.querySelector('input[name="glassProfileMode"][value="standard"]').checked = true;
    overlay.querySelector('#glassProfileEn').value = String(Math.round(current.en));
    overlay.querySelector('#glassProfileBoy').value = String(Math.round(current.boy));
    overlay.querySelector('#glassProfileEt').value = String(Math.round(current.et));
    const customWrap = overlay.querySelector('#glassProfileCustomFields');
    customWrap.hidden = (overlay.querySelector('input[name="glassProfileMode"]:checked') || {}).value !== 'other';
    overlay.hidden = false;
  }

  function ensurePostEditorOverlay() {
    let overlay = $('postEditorOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'postEditorOverlay';
    overlay.className = 'dim-edit-overlay post-editor-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <form id="postEditorForm" class="dim-edit-card">
        <div class="dim-edit-title" id="postEditorTitle">Ön Dikme Düzenle</div>
        <div class="dim-edit-meta" id="postEditorMeta"></div>
        <div class="post-editor-grid">
          <label><span id="postEditorCountLabel">Dikme adedi</span><input id="postEditorCountInput" type="text" inputmode="numeric" autocomplete="off" /></label>
          <div>
            <div class="dim-edit-label"><span id="postPlacementLegend">Dikme yerleşim mantığı</span></div>
            <div class="post-placement-options">
              <label><input type="radio" name="postPlacementMode" value="standard" checked /> <span id="postPlacementStandard">Standart bölme</span></label>
              <label><input type="radio" name="postPlacementMode" value="equal" /> <span id="postPlacementEqual">Eşit bölme</span></label>
            </div>
          </div>
          <div id="postEditorNote" class="post-editor-note"></div>
        </div>
        <div class="dim-edit-actions">
          <button id="postEditorDelete" type="button" class="dim-edit-delete">Dikmeyi Sil</button>
          <button id="postEditorCancel" type="button" class="dim-edit-cancel">İptal</button>
          <button id="postEditorApply" type="submit" class="dim-edit-apply">Tamam</button>
        </div>
      </form>`;
    previewPanel.appendChild(overlay);
    overlay.querySelector('#postEditorCancel').addEventListener('click', () => { overlay.hidden = true; });
    overlay.querySelector('#postEditorDelete').addEventListener('click', () => {
      const idx = Number(overlay.dataset.postIndex || 0) || 0;
      if (!window.confirm(currentLanguage === 'en' ? 'Delete this front post?' : 'Bu ön dikme silinsin mi?')) return;
      try { deleteFrontPost(idx); }
      catch (err) { window.alert(err.message); return; }
      overlay.hidden = true;
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en' ? 'Front post deleted.' : 'Ön dikme silindi.';
    });
    overlay.addEventListener('click', evt => { if (evt.target === overlay) overlay.hidden = true; });
    overlay.addEventListener('keydown', evt => { if (evt.key === 'Escape') { evt.preventDefault(); overlay.hidden = true; } });
    overlay.querySelector('#postEditorForm').addEventListener('submit', evt => {
      evt.preventDefault();
      const countInput = overlay.querySelector('#postEditorCountInput');
      const nextCount = Math.max(0, Number(String(countInput.value || '').replace(/[^0-9]/g, '')) || 0);
      const mode = (overlay.querySelector('input[name="postPlacementMode"]:checked') || {}).value || 'standard';
      const postEl = $('postCount');
      if (postEl) {
        postEl.value = String(nextCount);
        postEl.dataset.userEdited = 'true';
      }
      manualPostPlacementMode = mode === 'equal' ? 'equal' : 'standard';
      customFrontPostCenters = null;
      slidingPlacements = [];
      guillotinePlacements = [];
      overlay.hidden = true;
      updatePreview(false);
      statusText.textContent = currentLanguage === 'en'
        ? `Front post count set to ${nextCount}. Placement mode: ${manualPostPlacementMode === 'equal' ? 'equal division' : 'standard division'}.`
        : `Ön dikme adedi ${nextCount} olarak ayarlandı. Yerleşim modu: ${manualPostPlacementMode === 'equal' ? 'eşit bölme' : 'standart bölme'}.`;
    });
    return overlay;
  }

  function showPostEditorOverlay(meta) {
    const overlay = ensurePostEditorOverlay();
    const isEn = currentLanguage === 'en';
    overlay.querySelector('#postEditorTitle').textContent = isEn ? 'Edit Front Posts' : 'Ön Dikme Düzenle';
    overlay.querySelector('#postEditorCountLabel').textContent = isEn ? 'Post count' : 'Dikme adedi';
    overlay.querySelector('#postPlacementLegend').textContent = isEn ? 'Post placement logic' : 'Dikme yerleşim mantığı';
    overlay.querySelector('#postPlacementStandard').textContent = isEn ? 'Standard division' : 'Standart bölme';
    overlay.querySelector('#postPlacementEqual').textContent = isEn ? 'Equal division' : 'Eşit bölme';
    overlay.querySelector('#postEditorCancel').textContent = isEn ? 'Cancel' : 'İptal';
    overlay.querySelector('#postEditorApply').textContent = isEn ? 'OK' : 'Tamam';
    overlay.querySelector('#postEditorDelete').textContent = isEn ? 'Delete Post' : 'Dikmeyi Sil';
    overlay.querySelector('#postEditorDelete').disabled = Number(meta.currentPostCount || 0) <= 2;
    overlay.querySelector('#postEditorDelete').classList.toggle('disabled', Number(meta.currentPostCount || 0) <= 2);
    overlay.dataset.postIndex = String(meta.postIndex || 0);
    overlay.querySelector('#postEditorMeta').innerHTML = `
      <b>${isEn ? 'Clicked front post' : 'Tıklanan ön dikme'}:</b> ${meta.postIndex + 1} / ${Math.max(meta.currentPostCount || 0, meta.postIndex + 1)}<br>
      <b>${isEn ? 'Current post count' : 'Mevcut dikme adedi'}:</b> ${meta.currentPostCount}<br>
      <b>${isEn ? 'Ray axis count' : 'Ray aks adedi'}:</b> ${meta.totalRayCount}`;
    overlay.querySelector('#postEditorCountInput').value = String(meta.currentPostCount || ($('postCount') ? $('postCount').value : '') || '');
    overlay.querySelectorAll('input[name="postPlacementMode"]').forEach(r => { r.checked = r.value === manualPostPlacementMode; });
    overlay.querySelector('#postEditorNote').textContent = isEn
      ? 'Standard division keeps the existing axis-based logic when post count and ray axis count match. Equal division always distributes posts equally.'
      : 'Standart bölme, dikme sayısı ile ray aks sayısı eşitse mevcut aks mantığını korur. Eşit bölme seçilirse dikmeler her durumda eşit aralıkla dağıtılır.';
    overlay.hidden = false;
    const input = overlay.querySelector('#postEditorCountInput');
    window.setTimeout(() => { input.focus({ preventScroll: true }); input.select(); }, 20);
  }

  function handlePreviewDimensionEdit(evt) {
    if (toolboxSelectionMode) {
      evt.preventDefault();
      evt.stopPropagation();
      toggleToolboxSelectionFromHit(evt.target);
      return;
    }
    const dimHit = evt.target && evt.target.closest ? evt.target.closest('[data-dim-id],[data-edit-field]') : null;
    const interactionHit = !dimHit && evt.target && evt.target.closest ? evt.target.closest('[data-interaction-type="postEditor"],[data-interaction-type="glassTrackEditor"],[data-interaction-type="productEditor"]') : null;
    if (!dimHit && !interactionHit) return;
    evt.preventDefault();
    evt.stopPropagation();
    if (previewState.dragMoved) {
      previewState.dragMoved = false;
      return;
    }
    if (interactionHit) {
      const interactionMeta = previewInteractionMetaFromHit(interactionHit);
      if (interactionMeta.interactionType === 'glassTrackEditor') showGlassTrackEditorOverlay(interactionMeta);
      else if (interactionMeta.interactionType === 'postEditor') showPostEditorOverlay(interactionMeta);
      else if (interactionMeta.interactionType === 'productEditor') {
        const record = findProductByInteraction(interactionMeta);
        if (!record) return;
        const editMeta = interactionMetaToProductMeta(interactionMeta, record);
        editMeta.editProduct = true;
        editMeta.placementId = record.placement.id;
        editMeta.productType = record.type;
        if (record.type === 'guillotine_glass') showGuillotineDetailsOverlay(editMeta, { editExisting: true });
        else showSlidingDetailsOverlay(editMeta, { editExisting: true });
      }
      return;
    }
    const meta = dimensionMetaFromHit(dimHit);
    restoreActiveDimensionPanelParts();
    if (!meta.editable && !meta.canAddSameProfile && !meta.canAddDifferentProfile && !meta.canPlaceProduct && !findProductForMeta(normalizedProductMeta(meta))) {
      showPassiveDimensionInfo(meta);
      return;
    }
    showDimensionEditOverlay(meta);
  }

  function bindPreviewKeyboardGuard() {
    document.addEventListener('keydown', evt => {
      if (toolboxSelectionMode) {
        const active = document.activeElement;
        const tag = active && active.tagName ? active.tagName.toLowerCase() : '';
        const isFormField = ['input','select','textarea','button'].includes(tag) && active !== preview;
        if (evt.key === 'Escape') {
          evt.preventDefault();
          cancelToolboxSelection(currentLanguage === 'en' ? 'Selection cancelled.' : 'Seçim iptal edildi.');
          return;
        }
        if (evt.key === 'Enter' && !isFormField) {
          evt.preventDefault();
          finishToolboxSelection();
          return;
        }
      }
      if (evt.key !== 'Enter' && evt.key !== ' ') return;
      const expanded = !!(previewPanel && previewPanel.classList.contains('is-expanded'));
      if (!expanded) return;
      const active = document.activeElement;
      if (active && active.id === 'expandPreviewBtn') {
        evt.preventDefault();
        evt.stopPropagation();
        focusPreviewCanvas();
      }
    }, true);
  }

  function bindPreviewInteractions() {
    preview.addEventListener('click', handlePreviewDimensionEdit);
    preview.addEventListener('contextmenu', evt => {
      if (!toolboxSelectionMode) return;
      evt.preventDefault();
      evt.stopPropagation();
      showToolboxContextMenu(evt.clientX, evt.clientY);
    });

    preview.addEventListener('wheel', evt => {
      if (!getPreviewSvg()) return;
      evt.preventDefault();
      const factor = evt.deltaY < 0 ? 1.14 : (1 / 1.14);
      setPreviewZoom(previewState.zoom * factor, evt.clientX, evt.clientY);
    }, { passive: false });

    preview.addEventListener('pointerdown', evt => {
      if (evt.target && evt.target.closest && evt.target.closest('[data-dim-id],[data-edit-field],[data-interaction-type]')) return;
      if (evt.button !== 0 || !getPreviewSvg()) return;
      previewState.dragActive = true;
      previewState.pointerId = evt.pointerId;
      previewState.dragStartX = evt.clientX;
      previewState.dragStartY = evt.clientY;
      previewState.dragMoved = false;
      previewState.dragScrollLeft = preview.scrollLeft;
      previewState.dragScrollTop = preview.scrollTop;
      preview.classList.add('is-dragging');
      if (preview.setPointerCapture) {
        try { preview.setPointerCapture(evt.pointerId); } catch (_) {}
      }
      evt.preventDefault();
    });

    preview.addEventListener('pointermove', evt => {
      if (!previewState.dragActive) return;
      const dx = evt.clientX - previewState.dragStartX;
      const dy = evt.clientY - previewState.dragStartY;
      if (Math.abs(dx) + Math.abs(dy) > 6) previewState.dragMoved = true;
      preview.scrollLeft = previewState.dragScrollLeft - dx;
      preview.scrollTop = previewState.dragScrollTop - dy;
    });

    const stopDrag = evt => {
      if (evt && preview.releasePointerCapture && previewState.pointerId !== null) {
        try { preview.releasePointerCapture(previewState.pointerId); } catch (_) {}
      }
      previewState.dragActive = false;
      previewState.pointerId = null;
      preview.classList.remove('is-dragging');
    };

    preview.addEventListener('pointerup', stopDrag);
    preview.addEventListener('pointercancel', stopDrag);
    preview.addEventListener('dblclick', evt => {
      if (!getPreviewSvg()) return;
      const next = previewState.zoom < 1.6 ? Math.max(1.8, previewState.zoom * 1.6) : 1;
      setPreviewZoom(next, evt.clientX, evt.clientY);
    });
    // Pencere boyutu değişse bile kullanıcı zoom'u korunur; yeniden sığdırma yalnızca Fit butonuyla yapılır.
  }

  function deepCloneJson(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function cleanProjectFileToken(value, fallback) {
    const raw = String(value ?? '').trim();
    const safe = window.PulumurModernDXF && typeof window.PulumurModernDXF.safeFileName === 'function'
      ? window.PulumurModernDXF.safeFileName(raw)
      : raw.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    return safe || fallback;
  }

  function createProjectSnapshot() {
    const formData = {};
    ids.forEach(id => {
      const el = $(id);
      if (!el) return;
      const rawValue = String(el.value ?? '');
      formData[id] = BOOLEAN_FIELD_IDS.includes(id)
        ? normalizeYesNo(rawValue)
        : (upperTableFieldIds.includes(id) ? rawValue.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : rawValue);
    });

    return {
      format: PROJECT_FORMAT,
      schemaVersion: PROJECT_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      savedAt: new Date().toISOString(),
      record: deepCloneJson(currentProjectRecord),
      metadata: {
        customerName: formData.customer || '',
        projectName: formData.project || '',
        drawingVersion: formData.version || '',
        productType: formData.product || 'Pergo Rise',
        moduleName: formData.moduleName || 'Module 1',
        drawingEngine: formData.engine || 'Web DXF'
      },
      formData,
      drawingState: {
        manualPostPlacementMode,
        glassTrackProfile: sanitizeGlassTrackProfile(glassTrackProfileState),
        glassTrackSupportProfiles: {
          left: sanitizeOptionalGlassTrackProfile(glassSupportProfileState.left),
          right: sanitizeOptionalGlassTrackProfile(glassSupportProfileState.right)
        },
        frontPostCenters: Array.isArray(customFrontPostCenters) ? customFrontPostCenters.map(Number) : null,
        sideSupportCenters: { ...customSideSupportCenters },
        sidePosts: deepCloneJson(customSidePosts) || {},
        frontPostProfiles: deepCloneJson(frontPostProfiles) || [],
        slidingPlacements: deepCloneJson(slidingPlacements) || [],
        sideSlidingPlacements: deepCloneJson(sideSlidingPlacements) || [],
        guillotinePlacements: deepCloneJson(guillotinePlacements) || [],
        sideGuillotinePlacements: deepCloneJson(sideGuillotinePlacements) || [],
        manualInputFlags: {
          rayCount: Boolean($('rayCount') && $('rayCount').dataset.userEdited === 'true'),
          postCount: Boolean($('postCount') && $('postCount').dataset.userEdited === 'true')
        }
      },
      uiSettings: {
        language: currentLanguage,
        dimensions: {
          main: isPreviewToggleOn($('showMainDims')),
          all: isPreviewToggleOn($('showAllDims'))
        }
      }
    };
  }

  function normalizeProjectSnapshot(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(currentLanguage === 'en' ? 'The project file is not a valid JSON object.' : 'Proje dosyası geçerli bir JSON nesnesi değil.');
    }
    if (raw.format !== PROJECT_FORMAT) {
      throw new Error(currentLanguage === 'en' ? 'This is not a Pülümür project file.' : 'Bu dosya Pülümür proje dosyası değil.');
    }
    const schemaVersion = Number(raw.schemaVersion);
    if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
      throw new Error(currentLanguage === 'en' ? 'The project schema version is invalid.' : 'Proje veri şeması sürümü geçersiz.');
    }
    if (schemaVersion > PROJECT_SCHEMA_VERSION) {
      throw new Error(currentLanguage === 'en'
        ? `This project was created with a newer data schema (v${schemaVersion}).`
        : `Bu proje daha yeni bir veri şemasıyla oluşturulmuş (v${schemaVersion}).`);
    }
    if (!raw.formData || typeof raw.formData !== 'object' || Array.isArray(raw.formData)) {
      throw new Error(currentLanguage === 'en' ? 'The project form data is missing.' : 'Projenin form verileri eksik.');
    }
    return deepCloneJson(raw);
  }

  function restoreProjectSnapshot(rawSnapshot, options = {}) {
    const snapshot = normalizeProjectSnapshot(rawSnapshot);
    const formData = snapshot.formData || {};
    const record = snapshot.record || {};
    const drawingState = snapshot.drawingState || {};
    const uiSettings = snapshot.uiSettings || {};
    const nextLanguage = uiSettings.language === 'en' ? 'en' : 'tr';

    suppressFormPreviewUpdate = true;
    try {
      currentProjectRecord = {
        projectId: record.projectId ? String(record.projectId) : null,
        projectCode: record.projectCode ? String(record.projectCode) : null,
        revisionNo: Number.isInteger(Number(record.revisionNo)) && Number(record.revisionNo) > 0 ? Number(record.revisionNo) : 1
      };

      if ($('languageSelect')) $('languageSelect').value = nextLanguage;
      translateUI(nextLanguage);

      ids.forEach(id => {
        const el = $(id);
        if (!el || formData[id] === undefined || formData[id] === null) return;
        el.value = BOOLEAN_FIELD_IDS.includes(id) ? normalizeYesNo(formData[id]) : String(formData[id]);
        autosizeTextarea(el);
      });

      manualPostPlacementMode = typeof drawingState.manualPostPlacementMode === 'string'
        ? drawingState.manualPostPlacementMode
        : 'standard';
      glassTrackProfileState = sanitizeGlassTrackProfile(drawingState.glassTrackProfile);
      const supports = drawingState.glassTrackSupportProfiles || {};
      glassSupportProfileState = {
        left: sanitizeOptionalGlassTrackProfile(supports.left),
        right: sanitizeOptionalGlassTrackProfile(supports.right)
      };
      customFrontPostCenters = Array.isArray(drawingState.frontPostCenters)
        ? drawingState.frontPostCenters.map(Number).filter(Number.isFinite)
        : null;
      customSideSupportCenters = drawingState.sideSupportCenters && typeof drawingState.sideSupportCenters === 'object'
        ? Object.fromEntries(Object.entries(drawingState.sideSupportCenters).map(([key, value]) => [String(key), Number(value)]).filter(([, value]) => Number.isFinite(value)))
        : {};
      customSidePosts = drawingState.sidePosts && typeof drawingState.sidePosts === 'object'
        ? deepCloneJson(drawingState.sidePosts) || {}
        : {};
      frontPostProfiles = Array.isArray(drawingState.frontPostProfiles)
        ? deepCloneJson(drawingState.frontPostProfiles) || []
        : [];
      slidingPlacements = Array.isArray(drawingState.slidingPlacements)
        ? deepCloneJson(drawingState.slidingPlacements)
        : [];
      sideSlidingPlacements = Array.isArray(drawingState.sideSlidingPlacements)
        ? deepCloneJson(drawingState.sideSlidingPlacements)
        : [];
      guillotinePlacements = Array.isArray(drawingState.guillotinePlacements)
        ? deepCloneJson(drawingState.guillotinePlacements)
        : [];
      sideGuillotinePlacements = Array.isArray(drawingState.sideGuillotinePlacements)
        ? deepCloneJson(drawingState.sideGuillotinePlacements)
        : [];
      pendingSlidingPlacementMeta = null;
      pendingGuillotinePlacementMeta = null;

      const manualFlags = drawingState.manualInputFlags || {};
      if ($('rayCount')) $('rayCount').dataset.userEdited = manualFlags.rayCount ? 'true' : 'false';
      if ($('postCount')) $('postCount').dataset.userEdited = manualFlags.postCount ? 'true' : 'false';

      updateRemoteOptions(true);

      const dimensions = uiSettings.dimensions || {};
      const mainOn = dimensions.main !== false;
      const allOn = mainOn && dimensions.all === true;
      setPreviewToggleState($('showMainDims'), mainOn);
      setPreviewToggleState($('showAllDims'), allOn);
      previewDimensionFilter.main = mainOn;
      previewDimensionFilter.all = allOn;

      document.querySelectorAll('.quick-test-btn.active').forEach(btn => btn.classList.remove('active'));
    } finally {
      suppressFormPreviewUpdate = false;
    }

    const drawing = updatePreview(options.resetZoom === true);
    if (!drawing && options.requireValidDrawing === true) {
      throw new Error(currentLanguage === 'en'
        ? 'The project data was loaded, but the drawing could not be rebuilt.'
        : 'Proje verileri yüklendi ancak çizim yeniden oluşturulamadı.');
    }
    return drawing;
  }


  function restoreProjectSnapshotWithHistory(rawSnapshot, options = {}) {
    const shouldResetHistory = options.resetHistory === true;
    const previousRestoring = projectHistory.restoring;
    if (shouldResetHistory) projectHistory.restoring = true;
    let drawing;
    try {
      drawing = restoreProjectSnapshot(rawSnapshot, options);
    } finally {
      if (shouldResetHistory) projectHistory.restoring = previousRestoring;
    }
    if (shouldResetHistory) {
      resetProjectHistory(false);
      if (drawing) recordProjectHistoryState({ force: true });
    }
    return drawing;
  }

  function serializeProjectSnapshot(snapshot = createProjectSnapshot()) {
    return JSON.stringify(normalizeProjectSnapshot(snapshot), null, 2);
  }

  function parseProjectSnapshot(text) {
    let raw;
    try {
      raw = JSON.parse(String(text ?? ''));
    } catch (err) {
      throw new Error(currentLanguage === 'en' ? 'The project file contains invalid JSON.' : 'Proje dosyasındaki JSON içeriği geçersiz.');
    }
    return normalizeProjectSnapshot(raw);
  }

  function projectSnapshotFileName(snapshot) {
    const meta = (snapshot && snapshot.metadata) || {};
    const record = (snapshot && snapshot.record) || {};
    const projectName = cleanProjectFileToken(meta.projectName, currentLanguage === 'en' ? 'project' : 'proje');
    const revisionNo = Number(record.revisionNo) > 0 ? Number(record.revisionNo) : 1;
    const revision = `R${String(revisionNo).padStart(2, '0')}`;
    const projectCode = cleanProjectFileToken(record.projectCode, 'LOCAL');
    return `${projectCode}-${projectName}-${revision}.plmr`;
  }

  function exportProjectSnapshot() {
    try {
      const snapshot = createProjectSnapshot();
      const filename = projectSnapshotFileName(snapshot);
      downloadText(filename, serializeProjectSnapshot(snapshot), 'application/json;charset=utf-8');
      statusText.textContent = currentLanguage === 'en'
        ? `Project file downloaded: ${filename}`
        : `Proje dosyası indirildi: ${filename}`;
      if (window.PulumurActivity) {
        const record = getCurrentProjectRecord();
        void window.PulumurActivity.log('project_file_download', {
          projectId: record.projectId, projectCode: record.projectCode, revisionNo: record.revisionNo,
          detail: { filename }
        });
      }
    } catch (err) {
      statusText.textContent = err.message;
      window.alert(err.message);
      console.error(err);
    }
  }

  async function importProjectSnapshotFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(currentLanguage === 'en' ? 'The project file is larger than 5 MB.' : 'Proje dosyası 5 MB sınırından büyük.');
    }
    const text = await file.text();
    const snapshot = parseProjectSnapshot(text);
    restoreProjectSnapshotWithHistory(snapshot, { resetZoom: false, resetHistory: true });
    statusText.textContent = currentLanguage === 'en'
      ? `Project loaded: ${file.name}`
      : `Proje yüklendi: ${file.name}`;
  }

  function openProjectSnapshotPicker() {
    const input = $('projectImportInput');
    if (!input) return;
    input.value = '';
    input.click();
  }

  function getCurrentProjectRecord() {
    return deepCloneJson(currentProjectRecord);
  }

  function setCurrentProjectRecord(record = {}) {
    currentProjectRecord = {
      projectId: record.projectId ? String(record.projectId) : null,
      projectCode: record.projectCode ? String(record.projectCode) : null,
      revisionNo: Number.isInteger(Number(record.revisionNo)) && Number(record.revisionNo) > 0 ? Number(record.revisionNo) : 1
    };
    return getCurrentProjectRecord();
  }

  window.PulumurProjectState = Object.freeze({
    format: PROJECT_FORMAT,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    createSnapshot: createProjectSnapshot,
    restoreSnapshot: restoreProjectSnapshotWithHistory,
    resetHistory: (captureCurrent = true) => resetProjectHistory(captureCurrent),
    serialize: serializeProjectSnapshot,
    parse: parseProjectSnapshot,
    getRecord: getCurrentProjectRecord,
    setRecord: setCurrentProjectRecord
  });

  function downloadBlob(filename, blob) {
    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
  }

  function downloadText(filename, text, mime = 'application/octet-stream;charset=utf-8') {
    downloadBlob(filename, new Blob([text], { type: mime }));
  }

  function buildNameRoot(drawing) {
    const record = currentProjectRecord || {};
    const revisionNo = Number(record.revisionNo) > 0 ? Number(record.revisionNo) : 1;
    const revision = `R${String(revisionNo).padStart(2, '0')}`;
    const projectCode = record.projectCode || 'LOCAL';
    return window.PulumurModernDXF.safeFileName(`${projectCode}-${drawing.input.project}-${revision}-${drawing.input.product}-web-dxf-v8_6_0-v${drawing.input.version}`);
  }

  function currentDxfDimensionHiddenLayers() {
    const mainOn = isPreviewToggleOn($('showMainDims'));
    const allOn = mainOn && isPreviewToggleOn($('showAllDims'));
    return {
      'Ölçüler - Ana': !mainOn,
      'Ölçüler - Detay': !allOn
    };
  }

  function generateDxf() {
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      drawing.hiddenLayers = currentDxfDimensionHiddenLayers();
      const engine = window.PulumurModernDXF;
      if (!engine || typeof engine.toDxf !== 'function') {
        throw new Error(currentLanguage === 'en'
          ? 'The Modern DXF engine could not be loaded (modernDxfTemplate.js / dxfModernEngine.js).'
          : 'Modern DXF motoru yüklenemedi (modernDxfTemplate.js / dxfModernEngine.js).');
      }
      const dxf = engine.toDxf(drawing);
      if (!dxf || dxf.length < 100) throw new Error(currentLanguage === 'en' ? 'The generated DXF is empty.' : 'DXF içeriği boş oluştu.');
      const nameRoot = buildNameRoot(drawing);
      downloadText(`${nameRoot}.dxf`, dxf, 'application/dxf;charset=utf-8');
      statusText.textContent = currentLanguage === 'en'
        ? `DXF downloaded: ${nameRoot}.dxf`
        : `DXF indirildi: ${nameRoot}.dxf`;
      if (window.PulumurActivity) {
        const record = getCurrentProjectRecord();
        void window.PulumurActivity.log('dxf_download', {
          projectId: record.projectId, projectCode: record.projectCode, revisionNo: record.revisionNo,
          detail: { filename: `${nameRoot}.dxf` }
        });
      }
    } catch (err) {
      statusText.textContent = currentLanguage === 'en' ? `DXF generation error: ${err.message}` : `DXF oluşturma hatası: ${err.message}`;
      window.alert(currentLanguage === 'en' ? `DXF generation error:
${err.message}` : `DXF oluşturma hatası:
${err.message}`);
      console.error(err);
    }
  }

  function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    const existing = document.querySelector('script[data-jspdf="1"]');
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(window.jspdf && window.jspdf.jsPDF), { once: true });
        existing.addEventListener('error', () => reject(new Error(currentLanguage === 'en' ? 'jsPDF could not be loaded.' : 'jsPDF yüklenemedi.')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.dataset.jspdf = '1';
      script.onload = () => resolve(window.jspdf && window.jspdf.jsPDF);
      script.onerror = () => reject(new Error(currentLanguage === 'en' ? 'PDF library could not be loaded.' : 'PDF kütüphanesi yüklenemedi.'));
      document.head.appendChild(script);
    });
  }

  function hexToRgb(hex) {
    const clean = String(hex || '#000000').replace('#', '').trim();
    if (clean.length !== 6) return [0, 0, 0];
    const value = Number.parseInt(clean, 16);
    if (!Number.isFinite(value)) return [0, 0, 0];
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  const ACI_HEX = {
    1: '#ff0000',
    2: '#ffff00',
    3: '#00ff00',
    4: '#00ffff',
    5: '#0000ff',
    6: '#ff00ff',
    7: '#000000',
    8: '#808080',
    9: '#c0c0c0',
    42: '#ffbf00',
    130: '#00bf00',
    256: null
  };

  function aciColorToHex(color, fallback = '#000000') {
    if (window.PulumurGeometry && typeof window.PulumurGeometry.aciColorToHex === 'function') {
      return window.PulumurGeometry.aciColorToHex(color, fallback);
    }
    const n = Number(color);
    if (!Number.isFinite(n) || n === 256 || n === 0) return fallback;
    return ACI_HEX[n] || fallback;
  }

  function entityPdfColor(ent, st) {
    return aciColorToHex(ent && ent.color, (st && st.stroke) || '#000000');
  }

  function pdfPageForBounds(box) {
    const ratio = Math.max(0.1, Math.min(10, box.width / Math.max(1, box.height)));
    const landscape = ratio >= 1;
    return landscape
      ? { width: 1189, height: 841, orientation: 'landscape' }
      : { width: 841, height: 1189, orientation: 'portrait' };
  }

  function setPdfStroke(pdf, ent, layerStyle, scale) {
    const st = layerStyle[ent.layer] || layerStyle.OUTLINE || { stroke: '#000000', width: 1 };
    const [r, g, b] = hexToRgb(entityPdfColor(ent, st));
    pdf.setDrawColor(r, g, b);
    pdf.setTextColor(r, g, b);
    // DraftSight çıktısına yakın A0 görünümü: ince, vektörel ve keskin çizgi.
    const lw = Math.max(0.04, Math.min(0.30, (Number(st.width) || 1) * scale * 0.85));
    pdf.setLineWidth(lw);
    if (st.dash && typeof pdf.setLineDashPattern === 'function') {
      const dash = String(st.dash).split(/\s+/).map(Number).filter(Number.isFinite).map(v => Math.max(0.12, v * scale));
      pdf.setLineDashPattern(dash.length ? dash : [], 0);
    } else if (typeof pdf.setLineDashPattern === 'function') {
      pdf.setLineDashPattern([], 0);
    }
  }

  function writePdfText(pdf, ent, mx, my, scale) {
    const raw = String(ent.value || '');
    if (!raw) return;
    const fontMm = Math.max(0.75, (Number(ent.height) || 100) * scale);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fontMm * 72 / 25.4);
    const align = ent.align === 'center' ? 'center' : (ent.align === 'right' ? 'right' : 'left');
    const lines = ent.type === 'mtext' ? raw.split('\\P') : [raw];
    lines.forEach((line, idx) => {
      pdf.text(line, mx(ent.x), my(ent.y) + idx * fontMm * 1.15, {
        align,
        baseline: 'middle',
        angle: -(Number(ent.rotation) || 0)
      });
    });
  }

  function drawVectorPdf(pdf, drawing, page, margin) {
    const flat = window.PulumurGeometry.flattenDrawingForExport
      ? window.PulumurGeometry.flattenDrawingForExport(drawing)
      : { entities: drawing.entities || [], bounds: window.PulumurGeometry.bounds(drawing.entities || []), layerStyle: drawing.layerStyle || window.PulumurGeometry.LAYER_STYLE };
    const box = flat.bounds;
    const usableW = Math.max(1, page.width - margin * 2);
    const usableH = Math.max(1, page.height - margin * 2);
    const scale = Math.min(usableW / Math.max(1, box.width), usableH / Math.max(1, box.height));
    const contentW = box.width * scale;
    const contentH = box.height * scale;
    const offsetX = (page.width - contentW) / 2 - box.minX * scale;
    const offsetY = (page.height - contentH) / 2 + box.maxY * scale;
    const mx = x => offsetX + x * scale;
    const my = y => offsetY - y * scale;
    const layerStyle = flat.layerStyle || window.PulumurGeometry.LAYER_STYLE;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, page.width, page.height, 'F');
    (flat.entities || []).forEach(ent => {
      setPdfStroke(pdf, ent, layerStyle, scale);
      if (ent.type === 'line') {
        pdf.line(mx(ent.x1), my(ent.y1), mx(ent.x2), my(ent.y2));
      } else if (ent.type === 'polyline') {
        const pts = ent.points || [];
        for (let i = 0; i < pts.length - 1; i += 1) pdf.line(mx(pts[i][0]), my(pts[i][1]), mx(pts[i + 1][0]), my(pts[i + 1][1]));
        if (ent.closed && pts.length > 2) pdf.line(mx(pts[pts.length - 1][0]), my(pts[pts.length - 1][1]), mx(pts[0][0]), my(pts[0][1]));
      } else if (ent.type === 'circle') {
        pdf.circle(mx(ent.x), my(ent.y), Math.abs(ent.r) * scale, 'S');
      } else if (ent.type === 'text' || ent.type === 'mtext') {
        writePdfText(pdf, ent, mx, my, scale);
      }
    });
    if (typeof pdf.setLineDashPattern === 'function') pdf.setLineDashPattern([], 0);
  }

  async function generatePdf() {
    preview.classList.add('is-loading');
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      const jsPDF = await ensureJsPdf();
      if (!jsPDF) throw new Error(currentLanguage === 'en' ? 'PDF library is not available.' : 'PDF kütüphanesi aktif değil.');
      const flat = window.PulumurGeometry.flattenDrawingForExport
        ? window.PulumurGeometry.flattenDrawingForExport(drawing)
        : { bounds: window.PulumurGeometry.bounds(drawing.entities || []) };
      const page = pdfPageForBounds(flat.bounds);
      const pdf = new jsPDF({ orientation: page.orientation, unit: 'mm', format: [page.width, page.height], compress: true, precision: 12, putOnlyUsedFonts: true });
      drawVectorPdf(pdf, drawing, page, 6);
      const blob = pdf.output('blob');
      const nameRoot = buildNameRoot(drawing);
      downloadBlob(`${nameRoot}.pdf`, blob);
      statusText.textContent = currentLanguage === 'en' ? `PDF downloaded: ${nameRoot}.pdf` : `PDF indirildi: ${nameRoot}.pdf`;
      if (window.PulumurActivity) {
        const record = getCurrentProjectRecord();
        void window.PulumurActivity.log('pdf_download', {
          projectId: record.projectId, projectCode: record.projectCode, revisionNo: record.revisionNo,
          detail: { filename: `${nameRoot}.pdf` }
        });
      }
    } catch (err) {
      statusText.textContent = currentLanguage === 'en' ? `PDF generation error: ${err.message}` : `PDF oluşturma hatası: ${err.message}`;
      window.alert(currentLanguage === 'en' ? `PDF generation error:\n${err.message}` : `PDF oluşturma hatası:\n${err.message}`);
      console.error(err);
    } finally {
      preview.classList.remove('is-loading');
    }
  }

  function syncExpandButton() {
    const btn = $('expandPreviewBtn');
    if (!btn || !previewPanel) return;
    const expanded = previewPanel.classList.contains('is-expanded');
    const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
    btn.textContent = expanded ? txt.shrinkPreviewBtn : txt.expandPreviewBtn;
  }

  function focusPreviewCanvas() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    if (preview && typeof preview.focus === 'function') {
      window.setTimeout(() => preview.focus({ preventScroll: true }), 30);
    }
  }

  function capturePreviewViewport() {
    const totalScale = Math.max(0.0001, (Number(previewState.baseScale) || 1) * (Number(previewState.zoom) || 1));
    return {
      worldCenterX: (preview.scrollLeft + preview.clientWidth / 2) / totalScale,
      worldCenterY: (preview.scrollTop + preview.clientHeight / 2) / totalScale,
      totalScale
    };
  }

  function restorePreviewViewport(viewport) {
    if (!viewport) return;
    const totalScale = Math.max(0.0001, viewport.totalScale || ((Number(previewState.baseScale) || 1) * (Number(previewState.zoom) || 1)));
    preview.scrollLeft = Math.max(0, viewport.worldCenterX * totalScale - preview.clientWidth / 2);
    preview.scrollTop = Math.max(0, viewport.worldCenterY * totalScale - preview.clientHeight / 2);
  }

  async function togglePreviewFullscreen() {
    if (!previewPanel) return;
    const viewport = capturePreviewViewport();
    const expanded = !previewPanel.classList.contains('is-expanded');
    // Native Fullscreen API kullanılmaz: tarayıcının Esc davranışı büyük önizlemeyi
    // istemeden küçültmesin. Büyük önizleme sadece bu butonla açılır/kapanır.
    previewPanel.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('preview-expanded-open', expanded);
    window.requestAnimationFrame(() => {
      restorePreviewViewport(viewport);
      window.requestAnimationFrame(() => restorePreviewViewport(viewport));
      focusPreviewCanvas();
    });
    syncExpandButton();
  }

  function resetForm() {
    resetProjectHistory(false);
    fillInitial();
    document.querySelectorAll('.quick-test-btn.active').forEach(btn => btn.classList.remove('active'));
    updatePreview();
  }

  function n(id) {
    const value = $(id).value;
    if (value === '') return null;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function setValue(id, value, digits = 0) {
    if (value === null || value === undefined || !Number.isFinite(value)) return;
    $(id).value = Number(value).toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function calculateMissing() {
    const angle = $('calcAngle').value;
    const opening = $('calcOpening').value;
    const rear = $('calcRear').value;
    const front = $('calcFront').value;
    try {
      const br = window.PulumurExcelBridge;
      const result = br.calculateSystem({ angle, opening, rear, front });
      lastCalc = result;

      const ids = ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'];
      const targetId = ids[result.missingIndex];
      $(targetId).value = result.resultText;
      {
        const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
        $('calcResult').textContent = `${txt.calcReady} (${result.pozSay} ${txt.calcPoz}): ${result.resultText}`;
      }
      return result;
    } catch (err) {
      $('calcResult').textContent = err.message;
      lastCalc = null;
      return null;
    }
  }

  function transferCalc() {
    const result = lastCalc || calculateMissing();
    if (!result) return;
    const ids = ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'];
    // Excel "Değerleri Hücrelere Aktar" davranışına web karşılığı:
    // Açılım / Arka Yükseklik / Ön Yükseklik ana forma aktarılır.
    if ($('calcOpening').value) $('opening').value = $('calcOpening').value;
    if ($('calcRear').value) $('rearHeight').value = $('calcRear').value;
    if ($('calcFront').value) $('frontHeight').value = $('calcFront').value;
    updatePreview();
    $('calculatorDialog').close();
  }

  function clearCalc() {
    ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'].forEach(id => { $(id).value = ''; });
    $('calcResult').textContent = (UI_TEXT[currentLanguage] || UI_TEXT.tr).calcWaiting;
    lastCalc = null;
  }

  function openCalculator() {
    $('calcOpening').value = $('opening').value || '';
    $('calcRear').value = $('rearHeight').value || '';
    $('calcFront').value = $('frontHeight').value || '';
    $('calcAngle').value = '';
    $('calcResult').textContent = (UI_TEXT[currentLanguage] || UI_TEXT.tr).calcOpenNote;
    $('calculatorDialog').showModal();
  }

  const WEB_HELP_TEXT_TR = `WEB KULLANIM KILAVUZU
Pülümür Automation Studio, Pergo Rise Module 1 için DXF ve A0 PDF üretir.

1) Temel kullanım
- Proje bilgilerini yaz.
- Sistem ölçülerini mm olarak gir.
- Önizleme otomatik oluşur.
- PDF İndir veya DXF İndir butonlarını kullan.
- DXF İndir butonu düzenlenebilir modern DXF dosyası üretir.

2) Çoklu poz
- Değerleri noktalı virgül (;) ile ayır.
- Örnek genişlik: 4000;4500;5000
- Örnek açılım: 4500;5200;6000
- Tek değer yazarsan tüm pozlar için ortak kabul edilir.

3) NO modu
- Genişlikte sonuna ;NO yazabilirsin.
- Örnek: 3000;100;3000;NO
- Bu durumda aradaki 100 ara boşluktur.

4) Otomatik ray ve dikme
- Ray sayısı genişliğe göre otomatik gelir.
- Cam Kaydı EVET ise ray hesabı gerçek çizim genişliğine göre yapılır.
- Ray veya dikme sayısını manuel yazarsan o değer kullanılır.

5) Önizleme
- Mouse tekerleği ile yakınlaş / uzaklaş.
- Sol tuşa basılı tutup sürükle.
- Çizimi Sığdır ile tekrar ekrana oturt.

6) Dil
- Türkçe veya İngilizce seçebilirsin.`;

  const WEB_HELP_TEXT_EN = `WEB USER GUIDE
Pulumur Automation Studio creates DXF and A0 PDF files for Pergo Rise Module 1.

1) Basic use
- Write the project information.
- Enter the system dimensions in mm.
- The preview is created automatically.
- Use Download PDF or Download DXF.
- Download DXF creates an editable modern DXF file.

2) Multiple positions
- Separate values with semicolon (;).
- Width example: 4000;4500;5000
- Projection example: 4500;5200;6000
- If you write one value, it is used for all positions.

3) NO mode
- In Width, you can write ;NO at the end.
- Example: 3000;100;3000;NO
- Here, 100 is the gap between systems.

4) Automatic rail and post count
- Rail count is calculated from the width.
- If Glass Gable is YES, the rail count uses the real drawing width.
- If you write rail or post count manually, your value is used.

5) Preview
- Use the mouse wheel to zoom in and out.
- Hold left mouse button and drag to move.
- Use Fit Drawing to fit the drawing again.

6) Language
- You can use Turkish or English.`;

  function showHelp() {
    const dialog = $('helpDialog');
    const box = $('helpContent');
    const text = currentLanguage === 'en' ? WEB_HELP_TEXT_EN : WEB_HELP_TEXT_TR;
    if (dialog && box) {
      box.textContent = text;
      dialog.showModal();
    } else {
      alert(text);
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function optionValuesForInput(input) {
    const key = input && input.dataset ? input.dataset.excelCombo : '';
    if (key === 'remote') {
      const motorValue = $('motor') ? $('motor').value : '-';
      const motorKey = String(motorValue || '-').trim().toLocaleUpperCase('tr-TR');
      return REMOTE_OPTIONS_BY_MOTOR[motorKey] || ['-'];
    }
    return key && EXCEL_COMBO_OPTIONS[key] ? EXCEL_COMBO_OPTIONS[key] : [];
  }

  function closeAllCombos(except) {
    document.querySelectorAll('.excel-combo.open').forEach(box => {
      if (box !== except) box.classList.remove('open');
    });
  }

  function buildComboMenu(input, box) {
    let menu = box.querySelector('.excel-combo-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'excel-combo-menu';
      box.appendChild(menu);
    }
    const values = optionValuesForInput(input);
    const current = String(input.value || '').trim().toLocaleUpperCase('tr-TR');
    menu.innerHTML = values.map(v => {
      const selected = String(v).trim().toLocaleUpperCase('tr-TR') === current ? ' selected' : '';
      return `<button type="button" class="excel-combo-option${selected}" data-value="${escapeHtml(v)}">${escapeHtml(v)}</button>`;
    }).join('') || '<div class="excel-combo-empty">Liste yok</div>';
    menu.querySelectorAll('.excel-combo-option').forEach(btn => {
      btn.addEventListener('mousedown', evt => evt.preventDefault());
      btn.addEventListener('click', () => {
        input.value = btn.dataset.value || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        box.classList.remove('open');
        input.focus();
      });
    });
  }

  function enhanceExcelCombos() {
    document.querySelectorAll('input[data-excel-combo]').forEach(input => {
      if (input.closest('.excel-combo')) return;
      const box = document.createElement('div');
      box.className = 'excel-combo';
      const parent = input.parentNode;
      parent.insertBefore(box, input);
      box.appendChild(input);
      input.setAttribute('autocomplete', 'off');
      input.classList.add('excel-combo-input');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'excel-combo-button';
      btn.setAttribute('aria-label', 'Listeyi aç');
      btn.textContent = '▾';
      box.appendChild(btn);
      const toggle = () => {
        const willOpen = !box.classList.contains('open');
        closeAllCombos(box);
        if (willOpen) {
          buildComboMenu(input, box);
          box.classList.add('open');
        } else {
          box.classList.remove('open');
        }
      };
      btn.addEventListener('click', evt => { evt.preventDefault(); toggle(); });
      input.addEventListener('focus', () => buildComboMenu(input, box));
      input.addEventListener('keydown', evt => {
        if (evt.key === 'ArrowDown' && evt.altKey) {
          evt.preventDefault();
          closeAllCombos(box);
          buildComboMenu(input, box);
          box.classList.add('open');
        } else if (evt.key === 'Escape') {
          box.classList.remove('open');
        }
      });
    });
    document.addEventListener('click', evt => {
      if (!evt.target.closest('.excel-combo')) closeAllCombos(null);
    });
  }

  function updateRemoteOptions(preserve = true) {
    const remoteEl = $('remote');
    if (!remoteEl) return;
    const options = optionValuesForInput(remoteEl);
    const previous = preserve ? String(remoteEl.value || '-') : '-';
    if (!preserve || !options.includes(previous)) remoteEl.value = '-';
    const box = remoteEl.closest('.excel-combo');
    if (box && box.classList.contains('open')) buildComboMenu(remoteEl, box);
  }

  function filterSemiNumeric(value, allowNo) {
    const src = String(value || '').toLocaleUpperCase('tr-TR');
    let out = '';
    let hasN = false;
    let hasO = false;
    for (const ch of src) {
      if (/[0-9;]/.test(ch)) {
        out += ch;
      } else if (allowNo && ch === 'N' && !hasN && !hasO) {
        out += 'N';
        hasN = true;
      } else if (allowNo && ch === 'O' && hasN && !hasO && out.endsWith('N')) {
        out += 'O';
        hasO = true;
      }
    }
    return out;
  }

  function applyPresetValues(values) {
    resetProjectHistory(false);
    fillInitial();
    const deferredManual = {};
    Object.entries(values || {}).forEach(([id, value]) => {
      const el = $(id);
      if (!el) return;
      if (id === 'rayCount' || id === 'postCount') {
        deferredManual[id] = value;
        return;
      }
      el.value = value;
    });
    updateRemoteOptions(false);
    applyAutoRayPost(true);
    ['rayCount', 'postCount'].forEach(id => {
      if (!$(id)) return;
      $(id).dataset.userEdited = 'false';
    });
    if (deferredManual.rayCount !== undefined && $('rayCount')) {
      $('rayCount').value = deferredManual.rayCount;
      $('rayCount').dataset.userEdited = String(deferredManual.rayCount || '').trim() ? 'true' : 'false';
      if (deferredManual.postCount === undefined && $('postCount')) {
        const raw = collectForm();
        const br = window.PulumurExcelBridge;
        if (br && br.postCountFromRayText) $('postCount').value = br.postCountFromRayText($('rayCount').value, raw.systemCount, raw.width, raw.frontHeight);
      }
    }
    if (deferredManual.postCount !== undefined && $('postCount')) {
      $('postCount').value = deferredManual.postCount;
      $('postCount').dataset.userEdited = String(deferredManual.postCount || '').trim() ? 'true' : 'false';
    }
    updateRemoteOptions(true);
    updatePreview();
  }

  function renderQuickTests() {
    const host = $('quickTestsGrid');
    if (!host) return;
    host.innerHTML = QUICK_TEST_PRESETS.map((preset, index) => (
      `<button type="button" class="quick-test-btn" data-test-index="${index}" title="${escapeHtml(preset.title)}">${escapeHtml(preset.name)}</button>`
    )).join('');
    host.querySelectorAll('.quick-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.testIndex);
        const preset = QUICK_TEST_PRESETS[idx];
        if (!preset) return;
        host.querySelectorAll('.quick-test-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        applyPresetValues(preset.values);
        statusText.textContent = currentLanguage === 'en' ? `${preset.name} loaded.` : `${preset.name} yüklendi: ${preset.title}`;
      });
    });
  }

  function bindStrictInputs() {
    const numericOnly = id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const clean = String(el.value || '').replace(/[^0-9]/g, '');
        if (el.value !== clean) el.value = clean;
      });
    };
    const semiNumeric = (id, allowNo = false) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const clean = filterSemiNumeric(el.value, allowNo);
        if (el.value !== clean) el.value = clean;
      });
    };
    numericOnly('parapetHeight');
    semiNumeric('width', true);
    ['opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount'].forEach(id => semiNumeric(id, false));
  }

  function showToolboxPlaceholder(command) {
    const isEn = currentLanguage === 'en';
    const message = command === 'product'
      ? (isEn ? 'Multiple product placement will be activated in the next toolbox revision.' : 'Çoklu ürün ekleme komutu sonraki toolbox revizyonunda aktif edilecek.')
      : (isEn ? 'Multiple dimension editing will be activated in the next toolbox revision.' : 'Çoklu ölçü düzenleme komutu sonraki toolbox revizyonunda aktif edilecek.');
    statusText.textContent = message;
    window.alert(message);
  }

  function bindEvents() {
    $('generateBtn').addEventListener('click', generateDxf);
    $('pdfBtn').addEventListener('click', () => { void generatePdf(); });
    $('previewBtn').addEventListener('click', updatePreview);
    $('resetBtn').addEventListener('click', resetForm);
    $('expandPreviewBtn').addEventListener('click', () => { void togglePreviewFullscreen(); });
    $('fitPreviewBtn').addEventListener('click', fitPreview);
    if ($('undoPreviewBtn')) $('undoPreviewBtn').addEventListener('click', undoProjectHistory);
    if ($('redoPreviewBtn')) $('redoPreviewBtn').addEventListener('click', redoProjectHistory);
    $('calcBtn').addEventListener('click', openCalculator);
    if ($('projectExportBtn')) $('projectExportBtn').addEventListener('click', exportProjectSnapshot);
    if ($('previewProjectExportBtn')) $('previewProjectExportBtn').addEventListener('click', exportProjectSnapshot);
    if ($('multiProductBtn')) $('multiProductBtn').addEventListener('click', () => startToolboxSelection('multi-product'));
    if ($('multiDimensionBtn')) $('multiDimensionBtn').addEventListener('click', () => startToolboxSelection('multi-dimension'));
    if ($('multiDeleteBtn')) $('multiDeleteBtn').addEventListener('click', () => startToolboxSelection('multi-delete'));
    if ($('deleteAllProductsBtn')) $('deleteAllProductsBtn').addEventListener('click', deleteAllProducts);
    document.querySelectorAll('[data-boolean-field]').forEach(btn => btn.addEventListener('click', () => toggleToolboxBoolean(btn.dataset.booleanField)));
    $('projectImportBtn').addEventListener('click', openProjectSnapshotPicker);
    $('projectImportInput').addEventListener('change', async evt => {
      try {
        await importProjectSnapshotFile(evt.target.files && evt.target.files[0]);
      } catch (err) {
        statusText.textContent = err.message;
        window.alert(err.message);
        console.error(err);
      } finally {
        evt.target.value = '';
      }
    });
    $('helpBtn').addEventListener('click', showHelp);
    $('languageSelect').addEventListener('change', evt => { translateUI(evt.target.value); updatePreview(); });
    $('motor').addEventListener('input', () => { updateRemoteOptions(true); });
    $('motor').addEventListener('change', () => { updateRemoteOptions(true); updatePreview(); });
    $('calcComputeBtn').addEventListener('click', () => {
      try { calculateMissing(); } catch (err) { $('calcResult').textContent = err.message; }
    });
    $('calcTransferBtn').addEventListener('click', () => {
      try { transferCalc(); } catch (err) { $('calcResult').textContent = err.message; }
    });
    $('calcClearBtn').addEventListener('click', clearCalc);
    ids.forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (suppressFormPreviewUpdate) return;
        if (BOOLEAN_FIELD_IDS.includes(id)) syncToolboxBooleanButtons();
        updatePreview();
      });
      el.addEventListener('input', () => {
        if (suppressFormPreviewUpdate) return;
        if (wrappingFields) return;
        autosizeTextarea(el);
        if (id === 'rayCount' || id === 'postCount') {
          el.dataset.userEdited = String(el.value || '').trim() ? 'true' : 'false';
          if (id === 'rayCount' && $('postCount') && $('postCount').dataset.userEdited !== 'true') {
            const raw = collectForm();
            const br = window.PulumurExcelBridge;
            if (br && br.postCountFromRayText) $('postCount').value = br.postCountFromRayText(el.value, raw.systemCount, raw.width, raw.frontHeight);
          }
        }
        if (id === 'width') {
          if ($('rayCount')) $('rayCount').dataset.userEdited = 'false';
          if ($('postCount')) $('postCount').dataset.userEdited = 'false';
        }
        if (['systemCount', 'width', 'rayCount', 'postCount'].includes(id)) {
          customFrontPostCenters = null;
          frontPostProfiles = [];
          customSidePosts = {};
          slidingPlacements = [];
          guillotinePlacements = [];
        }
        if (['systemCount', 'width', 'frontHeight', 'glassTrack'].includes(id)) {
          applyAutoRayPost(false);
        }
        window.clearTimeout(el._previewTimer);
        el._previewTimer = window.setTimeout(updatePreview, 350);
      });
    });
  }

  document.addEventListener('fullscreenchange', syncExpandButton);
  bindPreviewInteractions();
  bindPreviewKeyboardGuard();
  bindHistoryKeyboardShortcuts();
  bindPreviewFilterControls();
  enhanceExcelCombos();
  bindStrictInputs();
  renderQuickTests();
  fillInitial();
  bindEvents();
  setupPwaInstall();
  const savedLang = (() => { try { return localStorage.getItem('pulumur_lang') || 'tr'; } catch (e) { return 'tr'; } })();
  if ($('languageSelect')) $('languageSelect').value = savedLang === 'en' ? 'en' : 'tr';
  translateUI(savedLang);
  updatePreview();
  syncExpandButton();
})();
