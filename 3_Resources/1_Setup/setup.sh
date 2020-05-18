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

sudo snap install code --classic


## Instalación de Android Studio

sudo snap install android-studio --classic
sudo snap install androidsdk
androidsdk 'platforms;android-29'
androidsdk 'build-tools:29.0.3'
