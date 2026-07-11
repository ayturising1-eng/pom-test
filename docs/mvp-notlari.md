# MVP Notları

Bu çalışma, mevcut Excel + LISP + DraftSight akışını web tabanlı DXF üretimine çevirmek için ilk denemedir.

## Eski akış

```text
Excel değerleri → veri dosyası → LISP → DraftSight / AutoCAD → DWG/PDF
```

## Yeni akış

```text
Web formu → JavaScript geometri motoru → DXF metni → doğrudan indirme
```

## Mevcut LISP’ten taşınan ilk mantıklar

- Sayısal değer normalizasyonu
- EVET / HAYIR opsiyonları
- Ray sayısına göre ray pozisyonu
- Ray genişliği için 80 mm kabulü
- Cam kaydı aktifse sol/sağ 66 mm ray alanı ofseti
- Ön / arka yükseklik farkından sistem açısı hesabı
- Parapet ve özel su çıkışı opsiyonlarının çizime etki etmesi

## Bilerek sadeleştirilen noktalar

- Hazır DWG blokları şimdilik basit çizgi / polyline ile temsil edilir.
- Ölçülendirme gerçek CAD DIMENSION objesi yerine LINE + TEXT + ok çizgileriyle yapılır.
- Tarama, detay blokları ve bağlantı setleri sembolik gösterilir.
- Tek poz hedeflendiği için `;` ile çoklu değer girişi şimdilik desteklenmez.

## Sonraki teknik adım

`pulumurapp.dwg` içindeki bloklar DXF olarak dışa aktarılmalı. Sonra `dxfEngine.js` içine BLOCKS / INSERT desteği eklenmeli.
