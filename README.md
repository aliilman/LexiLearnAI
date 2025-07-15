# 📚 LexiLearn - İngilizce Kelime Öğrenme Uygulaması

Modern ve kullanıcı dostu bir İngilizce kelime öğrenme web uygulaması.

## ✨ Özellikler

### 🎯 Ana Özellikler
- **Günlük 5 kelime** - Her gün farklı kelimeler
- **Çoktan seçmeli testler** - 5 seçenekli testler
- **Sesli telaffuz** - Web Speech API ile
- **İlerleme takibi** - Günlük seri ve toplam kelime sayısı
- **Responsive tasarım** - Mobil uyumlu

### 📊 Kelime Detayları
- İngilizce kelime
- Türkçe anlamı
- Örnek cümle (İngilizce + Türkçe)
- 4 eş anlamlı kelime
- 4 zıt anlamlı kelime

### 🔧 Yönetici Paneli
- **Kelime düzenleme** - Tüm alanları değiştirme
- **Yeni kelime ekleme** - Günlere kelime ekleme
- **Gün yönetimi** - Yeni günler oluşturma
- **Veri yönetimi** - İçe/dışa aktarma
- **Gerçek zamanlı güncelleme** - localStorage entegrasyonu

## 🚀 Kullanım

### 📱 Ana Uygulama
1. `index.html` dosyasını tarayıcıda açın
2. Günün kelimelerini inceleyin
3. 5 kelimeyi öğrendikten sonra teste geçin
4. Çoktan seçmeli soruları cevaplayın
5. Sonuçlarınızı görün ve günlük serinizi artırın

### 🔧 Yönetici Paneli
1. `admin.html` dosyasını tarayıcıda açın
2. Tarih seçin ve verileri yükleyin
3. Kelimeleri düzenleyin veya yeni ekleyin
4. Değişiklikler otomatik kaydedilir

### 🧪 Test Sayfası
1. `test_local.html` dosyasını açın
2. Sistem bileşenlerini test edin
3. Hata kontrolü yapın

## 📁 Dosya Yapısı

```
LexiLearn/
├── index.html              # Ana uygulama
├── styles.css              # Ana stil dosyası
├── script.js               # Ana JavaScript
├── admin.html              # Yönetici paneli
├── admin.css               # Yönetici stilleri
├── admin.js                # Yönetici JavaScript
├── date_manager.js         # Tarih yönetimi
├── words_embedded.js       # Gömülü kelime veritabanı
├── kelimeler_veritabani_yeni.csv  # Ana kelime veritabanı
├── test_local.html         # Test sayfası
└── README.md               # Bu dosya
```

## 🎨 Teknolojiler

- **HTML5** - Modern web standartları
- **CSS3** - Gradient arka planlar, animasyonlar
- **JavaScript ES6+** - Async/await, localStorage
- **Web Speech API** - Sesli telaffuz
- **CSV** - Veri saklama
- **Responsive Design** - Mobil uyumluluk

## 📊 Veri Yönetimi

### 📅 Tarih Sistemi
- **Başlangıç:** 16 Temmuz 2025
- **Döngü:** 10 günlük kelime rotasyonu
- **Otomatik:** Tarih bazlı kelime seçimi

### 💾 Veri Saklama
- **CSV dosyası** - Ana veritabanı
- **localStorage** - Güncellemeler ve ilerleme
- **Gömülü veritabanı** - Fallback sistemi

## 🔄 Güncelleme Sistemi

1. **Admin panelinde düzenleme** → localStorage'a kayıt
2. **Ana uygulama** → localStorage'dan okuma
3. **Gerçek zamanlı senkronizasyon**
4. **Veri güvenliği** - Otomatik yedekleme

## 🎯 Gelecek Özellikler

- [ ] Daha fazla dil desteği
- [ ] Kullanıcı hesapları
- [ ] İstatistik grafikleri
- [ ] Kelime kategorileri
- [ ] Zorluk seviyeleri
- [ ] Sosyal özellikler

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Ali** - [GitHub Profili](https://github.com/KULLANICI_ADINIZ)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!