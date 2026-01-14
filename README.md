# 🌊 Safe To Manu

> Real-time water safety conditions for Tauranga's swimming spots

<!-- [![License](https://img.shields.io/badge/license-MIT-blue.svg)]() -->
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)]()

---

## 📖 Overview

The Manu Meter is a proof of concept for a community enagagment project situated at the Tauranga Wharf. This project was a part of a University of Waikato Summer Research scholarship in association with the Tauranga City Council. This project is comprised of two major parts, the dashboard written by Blake Smith, and the scoring system created by Jack Unsworth. 

---

## ✨ Features

- 🎥 **Instant Replay** - Instant replay feed for most recent manu
- 📊 **Splash Leaderboard** - Track the highest scoring manus of the day
- 🌡️ **Water Temperature** - Real-time water temp readings from the port
- 🌊 **Tide Height** - Current tide conditions from local sensors
- 💨 **Wind Speed** - Wind conditions for safe swimming from metservice API
- ☀️ **UV Index** - Sun safety information estimated by LAWA calculations
- 🧪 **Water Quality** - Regional council water quality data

---

## 🏗️ Architecture

```
├── frontend/          # React + Vite frontend
├── backend/           # Python FastAPI backend
├── splashScoring/     # ML-based splash detection and scoring service
└── scripts/           # Utility scripts
```

---

## 🚀 Getting Started   
Sam installation:

### Prerequisites

- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.12 (for local backend development and ml)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/SafeToManu.git
cd SafeToManu

# Copy environment template and fill in details
cp template.env .env

#Install sam files
cd splashScoring
git clone https://github.com/facebookresearch/sam2.git && mv sam2 samfiles && cd samfiles

pip install -e .

#if your having trouble with space use 
#pip install -e . --no-build-isolation

#Download checkpoint
cd checkpoints
https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt


# Start all services
cd ../../../
make build
```

---

## 🛠️ Development

### Running Locally

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Or for both combined
make run
```

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make build` | Rebuild containers |

---

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/...` | TODO: Document endpoints |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

Proudly supported by:

- **Tauranga City Council**
- **University of Waikato**
- **Bay of Plenty Regional Council**

---
