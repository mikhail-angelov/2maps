include .env.prod

postgres: 
	docker-compose -f ./docker-compose-postgres.yml up -d
	
dump-db: DUMP_FILE=$(shell date +%s).dump
dump-db:
	ssh root@2maps.xyz "docker exec postgres-2map bash -c 'pg_dump -Fc --dbname=postgresql://${DB_USERNAME}:${DB_PASSWORD}@127.0.0.1:5432/${DB_DATABASE} | gzip >/var/lib/postgresql/data/${DUMP_FILE}.gz'"
	ssh root@2maps.xyz "mv /opt/postgresdb/${DUMP_FILE}.tar.gz /opt/2maps/${DUMP_FILE}.gz"
	scp -r root@2maps.xyz:/opt/2maps/${DUMP_FILE}.gz ./${DUMP_FILE}.gz

restore-db:
	docker exec -i 2maps-postgres-1 pg_restore --dbname=postgresql://postgres:postgres@localhost:5432/2maps --clean --if-exists --verbose < '$(name)'

restore-local-db:
	pg_restore --dbname=postgresql://postgres:postgres@localhost:5432/2maps --clean --if-exists --verbose ${file}

build:
	npm run build
	docker build --platform linux/arm64 . -t mangelov/2maps

push:
	docker push mangelov/2maps:latest

scp:
	scp -r ./.env.prod root@2maps.xyz:/opt/2maps/.env
	scp -r Makefile root@2maps.xyz:/opt/2maps/Makefile
	scp -r docker-compose.yml root@2maps.xyz:/opt/2maps/docker-compose.yml

scp-map:
	scp -r ./data/mende-nn.sqlitedb root@2maps.xyz:/opt/2maps/data/mende-nn.sqlitedb
	scp -r ./data/volga.sqlitedb root@2maps.xyz:/opt/2maps/data/volga.sqlitedb

deploy: 
	ssh root@2maps.xyz 'docker pull docker.pkg.github.com/mikhail-angelov/2maps/2maps:latest; cd /opt/2maps;docker-compose down --remove-orphans;docker-compose up -d'

clean:
	docker system prune -a