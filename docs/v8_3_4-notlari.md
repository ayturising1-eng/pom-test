# Pülümür Automation Studio v8.3.4

## Sliding Details arayüz düzeltmeleri

- Kapatma düğmesi CSS çizgileriyle gerçek merkezine alındı.
- `POZ NO` etiketi Türkçede `Poz No`, İngilizcede `Position No.` olarak düzenlendi.
- Alt bilgi satırı genişlikleri yeniden dağıtıldı; Panel Sayısı / Panel Count alanına daha fazla yer ayrıldı.
- Genişlik ve Yükseklik etiketleri sola hizalandı ve değer kutuları dengelendi.
- Modal genişliği masaüstünde 1120 px sınırına çıkarıldı ve viewport merkezli hale getirildi.
- Product Series, Type, Opening Type, Glass Thickness ve Glass Color başlıkları fieldset kenarından alınarak kartların içine taşındı.
- Modal renkleri Pülümür paletine bağlandı: lacivert, petrol yeşili ve açık buz tonları.
- Sliding Details arayüzünün tüm metinleri aktif dile göre Türkçe/İngilizce gösteriliyor.
- Other / Diğer özel cam rengi alanı ve validasyon mesajları dile göre değişiyor.
- Ana formdaki Structure Color, Fabric, Fabric Profiles, Remote ve Extras / Notes etiketlerinin Türkçe karşılıkları düzeltildi.
- DXF/PDF indirme mesajları, sürme yerleştirme mesajı ve dikme aralığı hata mesajları aktif dile bağlandı.

## Korunan davranışlar

- A/K seri kuralları, K Series için 10 mm kısıtı ve Low-e koşulu değişmedi.
- Quantity çizim verisinde 1 olarak korunuyor ve modalda gösterilmiyor.
- Otomatik Poz No, genişlik, yükseklik ve panel sayısı hesapları değişmedi.
- Sliding çizim geometrisi ve DXF blok mantığı değiştirilmedi.
