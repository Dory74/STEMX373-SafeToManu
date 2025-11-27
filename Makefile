build:
	docker compose up --build backend
	docker compose up --build frontend

down:
	docker compose down

b:
	make build

d:
	make down

run:
	./scripts/run.sh