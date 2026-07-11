# V8.2.30 - Çoklu Poz Cam Kaydı Y Düzeltmesi

- Farklı açılımlı çoklu pozlarda üst görünüş cam kayıt profili PERI01 `camKaydiUstCiz` mantığına göre düzeltildi.
- İlk poz ve son poz cam kayıt profillerinin `-Y` uçları aynı referansta tutuldu. Profil boyları poz açılımına göre değiştiği için `+Y` uçları artık poz bazlı farklı kotlara geliyor.
- 5000 mm üzeri otomatik gelen ara destek dikmesi de ilgili profilin kendi boyuna göre merkezleniyor.
- Samples klasöründeki eski DXF dosyaları temizlendi; sadece bu sürüm test DXF’i bırakıldı.
