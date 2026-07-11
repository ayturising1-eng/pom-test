# V6.6 Kaynak Base Point Notları

Bu sürümde filtrelenmiş DXF blokları artık bbox/ürün merkezi baz alınarak değil, kaynak DXF içindeki orijinal blok base point mantığı korunarak kullanılır.

İş akışı:

1. Kaynak blok entity koordinatları korunur.
2. Parça online çizimdeki gerçek yerine insertion point üzerinden oturtulur.
3. Yerleşmiş geometri BLOCK tanımı içine alınır.
4. Modelspace içinde ham çizgi kalmaz; sadece INSERT kalır.
5. INSERT noktası, kaynak DXF dosyasındaki blok base point karşılığıdır.
