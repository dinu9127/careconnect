# CareConnect Frontend

A modern React frontend for the CareConnect healthcare management platform.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── client/        # Client dashboard pages
│   ├── caregiver/     # Caregiver dashboard pages
│   └── admin/         # Admin dashboard pages
├── components/        # Reusable components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── services/          # API services
├── routes/            # Route configuration
└── utils/             # Utility functions
```

## Features

- User authentication (Login/Register)
- Role-based dashboards (Client, Caregiver, Admin)
- Responsive design with TailwindCSS
- API integration with Axios
- Reusable UI components

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
