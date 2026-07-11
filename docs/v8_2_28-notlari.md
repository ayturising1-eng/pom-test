# V8.2.28 Notları

- PERI01 DraftSight v32 / AutoCAD v30 LISP mantığına göre parapet aktifken karşı görünüşe parapet ölçülendirmesi eklendi.
- Parapet yüksekliği, parapet alt kotu ile parapet üst kotu arasında ölçülür.
- Dikme/boşluk yüksekliği, parapet üst kotu ile oluk altı referansı arasında ayrıca ölçülür.
- Bu iki ek ölçü LISP tarafındaki gibi sol ölçü aksına alınır ve %18 küçük ölçü grafiğiyle çizilir.
- V8.2.27 çoklu poz üst genişlik ve toplam dıştan dışa genişlik ölçüleri korunmuştur.
- V8.2.26 trapez tarama sınırı korunmuştur: ilk raydan son raya.
- Yan görünüş ön yükseklik ölçüsü de PERI01 parapet kot mantığına göre toplam ön yüksekliği verecek şekilde düzeltildi.
