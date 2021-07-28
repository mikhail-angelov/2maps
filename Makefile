DEV_SERVER=root@bconf.com

build:
	npm run build
	docker build  . -t mangelov/mapnn-tiles

push:
	docker push mangelov/mapnn-tiles:latest

run:
	docker run mangelov/mapnn-tiles:latest

scp:
	scp -r ./data ${DEV_SERVER}:/opt/mapnn
	scp -r ./.env ${DEV_SERVER}:/opt/mapnn/.env
	scp -r docker-compose.yml ${DEV_SERVER}:/opt/mapnn/docker-compose.yml

deploy: 
	ssh ${DEV_SERVER} 'docker pull mangelov/mapnn-tiles:latest; cd /opt/mapnn;docker-compose down;docker-compose up -d'