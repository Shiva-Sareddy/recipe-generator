# 🧑‍🍳 Recipe Generator App 🍲

A fun and interactive AI-powered web app that helps you cook with what you have in your kitchen! Just type or upload your ingredients, apply a dietary filter, and let the magic happen.

---

## 🚀 Features

- 👋 Personalized welcome message using your name  
- ✍️ Enter ingredients manually or upload an image of them  
- 🍃 Apply dietary filters (Vegan, Keto, etc.)  
- 🤖 Generate unique recipes using AI  
- 🔁 Regenerate different versions of the recipe  
- 📄 Save recipes as downloadable PDFs  
- 💾 Everything handled on the frontend with `localStorage` (no backend)

---

## 🛠️ Tech Stack

- HTML, CSS, JavaScript  
- AI API (like OpenAI or Gemini via fetch)  
- [Tesseract.js](https://github.com/naptha/tesseract.js) for image-to-text (OCR)  
- [jsPDF](https://github.com/parallax/jsPDF) or [html2pdf.js](https://github.com/eKoopmans/html2pdf) for exporting recipes

---

## 📦 Setup Instructions

1. Clone the repo:
   ```
   git clone https://github.com/your-username/recipe-generator-app.git
   cd recipe-generator-app 
2. Open index.html in your browser.

3. Add your AI API key in the JavaScript file if required.

## 📸 Demo
<img src="assets/recipe-makeNow.jpg" alt="Recipe Generator Demo" width="600" />

## 📌 Notes
All user data (like name and preferences) is stored using localStorage

No backend, no login — just pure frontend fun!

Works great on mobile and desktop

## 🌟 Contributions
Got feature ideas or improvements? Feel free to fork this project and submit a PR!

## 📄 License
This project is open-source and free to use under the MIT License.
