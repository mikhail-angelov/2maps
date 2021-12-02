build:
	npm run build
	docker build  . -t mangelov/mapnn-tiles

push:
	docker push mangelov/mapnn-tiles:latest

run:
	docker run mangelov/mapnn-tiles:latest

scp:
	scp -r ./data root@bconf.com:/opt/mapnn
	scp -r ./.env root@bconf.com:/opt/mapnn/.env
	scp -r docker-compose.yml root@bconf.com}:/opt/mapnn/docker-compose.yml

deploy: 
	ssh root@bconf.com 'docker pull docker.pkg.github.com/mikhail-angelov/mapnn-tiles/mapnn-tiles:latest; cd /opt/mapnn;docker-compose down;docker-compose up -d'

clean:
	docker system prune -a