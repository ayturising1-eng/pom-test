## v8.4.1 — Modern DXF Tek Motor

- R12 dışa aktarım motoru ve format seçimi kaldırıldı.
- Uygulama yalnızca AutoCAD 2013 / `AC1027` Modern DXF üretir.
- `DXF İndir` düğmesi doğrudan modern dosyayı indirir.
- Modern motor UTF-8 metin, uzun katman/blok adları, LWPOLYLINE, MTEXT, gerçek DIMENSION ve True Color destekler.
- Giyotin rengi DXF içinde gerçek `RGB 41,49,137` olarak yazılır.
- R12 motoruna olan `safeFileName` bağımlılığı kaldırıldı; modern motor kendi dosya adı temizleyicisini kullanır.
- Önizleme, Sliding ve Giyotin özellikleri v8.4.0 ile aynı şekilde korunmuştur.

Sonraki çalışma alanı: modern HATCH entity yapısının duvar, kumaş ve trapez taramalarına uygulanması.
