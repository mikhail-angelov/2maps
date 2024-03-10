include .env

postgres: 
	docker-compose -f ./docker-compose-postgres.yml up -d
	
dump-db: DUMP_FILE=$(shell date +%s).dump
dump-db:
	docker exec postgres bash -c 'pg_dump -Fc --dbname=postgresql://${DB_USERNAME}:${DB_PASSWORD}@127.0.0.1:5432/${DB_DATABASE} | gzip >/var/lib/postgresql/data/${DUMP_FILE}.tar.gz'

restore-db:
	pg_restore --dbname=${DB_URL} --clean --if-exists --verbose dump.tar

build:
	npm run build
	docker build  . -t mangelov/2maps
	docker build  -f ./DockerfileMigration . -t mangelov/2maps-migration
m:
	docker-compose -f ./docker-compose.migration.local.yml up

push:
	docker push mangelov/2maps:latest

run:
	docker run mangelov/2maps:latest

scp:
	scp -r ./.env.prod root@2maps.xyz:/opt/2maps/.env
	scp -r Makefile root@2maps.xyz:/opt/2maps/Makefile
	scp -r docker-compose.yml root@2maps.xyz:/opt/2maps/docker-compose.yml
	scp -r docker-compose.migration.yml root@2maps.xyz:/opt/2maps/docker-compose.migration.yml

scp-map:
	scp -r ./data/mende-nn.sqlitedb root@2maps.xyz:/opt/2maps/data/mende-nn.sqlitedb

deploy: 
	ssh root@2maps.xyz 'docker pull docker.pkg.github.com/mikhail-angelov/2maps/2maps:latest; cd /opt/2maps;docker-compose down --remove-orphans;docker-compose up -d'

migration: 
	ssh root@2maps.xyz 'docker pull docker.pkg.github.com/mikhail-angelov/2maps/2maps-migration:latest; cd /opt/2maps;docker-compose down --remove-orphans;docker-compose -f ./docker-compose.migration.yml up;docker-compose up -d'

clean:
	docker system prune -a