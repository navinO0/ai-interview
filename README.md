# AI Interview Coach - Frontend

A modern, responsive dashboard for candidates to practice interviews, build learning paths, and analyze their performance.

## 🚀 Tech Stack & Rationale

| Technology | Role | Why? |
| :--- | :--- | :--- |
| **Next.js 14 (App Router)** | Framework | Server-side rendering (SSR), optimized routing, and great developer experience. |
| **React** | UI Library | Component-based architecture for reusable UI elements (Buttons, Modals, Cards). |
| **Tailwind CSS** | Styling | Utility-first CSS for rapid, responsive design without writing custom CSS files. |
| **Framer Motion** | Animations | Smooth, professional transitions and micro-interactions that make the app feel premium. |
| **Axios** | API Calls | Robust HTTP client with interceptors for handling auth globally. |
| **Monaco Editor** | Code Execution | The same engine powering VS Code, giving users a familiar coding environment. |
| **Recharts** | Analytics | Simple and beautiful charting library for visualizing interview scores. |

---

## 🎨 UI/UX Philosophy

### 1. The "Flow State" Layout
We use a persistent sidebar and breadcrumb navigation to ensure the user always knows where they are in their learning journey.

### 2. Dashboards as Data Narratives
The dashboard doesn't just show numbers; it uses `Recharts` to show **trends**. This helps users visualize their progress over time, which is a key psychological motivator.

### 3. Responsive by Design
Using Tailwind's breakpoint system (`md:`, `lg:`), the app adapts from a desktop monitor to a tablet seamlessly.

---

## 🏗️ Key Logic & Components

### A. Real-time AI Chat Component
**Logic**: 
- Uses an optimistic UI pattern: when a user sends a message, it appears instantly in the list before the server responds.
- Handles partial AI responses (Streaming support can be added in the future).

### B. Dynamic Roadmap Renderer
**Logic**:
- Fetches a JSON structure from the backend.
- Recursively renders nodes and connects them with lines (SVG or CSS borders).
- Each node tracks "Completion Status" via local storage or backend sync.

---

## 🧠 Interview Prep Highlights (Frontend Role)

### 1. State Management
We minimize global state by using **Server Components** for data fetching and **React Hooks** (`useState`, `useEffect`) for local interactivity. This reduces re-renders and improves performance.

### 2. Performance Optimization
- **Image Optimization**: Using `next/image` for automatic resizing.
- **Code Splitting**: Next.js automatically splits code by route, so users only download the JS they need for the current page.

---

## 🔮 Future Frontend Improvements
- [ ] **Dark Mode**: Implement a toggle using `next-themes`.
- [ ] **Voice Recognition**: Integrate Web Speech API for voice-driven mock interviews.
- [ ] **Collaborative Coding**: Use Yjs or Socket.io to allow peer-to-peer practice.
- [ ] **PWA Support**: Allow users to install the app on their home screen.

---

## ⚙️ Example `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
# Optional: Analytics and Monitoring keys
```
