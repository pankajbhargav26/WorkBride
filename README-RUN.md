# WorkBridge - kaise chalayein

Do terminals chahiye (Backend + Frontend). Node.js 20+ install hona chahiye.

## 1. Backend
    cd BackEnd
    copy .env.example .env      (Mac/Linux: cp .env.example .env)
    -> .env kholo aur MONGO_URI + JWT_SECRET bharo
    npm install
    npm run dev                 (ya: npm start)
"MongoDB connected successfully!" dikhna chahiye. Server: http://localhost:5000

## 2. Frontend
    cd FrontEnd/workbridge
    copy .env.example .env
    npm install
    npm run dev
Browser me http://localhost:5173 kholo.

## 3. Test karne ka tarika
1. Customer account banao -> Post a job.
2. Technician account banao (service category wahi chuno) -> Accept Job.
3. Technician: job details -> visiting charge + inspection details -> Visited.
4. Technician: repair estimate -> Estimate Given.
5. Customer: My Jobs -> Approve Repair  (ya Don't Repair).
6. Technician: completion photo upload -> Completed.
   (Ya Estimate Given pe "Customer Did Not Proceed" -> Repair Not Proceeded.)
7. Customer: star rating + feedback.

## 4. Backend symptom diagnosis
`Post a Job` page par form se pehle diagnosis chatbot kholkar problem describe karein. Follow-up answer ke baad recommended service, job title aur description form mein prefill honge; post karne se pehle unhe review/edit kar sakte hain.

API ko conversation history ke saath directly bhi call kar sakte hain:

    POST http://localhost:5000/api/diagnosis
    Content-Type: application/json

    {
      "messages": [
        { "role": "user", "content": "Mere ghar ka fan nahi chal raha" }
      ]
    }

Response me `reply` agla sawal deta hai. Har turn par poori conversation ko `messages` me bhejein. Fan wale example me `haan, lekin fan rotate nahi ho raha` ke baad response possible capacitor/motor issue aur `recommendedService: "Electrical"` dega. Yeh local guided rules use karta hai; kisi external AI API key ki zaroorat nahi hai.
