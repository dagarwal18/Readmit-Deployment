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

                    def BUILD_BACKEND = changedFiles.contains("Readmit-Backend/")
                    def BUILD_MICROSERVICE = changedFiles.contains("flask-reAdmit-microservice/")
                    def BUILD_FRONTEND = changedFiles.contains("ReAdmit-AI/")

                    if (!BUILD_BACKEND && !BUILD_MICROSERVICE && !BUILD_FRONTEND) {
                        error("No relevant changes detected in any service.")
                    }

                    env.BUILD_BACKEND = BUILD_BACKEND.toString()
                    env.BUILD_MICROSERVICE = BUILD_MICROSERVICE.toString()
                    env.BUILD_FRONTEND = BUILD_FRONTEND.toString()
                }
            }
        }

        stage('Login to ECR') {
            steps {
                sh """
                    aws ecr get-login-password --region $AWS_REGION \
                    | docker login --username AWS --password-stdin 137812392325.dkr.ecr.us-east-1.amazonaws.com
                """
            }
        }

        stage('Build & Push Backend') {
            when { expression { return env.BUILD_BACKEND == 'true' } }
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
            when { expression { return env.BUILD_MICROSERVICE == 'true' } }
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
            when { expression { return env.BUILD_FRONTEND == 'true' } }
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
                    if (env.BUILD_BACKEND == 'true') {
                        sh """
                            aws ecs update-service \
                            --cluster readmit-cluster \
                            --service readmit-backend-service-k0nf5j9s \
                            --force-new-deployment \
                            --region $AWS_REGION
                        """
                    }
                    if (env.BUILD_MICROSERVICE == 'true') {
                        sh """
                            aws ecs update-service \
                            --cluster readmit-cluster \
                            --service readmit-ml-service-service-9v4p1ewh \
                            --force-new-deployment \
                            --region $AWS_REGION
                        """
                    }
                    if (env.BUILD_FRONTEND == 'true') {
                        sh """
                            aws ecs update-service \
                            --cluster readmit-cluster \
                            --service readmit-frontend-service-caouxqp2 \
                            --force-new-deployment \
                            --region $AWS_REGION
                        """
                    }
                }
            }
        }
    }
}