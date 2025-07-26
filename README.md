# ✨ LoveSlide

> A modern, eye-catching, and intuitive presentation platform for creating and sharing beautiful slides without the need for heavy desktop software.

LoveSlide is a web-based presentation application built with **React.js**, designed to help users quickly create, edit, and share presentations with a focus on UI/UX and accessibility. The system emphasizes a smooth user experience and visually appealing design.

## 🎨 Features

### UI/UX Design
- **Modern Interface** – Clean, intuitive, and visually engaging layout
- **Responsive Design** – Fully adapts to both desktop and mobile devices
- **Animated Interactions** – Smooth transitions and interactive modals
- **Accessibility** – Focus on accessible design and usability

### Core Features

#### Authentication
- **User Registration & Login** – Secure account creation and login
- **Dashboard Access** – Enter the dashboard after login, return to landing page after logout

#### Presentation Management
- **Create Presentations** – Add new presentations with title, description, and thumbnail
- **Card Layout** – All presentations displayed as adaptive cards for easy browsing

#### Slide Editing
- **Edit Slides** – Click a card to enter the editor
  - Return to dashboard
  - Delete entire presentation
  - Edit presentation name and thumbnail
  - Add/delete slides, navigate with arrow keys
  - Display current slide number

#### Slide Element Editing
- **Add Elements** – Each slide supports adding the following elements via modal dialogs:
  1. **Text**: Size, color, content
  2. **Image**: Thumbnail size, URL/local file, alt text
  3. **Video**: YouTube URL, autoplay option
  4. **Code Block**: Code content, font size, auto language detection (C, Python, JS)
- **Edit/Delete** – Double-click to edit, right-click to delete elements

#### Advanced Editing Features
- **Global Font Selection** – Choose from at least 3 fonts
- **Background Selector** – Solid color, gradient, or image backgrounds
- **Preview Mode** – Preview presentation with key controls
- **URL Slide Sync** – URL reflects current slide, refresh-safe
- **Drag & Resize** – Elements can be dragged and resized with boundary snapping
- **Slide Reordering** – Drag to rearrange slides
- **Version History** – Restore previous versions of presentations

### Test Coverage
- **UI Testing** – Vitest + Cypress for interface and interaction testing
- **End-to-End Testing** – Full user flow and presentation editing tests

## 🛠️ Tech Stack

### Frontend Technologies
```
React.js
Material UI / Custom CSS
Cypress
Vitest
```

### Backend Technologies
```
RESTful API
Node.js
```

## 🔗 Demo URL：
[https://www.slide-web-frontend.vercel.app](https://www.slide-web-frontend.vercel.app)
