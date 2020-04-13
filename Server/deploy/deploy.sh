docker build -t ${REPO} .
docker tag ${REPO}:latest cloud.canister.io:5000/${NAMESPACE}/${REPO}:latest
docker push cloud.canister.io:5000/${NAMESPACE}/${REPO}
