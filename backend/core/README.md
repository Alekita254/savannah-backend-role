# Savannah Backend Role Assignment Task

A robust Django REST Framework backend for Savannah Informatics Backend Developer Mid Level, e-commerce platform, featuring user authentication, product management, order processing, and cart functionality.

## Features

- **User Management**
  - JWT Authentication
  - Customer profiles
  - Admin dashboard
- **Product Catalog**
  - Hierarchical categories (MPTT)
  - Product listings with images
  - Inventory management
- **Order System**
  - Cart functionality
  - Order processing workflow
  - Status tracking (Pending → Confirmed → Shipped → Delivered)
- **API Documentation**
  - Swagger UI
  - ReDoc

## Technologies

- **Backend**: Django 5.0, Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT, OAuth2 (Google)
- **API Docs**: drf-yasg (Swagger/OpenAPI)
- **Other**: MPTT for hierarchical categories, Africa's Talking SMS integration

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL
- Redis (for caching)
- Africa's Talking API credentials (for SMS)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend

2. Create and Activate virtual Environment
   ```bash
    python -m venv venv
    # Linux/Mac:
    source venv/bin/activate
    # Windows:
    venv\Scripts\activate

3. Install dependencies
    ```bash
    pip install -r requirements.txt

4. Set up environment variables 
    ``` bash 
    cp .env.example .env

Then edit .env with your configuration

5. Run Migrations
     ```bash
    python manage.py migrate

6. Create superuser
     ```bash
     python manage.py createsuperuser

### Running the server
1. Run the server    
    ```bash
    python manage.py runserver

2. Testing
    ```
    pytest

3. Test with coverage:
    ```
    pytest --cov=.

### Kubernetes dashboard (Minikube)

1. ``` minikube dashboard ```
2. ``` kubectl logs -f deployment/core ```

### Cleanup
1. ``` docker-compose down -v ```

2. ``` minikube delete ```

``` cd /opt/lampp/htdocs/tests/authentication/GoogleLoginDjangoReact/backend/ ```

then run this command

``` python -m pytest --cov=myuser --cov=products --cov=core --cov-report=term-missing core/ ```



