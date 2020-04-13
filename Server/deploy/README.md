# How to deploy

Build the docker container local, then push it to AWS ECR.

```shell
aws ecr get-login --no-include-email --region=eu-north-1 | sh -

REPO=liveol ./deploy/deploy.sh
```

Then pull the container on your server.
