# Project Title

## Overview
This project consists of three main components: **AI Engine**, **Backend**, and **Frontend**. Each component serves a specific purpose and is designed to work together seamlessly, providing a robust solution for AI-driven applications.

## Components

### AI Engine
- **Description**: Responsible for processing and analyzing data using machine learning algorithms.
- **Key Features**: Data ingestion, model training, and inference.
- **Technologies**: Python, Uvicorn, FastAPI.

### Backend
- **Description**: Handles authentication, database interactions, and serves APIs for the frontend.
- **Key Features**: User authentication, CRUD operations, and file uploads.
- **Technologies**: Node.js, Express, MongoDB.

### Frontend
- **Description**: Provides the user interface and user experience of the application.
- **Key Features**: Responsive design, API integration, and user interaction.
- **Technologies**: React, Vite.

## Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Project
   ```
2. For each component, follow the respective setup instructions in their README files.

## Running the Application
- **AI Engine**:
  ```bash
  cd ai-engine
  uvicorn app.main:app --reload
  ```
- **Backend**:
  ```bash
  cd backend
  npm start
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm start
  ```
- To run the AI Engine:
  ```bash
  cd ai-engine
  venv\Scripts\activate  # Activate the virtual environment
  uvicorn app.main:app --reload
  ```
- To run the Backend:
  ```bash
  cd backend
  npm start
  ```
- To run the Frontend:
  ```bash
  cd frontend
  npm start
  ```
- To run the AI Engine:
  ```bash
  cd ai-engine
  python app/main.py
  ```
- To run the Backend:
  ```bash
  cd backend
  npm start
  ```
- To run the Frontend:
  ```bash
  cd frontend
  npm start
  ```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
This project is licensed under the MIT License.
