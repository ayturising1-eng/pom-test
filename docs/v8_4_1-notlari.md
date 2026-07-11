# v8.4.1 — R12 kaldırıldı

## Değişiklikler

- R12 motoru uygulama paketinden çıkarıldı.
- DXF format seçim kutusu kaldırıldı.
- Tek dışa aktarım formatı Modern DXF 2013 (`AC1027`) oldu.
- `dxfEngine.js` artık tarayıcıya yüklenmez ve service worker tarafından önbelleğe alınmaz.
- Modern motor dosya adı üretiminde bağımsız hale getirildi.
- Arayüz yardım metinleri ve durum mesajları tek modern motoru açıklayacak şekilde güncellendi.

## Korunan özellikler

- Gerçek DIMENSION entity
- UTF-8/Türkçe metin
- Uzun katman ve blok adları
- LWPOLYLINE
- MTEXT
- True Color
- Sliding ve Giyotin yerleşimi
