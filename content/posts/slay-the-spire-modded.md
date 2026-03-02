---
title: Modding Slay The Spire on Steam Deck
date: 2025-03-21
summary: A guide to installing mods for Slay the Spire on the Steam Deck, with a focus on the Downfall Expansion Mod.
category: Steam Deck
tags: [Gaming, Modding, Steam Deck]
---

Slay the Spire is an great game, but it feels much more complete with the Downfall Expansion Mod. Here’s how to get it running on your Steam Deck.

## Step 1: Access the Community Workshop
Visit the [Slay the Spire Community Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=1610056683) and download the Downfall mod. This will also install other required components, such as stslib and ModTheSpire.

## Step 2: Configure ModTheSpire
The ModTheSpire UI is highly unstable on the Steam Deck, so it’s best to avoid interacting with it directly. Instead, you can pre-configure the mods to load automatically at startup.

1. Navigate to the following directory on your Steam Deck:
   ```
   ~/.local/share/Steam/steamapps/compatdata/646570/pfx/drive_c/users/steamuser/AppData/Local/ModTheSpire
   ```
   - Note: `646570` is Slay the Spire’s Steam App ID. You can confirm this on [SteamDB](https://steamdb.info/app/646570/).

2. Open the `ModTheSpire.Properties` file in a text editor.

3. Add the following line to specify the mods to load:
   ```
   mods=basemod,stslib,downfall
   ```

## Step 3: Launch ModTheSpire
Go back to the main Steam menu, click on Slay the Spire, and launch it. When prompted, select ModTheSpire as your default launch option.

If you are not prompted, go into the general settings of Slay the Spire and set ModTheSpire as the default launch option.

