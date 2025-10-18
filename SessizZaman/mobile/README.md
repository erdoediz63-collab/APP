# 🌳 Sessiz Zaman - Konsantrasyon Uygulaması

Sessiz Zaman, odaklanmanızı artırmak ve konsantrasyonunuzu geliştirmek için tasarlanmış bir mobil uygulamadır.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **Pomodoro Timer**: Klasik 25/5 dk veya özelleştirilebilir süreler
- **Farklı Zamanlayıcı Modları**: Pomodoro (25d), Kısa (15d), Uzun (50d)
- **Doğa Temalı Oyunlaştırma**: Her odaklanma seansında sanal ağaç yetiştirme
- **20+ Farklı Ağaç Türü**: Coin karşılığında kilidini açabileceğiniz ağaçlar
- **Detaylı İstatistikler**: Günlük, haftalık ve tüm zamanlar istatistikleri
- **Başarı Sistemi**: Rozetler ve ödüller
- **Seviye Sistemi**: Odaklanma süresiyle yükselen level
- **Coin Sistemi**: Her dakika odaklanma = 1 coin
- **Streak Takibi**: Günlük ardışık kullanım takibi

### 🎨 Tasarım
- Minimalist ve sakin arayüz
- Yeşil tonları ve doğa teması
- Smooth animasyonlar
- Mobil-optimized UI

## 🚀 Kurulum ve Çalıştırma

### Backend Kurulumu

1. Backend dependencies'i yükleyin:
```bash
cd /app/backend
pip install -r requirements.txt
```

2. Backend'i başlatın:
```bash
sudo supervisorctl restart backend
```

Backend şu adreste çalışacak: `https://turkish-greeting-44.preview.emergentagent.com/api`

### Mobile App Kurulumu

1. Dependencies'i yükleyin:
```bash
cd /app/mobile
npm install
```

2. Expo Go uygulamasını yükleyin:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

3. Uygulamayı başlatın:
```bash
npx expo start
```

4. QR kodu Expo Go ile tarayın

## 📱 Expo Go ile Test Etme

1. Telefonunuza **Expo Go** uygulamasını indirin
2. Terminalden `npx expo start` komutunu çalıştırın
3. Çıkan QR kodu telefonunuzla tarayın:
   - iOS: Kamera uygulamasıyla QR kodu tarayın
   - Android: Expo Go uygulamasındaki "Scan QR Code" ile tarayın
4. Uygulama telefonunuzda açılacak!

## 🎮 Kullanım

### İlk Kullanım
1. Uygulamayı açın
2. "Kayıt Ol" butonuna tıklayın
3. E-posta, kullanıcı adı ve şifre girin
4. Kayıt olun ve giriş yapın

### Odaklanma Seansı Başlatma
1. Ana ekranda zamanlayıcı modunu seçin (Pomodoro/Kısa/Uzun)
2. "Başlat" butonuna tıklayın
3. Ağacınız büyümeye başlayacak
4. Odaklanın! Uygulamadan çıkarsanız ağaç kurur ⚠️
5. Süre bitince coin ve XP kazanın

### Ağaç Koleksiyonu
1. "Orman" sekmesine gidin
2. Kazandığınız coinlerle yeni ağaçların kilidini açın
3. Nadir, Epik ve Efsanevi ağaçları toplayın

### İstatistikler
1. "İstatistikler" sekmesinde ilerlemenizi görün
2. Günlük, haftalık ve tüm zamanlar verilerinizi inceleyin
3. Grafiklerde trendlerinizi takip edin

## 🏗️ Teknik Detaylar

### Tech Stack
- **Frontend**: React Native + Expo
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Navigation**: React Navigation
- **State Management**: React Context

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı profili

#### Focus Sessions
- `POST /api/sessions` - Yeni odaklanma seansı kaydet
- `GET /api/sessions` - Kullanıcının seanslarını getir

#### Statistics
- `GET /api/stats` - Detaylı istatistikler

#### Trees
- `GET /api/trees` - Tüm ağaçları listele
- `GET /api/trees/user` - Kullanıcının ağaçları
- `POST /api/trees/unlock/{tree_id}` - Ağaç kilidini aç

#### Settings
- `GET /api/settings` - Kullanıcı ayarları
- `PUT /api/settings` - Ayarları güncelle

#### Leaderboard
- `GET /api/leaderboard` - Global lider tablosu

### Proje Yapısı

```
/app/
├── backend/
│   ├── server.py          # Ana FastAPI sunucusu
│   ├── models.py          # Pydantic modelleri
│   ├── auth.py            # Authentication helper'lar
│   └── requirements.txt   # Python dependencies
│
└── mobile/
    ├── App.js             # Ana uygulama
    ├── app.json           # Expo config
    ├── src/
    │   ├── config.js      # API URL config
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── TimerScreen.js
    │   │   ├── StatsScreen.js
    │   │   ├── ForestScreen.js
    │   │   └── ProfileScreen.js
    │   └── utils/
    │       ├── api.js     # Axios instance
    │       └── storage.js # AsyncStorage helper
    └── assets/
```

## 🎯 Özellik Detayları

### Oyunlaştırma Mekaniği
- Her başarılı seans = 1 ağaç dikildi
- Her dakika odaklanma = 1 coin
- Her 3600 saniye (1 saat) = 1 level
- Başarısız seans (yarıda bırakma) = ağaç kurudu, coin yok

### Ağaç Türleri
- **Yaygın**: Meşe (ücretsiz), Çam (100 coin), Kaktüs (150 coin)
- **Nadir**: Palmiye (200 coin), Bambu (300 coin), Akçaağaç (400 coin)
- **Epik**: Kiraz Çiçeği (500 coin), Söğüt (600 coin)
- **Efsanevi**: (Yakında eklenecek)

## 📈 Gelecek Özellikler

- [ ] Ortam sesleri (doğa, yağmur, okyanus)
- [ ] Push bildirimleri
- [ ] Arkadaşlarla yarışma
- [ ] Gerçek ağaç dikme entegrasyonu
- [ ] Dark mode
- [ ] Widget desteği
- [ ] Apple Watch entegrasyonu

## 🐛 Bilinen Sorunlar

- Arka planda çalışma henüz tam desteklenmiyor
- Bazı Android cihazlarda bildirim gecikmeleri olabilir

## 📝 Notlar

- Uygulama test aşamasındadır
- App Store yayınlanması için Apple Developer hesabı gereklidir
- Expo EAS Build ile production build alınabilir

## 🎉 Teşekkürler

Sessiz Zaman'ı kullandığınız için teşekkürler! Konsantrasyonunuzu artırın ve ormanınızı büyütün! 🌳
