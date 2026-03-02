---
title: Remotely Accessing Your Steam Deck
date: 2025-03-21
summary: A guide on how to remotely access your Steam Deck from another computer using Steam Link and SSH.
category: Steam Deck
tags: [Steam Deck, SSH]
---

There are two main methods to remotely access your Steam Deck: Steam Link and SSH. I recommend setting up both as they complement each other well - Steam Link for GUI, SSH for file transfers and command-line access.

## Steam Link Setup

Install Steam Link for your platform:
- **macOS**: Available on the App Store
- **Windows**: Download from [Steam Community](https://steamcommunity.com/app/353380/discussions/8/)
- **Linux**: Install via [Flathub](https://flathub.org/apps/com.valvesoftware.SteamLink)

Steam Link works out of the box with your Steam Deck - just make sure both devices are on the same network.

## SSH Setup

SSH provides powerful command-line access and file transfer capabilities. Here's how to set it up:

1. **Enter Desktop Mode**
   - Press the Steam button
   - Select Power
   - Choose "Switch to Desktop"

2. **Open Terminal**
   - Press the bottom-left Start button
   - Go to System
   - Select Konsole

3. **Set User Password**
   ```bash
   passwd
   ```
   Choose a strong password.

4. **Enable SSH Service**
   ```bash
   sudo systemctl enable sshd --now
   ```

5. **Connect to Your Steam Deck**
   ```bash
   # Basic connection using hostname
   ssh deck@steamdeck
   
   # If hostname doesn't resolve, find IP address
   ip addr | grep inet
   
   # Connect using IP address
   ssh deck@192.168.178.65  # Replace with your Steam Deck's IP
   ```

With both Steam Link and SSH set up, you'll have comprehensive remote access to your Steam Deck - Steam Link for gaming and desktop access, SSH for file management and system administration.