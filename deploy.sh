echo "Votre client_id infisical"
read -p "[ AWAIT ] Client : " inf_client

echo "Votre token infisical"
read -s -p "[ AWAIT ] Token : " inf_token
echo ""

git fetch --all && git checkout --force "origin/main" > /dev/null 2>&1
git fetch --all && git checkout --force "origin/main" > /dev/null 2>&1

export INFISICAL_TOKEN=$(infisical login --method=universal-auth --client-id=$inf_client --client-secret=$inf_token --plain --silent)

TAG=$(date +%Y-%m-%d_%H%M)

docker build ./ -t pastillebot/pastille-bot:prod_$TAG
docker stop pastille-bot > /dev/null 2>&1
docker rm pastille-bot > /dev/null 2>&1
docker run \
  -d \
  --name pastille-bot \
  --env INFISICAL_TOKEN=$INFISICAL_TOKEN \
  --privileged \
  pastillebot/pastille-bot:prod_$TAG