# HireLink
**AI-Powered Job Portal**

HireLink is a full-stack job portal that securely connects candidates and recruiters. It features AI-powered resume analysis, smart job recommendations, and AI-generated recruitment emails, while ensuring platform trust through admin-validated recruiter accounts. Candidates can apply for jobs and optimize their resumes, recruiters can manage job offers and applications, and admins verify recruiter identities to maintain credibility.
---

## 🤖 AI Features (Core Focus)

### Candidate AI
- **ATS Resume Analysis**
  - Resume scoring based on ATS compatibility
  - AI suggestions to improve resume quality
- **AI Job Recommendations**
  - Personalized job suggestions based on candidate skills and profile

### Recruiter AI
- **AI-Generated Emails**
  - Automatically generate emails for:
    - Acceptance
    - Rejection
    - Interview invitations
  - Emails can be regenerated and sent directly to candidates

---

## 🛠️ Tech Stack
- **Frontend**: Next.js  
- **Backend**: Django (Python)  
- **Database**: MySQL  
- **AI**: Generative AI (OpenRouter API)

---

## ▶️ Run the Project

### Backend (Django)
cd HireLink/Hirelink_backend
python manage.py runserver

### Frontend (Next.js)
cd HireLink/hirelink-frontend
npm install
npm run dev

### 🔐 Environment Variables

HireLink/Hirelink_backend/.env
OPENROUTER_API_KEY=your_openrouter_api_key_here

HireLink/hirelink-frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
