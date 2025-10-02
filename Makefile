all:
	docker compose up --build -d

dev:
	docker compose -f docker-compose.dev.yml up --build

down:
	docker compose down

down-dev:
	docker compose -f docker-compose.dev.yml down

fclean:
	docker compose down -v

prune:
	docker system prune -af --volumes

.PHONY: all dev down down-dev fclean prune



