docker build -t ${REPO} .
docker tag ${REPO}:latest 237763290421.dkr.ecr.eu-north-1.amazonaws.com/${REPO}:latest
docker push 237763290421.dkr.ecr.eu-north-1.amazonaws.com/${REPO}
