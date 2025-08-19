# Savannah-Backend-Role

A full-stack web application built with **Django** (backend) and **React** (frontend), featuring Google authentication.

##  Features
- User authentication via **Google Sign-In**
- Clear separation between backend and frontend codebases
- Unit testing with coverage (pytest + pytest-cov)
- CI/CD workflows using GitHub Actions + containerization (Docker, Kubernetes)


##  Tech Stack
| Layer       | Technology        |
|-------------|-------------------|
| Backend     | Python, Django, Django REST Framework |
| Frontend    | JavaScript / React |
| Authentication | OAuth2 / Google Sign-In |
| CI/CD       | GitHub Actions, Docker, Kubernetes |
| Testing     | pytest, pytest-cov (backend); |
| DB          | PostgreSQL (local / container) |
| Cache       | Redis |

##  Local Setup (Development)

### Prerequisites
- Python 3.10+
- Node.js & npm (or yarn)
- Docker & Docker Compose (if using containers)
- Google OAuth credentials (client ID & secret)

### Backend Setup
1. Clone the repo  
   ```bash
   git clone https://github.com/Alekita254/savannah-backend-role.git
   cd savannah-backend-role/backend

1. Install dependencies:
    
    ```bash
    pip install -r requirements.txt
    
    ```
    
2. Configure environment variables (e.g., using `.env`):
    
    ```
    DEBUG=True
    DATABASE_URL=postgres://localhost:5432/savannah
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    
    ```
    
3. Run database migrations:
    
    ```bash
    python manage.py migrate
    
    ```
    
4. Start backend:
    
    ```bash
    python manage.py runserver
    
    ```
    

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev

```

Navigate to `http://localhost:5173/` (or as configured) to access the UI.

## Testing

### Backend

```bash
cd backend
pytest --cov=. --cov-report=html

```


### Frontend

```bash
cd frontend
npm test  # runs Vitest / Jest with coverage

```

## CI / CD (GitHub Actions)

Workflow file located at `.github/workflows/ci-cd.yml`:

- Runs tests and collects coverage (backend & frontend)
- Builds Docker image and pushes to GitHub Container Registry
- Deploys to Kubernetes cluster (with `kubeconfig` set via secrets)

## Environment Variables and Secrets

Set the following as GitHub repository secrets:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PROD_KUBE_CONFIG`
