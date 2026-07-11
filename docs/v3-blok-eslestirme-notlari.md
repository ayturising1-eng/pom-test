# V3 - PERI01 Blok Eşleştirme Notları

Bu revizyonda kullanıcı tarafından verilen `pulumurapp.dxf` ve `DENEME-DENEME.dxf` referans alınmıştır.

## Referans tek poz verisi

- Genişlik: 4000 mm
- Açılım: 4500 mm
- Arka yükseklik: 3200 mm
- Ön yükseklik: 2600 mm
- Ray sayısı: 2
- Dikme sayısı: 2
- Parapet: HAYIR
- Cam kaydı: HAYIR
- Üçgen doğrama: HAYIR
- Su çıkışı standart: EVET

## Yapılan eşleştirmeler

- `pulumurapp.dxf` içindeki BLOCKS bölümü `blocks/pulumurBlocks.js` içine taşındı.
- Web DXF çıktısında artık gerçek `INSERT` entity üretiliyor.
- Tek poz referansındaki ana blok insert koordinatları DENEME-DENEME.dxf ile eşleştirildi.
- Excel girişindeki 4000 mm genişlik, PERI01 çizim motorunda 3988 mm net çizim genişliği olarak kullanıldı. Bu, referans çıktıda görülen 12 mm ofset farkını karşılar.
- Ray uzunluğu hesabında PERI01 içindeki `265 mm` düşüm sabiti kullanıldı.
- Yan görünüş dönüş açısı ve blok dönüşleri PERI01 formülüyle 355.841667° olarak üretildi.
- Trapez Tarama, RISING LOGO ve PLMR logo web DXF çıktısına eklenmedi.

## Kontrol sonucu

`DENEME-DENEME.dxf` ile yeni web örnek DXF karşılaştırıldığında ana çizim insert noktaları aşağıdaki başlıklarda eşleşir:

- Üst görünüş ray arka mekanizma ve ray kafası
- Üst görünüş oluk
- Üst görünüş dikme ve dikme-oluk bağlantısı
- Ön görünüş ray kafası
- Ön görünüş dikme bağlantıları ve dikme dikdörtgenleri
- Yan görünüş dikme, oluk, duvar, ray, ray kafası, çatı kayıt profili ve çekici araba blokları

Sonraki aşama: gerçek programda DraftSight/AutoCAD açılış testi ve blokların görünürlük/layer davranışının kontrolü.
