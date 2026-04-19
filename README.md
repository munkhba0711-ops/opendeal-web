# Frontend Setup Guide

## React Frontend Суулгах

### 1. Шаардлагатай
- Node.js 16+
- npm

### 2. Суулгалт алхамууд

```bash
# Frontend folder рүү орго
cd frontend

# npm зависимость суулгах
npm install

# React development сервер ажилуулах
npm start
```

Сервер `http://localhost:3000` дээр ажиллана.

### 3. Environment Variables

`.env` файл үүсгэх (опционал):
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Build үйлдэл

Production build үүсгэх:
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── components/         # Reusable компонентүүд
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ProductCard.jsx
│   ├── pages/             # Page компонентүүд
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── CartPage.jsx
│   │   └── OrdersPage.jsx
│   ├── services/          # API болон state management
│   │   ├── api.js         # Axios API instance
│   │   └── store.js       # Zustand cart store
│   ├── App.jsx            # Root компонент
│   ├── App.css
│   ├── index.js           # Entry point
│   └── index.css          # TailwindStyles
├── package.json
└── .gitignore
```

## Components Overview

### Header
- Navigation меню
- Сайтын лого

### ProductCard
- Бүтээгдэхүүний информация
- "Сагсанд нэмэх" товчлуур
- Stock статус дэлгэцлэх

### HomePage
- Тавтай морилгалын салбар
- Үйлчилгээний давуу тал болон сайжруулалт
- Links харуулах

### ProductsPage
- Бүтээгдэхүүнийн жагсаалт
- Search функцээ
- Pagination

### CartPage
- Сагсан дахь бүтээгдэхүүнүүдийг харуулах
- Quantity өөрчлөх
- Item устгах
- Total үнэ

### OrdersPage
- Өмнөх захиалгууд жагсаах
- Order статус харуулах
- Захиалгын дэлгэрэнгэй

## Libraries

- **React Router** - Салаалалт
- **Axios** - HTTP клиент
- **Zustand** - State Management
- **Tailwind CSS** - Стилизацион
- **React Hot Toast** - Нотификацион

## Features

✅ Responsive Design  
✅ API Integration  
✅ Cart Management  
✅ Search Functionality  
✅ Toast Notifications  
✅ Mongolian UI  

## Commands

```bash
# Development сервер эхлүүлэх
npm start

# Production build үүсгэх
npm run build

# Test ажиллуулах
npm test

# ESLint ажиллуулах
npm run lint
```

## Troubleshooting

### CORS Error
Backend CORS-г идэвхүүлсэн эсэхийг шалгах. Frontend .env дээр зөв API URL эсэхийг шалгах.

### API Connection Error
- Backend сервер ажиллаж байгаа эсэхийг шалгах (`http://localhost:8000`)
- API URL .env файлд зөв байгаа эсэхийг шалгак

### Module Not Found
```bash
npm install
```

## Development Tips

1. React Developer Tools browser extension суулгах
2. Redux DevTools суулгах (state debugging)
3. Prettier formatter суулгах
4. ESLint extension суулгах
