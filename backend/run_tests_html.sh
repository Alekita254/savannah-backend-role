#!/bin/bash

# Change to the backend directory
cd /opt/lampp/htdocs/tests/authentication/GoogleLoginDjangoReact/backend/

# Run pytest with HTML coverage report
echo "Running tests with HTML coverage report..."
python -m pytest --cov=myuser --cov=products --cov=core --cov-report=html --cov-report=term-missing core/ $@

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 HTML coverage report generated in: htmlcov/"
    echo "Open htmlcov/index.html in your browser to view the report"
else
    echo "❌ Some tests failed!"
    exit 1
fi
