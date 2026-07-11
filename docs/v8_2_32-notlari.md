# V8.2.32 Notları

- Çoklu poz üst toplam ölçüsü, yan/cam kayıt profili çiziliyorsa artık ray arka mekanizma blok uçlarından değil, yan kayıt profillerinin dış X uçlarından alınır.
- Ölçü başlangıcı: Poz 1 sol yan kayıt profilinin -X dış ucu.
- Ölçü bitişi: Son poz sağ yan kayıt profilinin +X dış ucu.
- Yan/cam kayıt profili yoksa V8.2.31 ray arka mekanizma blok ucu mantığı korunur.
- ;NO ara boşluklu çoklu poz sistemi korunur.
