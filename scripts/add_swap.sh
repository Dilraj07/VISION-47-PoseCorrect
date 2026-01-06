#!/bin/bash
# Add 2GB of Swap Space to prevent "Out of Memory" kills on t2.micro
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo "Swap Created Successfully!"
free -h
