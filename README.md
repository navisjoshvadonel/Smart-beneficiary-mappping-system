# Smart Beneficiary Mapping System 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent platform designed to bridge the gap between government/social schemes and the individuals who need them most. By analyzing user demographics and socioeconomic data, the system automatically identifies and maps eligible schemes to the right beneficiaries.

## 🌟 Key Features
* **Automated Eligibility Check:** Matches user profiles with a database of available schemes using a robust rules engine.
* **Intelligent BENE-Bot:** AI-powered welfare assistant with persistent chat history and dynamic context mapping.
* **Smart Scheme Recommendations:** Personalized matches based on demographic and socioeconomic data.
* **Grievance Analysis:** Automated sentiment and urgency analysis for citizen complaints.
* **User-Centric Interface:** Futuristic, high-performance UI built with React and Framer Motion.
* **Scalable Architecture:** Django-based backend designed to handle diverse datasets and complex eligibility rules.

## 🛠️ Tech Stack
* **Backend:** Python (Django), MySQL
* **Frontend:** React (Vite), Framer Motion, Tailwind CSS
* **AI Engine:** Google Gemini (Generative AI)
* **Data Handling:** Pandas / Excel Integration

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/navisjoshvadonel/Smart-beneficiary-mappping-system.git
   cd Smart-beneficiary-mappping-system
   ```

2. **Backend Setup:**
   ```bash
   cd sbms_project
   pip install -r requirements.txt
   # Set up your .env file with DB_PASSWORD and GEMINI_API_KEY
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup:**
   ```bash
   cd ../sbms_frontend
   npm install
   npm run dev
   ```

## 🧪 Testing
Run AI service tests:
```bash
cd sbms_project
python manage.py test core.test_ai_services
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
