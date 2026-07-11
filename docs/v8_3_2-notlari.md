# v8.3.2 Notları

- v8.3.1 baz alınmıştır.
- DraftSight tarafından reddedilen uzun kaynak blok adları kısaltılmıştır.
- Tüm DXF blok adları ASCII/BÜYÜK HARF formatında ve en fazla 31 karakterdir.
- Kaynak blok kütüphanesindeki `dxfName` değerleri de aynı kısa adlarla güncellenmiştir.
- BLOCK tablosu, INSERT kayıtları ve aynalanmış bloklar aynı isim dönüştürme fonksiyonunu kullanır.
- Bilinen Pergo Rise blokları okunabilir kısa kodlarla adlandırılmıştır:
  - `PERGORISE_RAY_ARKA_MEKANIZMA_UST_GORUNUS` → `PR_RAIL_REAR_MECH_TOP`
  - `PERGORISE_DIKME_OLUK_BAGLANTI_KARSI_GORUNUS` → `PR_POST_GUTTER_FRONT`
  - `PERGORISE_OLUK_YAN_GORUNUS_BIRLESTIRILMIS` → `PR_GUTTER_SIDE_COMBINED`
- Bilinmeyen/gelecekte eklenecek 31 karakterden uzun adlar otomatik kısa hash ekiyle güvenli hale getirilir.
- Önizlemedeki görünen Türkçe blok adları değiştirilmemiştir; yalnız DXF kayıt adları güncellenmiştir.
