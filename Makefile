build:
	docker compose up --build backend -d
	docker compose up --build frontend

down:
	docker compose down

b:
	make build

d:
	make down

run:
	./scripts/run.sh

test-backend:
	./scripts/test_backend.sh
