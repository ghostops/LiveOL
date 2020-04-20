#!/bin/bash

##
# This script is used on startup of a new server (running Ubuntu 18.04)
# to start deploying the LiveOL API. It requires AWS s3 access to
# obtain certain resources
##

export SCRIPT_USER="ubuntu"
export SCRIPT_HOME="/home/$SCRIPT_USER"

export DOCKER_COMPOSE_VERSION="1.25.4"
export SERVER_ROOT="$SCRIPT_HOME/LiveOL/Server"

export AWS_BINARY="/usr/local/bin/aws"
export AWS_REGION="eu-north-1"
export S3_ROOT="s3://liveol/deploy"

export DOCKER_COMPOSE="docker-compose -f docker-compose.live.yml"
export DUCKDNS_SCRIPT="echo url='https://www.duckdns.org/update?domains=liveol-server&token=db0ac24f-5f69-427d-a144-9f7503650513&ip=' | curl -k -o $SCRIPT_HOME/duckdns/duck.log -K -"

# Make home dir
mkdir -p $SCRIPT_HOME
mkdir -p $SCRIPT_HOME/.ssh

chown -R $SCRIPT_USER:$SCRIPT_USER $SCRIPT_HOME

# Install required
apt update
apt -y install apache2 apt-transport-https ca-certificates curl software-properties-common unzip

## AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "$SCRIPT_HOME/awscliv2.zip"
unzip -o "$SCRIPT_HOME/awscliv2.zip" -d "$SCRIPT_HOME"
$SCRIPT_HOME/aws/install

## Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
apt update
apt-cache policy docker-ce
apt -y install docker-ce

## Docker-Compose
curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add SSH key
su $SCRIPT_USER <<'EOF'
$AWS_BINARY s3 cp $S3_ROOT/id_ci $SCRIPT_HOME/.ssh/id_rsa
chmod 600 $SCRIPT_HOME/.ssh/id_rsa
ssh-keyscan github.com >> ~/.ssh/known_hosts
EOF

# Install DuckDNS on $SCRIPT_USER
su $SCRIPT_USER <<'EOF'
mkdir $SCRIPT_HOME/duckdns
echo $DUCKDNS_SCRIPT >> $SCRIPT_HOME/duckdns/duck.sh
chmod 700 $SCRIPT_HOME/duckdns/duck.sh

# cron poll
(crontab -l 2>/dev/null; echo "*/5 * * * * $SCRIPT_HOME/duckdns/duck.sh >/dev/null 2>&1") | crontab -

# cron reboot
(crontab -l 2>/dev/null; echo "@reboot $SCRIPT_HOME/duckdns/duck.sh >/dev/null 2>&1") | crontab -
EOF

# Clone repo
su $SCRIPT_USER <<'EOF'
git clone git@github.com:ghostops/LiveOL.git "$SCRIPT_HOME/LiveOL"
EOF

# Auth ECR
eval $($AWS_BINARY ecr get-login --no-include-email --region=$AWS_REGION)

# Pull all live containers
cd $SERVER_ROOT ; $DOCKER_COMPOSE up -d ; cd $SCRIPT_HOME

# Add website dir
mkdir -p /var/www/liveol.larsendahl.se/public
rm -rf /var/www/html
chown -R $SCRIPT_USER:$SCRIPT_USER /var/www/liveol.larsendahl.se

# Add Apache2 VHost
$AWS_BINARY s3 cp $S3_ROOT/vhost.conf .
mv ./vhost.conf /etc/apache2/sites-available/vhost.conf
a2ensite vhost.conf

# enable reverse proxies
a2enmod proxy proxy_http

systemctl restart apache2

# Reboot for all changes to take effect
reboot now
