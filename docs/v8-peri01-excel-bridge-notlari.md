# V8 PERI01 Excel Bridge Notları

Kaynaklar:
- `pulumur_macros_formulas_txt(1).zip`
- `PERI01_DraftSight_v32_Triangle_Ofset(7).lsp`
- `PERI01_AutoCAD_v30(4).lsp`

Aktarılan net mantıklar:
1. Çizim verisi Sayfa1 üzerinden işlenir.
2. Sayfa1!B1 genişlik optimizasyonu:
   - tek değer ve cam kaydı yok: G8 - 12
   - normal çoklu liste: sistemler arası 25 mm payı dağıtılır
   - NO modu: genişlik/boşluk sırası korunur, genişlikler cam kaydı durumuna göre düzeltilir
3. Ray sayısı:
   - <=4000: 2 ray
   - <=8000: 3 ray
   - <=12000: 4 ray
   - üstü: 4 ray
4. Dikme sayısı:
   - toplam ray - (poz/sistem sayısı - 1)
   - ön yükseklik tüm pozlarda 0 ise dikme sayısı 0
5. Pülümür hesaplayıcı:
   - açı/açılım/arka/ön değerlerinden biri boş bırakılır
   - 71.1 ve 278 sabitleri kullanılır
   - çoklu poz noktalı virgül ile desteklenir
6. Üst tablo ve alt antet:
   - Sayfa1 I sütunu ölçüleri temel alınır
   - PERGO RISE yazı yüksekliği ile dinamik ölçeklenir
7. Yardım:
   - Kullanım kılavuzu metni web yardım penceresine eklendi.

Kalan birebirlik işleri:
- Referans PERI01 çıktılarına göre görünüş koordinatları ve ölçülendirme sabitlerini milim düzeltmek.
- `PergoRise Dikme Üst Görünüş` kaynak bloğu temiz tek DXF olarak verilirse değiştirmek.
- Antet ve tablo yazı hizalama/ölçü okları DraftSight çıktısı ile yan yana kontrol edilerek inceltilecek.
