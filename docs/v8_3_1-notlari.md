# v8.3.1 Notları

- v8.3 baz alınmıştır.
- Önizlemedeki Türkçe ve boşluklu katman adları korunmuştur.
- DXF dışa aktarımında tüm katman adları DraftSight R12 uyumlu biçime çevrilir: BÜYÜK HARF, İngilizce karakter ve alt çizgi.
- Örnek: `Ray - Yan Görünüş` → `RAY_YAN_GORUNUS`.
- Ölçü katmanları `OLCULER_ANA` ve `OLCULER_DETAY` olarak yazılır.
- Layer tablosu, entity layer referansları, blok içi entity layer referansları ve kapalı layer durumları aynı dönüşümü kullanır.
- Böylece `Improper table entry name ...` hatası giderilmiştir.
- Ölçülerin `*D1`, `*D2` anonim blokları R12/DraftSight beklentisine uygun olarak anonymous block flag `1` ile yazılır.
