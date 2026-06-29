# Component Architecture: Next.js + React

A modular representation of the Lumina React application components.

---

## 1. Component Tree
```
├── AppLayout (Navbar, Sticky Footer, Cart Drawer, Sommelier Drawer)
│   ├── Hero (ReservationWidget)
│   │   └── DatePicker / GuestDropdown
│   │
│   ├── VibeSelector (Dial, DialCenter, MoodOption)
│   │
│   ├── MenuSection (CategoryTabs, MenuGrid)
│   │   └── MenuCard (CustomizeModal, CartCTA)
│   │
│   ├── SeatingSection (InteractiveSeatMap, BookingForm)
│   │
│   ├── SourcingTimeline (IngredientCard, SourceDetails)
│   │
│   └── AdminOpsHub (SalesChart, CRMList, WaitlistBoard, SupplyTracker)
```

---

## 2. Shared State Management (React Context)
* **`CartContext`**: Manages active basket items, quantities, and price calculations.
* **`VibeContext`**: Tracks active vibe selection, dynamically updating document variables and theme aesthetics.
* **`AuthContext`**: Handles Firebase user authentication credentials and login modal states.

---

## 3. Performance Optimizations
* **Next.js Image Optimizer**: Lazy-loading and converting all photos to WebP format.
* **Framer Motion Variants**: Utilizing GPU-accelerated transforms (`y`, `opacity`, `scale`) to prevent layout thrashing.
* **React Virtualized Lists**: Dynamic menu rendering for high-performance category switching.
