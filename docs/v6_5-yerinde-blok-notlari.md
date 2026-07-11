# V6.5 Yerinde Blok Notları

Önceki V6.4 sürümünde bloklar kütüphane gibi tanımlanıp farklı yerlere INSERT ediliyordu.

Bu sürümde istenen CAD davranışına daha yakın olacak şekilde, her yerleşmiş ürün kendi bulunduğu koordinata göre blockify edilir:

- Ürün önce gerçek koordinatına taşınır.
- Dönüş ve ölçek blok içeriğine uygulanır.
- Blok koordinatları ürün merkezine göre tekrar sıfırlanır.
- Modelspace'e merkez noktasından INSERT yazılır.

Sonuç: Modelspace içinde ilgili ürün ham çizgi yığını değil, seçilebilir bloktur.
