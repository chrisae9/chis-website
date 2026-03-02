---
title: Signing GitHub commits with GPG Key
date: 2022-06-09
summary: Signing GitHub commits with a GPG key. Reference to importing and exporting key to different devices through ssh/file transfer.
category: Docs
tags: [Git, Security]
---

# Signing GitHub commits with GPG Key

### Generating the GPG Key

Original article: [https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)

```
gpg --full-generate-key
# walk through prompts

gpg --list-secret-keys --keyid-format=long
# copy key name
# the part after "sec   4096R/"

gpg --armor --export $KEY_NAME
# prints the public key
# Add this to GitHub
```

### Signing commits

```
git config --global commit.gpgsign true
git config --global user.signingkey $KEY_NAME
```

### Exporting/importing key

```
gpg --export-secret-key $KEY_NAME > ~/my-key.asc
gpg --import my-key.asc

# preferred way is over ssh
gpg --export-secret-key SOMEKEYID | ssh othermachine gpg --import

# or...

ssh othermachine gpg --export-secret-key SOMEKEYID | gpg --import
# just kidding that seems broken, maybe look here
https://d.sb/2016/11/gpg-inappropriate-ioctl-for-device-errors
```

### Resigning old commits??

ref: [https://superuser.com/questions/397149/can-you-gpg-sign-old-commits](https://superuser.com/questions/397149/can-you-gpg-sign-old-commits)

```
git rebase --exec 'git commit --amend --no-edit -n -S' -i development
```
