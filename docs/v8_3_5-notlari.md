# Pülümür Automation Studio v8.3.5

## Giyotin Cam entegrasyonu

- Akıllı Ölçü Düzenle ekranındaki ürün listesine ikinci ürün olarak `Giyotin Cam / Guillotine` eklendi.
- Giyotin yalnızca ön görünüşte iki dikme arasındaki ürün yerleştirme alanına eklenir.
- Ürün seçildikten sonra Sliding Details tasarım sistemini kullanan ayrı `Giyotin Detayları / Guillotine Details` penceresi açılır.
- Genişlik otomatik olarak dikmeler arasındaki net boşluk eksi 5 mm alınır.
- Yükseklik, sürme camdaki gibi ön dikme yüksekliği eksi parapet eksi 5 mm olarak otomatik gelir.
- Poz numarası `G01, G02, G03...` biçiminde otomatik verilir.
- Quantity arayüzde gösterilmez; yerleştirilen ürün adedi çizim verisinde 1 olarak korunur.

## Giyotin seçenekleri ve kurallar

- Seri: A Series / K Series.
- A Series cam: 8 mm veya Insulated Glass; K Series yalnızca Insulated Glass.
- A Series tip: Standard, Cleanable, Upward Collecting; K Series için Upward Collecting pasiftir.
- A Series mekanizma: Chain veya Belt; K Series yalnızca Belt.
- Panel tipi: 1+1 veya 1+2.
- Motor yönü: Right / Left.
- Görünüş: Inside View / Outside View.
- Motor: Somfy RTS, Somfy IO, Rising.
- Kumanda: 1, 2, 4, 6, 16 veya 40 kanal.
- Low-e Glass yalnızca Insulated Glass seçildiğinde aktiftir.
- Other / Diğer seçildiğinde özel cam rengi alanı açılır.

## Çizim ve DXF

- Yalnız giyotin ürün geometrisi blok içine alınır; giyotin bilgi tablosu Pergo Rise çizimine eklenmez.
- Blok adı `GUILLOTINE_POZ_G01` düzenindedir ve base point ürünün sol-alt köşesidir.
- Dış ve iç çerçeveler ile yatay panel ayırıcıları kapalı polyline olarak oluşturulur.
- 1+1 iki, 1+2 üç yatay panel üretir.
- Standard ve Cleanable için üst panelde aşağı yönlü; Upward Collecting için alt panelde yukarı yönlü ok çizilir.
- Cleanable sembolü birleşik açık polyline olarak çizilir.
- Motor ve Inside/Outside View yazıları üst 150 mm motor bandına dinamik boyutta yerleştirilir.
- Ürün rengi RGB `41,49,137` / `#293189`; DXF içinde True Color `2699657`, ACI fallback `5` kullanılır.
- Toplam genişlik ve yükseklik ölçüleri kırmızı gerçek DIMENSION entity olarak ürünün içinde gösterilir.
- Yerleşim referansı sürme camla aynıdır; standart sol dikme varsa ürün 49 mm -Y yönüne kaydırılır.
- Aynı dikme boşluğunda Sürme Cam ve Giyotin Cam üst üste gelemez; yeni ürün mevcut ürünü değiştirir.

## Testler

- JavaScript sözdizimi kontrol edildi.
- Mevcut üç smoke testi ve v8.3 Sliding testi çalıştırıldı.
- Giyotin blok, insert, iç ölçü, tablo bulunmaması ve True Color kayıtları doğrulandı.
- Üretilen Sliding ve Guillotine DXF dosyaları ezdxf ile tekrar açılarak AC1009 yapısı doğrulandı.
