# V6 Clean R12 Notları

## Sorun

V4/V5 DXF dosyaları DraftSight açılışında "Teknik resim dosyasının kurtarılması gerekli" uyarısı verdi.

## Kaynak

Sorun, web tarafında `pulumurapp.dxf` içindeki blokları doğrudan DXF içine gömme denemesinden kaynaklandı. Blokların içinde CAD programına özel handle/owner/layout/linetype/style referansları vardı. Bu referansların bir kısmı temizlense de DraftSight yine recovery istedi.

## Çözüm

V6'da DXF motoru `AC1009 / AutoCAD R12` formatına çekildi. Gerçek `BLOCK / INSERT` yazımı kapatıldı. Blok yerleri geçici olarak temiz çizgilerden oluşan yer tutucu geometriyle gösteriliyor.

## Sonraki adım

1. V6'nın DraftSight'ta recovery uyarısı vermeden açıldığını doğrula.
2. Tek poz ölçü ve koordinatlarını PERI01'e yaklaştır.
3. Blokları tek tek yeniden ekle:
   - önce sadece `PergoRise Dikme Üst Görünüş`
   - sonra `PergoRise Oluk`
   - sonra ray blokları
4. Her blok eklendiğinde DraftSight açılış testi yap.
