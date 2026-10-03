pipeline {

    agent any

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Validation') {
            steps {
                bat '''
                    cd backend
                    python -m py_compile app.py
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                bat '''
                    cd backend
                    python -m pytest
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                bat '''
                    cd frontend
                    npm install
                    npm run build
                '''
            }
        }
    }

    post {

        success {
            echo 'Student Management System CI Pipeline completed successfully.'
        }

        failure {
            echo 'Student Management System CI Pipeline failed.'
        }
    }
}