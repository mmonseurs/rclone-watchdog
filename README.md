# rclone-watchdog
Directory syncing with filesystem monitoring, smart debouncing and queuing. Watches your local directory and keeps a remote (rclone) destination in sync, triggered by changes to files/directories. NOTE: this project is in no way affiliated with rclone. This is just an independent script I wrote, because I wanted a way to have rclone look for filesystem changes and automatically sync those to my cloud storage for backups. Since there's no official Google Drive sync client for Linux, this'll do for my usecase. This is strictly one-way however, so no bilateral sync sadly.

## Features
- Robust: uses [rclone](https://rclone.org/) to sync to/from local/remote directories
- Smart Debouncing: Collapses rapid file changes into one sync (default 2 seconds)
- Automatic Queuing: Changes during sync are queued for subsequent run
- Zero Dependencies: Pure Javascript

## Installation
Download or clone this repo and make rclone-watchdog.js executable.

## Usage
```
./rclone-watchdog.js --source=<path> --target=<path>
```

Options:
```
--source=<path>     Directory to sync from
--target=<path>     Directory to sync to
--debounce=<int>    Delay in milliseconds
```

Optionally you can register rclone-watchdog as a systemd service. Use the rclone-watchdog.service.template as reference.

## Dependencies
- [rclone](https://rclone.org/)
- [Node.js](https://nodejs.org/en)
