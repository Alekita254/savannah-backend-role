#!/bin/bash

# Change to the backend directory
cd /opt/lampp/htdocs/tests/authentication/GoogleLoginDjangoReact/backend/

echo "Running tests for low-coverage areas..."
echo "Focusing on: myuser/views.py, products/views.py, myuser/utils.py, products/notifications.py"

# Run tests with focus on low-coverage files
python -m pytest --cov=myuser --cov=products --cov=core --cov-report=term-missing \
    -k "test_view or test_util or test_notification or view or util or notification" \
    core/ $@

echo "Low-coverage areas test completed!"
