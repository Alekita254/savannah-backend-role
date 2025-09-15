#!/bin/bash

# Change to the backend directory
cd /opt/lampp/htdocs/tests/authentication/GoogleLoginDjangoReact/backend/

if [ -f ".coverage" ]; then
    echo "Generating coverage report from existing data..."
    coverage report
    echo ""
    echo "To generate HTML report: coverage html"
    echo "Then open htmlcov/index.html in your browser"
else
    echo "No coverage data found. Run tests first with: ./run_tests.sh"
    exit 1
fi
