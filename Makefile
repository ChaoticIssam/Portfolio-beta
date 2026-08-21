# Makefile for portfolio-beta

.PHONY: help install dev start build preview clean audit docker-build docker-up docker-down docker-clean docker-prune docker-fclean docker-re

# Default target
.DEFAULT_GOAL := help

help: ## Show available commands
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

start: dev ## Alias for make dev

build: ## Build production bundle
	npm run build

preview: build ## Rebuild and preview production bundle locally
	npm run preview

audit: ## Run npm security audit and fix
	npm audit fix

clean: ## Clean build artifacts and dist directory
	rm -rf dist .vite

docker-build: ## Build Docker image
	docker compose build

docker-up: ## Build and start Docker container on http://localhost:8090
	docker compose up --build -d

docker-down: ## Stop and remove Docker container
	docker compose down

docker-clean: docker-down ## Remove dangling images and build cache
	docker image prune -f
	docker builder prune -f

docker-prune: docker-down ## Prune dangling images, unused volumes, and build cache
	docker system prune -f
	docker volume prune -f

docker-fclean: docker-down clean ## Deep clean: containers, images, volumes, and local build artifacts
	docker system prune -a -f --volumes
	docker builder prune -a -f

docker-re: docker-down docker-up ## Restart and rebuild Docker container

