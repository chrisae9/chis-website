---
title: Torrenting with ProtonVPN over Docker
date: 2023-11-20
summary: Setting up QBitTorrent using ProtonVPN port forwarding in Docker. Accessible via browser over localhost.
category: Docker
tags: [Docker, Torrent, VPN]
draft: true
---

## Generating Wireguard Configuration File

Go to: [https://account.proton.me/u/0/vpn/WireGuard](https://account.proton.me/u/0/vpn/WireGuard)

![Transmission](/images/protonvpn-docker-torrent.png)

Use these settings and select a server tagged as P2P—preferably a server in Switzerland where the data privacy laws are sold.

Place the file in `gluetun/wireguard/wg0.conf`

## Setting Up Docker Compose

```
version: "3.9"
services:
  vpn:
    image: qmcgaw/gluetun:latest
    container_name: gluetun
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
    ports:
      - 8088:8088
      - 54435:54435
      - 54435:54435/udp # port generated in gluten/info/forwarded_port
    volumes:
      - ./gluetun:/gluetun
      - ./gluetun/info:/tmp/gluetun
    devices:
      - /dev/net/tun:/dev/net/tun
    environment:
      - TZ=America/New_York
      - VPN_SERVICE_PROVIDER=custom
      - VPN_TYPE=wireguard
      - VPN_PORT_FORWARDING=on
      - VPN_PORT_FORWARDING_PROVIDER=protonvpn
      - FIREWALL_OUTBOUND_SUBNETS=192.168.0.0/16 # Internal network
  torrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    container_name: torrent
    restart: unless-stopped
    network_mode: "service:vpn"
    environment:
      - WEBUI_PORT=8088
      - TZ=America/New_York
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
      - ./downloads:/downloads
    depends_on:
      - vpn
```

## Configuring VPN ports

Start the VPN service from the `docker-compose.yaml` file and look in `gluetun/info/forwarded_port` . Replace all entries of the port (54355) in the compose file with the new one.

## Setting Up QBitTorrent

To login, the default admin account is `admin/adminadmin`.

![Transmission](/images/protonvpn-docker-torrent1.png)

Head over to the settings and setup the port forwarding in the connection tab.

![Transmission](/images/protonvpn-docker-torrent2.png)

Limit the network interface to only use the VPN by binding it to `/dev/tun`.

![Transmission](/images/protonvpn-docker-torrent3.png)

## Additional Setup

Recommended to setup a Global seeding limit in the BitTorrent tab, mine is configured to a ratio of 2.

![Transmission](/images/protonvpn-docker-torrent4.png)

Here is my configuration for saving files in the Downloads tab. 

![Transmission](/images/protonvpn-docker-torrent5.png)

### Automatically Updating qBittorrent Port to Match Gluetun Port

To streamline the process of ensuring your qBittorrent client uses the same port as Gluetun, you can use a combination of a Python script and a Bash script. The Python script updates the qBittorrent listening port, while the Bash script manages the overall process, including reading the new port from Gluetun and updating the Docker Compose configuration.

### Python Script

The Python script `listening_port.py` updates the qBittorrent listening port. Here’s the code, with sensitive credentials obfuscated:

```python
import qbittorrentapi
import sys

if not len(sys.argv) > 1:
    print("specify port")
    exit(1)

new_port = sys.argv[1]  # specify the new port here

# instantiate a Client using the appropriate WebUI configuration
conn_info = dict(
    host="localhost",
    port=8088,
    username="your_username",  # obfuscated
    password="your_password",  # obfuscated
)
qbt_client = qbittorrentapi.Client(**conn_info)

# update the listening port
qbt_client.app.preferences = {'listen_port': new_port}

```

### Setting Up the Environment

Before running the scripts, set up a Python virtual environment and install the necessary dependencies. Here’s how to do it:

1. **Create a Virtual Environment:**
    
    ```bash
    python -m venv env
    ```
    
2. **Activate the Virtual Environment:**
    
    ```bash
    source env/bin/activate
    ```
    
3. **Install Dependencies:**
Create a `requirements.txt` file with the following content:
    
    ```
    qbittorrent-api
    ```
    
    Then, install the dependencies:
    
    ```bash
    pip install -r requirements.txt
    ```
    

### Bash Script

The Bash script `change_port.sh` automates the process of updating the port in both Docker Compose and qBittorrent. Here’s the script:

```bash
#!/bin/bash

# Ensure the script exits on any error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Path to the forwarded_port file
FORWARDED_PORT_FILE="../gluetun/info/forwarded_port"

# Path to the docker-compose.yaml file
DOCKER_COMPOSE_FILE="../docker-compose.yaml"

# Maximum wait time for the port file (in seconds)
MAX_WAIT=60
WAIT_INTERVAL=2
TOTAL_WAIT=0

# Function to wait for the forwarded_port file
wait_for_port_file() {
    echo "Waiting for the forwarded_port file to be created..."
    while [ ! -f "$FORWARDED_PORT_FILE" ]; do
        if [ $TOTAL_WAIT -ge $MAX_WAIT ]; then
            echo "Timed out waiting for $FORWARDED_PORT_FILE to be created. Exiting."
            exit 1
        fi
        sleep $WAIT_INTERVAL
        TOTAL_WAIT=$((TOTAL_WAIT + WAIT_INTERVAL))
    done
}

# Function to read the new port from the forwarded_port file
read_new_port() {
    NEW_PORT=$(head -n 1 "$FORWARDED_PORT_FILE")
    if [[ -z "$NEW_PORT" ]]; then
        echo "Failed to read new port from $FORWARDED_PORT_FILE. Exiting."
        exit 1
    fi
    echo "Updating port to: $NEW_PORT"
}

# Function to update the docker-compose.yaml file with the new port
update_docker_compose() {
    echo "Updating docker-compose.yaml with the new port..."
    sed -i "s#54435:[0-9]\\+#54435:${NEW_PORT}#g" "$DOCKER_COMPOSE_FILE"
}

# Function to run the Python script with the new port
run_python_script() {
    echo "Running the Python script with the new port..."
    ./env/bin/python python/listening_port.py "$NEW_PORT"
}

# Function to restart Docker services
restart_docker_services() {
    echo "Restarting Docker services..."
    docker-compose down
    docker-compose up -d
}

# Main script execution
echo "Shutting down any running Docker services..."
docker-compose down

echo "Starting vpn and torrent services..."
docker-compose up -d vpn torrent

wait_for_port_file
read_new_port
update_docker_compose
run_python_script

restart_docker_services

echo "Port update and service restart completed successfully."
```

### Using the Scripts

1. **Ensure all scripts are placed in the correct directories:**
    - `listening_port.py` in the `python` directory.
    - `change_port.sh` in the root directory next to the Docker Compose file.
2. **Make the Bash script executable:**
    
```bash
  chmod +x change_port.sh
```
    
3. **Run the Bash script to update the ports and restart the services:**
    
```bash
  ./change_port.sh
```
    

By following these steps, you can ensure that your qBittorrent client dynamically updates its port to match the one used by Gluetun, maintaining a seamless and secure torrenting experience.
