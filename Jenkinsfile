pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        BACKEND_IMAGE = "137812392325.dkr.ecr.us-east-1.amazonaws.com/readmit-backend:latest"
        MICROSERVICE_IMAGE = "137812392325.dkr.ecr.us-east-1.amazonaws.com/readmit-ml-service:latest"
        FRONTEND_IMAGE = "137812392325.dkr.ecr.us-east-1.amazonaws.com/readmit-frontend:latest"
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Detect Changes') {
            steps {
                script {
                    def changedFiles = sh(script: "git diff --name-only HEAD~1 HEAD || true", returnStdout: true).trim()
                    echo "Changed files:\n${changedFiles}"

                    BUILD_BACKEND = changedFiles.contains("Readmit-Backend/")
                    BUILD_MICROSERVICE = changedFiles.contains("flask-reAdmit-microservice/")
                    BUILD_FRONTEND = changedFiles.contains("ReAdmit-AI/")

                    if (!BUILD_BACKEND && !BUILD_MICROSERVICE && !BUILD_FRONTEND) {
                        error("No relevant changes detected in any service.")
                    }
                }
            }
        }

        stage('Login to ECR') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region $AWS_REGION \
                        | docker login --username AWS --password-stdin 137812392325.dkr.ecr.us-east-1.amazonaws.com
                    """
                }
            }
        }

        stage('Build & Push Backend') {
            when { expression { return BUILD_BACKEND } }
            steps {
                dir('Readmit-Backend') {
                    sh """
                        docker build -t $BACKEND_IMAGE .
                        docker push $BACKEND_IMAGE
                    """
                }
            }
        }

        stage('Build & Push Microservice') {
            when { expression { return BUILD_MICROSERVICE } }
            steps {
                dir('flask-reAdmit-microservice') {
                    sh """
                        docker build -t $MICROSERVICE_IMAGE .
                        docker push $MICROSERVICE_IMAGE
                    """
                }
            }
        }

        stage('Build & Push Frontend') {
            when { expression { return BUILD_FRONTEND } }
            steps {
                dir('ReAdmit-AI') {
                    sh """
                        docker build -t $FRONTEND_IMAGE .
                        docker push $FRONTEND_IMAGE
                    """
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    if (BUILD_BACKEND) {
                        sh "aws ecs update-service --cluster readmit-cluster --service backend-service --force-new-deployment --region $AWS_REGION"
                    }
                    if (BUILD_MICROSERVICE) {
                        sh "aws ecs update-service --cluster readmit-cluster --service ml-service --force-new-deployment --region $AWS_REGION"
                    }
                    if (BUILD_FRONTEND) {
                        sh "aws ecs update-service --cluster readmit-cluster --service frontend-service --force-new-deployment --region $AWS_REGION"
                    }
                }
            }
        }
    }
}