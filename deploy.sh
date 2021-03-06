#!/usr/bin/env sh
openssl aes-256-cbc -K $encrypted_8fb4cefaf9ce_key -iv $encrypted_8fb4cefaf9ce_iv -in galaxyboard.enc -out id_rsa -d
chmod 600 ./id_rsa
cat ./known_hosts > ~/.ssh/known_hosts
eval `ssh-agent -s`
ssh-add ./id_rsa
ssh galaxyboard@euve58546.serverprofi24.de -p 55123 '~/galaxyboard/node_modules/forever/bin/forever stop ~/galaxyboard/boards.js'
rsync -avze 'ssh -p 55123' ./ galaxyboard@euve58546.serverprofi24.de:galaxyboard
ssh galaxyboard@euve58546.serverprofi24.de -p 55123 'sh ~/galaxyboard/install/install.sh'
ssh galaxyboard@euve58546.serverprofi24.de -p 55123 '~/galaxyboard/node_modules/forever/bin/forever start ~/galaxyboard/boards.js'