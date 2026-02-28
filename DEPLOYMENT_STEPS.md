# خطوات رفع الـ Backend على Vercel وتوصيله بالـ Frontend

لقد قمت بتجهيز ملفات المشروع للرفع. اتبع الخطوات التالية لإتمام العملية:

## 1. رفع الكود على GitHub
إذا لم يكن الكود مرفوعاً بالفعل، قم برفع مجلد الـ `backend` (هذا المجلد) على مستودع (Repository) جديد في GitHub.

## 2. إنشاء مشروع جديد في Vercel
1. افتح [Vercel Dashboard](https://vercel.com/dashboard).
2. اضغط على **"Add New"** ثم **"Project"**.
3. قم بعمل **Import** للمستودع الخاص بالـ Backend.

## 3. إعداد المتغيرات البيئية (Environment Variables)
في إعدادات المشروع على Vercel، اذهب إلى **Settings > Environment Variables** وأضف القيم التالية:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://adminsara:adminsara@cluster0.aqhjfqt.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `esdaly_super_secret_jwt_key_2024` (يفضل تغييره لسلسلة عشوائية) |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | `https://esdaly-frontend.vercel.app/` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

## 4. إعدادات MongoDB Atlas
تأكد من أن الـ Database الخاصة بك تسمح بالاتصال من Vercel:
1. في MongoDB Atlas، اذهب إلى **Network Access**.
2. تأكد من وجود العنوان `0.0.0.0/0` (Allow Access from Anywhere).

## 5. ربط الفرونت بالباك (خطوة هامة جداً)
بعد نجاح رفع الـ Backend، سيعطيك Vercel رابطاً (مثلاً: `https://esdaly-backend.vercel.app`).
يجب عليك الذهاب إلى إعدادات مشروع الـ **Frontend** في Vercel وإضافة/تحديث الرابط:

1. اذهب لـ Dashboard الـ Frontend.
2. اذهب لـ **Settings > Environment Variables**.
3. ابحث عن متغير باسم `REACT_APP_API_URL` أو `NEXT_PUBLIC_API_URL` وقم بتحديث قيمته برابط الـ Backend الجديد متبوعاً بـ `/api`.
   * مثال: `https://esdaly-backend.vercel.app/api`
4. قم بعمل **Redeploy** للفرونت لتفعيل التغيير.

---
**بالتوفيق في مشروع ESDALY!**
