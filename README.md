# ObsidianNet — Professional Networking & Real-Time Communication Platform

ObsidianNet is a full-stack, professional networking web application engineered to mimic modern enterprise communication systems. Built using the **MERN Stack (MongoDB, Express.js, React, Node.js)** and integrated with **Socket.io**, the platform features a highly responsive, real-time message broadcasting framework alongside a customized, WhatsApp-style dynamic inbox management dashboard.

---

## Live Deployment Links

* **Frontend Client:** [https://obsidiannet-platform.vercel.app](https://obsidiannet-platform.vercel.app)
* **Backend Server API:** [https://obsidiannet-backend.onrender.com](https://obsidiannet-backend.onrender.com)

---

## Core Architecture & Features

### 1. Real-Time WhatsApp-Style Messaging Dashboard
* **Dynamic Conversation Aggregation:** Instead of displaying an exhaustive list of all users, the system natively aggregates chat records. It parses the database history to extract unique, recent message threads, ranking them chronologically.
* **Live Preview Analytics:** The message panel dynamically rendering updates to display the absolute latest communication string, matching real-time enterprise layout expectations.
* **State-Aware Sidebar Updates:** Features dynamic component sorting that instantly bubbles the most recent active conversation to the absolute top of the viewport list upon message delivery or receipt.

### 2. State-Driven Notification Subsystem
* **Global Layout Synchronization:** Utilizing a centralized Zustand global state layer paired with Socket.io background workers, the UI updates dynamically across routes when new incoming packet events are intercepted.
* **Contextual Read/Unread Triggers:** System monitors target thread activity. Opening a dedicated message window maps an API `PUT` request to update the database state vector (`isRead: true`), immediately removing local and global notification flags.

### 3. Full Cross-Device & Deployment Compatibility
* **Environment-Aware Network Routing:** Dynamically parses deployment variables using `import.meta.env.MODE` to swap operational execution environments from local configurations (`http://localhost:5000`) to secure cloud networks.
* **Secure Multi-Device Interfacing:** Backend structures implement strict Cross-Origin Resource Sharing (CORS) with state management settings, allowing external validation devices (e.g., smart tablets, smartphones) to concurrently authenticate across separate networks.

---

## 🛠 Tech Stack Breakdown

### Frontend Architecture
* **React (Vite Bootstrapping):** Component-driven view layers optimizing hot module replacements.
* **Tailwind CSS:** Fully tailored UI layout using modern dark-mode aesthetic styling frameworks (`#11131e`, `#161822`).
* **Zustand:** Micro-state controller tracking real-time client active profiles, online presence configurations, and auth token access.
* **Socket.io Client:** Persistent bi-directional WebSocket interface mapping network payloads over events.

### Backend Infrastructure
* **Node.js & Express.js:** Scalable routing framework utilizing robust, modular controllers.
* **MongoDB & Mongoose ODM:** Advanced data layer modeling communication structures through optimized query aggregation pipelines.
* **JSON Web Tokens (JWT):** Cryptographically signed access authentication using HTTP-Only cookies to protect API endpoints against XSS and CSRF anomalies.

---

## 📊 Database Schema Blueprint

The messaging system is structured on a streamlined, relational-state architecture built to quickly index and serve chronological records.

```javascript
{
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}


👥 Team Members

Omm Shree Chinmay Behera (Reg. No: 230301120034)

Tushar Patel (Reg. No: 230301120170)

Rahul Patel (Reg. No: 230301120119)

Thabira Pradhan (Reg. No: 230301120452)

Biswajit Rout (Reg. No: 230301120328)