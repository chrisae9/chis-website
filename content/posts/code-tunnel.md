---
title: VSCode Tunnel Service on Arch Linux
date: 2024-01-30
summary: Guide on how to set up a VSCode tunnel service on your Arch Linux system, allowing you to connect to your remote development server seamlessly through the https://insiders.vscode.dev/ website.
category: Docs
tags: [Arch, Chromebook, VSCode]
---

The purpose of this guide is to create a VSCode tunnel using the code CLI, creating a service that optionally runs on boot. This allows you to connect to your remote development server over the [insiders.vscode.dev](https://insiders.vscode.dev/) website. This setup is particularly useful if you're working on a machine with limited resources, like an old Pixelbook, where the local Linux development version of VSCode might be too choppy and slow.

## Why Use a VSCode Tunnel?

Running VSCode directly on an older machine like a Pixelbook can be inefficient. The Linux development version of VSCode may run too slowly, making coding a frustrating experience. By using a VSCode tunnel, you can offload the heavy lifting to a remote server and access a smooth, responsive development environment via the [insiders.vscode.dev](https://insiders.vscode.dev/) website.

## Step 1: Grab the Code Executable

First, grab the code insiders executable using the following command:

```bash
curl -Lk 'https://code.visualstudio.com/sha/download?build=insider&os=cli-alpine-x64' --output vscode_cli_insiders.tar.gz
```

Extract the downloaded tarball:

```bash
tar -xf vscode_cli_insiders.tar.gz
```

> Note: I extracted it to my home folder for simplicity.

## Step 2: Test Out That It Works

Navigate to the extracted folder and test the VSCode tunnel:

```bash
./code-insiders tunnel
```

You will be prompted to log in using Microsoft or GitHub. I chose GitHub. Enter the code that you get in the terminal and test the connection by logging into:

```
https://insiders.vscode.dev/tunnel/[your-pc]
```

Replace `[your-pc]` with your actual PC name provided during the setup.

## Step 3: Register the Code Tunnel as a Service

To register the code tunnel as a service, use the command:

```bash
./code-insiders tunnel service install
```

This process works properly with the insiders version. The service will be automatically created and configured.

## Step 4: Manage the Service

The service is now installed and can be managed using the following commands:

### Service Commands

To uninstall the service:
```bash
./code-insiders tunnel service uninstall
```

To check if the tunnel is running:
```bash
./code-insiders tunnel status
```

### Remove a Tunnel Registration

If you want to remove the machine's association with tunneling entirely:
```bash
./code-insiders tunnel unregister
```

You can also remove tunnels from any VS Code client by opening the Remote Explorer view, right-clicking on the machine, and selecting "unregister".

## Additional Helpful Aliases

For other helpful things, I alias:

```bash
alias ci='code-insiders -r .'
```

When you are in the VSCode terminal, you can type `ci` to open the current working directory into the VSCode editor.
