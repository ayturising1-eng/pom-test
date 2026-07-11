# Pülümür Automation Studio v8.4.0

## Modern DXF geçişi

- Varsayılan dışa aktarım: AutoCAD 2013 DXF (`AC1027`).
- Geri dönüş seçeneği: AutoCAD R12 DXF (`AC1009`).
- Her iki çıktı aynı `buildDrawing()` geometrisini kullanır; önizleme ile dışa aktarım arasında ayrı geometri hesabı yoktur.

## Modern motor özellikleri

- UTF-8 / Türkçe metin desteği.
- 31 karakter R12 sınırına takılmayan uzun blok ve katman adları.
- Katmanlarda ve varlıklarda True Color (`group 420`) desteği.
- Giyotin için gerçek RGB `41,49,137` (`#293189`).
- `LWPOLYLINE`, gerçek `MTEXT`, modern `BLOCK_RECORD`, handle/owner ilişkileri.
- Düzenlenebilir `DIMENSION` entity ve anonim `*D` ölçü blokları.
- Kapalı dikdörtgenler tek LWPOLYLINE olarak korunur.

## Uyumluluk yaklaşımı

- Modern DXF yeni varsayılandır.
- R12 Güvenli motor kaldırılmadı; eski DraftSight/AutoCAD sürümleri için format seçicisinden kullanılabilir.
- Modern motor ayrı `dxfModernEngine.js` dosyasındadır. R12 motoru `dxfEngine.js` olarak korunur.

## Doğrulama

- Modern Giyotin ve Sliding örnekleri `ezdxf 1.4.4` ile yeniden açıldı.
- Her iki örnekte `AC1027`, gerçek DIMENSION kayıtları, bloklar ve True Color doğrulandı.
- Audit sonucu: 0 hata, 0 düzeltme.
- Mevcut R12 smoke testleri de başarılıdır.
