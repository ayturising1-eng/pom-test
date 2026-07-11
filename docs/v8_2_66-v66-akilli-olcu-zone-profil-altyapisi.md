# v8.2.66 - V66 Akıllı Ölçü / Zone / Profil-Ürün Altyapısı

Bu sürüm, `PLMR_V66_Dinamik_Olcu_Urun_Yerlesim_Promptu_26_Madde.pdf` içindeki talimatlara göre ilk altyapı revizyonudur.

## Eklenenler

- Ölçülere `dimId`, `view`, `zoneId`, `editable`, `dimensionType`, `actionType` metadata alanları eklendi.
- Merkezi `DIMENSION_EDIT_RULES` ve `DIMENSION_ACTIONS` altyapısı eklendi.
- `PROFILE_LIBRARY` ve `PRODUCT_LIBRARY` altyapısı eklendi.
- Önizleme SVG içinde ölçüler `data-dim-id`, `data-view`, `data-zone-id`, `data-editable`, `data-can-*` alanları taşır.
- Ölçü paneli V66 akıllı panel olarak genişletildi.
- Panelde işlem seçenekleri eklendi:
  - Sadece ölçüyü değiştir
  - Bu aralığa aynı profilden ekle
  - Bu aralığa farklı profil ekle
  - Bu alana ürün yerleştir
  - Mevcut elemanı / profili düzenle
- Pasif ölçüler için bilgi paneli eklendi.
- Aynı profilden ekle altyapısı ilk aşamada dikme sayısını +1 yapacak şekilde bağlandı.
- Profil seçiminde 40x130 örneği için yan/üst görünüş ilişkisi gösterilir.
- DXF layer listesine V66 görünüş/ölçü/ürün/profil layerları eklendi.

## Henüz bilinçli olarak yapılmayanlar

- Sürme, zipper, giyotin detay çizimleri bu aşamada tam çizilmez.
- Profil değişikliği henüz gerçek geometri kesitini tüm görünüşlerde değiştirmez; veri modeli ve UI altyapısı hazırdır.
- Tüm pasif/aktif ölçü listesi kullanıcıdan gelecek net listeye göre sonraki revizyonda genişletilecektir.

## Korunanlar

- v8.2.63 zoom/pan ve dinamik ölçü davranışı korunmuştur.
- DXF/PDF indirme, PWA, dil, hesaplayıcı, hızlı testler korunmuştur.
