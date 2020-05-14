#!/bin/sh

sudo apt-get update
sudo apt-get upgrade

sudo apt-get install wget

# Instalación de nvm

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash


export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm


nvm install --lts


## Instalación de Ionic

npm install -g @ionic/cli


## Instalación de VSCode

vscode="vscode.deb"
wget https://go.microsoft.com/fwlink/?LinkID=760868 -O $vscode
sudo dpkg -i $vscode

