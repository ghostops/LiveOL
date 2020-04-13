# How to deploy

Build the docker container local, then push it to canister.io.

```shell
docker login --username=${USERNAME} cloud.canister.io:5000

NAMESPACE=namespace REPO=liveol ./deploy/deploy.sh
```

Then pull the container on your server.
