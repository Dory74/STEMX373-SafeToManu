build:
	docker compose up --build backend -d
	docker compose up --build frontend -d
	docker compose up proxy -d
	docker compose up --build splash_scoring 


down:
	docker compose down

b:
	make build

d:
	make down

run:
	docker compose up proxy-dev -d
	./scripts/run.sh

test-backend:
	./scripts/test_backend.sh
