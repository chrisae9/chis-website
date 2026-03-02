---
title: Discord Webhook Integration
date: 2023-12-01
summary:  A quick overview of Discord slash commands and a bit of history behind Discord bots.
category: Web
tags: [Discord, Server, Webhook]
---

## The Problem With Discord Bots

Traditional Discord bots listen to a text channel for a command that starts with a particular prefix (!, ., $, ?). This required the bot's permission to view the channel and have an open gateway connection to Discord to parse every message. This is inefficient since the bot has to maintain the connection with Discord and read every message sent on each channel.

## Introduction of Slash Commands

[Back in September of 2022](https://discordnet.dev/guides/int_basics/application-commands/intro.html) Discord introduced slash commands. No longer did your bot have to parse a message for a prefix. All you needed to do was send Discord a list of commands you want your bot to have. Although this was more efficient, most bots continued to use a gateway connection to receive and respond to the slash commands. 

## Using Discord Webhooks

In the Discord developer console, you can configure a webhook URL to receive slash commands instead of registering a bot with an open gateway connection. This makes the most sense for interacting with slash commands. A lot less overhead than a gateway connection.

There are two requirements for the Discord webhook:

1. Your endpoint has to deny requests that aren’t verified with Discord’s signature.
2. The webhook needs to respond with the proper payload to PING interaction requests.

*Occasionally, Discord will send malformed requests to your webhook to verify that it works correctly.* 

## Slash Command Workflow

When someone uses a slash command, Discord sends an interaction through the webhook. There is a very short time window to respond to this request. If your webhook needs to do some processing before sending a response back, it needs to differ the message immediately. This will let Discord know that you are processing the request. And your bot will look like this:

![discord](/images/discord-webhook.png)

Discord will send back an interaction response to allow your webhook to send a follow-up message. Once the processing is done, the webhook can patch the deferred message with the correct response.

## Discord Interactions Example

I wrote a simple webhook to start and stop game services on my personal server. Here is the repository: 

[https://github.com/Chrisae9/discord-interactions-webhook](https://github.com/Chrisae9/discord-interactions-webhook)