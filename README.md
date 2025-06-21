# 🔐 Environment Variables Configuration

This document outlines the environment variables used in the **SDPJSS Project**, which includes:

- **Admin Portal**
- **Backend**
- **Frontend**

---

## 📌 Admin Portal

**Deployed Link:** [https://sdpjss-admin.onrender.com](https://sdpjss-admin.onrender.com)

**Default Admin Credentials (for deployed link):**
```env
ADMIN_EMAIL = admin@prasadhub.com
ADMIN_PASSWORD = qwerty123
```

### Environment Variables

```env
VITE_BACKEND_URL=<Backend Server URL>
```

---

## 🧠 Backend

**Deployed Link:** [https://sdpjss.onrender.com](https://sdpjss.onrender.com)

### Environment Variables

```env
MONGODB_URI=<MongoDB Connection URI>
CLOUDINARY_NAME=<Cloudinary Cloud Name>
CLOUDINARY_API_KEY=<Cloudinary API Key>
CLOUDINARY_SECRET_KEY=<Cloudinary Secret Key>

ADMIN_EMAIL=<Default Admin Email>
ADMIN_PASSWORD=<Default Admin Password>
JWT_SECRET=<JWT Secret Key>

RAZORPAY_KEY_ID=<Razorpay Public Key>
RAZORPAY_KEY_SECRET=<Razorpay Secret Key>
CURRENCY=INR

EMAIL_USER=<Email Sender Address>
EMAIL_PASSWORD=<Email Password or App Password>
```

---

## 🌐 Frontend

**Deployed Link:** [https://sdpjss-frontend.onrender.com](https://sdpjss-frontend.onrender.com)

### Environment Variables

```env
VITE_BACKEND_URL=<Backend Server URL>
VITE_RAZORPAY_KEY_ID=<Razorpay Public Key>
```

---

✅ **END**
