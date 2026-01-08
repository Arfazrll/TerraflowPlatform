# Terraflow - Frontend

The web interface for Terraflow, built to provide real-time visualization of sensor data and manual control of IoT devices.

## 🛠 Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Visualization**: Three.js (@react-three/fiber) & Recharts
- **Icons**: Lucide React

## ⚙️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in this directory. **You must fill these in** for the app to work:
   ```bash
   # Firebase Configuration (Get these from your Firebase Console)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # API Backend URL
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 📦 Building for Production

To create an optimized production build (standalone mode):
```bash
npm run build
npm start
```
*Note: This is automatically handled if you use the Docker method.*
