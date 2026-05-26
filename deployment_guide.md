# 🚀 AYPERI Portfolio - Saytni Deploy qilish (Joylashtirish) bo'yicha Qo'llanma

Ushbu qo'llanma AYPERI veb-saytini (Express API + SQLite bazasi + React frontend) internetga muvaffaqiyatli va xatolarsiz joylashtirish bo'yicha to'liq ko'rsatmalarni o'z ichiga oladi. Loyiha ham mono-deployment (bitta serverda frontend va backend), ham split deployment (alohida frontend va backend) arxitekturalarini to'liq qo'llab-quvvatlaydi.

---

## 🛠️ Loyihaning Joylashtirishga Tayyorligi

Koddagi quyidagi muhim o'zgarishlar deployni juda osonlashtiradi:
1. **Avtomatlashtirilgan o'rnatish (`postinstall`)**: Root (backend) papkasida `npm install` qilinganda, frontend dependencies avtomatik tarzda yuklanadi.
2. **CORS faollashtirilgan**: Agar frontend va backend alohida serverlarga joylansa, brauzerdagi xavfsizlik (CORS) xatolarining oldi olingan.
3. **Dinamik SQLite ma'lumotlar bazasi yo'li**: `DATABASE_PATH` muhit o'zgaruvchisi (env var) orqali SQLite faylini persistent (o'chib ketmaydigan) xotiraga yo'naltirish mumkin.
4. **Dinamik API manzili**: Frontendda `VITE_API_URL` env var orqali istalgan backend API manzilini ko'rsatish mumkin.

---

## 🎯 Variant A: Render.com da Mono-Deployment (Tavsiya etiladi)

Ushbu usulda bitta server Express backendni ishga tushiradi va React frontend sahifalarini ham o'zi xizmat qildiradi (serve qiladi). SQLite ma'lumotlar bazasi o'chib ketmasligi uchun persistent disk ulaymiz.

### Qadamlar:
1. **GitHub repozitoriyasini ulash**:
   - Kodlaringizni GitHub-ga yuklang va Render.com saytida yangi **Web Service** yarating.
2. **Sozlamalar (Build & Start)**:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build` (Ushbu buyruq frontendni kompilyatsiya qiladi va productionga tayyorlaydi).
   - **Start Command**: `npm start`
3. **Environment Variables (Muhit O'zgaruvchilari)**:
   - `PORT`: `3000` (yoki Render o'zi beradigan port)
   - `DATABASE_PATH`: `/data/database.sqlite` (ma'lumotlar bazasi diskda saqlanishi uchun)
4. **Persistent Disk (Disk ulash)**:
   - Render boshqaruv panelida **Disks** bo'limiga o'ting.
   - **Add Disk** tugmasini bosing.
   - **Name**: `database-volume`
   - **Mount Path**: `/data`
   - **Size**: `1 GB` (ushbu loyiha uchun yetarli)

> [!IMPORTANT]
> Render-da bepul rejalarda disklar vaqtincha tozalanishi mumkin (ephemeral filesystem). Shuning uchun SQLite ishlatganda albatta **Persistent Disk Volume** ulanishi va uning yo'li `DATABASE_PATH` o'zgaruvchisiga o'rnatilishi shart!

---

## 🎯 Variant B: Railway.app da Joylashtirish

Railway ham Render kabi juda qulay va SQLite persistent volume-ni qo'llab-quvvatlaydi.

### Qadamlar:
1. Railway boshqaruv panelida yangi loyiha yarating va GitHub repo-ni bog'lang.
2. **Volume yaratish**:
   - Loyiha sozlamalarida **Volume** bo'limiga o'ting va yangi disk hajmini yarating (Mount yo'lini `/data` deb belgilang).
3. **Environment Variables (Variables)**:
   - `DATABASE_PATH` o'zgaruvchisini `/data/database.sqlite` ga sozlang.
4. **Railway avtomatik tarzda build qiladi**:
   - `package.json` faylidagi `start` va `build` skriptlarini Railway avtomatik aniqlaydi va ishga tushiradi.

---

## 🎯 Variant C: Split Deployment (Frontend Netlify/Vercel + Backend Render)

Agar frontendni tezroq va bepul yuklanishi uchun static hostingga (Netlify/Vercel) joylashtirib, Express API ni alohida serverda (Render/Railway) ishlatmoqchi bo'lsangiz.

### 1-qadam: Backend API ni Render-ga joylash (Disk ulab)
- Yuqoridagi Render ko'rsatmalari bo'yicha **Web Service** yarating.
- Web Service yaratilgach, sizga backend API manzili beriladi (masalan: `https://ayperi-backend.onrender.com`).

### 2-qadam: Frontendni Netlify yoki Vercel-ga joylash
- Yangi sayt yarating va GitHub repo-ni tanlang.
- **Build settings**:
  - **Build Command**: `npm run build`
  - **Publish directory**: `frontend/dist`
- **Environment Variables**:
  - `VITE_API_URL` o'zgaruvchisini yarating va qiymatiga Render-dagi backend manzilingizni yozing: `https://ayperi-backend.onrender.com`

> [!TIP]
> Netlify yoki Vercel loyihani kompilyatsiya qilayotganda `VITE_API_URL` o'zgaruvchisini kod ichiga joylaydi. Biz `main.jsx` da yozgan fetch interceptorimiz ushbu URL orqali so'rovlarni avtomatik tarzda backend serverga yo'naltiradi.

---

## 🎯 Variant D: Ubuntu VPS da PM2 va Nginx yordamida joylashtirish

Agar shaxsiy VPS (Virtual Private Server) sotib olgan bo'lsangiz (masalan, DigitalOcean, Hetzner, VDS.uz va h.k.).

### 1-qadam: Serverni tayyorlash
Serverga ulanib, Node.js va Git-ni o'rnating:
```bash
sudo apt update
sudo apt install -y nodejs npm git nginx
sudo npm install -y -g pm2
```

### 2-qadam: Loyihani serverga yuklash va sozlash
```bash
cd /var/www
git clone <Sizning_Repo_Link>.git ayperi
cd ayperi

# Barcha dependencies yuklanadi (postinstall orqali frontendniki ham)
npm install

# Frontendni production versiyaga build qilish
npm run build
```

### 3-qadam: PM2 orqali backendni fonda ishga tushirish
```bash
# SQLite faylini maxsus joyda saqlash
mkdir -p /var/www/ayperi/data
export DATABASE_PATH=/var/www/ayperi/data/database.sqlite

# PM2 da serverni boshlash
DATABASE_PATH=/var/www/ayperi/data/database.sqlite pm2 start server.js --name "ayperi-app"

# Server o'chib yonganda avtomatik qayta yonish sozlamasi
pm2 save
pm2 startup
```

### 4-qadam: Nginx Proxy-ni sozlash
Nginx configuration faylini oching:
```bash
sudo nano /etc/nginx/sites-available/default
```

Fayl ichini quyidagicha o'zgartiring:
```nginx
server {
    listen 80;
    server_name sizning_domen.uz www.sizning_domen.uz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Sozlamalarni tekshirib, Nginx-ni qayta yuklang:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 5-qadam: SSL (HTTPS) sertifikatini o'rnatish
```bash
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d sizning_domen.uz -d www.sizning_domen.uz
```

---

## 🔍 Deploydan keyin tekshirilishi kerak bo'lgan muhim jihatlar
1. Saytga kirib, **"Байланышуу" (Contact)** formasi orqali test xabar yuborib ko'ring.
2. Admin panelga kirib (default parol: `ayperi2026`), test xabar Inbox bo'limiga tushganini tekshiring.
3. Sozlamalar ("Жөндөөлөр") bo'limidan Telegram Bot Token va Chat ID larni kiriting va **"Ботту текшерүү"** tugmasi orqali Telegram bot xabar yuborishini tekshiring.
