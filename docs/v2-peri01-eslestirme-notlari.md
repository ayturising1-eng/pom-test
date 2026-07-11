# v2 PERI01 Eşleştirme Notları

Bu revizyon tek poz çiziminde PERI01 LISP içindeki temel koordinat ve profil sabitlerini web DXF motoruna taşır.

## Taşınan başlıca sabitler

- Dikme üst/ön görünüş temsil ölçüsü: 100x100 mm
- Ray üst görünüş genişliği: 80 mm
- Ray iç çizgisi: X + 33.5 mm, genişlik 13 mm
- Üst görünüş ana başlangıç: sistem X = 300 mm
- Oluk üst görünüş: X = 250 mm, Y = -Açılım, genişlik = Genişlik + 100, yükseklik = 145 mm
- Ön görünüş başlangıç Y: `-(Açılım + (ArkaY - ÖnY) + 500)`
- Ön görünüş oluk yüksekliği: 135 mm
- Ön dikme yüksekliği: `ÖnY - 49 - ParapetY`
- Ray gerçek yan görünüş uzunluğu: `sqrt((ArkaY - ÖnY - 278)^2 + Açılım^2) - 220`
- Yan görünüş ray açısı: `atan((ArkaY - ÖnY - 278) / (Açılım - 71.1))`
- Cam kaydı ofseti: ilk/son kenardan 66 mm
- Cam kaydı profili: 100 mm
- Çatı kayıt profili: 30 mm yüksekliğinde; ilk Y = -400 mm
- İkinci çatı kayıt ofseti: `(rayLen / 490) * 47 + 120`

## Bilerek sembolik bırakılanlar

Aşağıdaki DWG/DXF blokları henüz gerçek block definition olarak web DXF içine aktarılmadı. Şimdilik yer tutucu olarak çiziliyor:

- PergoRise Oluk
- PergoRise Dikme Üst Görünüş
- PergoRise Dikme Ön Görünüş
- PergoRise Ray Kafası Üst Görünüş
- PergoRise Ray Arka Mekanizma Üst Görünüş
- PergoRise Dikme Oluk Bağlantı Üst Görünüş
- Yan/ön bağlantı blokları

Bu blokları birebir taşımak için `pulumurapp.dxf` dosyasının ZIP olarak ayrıca verilmesi gerekir.
