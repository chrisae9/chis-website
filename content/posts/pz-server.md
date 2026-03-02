---
title: Hosting a Project Zomboid Server
date: 2022-01-05
summary: How I setup a Project Zomboid server that was orchestrated from my Discord bot.
category: Game
tags: [Gaming, Server]
draft: true
---

Project Zomboid

Another day another server!

Here is how to get a simple Project Zomboid Dedicated Server up and running.

You will no longer have to overheat your gaming pc/laptop by hosting a server while playing with your friends.

## Installing SteamCMD

Make sure that SteamCMD is installed on the Linux server.

[Link to SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD)

I chose to install SteamCMD here:

`/hdd/steam`

## Installing Project Zomboid’s Dedicated Server Application

PZ’s developers decided to put an application on the steam store to make running Valheim dedicated servers easier.

To install this on our Linux server we need to launch SteamCMD:

`/hdd/steam/steamcmd.sh`

Make sure you are logged into Steam

```bash
login anonymous
```

Set an installation directory:

```bash
force_install_dir pz_server
```

Install the PZ Dedicated Server application using its app_id:

```bash
app_update 380870 validate
```

## Configuring the Default Settings

Configure the settings by creating the file:

`/hdd/steam/pz_server/servertest.ini`

Here are my set parameters:

```
ServerWelcomeMessage=Welcome to Chis Project Zomboid Server! <LINE> <LINE> To interact with the Chat panel: press Tab, T, or Enter. <LINE> <LINE> The Tab key will change the target stream of the message. <LINE> <LINE> Global Streams: /all <LINE> Local Streams: /say, /yell <LINE> Special Steams: /whisper, /safehouse, /faction. <LINE> <LINE> Press the Up arrow to cycle through your message history. Click the Gear icon to customize chat. <LINE> <LINE> Happy surviving!

Public=true

PublicName=Chis Server

PublicDescription=Friend server.

PingLimit=600

AnnounceDeath=true

UPnP=false
```

## Starting the PZ Server

Open ports on your router to make the server accessible to people outside of your network.

```bash
sudo ufw allow 8766
sudo ufw allow 16261
```

Run the server.

```
/hdd/steam/pz_server/start-server.sh
```

### Automating the Process Using Discord

Create a systemd service for the PZ start script.

`/lib/systemd/system/pz-server.service`

```bash
[Unit]
Description=pz-server
After=NetworkManager.service

[Service]
WorkingDirectory=/hdd/steam/pz
Type=simple
KillMode=control-group
TimeoutStopSec=2
SuccessExitStatus=0 1
ExecStart=/hdd/steam/pz/start-server.sh
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
```

Reload the systemd daemon.

`sudo systemctl daemon-reload`

Create a Discord bot using Python (recommended to use slash commands).

Add a Cog that includes code similar to this:

`options`

```python
from discord_slash import SlashContext, cog_ext
from discord_slash.model import (SlashCommandOptionType,
                                 SlashCommandPermissionType)
from discord_slash.utils.manage_commands import (create_choice, create_option,
                                                 create_permission)

SERVICES = [
    create_choice(
        name="Minecraft",
        value="minecraft-server.service"
    ),
    create_choice(
        name="Project Zomboid",
        value="pz-server.service"
    ),
    create_choice(
        name="CSGO Bhop",
        value="csgo-bhop-server.service"
    )
]
```

`slash command`

```python
@cog_ext.cog_slash(name="server",
                    description="Start a Chis Bot service",
                    options=[
                        create_option(
                            name="service",
                            description="Select a service",
                            option_type=SlashCommandOptionType.STRING,
                            required=True,
                            choices=SERVICES
                        ),
                        create_option(
                            name="state",
                            description="Stop a service",
                            option_type=SlashCommandOptionType.STRING,
                            required=True,
                            choices=[create_choice(
                                name="start",
                                value="start"
                            ),
                                create_choice(
                                name="stop",
                                value="stop"
                            ), create_choice(
                                name="status",
                                value="status"
                            )]
                        )
                    ],
                    default_permission=False,
                    guild_ids=[0000000000],
                    permissions={000000000000000: [create_permission(
                        00000000000000, SlashCommandPermissionType.ROLE, True)]}
                    )
async def server_command(self, ctx, service, state):
    await ctx.defer()
    check = subprocess.run(
        ['/bin/systemctl', 'show', '-p', 'ActiveState' ,'--value', service], capture_output=True, timeout=120)

    checkout= check.stdout.decode("utf-8")
    checkerr= check.stderr.decode("utf-8")
    logging.info(check)
    action = subprocess.run(
                ['/bin/systemctl', state, service], capture_output=True, timeout=120)
    logging.info(action)

    embed = discord.Embed(
        title=f'Chis Server', description='', color=0xff00d4)
    embed.set_author(name="Chis Bot", url="https://chis.dev/chis-bot/",
                        icon_url="https://cdn.discordapp.com/app-icons/724657775652634795/22a8bc7ffce4587048cb74b41d2a7363.png?size=256")
    embed.add_field(name=f'Service',
            value=f'{service}', inline=False)

    if state == 'status':
        embed.add_field(name=f'Command',
            value=f'{state}', inline=True)
        embed.add_field(name=f'Output',
                        value=f'{checkout if checkout else "N/A"}', inline=True)
        embed.add_field(name=f'Error',
                        value=f'{checkerr if checkerr else "N/A"}', inline=True)

    if state == 'start':
        embed.add_field(name=f'Command',
            value=f'{state}', inline=True)
        if checkout == "deactivating":
            embed.add_field(name=f'Action',
                value=f'{service} is still deactivating, hold on.', inline=True)
        else:
            action = subprocess.run(
                    ['/bin/systemctl', state, service], capture_output=True, timeout=120)
            embed.add_field(name=f'Action',
                        value=f'{service} is starting, hold on.', inline=True)
            embed.add_field(name=f'Previous State',
                        value=f'{checkout if checkout else "N/A"}', inline=True)

    if state == 'stop':
        embed.add_field(name=f'Command',
                    value=f'{state}', inline=True)
        embed.add_field(name=f'Action',
                    value=f'{service} is stopped.', inline=True)
        embed.add_field(name=f'Previous State',
                    value=f'{checkout if checkout else "N/A"}', inline=True)

    await ctx.send(embed=embed)
```

If running as not-root make sure to include `--user` tag in `subprocess.run()` function when calling `systemctl`.

Both the bot and the service must be run by the same user.

🦔