include .env

dump-db: DUMP_FILE=$(shell date +%s)-ls.dump
dump-db:
	pg_dump -Fc --dbname=postgresql://postgres:${DB_PASSWORD}@localhost:5432/2maps > ${DUMP_FILE}

restore-db:
	pg_restore --dbname=${DB_URL} --clean --if-exists --verbose '$(name)'

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
	scp -r ./.env.prod root@2map.xyz:/opt/mapnn/.env
	scp -r Makefile root@2map.xyz:/opt/mapnn/Makefile
	scp -r docker-compose.yml root@2map.xyz:/opt/mapnn/docker-compose.yml
	scp -r docker-compose.migration.yml root@2map.xyz:/opt/mapnn/docker-compose.migration.yml

deploy: 
	ssh root@2map.xyz 'docker pull docker.pkg.github.com/mikhail-angelov/2maps/2maps:latest; cd /opt/mapnn;docker-compose down;docker-compose up -d'

migration: 
	ssh root@2map.xyz 'docker pull docker.pkg.github.com/mikhail-angelov/2maps/2maps-migration:latest; cd /opt/mapnn;docker-compose down;docker-compose -f ./docker-compose.migration.yml up;docker-compose up -d'

clean:
	docker system prune -a