# V8.2.31 Notları

- Parapet aktifken karşı görünüşte toplam ön yükseklik ölçüsü kaldırıldı.
- Parapet aktifken karşı görünüşte yalnızca parapet yüksekliği ve parapet üstü ile oluk altı arasında kalan bölüm ölçülendirilir.
- Çoklu poz üst görünüş toplam genişlik ölçüsü artık 1. poz 1. rayın `PergoRise Ray Arka Mekanizma Üst Görünüş` bloğunun -X ucu ile son poz son rayın aynı bloğunun +X ucu arasından alınır.
- Çoklu poz toplam üst ölçü çizgisi, üst görünüş duvar çizimlerinin +Y yönündeki en uç noktasından +50 mm yukarı konumlandırılır.
- `;NO` ara boşluklu çoklu poz yerleşimleri bu toplam ölçü hesabında korunur.
- PDF üretimi raster görsel yerine çizim entity'lerinden vektörel PDF üretmeye geçirildi.
- Önizleme SVG çıktısında geometrik/text render kalitesi iyileştirildi.
