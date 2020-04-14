#!/bin/bash

##
# This script is used on startup of a new server (running Ubuntu 18.04)
# to start deploying the LiveOL API. It requires AWS s3 access to
# obtain certain resources
##

# HOME is not set on launch
HOME="/root"

DOCKER_COMPOSE_VERSION="1.25.4"
SERVER_ROOT="$HOME/LiveOL/Server"

AWS_BINARY="$HOME/.local/bin/aws"
AWS_REGION="eu-north-1"
S3_ROOT="s3://liveol/deploy"

DOCKER_COMPOSE="docker-compose -f docker-compose.live.yml"
DUCKDNS_SCRIPT="echo url='https://www.duckdns.org/update?domains=liveol-server&token=db0ac24f-5f69-427d-a144-9f7503650513&ip=' | curl -k -o $HOME/duckdns/duck.log -K -"

# Install required
apt update
apt -y install apache2 python3 python3-pip apt-transport-https ca-certificates curl software-properties-common
pip3 install awscli --upgrade --user

# add aws to path
echo 'export PATH="$PATH:$HOME/.local/bin"' >> $HOME/.bashrc
source $HOME/.bashrc

# Add SSH key
$AWS_BINARY s3 cp $S3_ROOT/id_ci $HOME/.ssh/id_rsa
chmod 600 $HOME/.ssh/id_rsa
ssh-keyscan github.com >> ~/.ssh/known_hosts

# Install DuckDNS
mkdir $HOME/duckdns
echo $DUCKDNS_SCRIPT >> $HOME/duckdns/duck.sh
chmod 700 $HOME/duckdns/duck.sh
# cron poll
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/duckdns/duck.sh >/dev/null 2>&1") | crontab -
# cron reboot
(crontab -l 2>/dev/null; echo "@reboot $HOME/duckdns/duck.sh >/dev/null 2>&1") | crontab -

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
apt update
apt-cache policy docker-ce
apt -y install docker-ce

# docker-compose
curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repo
git clone git@github.com:ghostops/LiveOL.git "$HOME/LiveOL"

# Auth ECR
eval $(aws ecr get-login --no-include-email --region=$AWS_REGION)
# also on reboot
(crontab -l 2>/dev/null; echo "@reboot (aws ecr get-login --no-include-email --region=$AWS_REGION )&") | crontab -

# Pull all live containers
cd $SERVER_ROOT ; $DOCKER_COMPOSE pull ; cd $HOME

# Add docker-compose up on reboot
(crontab -l 2>/dev/null; echo "@reboot (sleep 30s ; cd $SERVER_ROOT ; /usr/local/bin/${DOCKER_COMPOSE} up -d )&") | crontab -

# Add Apache2 VHost
$AWS_BINARY s3 cp $S3_ROOT/vhost.conf .
mv ./vhost.conf /etc/apache2/sites-available/vhost.conf
a2ensite vhost.conf

# enable reverse proxies
a2enmod proxy proxy_http

systemctl restart apache2

# Reboot for all changes to take effect
reboot now
