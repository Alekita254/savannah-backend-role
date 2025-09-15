#!/bin/bash

# Change to the backend directory
cd /opt/lampp/htdocs/tests/authentication/GoogleLoginDjangoReact/backend/

# Run pytest with coverage
echo "Running tests with coverage..."
python -m pytest --cov=myuser --cov=products --cov=core --cov-report=term-missing core/ $@

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
    exit 1
fi
