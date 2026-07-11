# V7.2 Optimizasyon Notları

Bu sürüm V7 PERI01 Logic Port üzerine dosya boyutu ve blok kullanımı optimizasyonudur.

## Uygulananlar

- Aynı blok tipi DXF içinde yalnızca bir kez tanımlandı.
- Modelspace içinde parça çizgileri yerine `INSERT` kullanıldı.
- `RISING LOGO`, `Trapez Tarama`, `Duvar Tarama Block` kaldırıldı.
- Polyline noktaları sadeleştirildi.
- Çok küçük çizgiler, çok küçük çemberler ve tekrarlı noktalar temizlendi.
- Sayısal çıktı hassasiyeti 0.001 mm seviyesine indirildi.
- R12 / AC1009 formatı korundu.

## Dosya boyutu sonucu

- Önceki çoklu test DXF: yaklaşık 8.3 MB
- V7.2 çoklu test DXF: yaklaşık 0.29 MB
