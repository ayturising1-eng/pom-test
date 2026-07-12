# Pülümür Automation Studio — Kalıcı Önizleme Kuralları

Bu kurallar **v8.9.15 ve sonraki bütün sürümler** için bağlayıcıdır.

## 1. Büyük önizleme durumu

- Büyük önizleme yalnızca **“Önizlemeyi Büyüt / Önizlemeyi Küçült”** butonuyla açılır veya kapanır.
- `Escape`, Enter, sağ tık, ürün/ölçü düzenleme, modal açma-kapama, ürün ekleme-silme, dil değiştirme, PDF/DXF indirme ve gelecekte eklenecek komutlar büyük önizlemeyi küçültemez.
- Bu nedenle native Fullscreen API kullanılmaz. Büyük önizleme `.preview-panel.is-expanded` CSS durumu ile yönetilir.
- Escape yalnızca o anda açık olan seçim veya bilgi penceresini kapatabilir; `is-expanded` durumuna dokunamaz.

## 2. Zoom ve pan değişmezliği

- Kullanıcının yaptığı zoom ve pan, **“Çizimi Sığdır”** komutu dışında hiçbir işlem tarafından sıfırlanamaz veya yeniden hesaplanamaz.
- `updatePreview()` varsayılan olarak mevcut ölçeği ve görünüm merkezini korur.
- Çizim geometrisinin viewBox ölçüsü değişirse yeni SVG, mevcut gerçek ölçek (`baseScale × zoom`) ile yeniden boyutlandırılır.
- İlk geçerli çizim oluşturulurken otomatik sığdırma yapılabilir. Bundan sonraki otomatik sığdırma yalnızca kullanıcı “Çizimi Sığdır” butonuna bastığında yapılır.
- Yeni özellikler `updatePreview(false)` mantığına uyumlu geliştirilmelidir. Doğrudan `applyPreviewScale()` çağrısı yalnızca ilk çizim, açık kullanıcı zoom işlemi veya “Çizimi Sığdır” akışında kullanılabilir.

## 3. Çoklu seçim göstergeleri

- Çoklu ürün ekleme, çoklu ölçü düzenleme ve çoklu ürün silme kutuları ilgili ölçü/ürün tıklama alanının tam merkezinde bulunmalıdır.
- Seçim göstergeleri DXF veya PDF dışa aktarım geometrisine yazılamaz; yalnızca SVG önizlemede bulunur.

## 4. Çoklu ürün ölçüleri

- Çoklu sürme ve giyotin eklemede her pozun genişlik ve yüksekliği ayrı ayrı manuel düzenlenebilir olmalıdır.
- İlk poz üst özet satırında; sonraki pozlar aynı alan düzeniyle alt alta gösterilir.
- Sürmede panel sayısı her pozun manuel genişliğine ve ortak açılım tipine göre ayrı hesaplanır.
- Ürün serisi, tip, cam, motor ve benzeri ortak seçenekler tüm seçilen pozlara tek seçim olarak uygulanır.


## 5. Geri Al / İleri Al geçmişi

- Büyük önizlemedeki **Geri Al** ve **İleri Al** düğmeleri, `Çizimi Sığdır` düğmesinin yanında yan yana bulunur.
- Geçmiş, proje açıldığı veya ilk geçerli çizim oluşturulduğu andan başlayarak oturum boyunca korunur.
- Yeni bir değişiklik, geri alınmış bir konumdan yapılırsa eski ileri-al dalı silinir.
- Çoklu ölçü ve çoklu ürün işlemleri tek bir tamamlanmış işlem olarak geçmişe yazılır; ara adımlar ayrı geçmiş kaydı oluşturamaz.
- Zoom, pan, büyük önizleme açık/kapalı durumu, çizimi sığdırma, modal açma-kapama ve çoklu seçim kutularını işaretleme geçmişe yazılmaz.
- Geri/ileri alma sırasında büyük önizleme kapanamaz ve zoom/pan aynen korunur.
- Yeni proje, başka proje dosyası veya bulut revizyonu açıldığında önceki projenin yerel geçmişi temizlenir ve açılan proje ilk geçmiş adımı olur.
