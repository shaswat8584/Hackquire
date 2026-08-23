# 🤖 Standalone Gemini AI FAQ & Support Assistant API

A standalone, decoupled, and reusable **AI FAQ & Support Assistant** microservice powered by the **Google Gemini API**.

The service provides real-time, grounded answers to product questions using a configurable knowledge base without hallucination or leakage of internal system instructions.

---

## 🏗 System Architecture

```text
                    AI ASSISTANT MODULE (ai-assistant/)
                                     |
                +--------------------+--------------------+
                |                                         |
     AI Assistant Client (Port 5174)           AI Assistant Server (Port 5001)
     (Standalone React + Vite + Tailwind)      (Express REST API + Gemini SDK)
                                                          |
                                                          v
                                                  Google Gemini API

                                   ▲
                                   │ HTTP POST /api/chat
                                   │
              +--------------------+--------------------+
              |                                         |
     SkillBridge Platform                      University / EdTech Portal
     (http://localhost:5173)                   (External 3rd-Party App)
```

---

## 🚀 Quick Start

### 1. Start the AI Assistant Backend (Port 5001)
```bash
cd ai-assistant/server
npm install
node server.js
```

### 2. Start the Standalone AI Assistant Showcase Frontend (Port 5174)
```bash
cd ai-assistant/client
npm install
npm run dev -- --port 5174
```

---

## 📡 REST API Reference

### 1. Health Check
`GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "service": "AI Assistant",
  "port": 5001,
  "timestamp": "2026-08-21T16:56:35.691Z"
}
```

### 2. Chat Endpoint
`POST /api/chat`

**Headers:**
`Content-Type: application/json`

**Request Body (SkillBridge default):**
```json
{
  "message": "How do I create a team?"
}
```

**Request Body (University / Third-Party):**
```json
{
  "portalType": "university",
  "message": "What are the scholarship application deadlines?"
}
```

**Successful Response:**
```json
{
  "success": true,
  "answer": "Go to the TeamForge tab from the sidebar, click 'Create Project Team', specify your team name, description, required role slots, and your designated role.",
  "product": "SkillBridge"
}
```

**Invalid Request Response:**
```json
{
  "success": false,
  "error": "Message is required and must be a string."
}
```

---

## 🔌 Third-Party Integration Examples

Any external web application, university portal, or EdTech system can consume the assistant API without needing access to the Gemini API key.

### JavaScript (fetch)
```javascript
const askAssistant = async (question) => {
  const response = await fetch('http://localhost:5001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: question,
      portalType: 'university' // Or your custom product identifier
    })
  });

  const data = await response.json();
  console.log('AI Answer:', data.answer);
};
```

### cURL
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How does SkillMatch calculate compatibility?"}'
```

---

## ⚙️ Customizing the Knowledge Base

To adapt the assistant to a new company or university, modify or add a knowledge base object in `server/data/knowledgeBase.js`:

```javascript
const customKnowledgeBase = {
  productName: "Acme EdTech",
  description: "Online learning platform for software engineering.",
  modules: [
    { name: "Live Bootcamps", description: "Interactive 12-week coding bootcamps." }
  ],
  faqs: [
    { question: "How do I enroll?", answer: "Click 'Enroll Now' on any course page." }
  ]
};
```

The `geminiService.js` automatically grounds system prompts using the configured knowledge base.

---

## 🛡️ Security Best Practices
- **Zero Client-Side Exposure**: `GEMINI_API_KEY` is loaded strictly on the Node.js backend.
- **Input Sanitization**: Length limits (1000 chars) and strict validation.
- **Error Guardrails**: Internal stack traces and prompts are never leaked in error responses.
