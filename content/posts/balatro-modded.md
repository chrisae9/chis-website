---
title: Modding Balatro on Steam Deck
date: 2025-03-21
summary: A guide to installing mods for Balatro on the Steam Deck using the Bunco mod framework.
category: Steam Deck
tags: [Gaming, Modding, Steam Deck]
---

!65[Bunco](/images/bunco.png)


After achieving 100% completion in Balatro, I wanted to explore more content. I discovered the [Bunco mod](https://firch.github.io/BuncoWeb/) which adds exciting new features to the game.

Since I exclusively play Balatro on my Steam Deck, I'll guide you through the process of installing mods on this platform. This guide is adapted from the [Steam Community guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3400691352).

## Prerequisites

Before we begin, I recommend checking out my guide on {{remote-steam-deck}} to learn different ways of accessing your Steam Deck remotely. This will make the modding process much easier.

## Installation Steps

### 1. Navigate to Balatro's Data Directory

First, access your Steam Deck via command line and navigate to Balatro's data directory:

```bash
cd ~/.local/share/Steam/steamapps/compatdata/2379780/pfx/drive_c/users/steamuser/AppData/Roaming/Balatro/
```

Note: `2379780` is Balatro's Steam App ID ([steamdb.info/app/2379780](https://steamdb.info/app/2379780/))

### 2. Create and Setup Mods Directory

Create a new directory for mods and enter it:

```bash
mkdir Mods
cd Mods
```

### 3. Install Required Components

1. Install the Balatro modding framework:
```bash
git clone https://github.com/Steamodded/smods
```

2. Install the Bunco mod:
```bash
git clone https://github.com/Firch/Bunco.git
```

### 4. Install Lovely Runtime Lua Injector

Navigate to Balatro's installation directory:

```bash
cd ~/.steam/steam/steamapps/common/Balatro
```

Download and install the latest version of the [Lovely Injector](https://github.com/ethangreen-dev/lovely-injector):

```bash
curl -sSL "https://api.github.com/repos/ethangreen-dev/lovely-injector/releases/latest" | jq -r '.tag_name' | xargs -I {} curl -sSL "https://github.com/ethangreen-dev/lovely-injector/releases/download/{}/lovely-x86_64-pc-windows-msvc.zip" -o lovely.zip && unzip lovely.zip && rm lovely.zip
```

This command performs several steps automatically:
1. Fetches the latest release tag from the GitHub API
2. Uses that tag to download the correct version of the lovely-injector
3. Downloads the Windows x64 version (which works with Steam Deck's Proton)
4. Extracts the ZIP file
5. Cleans up by removing the ZIP file

### 5. Configure Steam Launch Options

The final step is to configure Balatro to use the installed version.dll file. Add the following to your Steam launch options for Balatro:

```
WINEDLLOVERRIDES="version=n,b" %command%
```

You can set this by right-clicking Balatro in Steam, selecting Properties, and adding the launch option in the General tab.

## Conclusion

You should now have a working modded installation of Balatro on your Steam Deck! Launch the game and enjoy the new content.



