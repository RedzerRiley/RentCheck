# 📦 RentCheck

> **Software Engineering 1 — Final Project**

A full-stack rental management web application that allows users to browse and rent items easily, while giving rental store owners and staff full control over inventory, rentals, and user management — all in one platform.

---

## 🧾 Overview

RentCheck is a modern rental management system built to bridge the gap between rental businesses and their customers. Customers can browse available items, submit rental requests, and track their active rentals. Owners and staff can manage the entire catalog, monitor all rentals in real time, approve or reject requests, and control user access through a role-based permission system.

The platform was designed with simplicity and reliability in mind — from a clean, responsive UI to a secure Firebase backend that keeps everything in sync in real time.

---

## ✨ Features

### For Customers (Users)
- 🔍 **Browse Item Catalog** — View all available rental items with photos, descriptions, and availability status
- 📋 **Submit Rental Requests** — Request to rent any item directly from the catalog
- 📦 **My Rentals** — Track all active and past rentals in a personal dashboard
- 👤 **User Profile** — Manage personal information including name, phone number, and address
- 🔐 **Authentication** — Register and sign in via Email/Password or Google OAuth
- ⏳ **Pending Verification** — New accounts are reviewed and approved by admin/staff before gaining full access

### For Admins & Staff
- 🗂️ **Item Catalog Management** — Add, edit, and remove rental items from the catalog
- 📊 **Rental Tracker** — Full overview of all active rentals across all users, with the ability to update rental statuses
- 👥 **Users Dashboard** — View all registered users, their contact details, verification status, and roles
- ✅ **User Verification** — Approve or revoke access for pending users
- 🛡️ **Role Management** *(Admin only)* — Promote verified users to Staff or demote Staff back to User

### Security & Access Control
- 🔒 **Role-Based Access Control (RBAC)** — Three tiers: `user`, `staff`, and `admin`
- 🚫 **Unverified user gating** — Unverified accounts are blocked from the catalog until approved
- 🔑 **Firebase Security Rules** — All Firestore operations are enforced server-side, preventing unauthorized reads or writes
- 🌐 **Environment variable protection** — All Firebase credentials are stored in `.env` and never committed to the repository

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS + inline styles |
| **UI Components** | shadcn/ui, Lucide React icons |
| **Authentication** | Firebase Auth (Email/Password + Google OAuth) |
| **Database** | Cloud Firestore (real-time NoSQL) |
| **File Storage** | Firebase Storage (profile pictures, item images) |
| **Hosting** | Firebase Hosting |
| **CI/CD** | GitHub Actions (automated build & deploy on push to `main`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Firebase project with **Authentication**, **Firestore**, **Storage**, and **Hosting** enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/RedzerRiley/RentCheck.git
cd RentCheck

# 2. Install dependencies
npm install

# 3. Set up environment variables
get it from your firebase console. 

# Fill in your Firebase config values in .env

# 4. Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root with the following values from your Firebase project settings:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready for deployment to Firebase Hosting.

---

## 🔄 CI/CD Pipeline

RentCheck uses **GitHub Actions** for automated deployment. Every push to the `main` branch triggers the following pipeline:

1. Checkout the repository
2. Set up Node.js 20
3. Run `npm ci` to install dependencies
4. Inject Firebase environment variables from GitHub Secrets
5. Run `npm run build` to compile the Vite app
6. Deploy the `dist/` folder to **Firebase Hosting** (live channel)

Pull requests get a **preview channel deployment** with a temporary URL, allowing changes to be reviewed before merging.

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| `user` | Browse catalog, submit rental requests, view own rentals, manage profile |
| `staff` | All user permissions + manage catalog, view all rentals, verify/unverify users |
| `admin` | All staff permissions + promote users to staff, demote staff to user |

> **Note:** Admin roles can only be assigned directly in the Firebase Console. All other role changes are managed through the Users Dashboard inside the application.

---

## 🔐 Firebase Security Rules

The application enforces the following Firestore security rules:

- **Users collection** — Users can read/write their own document. Admins and staff can read/write all user documents.
- **Items collection** — All authenticated users can read. Only admins and staff can create or delete items. All authenticated users can update (for rental status changes).
- **Rentals collection** — Users can read/write their own rentals. Admins and staff can read/write all rentals.

---

## 🌐 Live Demo

The application is deployed and accessible at:

```
https://rentcheck-6a7ec.web.app/
```

---

## 🤝 Contributors

This project was developed as a **Software Engineering 1** course requirement.

| Name | Role |
|---|---|
| **Redzer Riley M. Monsod** | Fullstack Developer |
| **Daniel Ivan V. Nombrado** | Frontend Developer |
| **Angel Leigh I. Columna** | Admin & Owner of Rental Business |

---

## 📄 License

This project was created for academic purposes as part of a Software Engineering 1 course requirement. All rights reserved by the contributors.

---

