# Pülümür Automation Studio — Kalıcı Önizleme Kuralları

Bu kurallar **v8.9.15 ve sonraki bütün sürümler** için bağlayıcıdır.

## 1. Büyük önizleme durumu

- Büyük önizleme yalnızca **“Önizlemeyi Büyüt / Önizlemeyi Küçült”** butonuyla açılır veya kapanır.
- `Escape`, Enter, sağ tık, ürün/ölçü düzenleme, modal açma-kapama, ürün ekleme-silme, dil değiştirme, PDF/DXF indirme ve gelecekte eklenecek komutlar büyük önizlemeyi küçültemez.
- Bu nedenle native Fullscreen API kullanılmaz. Büyük önizleme `.preview-panel.is-expanded` CSS durumu ile yönetilir.
- Escape yalnızca o anda açık olan seçim veya bilgi penceresini kapatabilir; `is-expanded` durumuna dokunamaz.

## 2. Zoom ve pan değişmezliği

- Kullanıcının yaptığı zoom ve pan, yalnız kullanıcının açıkça bastığı **“Önizlemeyi Yenile”** komutu veya doğrudan zoom/pan hareketi dışında hiçbir işlem tarafından sıfırlanamaz veya yeniden hesaplanamaz.
- `updatePreview()` varsayılan olarak mevcut ölçeği ve görünüm merkezini korur.
- Çizim geometrisinin viewBox ölçüsü değişirse yeni SVG, mevcut gerçek ölçek (`baseScale × zoom`) ile yeniden boyutlandırılır.
- İlk geçerli çizim oluşturulurken otomatik sığdırma yapılabilir. Bundan sonraki sığdırma yalnızca kullanıcı “Önizlemeyi Yenile” butonuna bastığında yapılır.
- Yeni özellikler `updatePreview(false)` mantığına uyumlu geliştirilmelidir. Doğrudan `applyPreviewScale()` çağrısı yalnızca ilk çizim, açık kullanıcı zoom işlemi veya “Önizlemeyi Yenile” akışında kullanılabilir.

## 3. Çoklu seçim göstergeleri

- Çoklu ürün ekleme, çoklu ölçü düzenleme ve çoklu ürün silme kutuları genel olarak ilgili ölçü/ürün tıklama alanının tam merkezinde bulunmalıdır. Ray aralığı ölçülerinde kutu, ölçü yazısının üst orta noktasına yerleştirilir.
- Seçim göstergeleri DXF veya PDF dışa aktarım geometrisine yazılamaz; yalnızca SVG önizlemede bulunur.

## 4. Çoklu ürün ölçüleri

- Çoklu sürme ve giyotin eklemede her pozun genişlik ve yüksekliği ayrı ayrı manuel düzenlenebilir olmalıdır.
- İlk poz üst özet satırında; sonraki pozlar aynı alan düzeniyle alt alta gösterilir.
- Sürmede panel sayısı her pozun manuel genişliğine ve ortak açılım tipine göre ayrı hesaplanır.
- Ürün serisi, tip, cam, motor ve benzeri ortak seçenekler tüm seçilen pozlara tek seçim olarak uygulanır.


## 5. Geri Al / İleri Al geçmişi

- Büyük önizlemedeki **Geri Al** ve **İleri Al** düğmeleri yan yana bulunur; kısayollar düğmelerin içinde gösterilir.
- Geçmiş, proje açıldığı veya ilk geçerli çizim oluşturulduğu andan başlayarak oturum boyunca korunur.
- Yeni bir değişiklik, geri alınmış bir konumdan yapılırsa eski ileri-al dalı silinir.
- Çoklu ölçü ve çoklu ürün işlemleri tek bir tamamlanmış işlem olarak geçmişe yazılır; ara adımlar ayrı geçmiş kaydı oluşturamaz.
- Zoom, pan, büyük önizleme açık/kapalı durumu, önizlemeyi yenileme/sığdırma, modal açma-kapama ve çoklu seçim kutularını işaretleme geçmişe yazılmaz.
- Geri/ileri alma sırasında büyük önizleme kapanamaz ve zoom/pan aynen korunur.
- Yeni proje, başka proje dosyası veya bulut revizyonu açıldığında önceki projenin yerel geçmişi temizlenir ve açılan proje ilk geçmiş adımı olur.

## 6. Üretim uygunluk kontrolleri

- **Çizimi Kontrol Et** sistemi tek bir uzun fonksiyon yerine `DRAWING_PRODUCTION_VALIDATORS` kayıt dizisindeki bağımsız doğrulayıcılardan oluşur.
- Yeni sürme, giyotin veya pergola üretim kuralı eklendiğinde ayrı bir doğrulayıcı yazılmalı ve bu diziye eklenmelidir; mevcut kontrollerin davranışı değiştirilmemelidir.
- Kontrol işlemi proje verisini, ölçüleri, ürünleri veya dikmeleri değiştiremez; Geri Al/İleri Al geçmişine yeni adım ekleyemez.
- Sonuç satırına tıklamak yalnızca ilgili SVG elemanını geçici olarak vurgular. Otomatik zoom, pan veya çizimi sığdırma yapılamaz.
- Kontrol mesajları Türkçe ve İngilizce hazırlanmalıdır. Üretim kuralları tavsiye/uyarı niteliğindedir ve hiçbir koşulda önizleme, DXF veya PDF oluşturmayı engelleyemez. Geometrik veri kaybı ya da fiziksel üst üste binme gibi bozuk durumlar ayrıca hata olarak gösterilebilir.

## 7. Aralık eşitleme ve ürün işlemleri

- Aralıkları eşitleme yan yana veya birbirinden ayrı seçilmiş ön dikme aralıklarına uygulanabilir; seçilen aralıkların toplam net genişliği korunur ve aradaki elemanlar ana sistem sınırlarını bozmadan kayar.
- Milimetre yuvarlama farkı merkez aralıktan başlayarak merkeze en yakın aralıklara dağıtılır.
- Ürün tipi değişiminde eski ürün, yeni ürün detay formu **Tamam** ile onaylanana kadar korunur. İptal edilen dönüşüm hiçbir proje verisini değiştiremez.
- Ürünü Alana Uydur işlemi genişliği `net aralık - 5 mm`, yüksekliği `kullanılabilir net yükseklik - 5 mm` yapar ve tekli/çoklu seçimle aynı kuralları kullanır.
- **Dikme Profilini Toplu Değiştir** düğmesi uygulama tamamlanıncaya kadar gerçek `disabled` niteliğiyle pasif kalmalı ve herhangi bir olay dinleyicisine bağlanmamalıdır.


## 8. v8.9.18 ek kuralları
- Parapet H hızlı alanı yalnız sayısal değer kabul eder; değer girildiğinde Parapet otomatik EVET olur ve değer ön H'yi aşamaz.
- Ürün tipi değiştirme aynı tipte birden fazla ürün için tek işlemde çalışabilir.
- Ön dikme aralıkları kesintisiz olmasa da seçili aralıkların toplamı korunarak eşitlenebilir; aradaki seçilmemiş bölmeler konumsal olarak kayar.
- Üst görünüş ray ölçüleri detay katmanındadır ve toplam sistem genişliğini değiştirmez. 2 raylı sistemde ölçü/düzenleme şimdilik gösterilmez. 3 rayda dış-merkez / merkez-dış; 4 rayda dış-merkez / merkez-merkez / merkez-dış ölçüleri kullanılır. 4 rayın orta ölçüsü değişirken iki iç ray sistem merkezini koruyarak eşit miktarda -X ve +X yönünde hareket eder. 25 mm ve 4000 mm değerleri üretim uyarısıdır; çizim oluşturmayı engellemez.
- Yan destek dikmesinin +Y üst ucu cam kaydı altında sabittir. Alt uç varsayılan olarak dikme merkezinin bulunduğu yerel parapet segmentinin üst kotuna oturur. Manuel işaretli ofset bu otomatik oturmayı geçersiz kılar: pozitif değer -Y yönüne uzatır, negatif değer alttan kısaltır.


## 9. v8.9.19 ray ölçüsü ve kontrol kuralları
- Ray ölçü çizgileri poz sayısına göre dinamik düşey ofset alamaz; bütün pozlarda son pozun üst ölçü hizasında aynı Y koordinatında olmalıdır.
- Ray ölçüsü seçme kutusu ölçü yazısının üst orta noktasında bulunmalıdır.
- İlk ve son raylar sabittir; ray ölçüsü değişiklikleri yalnızca iç rayların X konumunu değiştirir ve toplam sistem genişliğini korur.
- 2 raylı sistemin mesafe düzenleme mantığı NO kuralıyla birlikte daha sonra tanımlanacaktır; bu sürümde 2 ray için ölçü çizgisi veya düzenleme kontrolü oluşturulmaz.
- Çizimi Kontrol Et için ray açısı tavsiye aralığı 6°–15°'dir. Bu ve diğer üretim limitleri uyarı üretir, çizim oluşturmayı durdurmaz.

## 10. v8.9.20 ray, dikme ve segmentli parapet kuralları
- Üç ve dört raylı sistemlerde ilk ve son ray sabittir; yalnız iç raylar X ekseninde hareket eder.
- Dört raylı sistemin orta aralığı düzenlendiğinde iki iç ray orta noktayı koruyarak eşit miktarda -X/+X yönünde hareket eder.
- Bir ray hareket ettiğinde üst görünüş rayı, arka mekanizması, ön kafası ve ön görünüş rayı/ön kafası aynı X ofsetini kullanır.
- İki raylı sistemde aralık düzenleme, NO kuralı tanımlanana kadar kapalıdır.
- Ray aralık ölçüleri bütün pozlarda sabit Poz 3 ölçü hattında ve merkez referanslarıyla gösterilir.
- Yan görünüş aralık eşitleme, toplam yan açıklığı korur; yuvarlama farkı merkez aralığa verilir.
- Ön dikme profili En/Boy/Et ile değiştirilebilir. Ön görünüşte En, üst görünüşte En×Boy kesiti gösterilir; kesitin -Y dış kenarı oluk -Y dış kenarında sabittir.
- Ön dikme uzatması yalnız alt ucu -Y yönüne taşır; üst bağlantı ve çatı açısı değişmez. Manuel uzatma otomatik parapet oturma kuralından önceliklidir.
- Ön ve sol yan parapetler segmentlere ayrılabilir. Her segment başlangıç, bitiş ve yükseklik verisi taşır ve bağımsız düzenlenir.
- Alt bağlantı bloğu parapet üst kotuna oturur; blok olmayan özel profil parapet üst kotuna teğet olur.
- Farklı parapet yükseklikleri için parapet ve oluk/dikme mesafeleri ayrı ölçülendirilir.
- Üretim limitleri çizimi, PDF'yi veya DXF'i engellemez; yalnız Çizimi Kontrol Et ekranında uyarı üretir.
- Yeni işlemler büyük önizlemeyi kapatmaz ve kullanıcının zoom/pan konumunu değiştirmez.


## v8.9.21 seçim ve ölçü yerleşimi kuralları
- Toolbox üzerinden bir seçim komutu aktifken yalnızca o komutun işleyebileceği ölçü veya ürün etkileşimleri görünür; diğer ölçü ve etkileşim işaretleri geçici olarak gizlenir.
- Komut iptal edildiğinde Ana/Tüm Ölçüler görünürlük filtreleri aynen geri yüklenir.
- Önizlemede yatay ölçü çizgileri yalnız Y, dikey ölçü çizgileri yalnız X ekseninde sürüklenebilir. Bu işlem geometriyi ve DXF ölçü değerini değiştirmez.
- Ölçü çizgisi önizleme ofsetleri proje dosyasına, bulut kaydına ve Undo/Redo geçmişine dahil edilir; zoom/pan değişmez.
- Bölünmüş parapetlerde her parçanın genişliği ölçülür. İlk ve orta parçalar sol sınırı sabit tutup sağa doğru; son parça sağ sınırı sabit tutup sola doğru büyür/küçülür.
- Parapet genişlik ölçü hattı ilgili parapetin -Y kenarından +50 mm yönünde konumlanır.


## v8.9.22 ölçü filtreleme ve tıklama kuralları

- `Tüm ölçüleri göster` kontrolü artık açılır ölçü filtresidir. İlk filtre grupları: Hepsi, Hiçbiri, Yatay, Dikey, Düzenlenebilir, Düzenlenemez ve dinamik Poz filtreleridir.
- Filtre grupları kesişim mantığıyla çalışır: seçili yön + seçili düzenlenebilirlik + seçili poz. Poz filtresinde tüm pozlar işaretliyse global ölçüler de görünür; belirli poz seçildiyse yalnız o poza bağlanabilen ölçüler gösterilir.
- `Ana ölçüleri göster` butonu hızlı ana-ölçü görünümüne döner. `Hepsi` ana ve detay ölçülerini açar, `Hiçbiri` bütün ölçüleri gizler.
- Toolbox eleman türü filtresi ölçü filtresinin üzerinde çalışmaya devam eder; aktif komutta yalnız işlem yapılabilen elemanlar görünür. Komut bittiğinde kullanıcının ölçü filtresi geri uygulanır.
- Ölçülerin görünmez tıklama alanı hiçbir zaman bütün uzatma çizgilerini kapsayan geniş bir dikdörtgen olamaz. Tıklama/sürükleme hedefi yalnız ölçü yazısı ve gerçek ölçü hattı boyunca dar bir koridordur. Bu kural yatay-dikey ölçü çakışmalarını önlemek için kalıcıdır.
- Ölçü filtreleri önizleme kullanıcı ayarı olarak proje dosyasına kaydedilir ve eski proje dosyalarıyla geriye dönük uyumludur.


## v8.9.23 seçim ve ölçü filtresi UI kuralları
- Ölçü filtresi menüsü her zaman kendi toolbox hücresinin ve Tüm Ölçüleri Göster butonunun genişliği içinde kalmalıdır.
- Filtrede ayrı Hiçbiri kontrolü kullanılmaz; Hepsi kutusu Excel tipi checked / unchecked / indeterminate durumlarını gösterir.
- Çoklu seçim, ölçü veya ürün geometrisini kalın/yeşil bir alanla kapatmamalıdır; seçim durumu yalnız küçük kutu ve tikle gösterilir.
- Ölçü seçim kutusu, ölçü yazısının ekran koordinatındaki üst orta noktasına yerleşmelidir.
- Önizleme alanının tamamında küçük hassas özel imleç kalıcıdır; yeni araçlar bu kuralı cursor override ile bozmamalıdır.

## v8.9.24 seçim kutusu ve filtre menüsü kuralları
- Çoklu seçim işaretleri yalnızca görsel gösterge değildir; kutunun tamamı doğrudan tıklanabilir seçim hedefidir.
- İşaretler klavyeyle Tab üzerinden odaklanabilir; Enter veya Space ile seçilip kaldırılabilir.
- İşaret kutusuna tıklamak, altındaki ölçü veya ürünle aynı seçim anahtarını kullanır; ayrı veya sahte bir seçim kaydı oluşturmaz.
- Poz filtreleri her zaman tek kolon ve yukarıdan aşağı sıralanır.
- Ölçü durum filtresi kullanıcı diliyle kısa tutulur: Düzenlenebilir / Bilgi amaçlı.
- Filtre menüsü yazıları toolbox içinde kompakt kalmalı; menü veya satırlar toolbox genişliğini aşmamalıdır.

## v8.9.25 parapet segment düşey ölçü yerleşimi kuralları
- Bölünmüş parapetlerde düşey ölçüler global sol/sağ kolonda toplanamaz; her segment kendi X aralığında yerel ölçü taşımalıdır.
- Her segmentte parapet yüksekliği ve oluk altı-parapet üstü mesafesi aynı düşey zincir hattında gösterilmelidir.
- Aynı yüksekliğe sahip segmentler birleştirilmez; her segment kendi ölçüsünü korur.
- Yerel ölçü hattı segmentin yaklaşık ilk üçte birlik bölümünde ve segment sınırları içinde kalmalıdır.
- Ön ve yan görünüş aynı yerleşim algoritmasını kullanmalıdır.
- Ölçüler dikey yön, bilgi amaçlı durum ve ilgili poz filtresiyle uyumlu metadata taşımalıdır.
- Mevcut ölçü kimlikleri mümkün olduğunca korunmalı; saklanmış manuel ölçü ofsetleri kaybolmamalıdır.
- Geometri değişikliği PDF/DXF ve önizlemede aynı ölçü yerleşimini üretmeli; zoom/pan veya büyük önizleme durumu değişmemelidir.



## v8.9.26 yan destek dikmesi oturma ve uzatma kuralları
- Sonradan eklenen veya mevcut bütün yan destek dikmeleri, manuel ofset yoksa merkez X konumlarının denk geldiği yerel parapet segmentinin +Y üst kotuna otomatik oturur.
- Parapet bölündüğünde, segment yüksekliği değiştiğinde veya destek dikmesi X ekseninde taşındığında otomatik oturma yeni yerel segmente göre yeniden hesaplanır.
- Yan destek dikmesinin +Y üst ucu cam kaydı alt kotunda sabit kalır; otomatik oturma veya manuel alt uç düzenlemesi çatı açısını ve üst bağlantıyı değiştiremez.
- Alt uç ofseti 0 ise parapete oturur; pozitif değer profili -Y yönüne uzatır, negatif değer profili alttan kısaltır.
- Manuel alt uç ofseti proje kaydı, bulut kayıt, Undo/Redo, PDF ve DXF üretimine dahil edilir.
- Üretim açısından aşırı uzatma veya kısaltma çizimi engellemez; Çizimi Kontrol Et ekranında uyarı üretir.

## v8.9.27 ürün ölçüsü ve yerel parapet yerleşim kuralları
- Ürün ekleme ekranında genişlik ve yükseklik otomatik hesaplanarak başlangıç değeri olarak gösterilir.
- Formdan kaydedilen ürün genişliği ve yüksekliği kullanıcı verisidir; normalize veya çizim aşamasında sessizce yeniden alan ölçüsüne zorlanamaz.
- Ön/yan dikme aralığı değişimi ve aralık eşitleme, mevcut ürün ölçülerini otomatik değiştirmez.
- Otomatik yeniden boyutlandırma yalnız “Ürünü Alana Uydur” komutuyla yapılır.
- Yan görünüşte otomatik ürün yüksekliği `Ön H - ürün merkezinin bulunduğu yerel parapet yüksekliği` olarak hesaplanır.
- Yan görünüşte ürün alt kotu yerel parapet üst kotuna oturur; farklı parapet yüksekliklerinde ürünlerin üst kotu ortak Ön H/oluk hattında kalır.
- Yan görünüşte otomatik ürün genişliği seçilen destek dikmesi aralığının net genişliğidir.
- Manuel ölçü yerleşim alanını aşarsa çizim engellenmez; Çizimi Kontrol Et uyarı üretir.


## v8.9.28 yan görünüş net yükseklik ve ara poz ölçü yerleşimi kuralları

- Yan görünüşte parapet üstünden başlayan net düşey ölçünün +Y üst referansı oluk kotu değil, cam kayıt profilinin -Y dış kenarıdır.
- Cam kayıt profilinin yan görünüşteki En değeri değiştiğinde net ölçü otomatik yeniden hesaplanır.
- Yan görünüşte yeni ürünün otomatik yüksekliği ve “Ürünü Alana Uydur” yüksekliği aynı cam kayıt alt kotunu kullanır.
- Kullanıcının manuel kaydettiği ürün yüksekliği otomatik olarak değiştirilmez; yalnız yeni otomatik değer ve uygunluk kontrolü revize edilir.
- Poz sayısı üç veya daha fazlaysa, tek parçalı parapete sahip ara pozların parapet + net boşluk zincir ölçüsü ön dikmenin hemen solunda gösterilir.
- Bölünmüş parapetlerde segment bazlı lokal ölçü dağılımı korunur.
- Büyük önizleme, zoom/pan, ölçü filtreleri ve manuel ölçü sürükleme kuralları değişmez.


## v8.9.29 yan ürün otomatik payı ve ara poz üst referansı
- Yan görünüşte yeni sürme/giyotin eklenirken otomatik genişlik ve yükseklikten 5 mm montaj payı düşülür.
- Bu değer yalnız başlangıç ve “Ürünü Alana Uydur” değeridir; kullanıcı sonradan genişlik/yüksekliği manuel değiştirebilir.
- Üç veya daha fazla yan pozda cam kayıt çizilmeyen ara pozların parapet net yükseklik ölçüsü oluk altı ile parapet üstü arasındadır.
- Cam kayıt gerçekten çizilen kenar pozlarda üst referans profilin -Y dış kenarıdır ve profil En değeri değişince ölçü revize olur.

## v8.9.30 taraf ve poz bazlı yan görünüş düzenleme kuralları
- Yan görünüş kimlikleri kalıcıdır: sol=`0`, sağ=`right`, ara poz=`poz indexi` (örn. `1`, `2`).
- Her yan görünüşün cam kaydı, üçgen doğrama, destek dikmeleri, parapet segmentleri, ürünleri ve ölçü durumları bağımsız saklanır.
- Bir taraftaki silme/düzenleme diğer tarafa otomatik uygulanmaz. Ana formdaki EVET/HAYIR yalnız başlangıçta iki kenar tarafını birlikte kurar.
- Sağ görünüş işlemleri ayna yönlerinde uygulanır; üst görünüş destek kesiti ilgili yan görünüşün kendi X konumuyla senkron kalır.
- Ara poz ilk kez düzenlemeye açıldığında sol yan görünüş bağımsız başlangıç kopyası olarak alınır; sonraki değişiklikler iki yönlü senkron değildir.
- Ürün kopyalarken poz numaraları topluca ayrılmalı; aynı map döngüsü içinde tek tek `allocatePozNos(...,1)` çağrılmamalıdır.
- Önizleme komut butonları ve etkileşim yardımcıları `previewOnly`/`interaction` olarak işaretlenmeli ve DXF/PDF düzleştirmesinde atlanmalıdır.
- Side state ve cam kaydı uzunluk ofsetleri `.plmr`, Undo/Redo ve bulut snapshot içinde saklanmalıdır.

## v8.9.31 yan görünüş ana/ayna ve yerel geometri kuralları
- Çoklu pozlarda son sağ yan görünüş düzenleme kaynağıdır; son sol yan görünüş yalnız kurallı ayna sunumudur.
- Son sol ayna görünüşte yalnız açılım, arka yükseklik, ön yükseklik ve açı/poz metni kalır.
- Aynalanan ürünlerde sağ/sol yönleri ile INSIDE/OUTSIDE VIEW metinleri semantik olarak terslenir.
- Destek dikmesinin yan görünüşte duvardan uzaklığı üst görünüşte cam kaydının duvar ucundan 1:1 ters yönde uygulanır: yan +X hareketi üst görünüşte aynı miktarda -Y hareketidir.
- Ara poz düzenleme butonu preview-only interaction elemanıdır; DXF/PDF geometrisine katılmaz.
- Üçgen doğrama dış çerçevesi ve iç ofseti sabit kalır; yalnız iç bölme sayısı eşit aralıkla değişir.
- Arka duvar ve cam kaydı Duvara Oturt işlemleri taraf/poz bazında bağımsızdır.

- Ara poz düzenleme anahtarı kırmızı durumdayken görünüş geometrisi korunur; yalnız anahtar tıklanabilir, diğer ürün/profil/parapet/duvar etkileşimleri pasiftir.

- Arka duvar parçaları parapet benzeri yerel başlangıç, bitiş ve yükseklik verisiyle saklanır; ortak parça sınırları birlikte hareket eder ve seçili parça eşit alt parçalara bölünebilir.
