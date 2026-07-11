# Pülümür Automation Studio v8.3.6

## DXF R12 renk uyumluluğu

- v8.3.5 Giyotin geometrisinde kullanılan DXF True Color `420` kayıtları kaldırıldı.
- Çıktı AC1009 / DXF R12 olduğu için renkler yalnızca geçerli ACI `62` koduyla yazılır.
- Giyotin önizleme rengi değişmedi: RGB `41,49,137` / `#293189`.
- DXF tarafında bu renge en yakın AutoCAD Color Index değeri olan **ACI 167** kullanılır (yaklaşık RGB `38,47,126`).
- Bu düzeltme DraftSight'taki `Undefined group code 420` hatasını giderir.
- Sliding, Pergo Rise geometrisi, ölçü katmanları ve ürün yerleştirme davranışı değiştirilmedi.
