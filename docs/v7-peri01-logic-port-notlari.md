# V7 PERI01 Logic Port Notları

Bu sürümde PERI01 LISP içindeki aşağıdaki mantıklar WebDXF çekirdeğine taşınmıştır:

- `;` ile çoklu genişlik, açılım, arka yükseklik ve ray sayısı okuma.
- Genişlik satırındaki `NO` özel ara boşluk modu.
- Sistem adedi / genişlik listesi / ray listesi arasında en büyük değere göre sistem sayısını büyütme.
- Sistem bazlı başlangıç X, bitiş X, ray alanı, ray pitch, ray pozisyonları.
- Cam kaydı varsa sadece ilk sistem solundan ve son sistem sağından 66 mm düşme.
- Çoklu sistemlerde ray arası akslardan dikme aksı üretme.
- Farklı açılım / farklı arka yükseklik listeleri için poz bazlı üst duvar ve yan görünüş mantığı.
- Ön görünüş ray üst kotunun maksimum arka yükseklik referansına göre hizalanması.
- Yan görünüşte ray uzunluğu ve açı hesabı: PERI01 sabitleri `71.1`, `278`, `265`, `220` ile.
- Cam kaydı, parapet, standart dışı su çıkışı ve üçgen doğrama ana çizim dalları.
- Kaynak base point korunarak blokların yerinde BLOCK/INSERT olarak yazılması.

Bu sürüm nihai birebir PERI01 değildir; ancak PERI01 algoritmasının web çekirdeğine taşındığı ana temel sürümdür. Bundan sonraki revizyonlarda görsel yerleşim ve her opsiyonun detay farkları bu temel üzerinden milim milim düzeltilecektir.
