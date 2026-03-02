---
title: All-in-One Bootable USB with Ventoy
date: 2023-12-14
summary: Stop carrying multiple USB drives — Ventoy lets you boot any number of ISOs from a single stick with no reflashing.
category: Tutorial
tags: [Engineering, OS]
---

# All-in-One Bootable USB with Ventoy

## The Problem

I keep a handful of ISOs around: GParted, Memtest86+, Arch Linux, and Windows 10/11. The traditional approach is one USB per ISO — flash it with dd or Rufus, boot from it, reflash when you need a different one. With a 128 GB USB that's mostly empty, dedicating the whole drive to a single 5 GB ISO is wasteful. And swapping between ISOs by reflashing every time is slow.

## Ventoy

[Ventoy](https://www.ventoy.net/en/doc_start.html) solves this by turning a USB drive into a boot menu. You install Ventoy once onto the drive, then just copy ISO files onto it like a normal filesystem. On boot, Ventoy presents a menu of every ISO it finds and boots whichever one you pick. No reflashing, no special tools — drag and drop.

It supports UEFI and Legacy BIOS, GPT and MBR, and handles ISOs, WIM, IMG, VHD, and EFI files. Most major Linux distros and Windows installers work out of the box.

## Setup

### 1. Download and Install

Grab the latest release from the [Ventoy downloads page](https://www.ventoy.net/en/download.html).

**Windows:** Extract the zip and run `Ventoy2Disk.exe`. Select your USB drive and click Install. This formats the drive into two partitions — a small EFI partition for Ventoy's bootloader and a large exFAT partition for your files.

**Linux:** Extract and run the install script:

```bash
sudo bash Ventoy2Disk.sh -i /dev/sdX
```

Replace `/dev/sdX` with your USB device. Use `lsblk` to identify it first — installing to the wrong device will wipe it.

### 2. Add ISOs

Once installed, the USB shows up as a regular drive. Create a folder structure that makes sense to you and drop ISOs in:

```
USB Drive/
├── linux/
│   └── archlinux-2024.01.01-x86_64.iso
├── utils/
│   ├── gparted-live-1.5.0-6-amd64.iso
│   └── memtest86+-7.00.iso
└── windows/
    └── Win11_23H2_English_x64.iso
```

Ventoy scans subdirectories recursively, so organize however you want. On the next boot from USB, all four ISOs appear in the menu.

### 3. Updating

When Ventoy releases a new version, you can update in place without losing your ISOs — just run the updater and it only touches the boot partition.

## Secure Boot

If your machine has Secure Boot enabled, Ventoy won't boot by default since its bootloader isn't signed by Microsoft. There are two options:

1. **Enroll the Ventoy key** — On first boot, Ventoy's UEFI shim will prompt you to enroll its certificate into your machine's MOK (Machine Owner Key) database. Follow the on-screen prompts, reboot, and it works from then on.

2. **Disable Secure Boot** — Simpler but less secure. Toggle it off in your BIOS/UEFI settings.

The [Ventoy Secure Boot documentation](https://www.ventoy.net/en/doc_secure.html) covers edge cases for specific firmware implementations.

## Persistence (Optional)

For Linux ISOs, Ventoy supports persistence files so changes you make in a live session survive reboots. Create a persistence data file using Ventoy's plugin, associate it with a specific ISO in `ventoy/ventoy.json`, and the live session will use it as writable storage. Useful if you regularly boot into a live Arch or Ubuntu environment for maintenance.

## Why This Works Well

The main advantage isn't just convenience — it's that the USB stays a normal filesystem. You can use the remaining space for anything else: documents, scripts, backup configs. The ISOs are just files sitting alongside everything else. When a new Arch ISO drops, delete the old one and copy the new one over. No tools needed.
