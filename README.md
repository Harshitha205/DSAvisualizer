# 🎯 DSA Visualizer Pro

A stunning, interactive **Data Structures & Algorithms Visualizer** built with modern web technologies. Watch algorithms come to life with beautiful 3D animations, get AI-powered explanations, and master DSA concepts through visual learning.

![DSA Visualizer Pro](https://img.shields.io/badge/version-2.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-3D-green)

---

## ✨ Features

### 🎨 **3D Visualization**
- Stunning 3D bar animations using Three.js and React Three Fiber
- Smooth camera controls with OrbitControls (rotate, zoom, pan)
- Real-time visual feedback for comparisons, swaps, and sorted elements
- Clean dark gradient backgrounds with neon glow effects

### 🤖 **AI-Powered Tutor**
- Get instant explanations for any algorithm
- Interactive Q&A about data structures
- Step-by-step learning guidance
- Personalized learning experience

### ⚡ **Sorting Algorithms**
- **Bubble Sort** - O(n²) - Compares adjacent elements
- **Selection Sort** - O(n²) - Finds minimum element
- **Insertion Sort** - O(n²) - Builds sorted array
- **Quick Sort** - O(n log n) - Divide and conquer

### 📦 **Data Structures**
- Arrays - Linear indexed structure
- Linked Lists - Node-based dynamic structure
- Trees - Hierarchical parent-child relationships
- Graphs - Network of connected nodes
- Hash Tables - Key-value O(1) lookup
- Stacks & Queues - LIFO/FIFO ordered processing

### 🎛️ **Interactive Controls**
- Play/Pause/Reset visualization
- Adjustable animation speed (10ms - 1000ms)
- Customizable array size (5 - 50 elements)
- 2D and 3D view modes
- Real-time statistics (comparisons, swaps)

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Smooth animations on all devices
- Glassmorphism UI with neon accents

---

## 🛠️ Tech Stack

### **Frontend Framework**
| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |

### **3D Graphics**
| Technology | Purpose |
|------------|---------|
| [Three.js](https://threejs.org/) | 3D graphics engine |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | Useful helpers for R3F |
| [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | Post-processing effects |

### **Styling & Animation**
| Technology | Purpose |
|------------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | Animation library |
| Custom CSS | Glassmorphism, gradients, glow effects |

### **State Management**
| Technology | Purpose |
|------------|---------|
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| React Hooks | Local component state |

### **UI Components**
| Technology | Purpose |
|------------|---------|
| [Lucide React](https://lucide.dev/) | Beautiful icon library |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives |
| Custom components | Cards, buttons, sliders |

### **Development Tools**
| Technology | Purpose |
|------------|---------|
| ESLint | Code linting |
| PostCSS | CSS processing |
| Turbopack | Fast bundler (dev) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Harshitha205/DSAvisualizer.git
cd DSAvisualizer
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
dsa-visualizer-pro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── visualizer/         # Visualizer page
│   │   ├── ai-tutor/           # AI Tutor page
│   │   ├── api/                # API routes
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── 3d/                 # 3D scene components
│   │   │   ├── ArrayBar.tsx    # Individual 3D bar
│   │   │   └── SortingScene.tsx# Main 3D scene
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── AITutor.tsx         # AI chat interface
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── algorithms/             # Sorting algorithm implementations
│   │   └── sorting.ts          # Bubble, Quick, Selection, Insertion
│   │
│   ├── stores/                 # Zustand state stores
│   │   └── visualizationStore.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAITutor.ts
│   │   └── useAnimationEngine.ts
│   │
│   └── lib/                    # Utility functions
│       ├── utils.ts
│       └── accessibility.tsx
│
├── public/                     # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🎮 Usage

### Selecting an Algorithm
1. Click on **"Algorithms"** dropdown in navbar
2. Choose an algorithm (Bubble, Quick, Selection, Insertion)
3. The visualizer will display the selected algorithm info

### Running Visualization
1. Click **"Start Visualization"** button
2. Watch the bars animate as the algorithm sorts
3. Use **Pause/Resume** to control playback
4. Click **Reset** to start over

### Customizing Settings
- **Array Size**: Adjust slider from 5 to 50 elements
- **Animation Speed**: Control speed from 10ms to 1000ms
- **View Mode**: Toggle between 2D and 3D views

### Camera Controls (3D Mode)
- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag

---

## 🎨 Color Legend

| Color | State |
|-------|-------|
| 🟣 Purple | Default (unsorted) |
| 🟠 Orange | Comparing |
| 🔴 Red/Pink | Swapping |
| 🟢 Green | Sorted |

---

## 📊 Algorithm Complexities

| Algorithm | Time (Best) | Time (Average) | Time (Worst) | Space |
|-----------|-------------|----------------|--------------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |

---

## 🔮 Future Enhancements

- [ ] More sorting algorithms (Merge Sort, Heap Sort, Radix Sort)
- [ ] Graph algorithms (BFS, DFS, Dijkstra)
- [ ] Tree traversals (Inorder, Preorder, Postorder)
- [ ] Pathfinding visualization
- [ ] Code execution playground
- [ ] User authentication & progress tracking
- [ ] Dark/Light theme toggle

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

**Harshitha Kunuguntla**

- GitHub: [@Harshitha205](https://github.com/Harshitha205)
- LinkedIn: [Harshitha Kunuguntla](https://www.linkedin.com/in/harshitha-kunuguntla-113b9829a)

---

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

---

<p align="center">
  Made with ❤️ and ☕ by Harshitha
</p>
