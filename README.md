# Smart Beneficiary Mapping System (SBMS) 🚀

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Microservices-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/AI-Integrated-orange?style=for-the-badge" alt="AI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</div>

---

## 🌍 Mission Statement
SBMS is an intelligent, high-impact platform designed to bridge the gap between government/social welfare schemes and the individuals who need them most. By leveraging Generative AI and a robust rules-based engine, we automate the discovery, eligibility mapping, and grievance handling for millions of beneficiaries.

### *“Empowering citizens through intelligent technology.”*

---

## 🌟 High-Impact Features

### 🤖 1. BENE-Bot: AI Welfare Assistant
An advanced AI companion powered by **Google Gemini**. It provides:
- **Persistent Chat Context:** Remembers user interactions for seamless assistance.
- **Contextual Awareness:** Direct mapping of user queries to specific welfare policies.
- **Natural Language Resolution:** Simplifies complex government jargon for the common citizen.

### 🧠 2. Intelligent Eligibility Mapping
A sophisticated rules engine that analyzes:
- **Demographics:** Age, location, occupational status.
- **Socio-Economic Data:** Income levels, family size, and asset ownership.
- **Real-time Discovery:** Instantly matches profiles against thousands of scheme criteria.

### ⚖️ 3. Smart Grievance Intelligence
Automated handling of citizen complaints using:
- **Sentiment Analysis:** Prioritizes issues based on user emotional tone and urgency.
- **Category Classification:** Automatically routes grievances to the relevant department.
- **Transparent Tracking:** End-to-end lifecycle management of citizen issues.

---

## 🏗️ Technical Architecture

The system utilizes a polyglot microservice architecture designed for scalability and resilience.

```mermaid
graph TD
    User((Citizen / Admin)) -->|React + Vite| Frontend[Frontend Layer]
    Frontend -->|API| Django[Django Backend - Core Engine]
    Frontend -->|API| NodeGate[Node.js - Microservice Gateway]
    
    Django -->|Auth & Data| MySQL[(MySQL - Primary Data)]
    Django -->|Intelligence| Gemini[Google Gemini AI]
    
    NodeGate -->|Business Logic| Mongo[(MongoDB - Session & Logs)]
    
    subgraph Services
        Gemini
        MySQL
        Mongo
    end
```

---

## 🛠️ Modern Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Backends** | ![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) |
| **AI / Data** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white) |

---

## 🚀 Pro Installation Guide

### 1. Clone & Initialize
```bash
git clone https://github.com/navisjoshvadonel/Smart-beneficiary-mappping-system.git
cd Smart-beneficiary-mappping-system
```

### 2. Core Backend (Django)
```bash
cd sbms_project
pip install -r requirements.txt
# Configure .env with DB credentials and GEMINI_API_KEY
python manage.py migrate
python manage.py runserver
```

### 3. Microservice Gateway (Node.js)
```bash
cd ../sbms_nodejs_backend
npm install
# Configure .env with MONGO_URI
npm start
```

### 4. High-Performance Frontend (React)
```bash
cd ../sbms_frontend
npm install
npm run dev
```

---

## 📂 Project Roadmap
- [ ] **Phase 4:** Mobile App implementation (React Native).
- [ ] **Phase 5:** Blockchain integration for transparent fund disbursement.
- [ ] **Phase 6:** Multilingual support for localized schemes.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">Made with ❤️ for social impact.</p>
