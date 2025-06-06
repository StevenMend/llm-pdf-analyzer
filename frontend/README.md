# Frontend: Interactive Query Interface

# Frontend application for a fullstack solution that allows users to upload PDF documents and interactively query their content using AI. The interface is modern, responsive, and optimized for mobile devices.

# Technologies Used
Next.js 15
React 19 + TypeScript
TailwindCSS
Radix UI & shadcn/ui
Lucide Icons
Real-time streaming from a FastAPI backend
Key Features
Efficient Backend Integration
Seamless connection to the FastAPI backend using useStreamingChat.ts with Server-Sent Events (SSE).
Context-Aware Chat per Document
Document-specific contextual conversations with support for multiple sessions (conversationId), preserving document state across interactions.
Smart PDF Upload Handling
Integrated PDFUploader component with validation, progress animations, and complete state management.
Natural, Real-Time Responses
Smooth, progressive rendering of AI-generated answers for a conversational user experience.
Responsive and Usability-Focused Design
Clean, accessible, and mobile-first UI built with TailwindCSS, Radix UI, and shadcn/ui components.
Robust Conversation State Management
Dynamic chat session handling, conversation resets, and animated rendering of messages and UI elements.

# Development Commands
# Install dependencies
npm install

# START COMMAND 
npm run dev


## Project Structurefrontend/
├── app/               # Next.js app directory
├── components/        # UI components
├── hooks/             # Custom hooks like useStreamingChat.ts
├── services/          # API communication layer
├── styles/            # Global CSS with Tailwind
└── types/             # Shared TypeScript types