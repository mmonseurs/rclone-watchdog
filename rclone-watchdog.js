#!/usr/bin/env node

import { watch } from 'node:fs';
import { spawn } from 'child_process';

// Global vars
let debounceMs = 2000;
let debounceTimeout = null;
let currentSync = null;
let queuedSync = false;

const log = (message) => console.log(`${new Date().toISOString()}  ${message}`);
const logErr = (message) => {
	console.error(message);
	process.exit(1);
}
const getArgs = () =>
  // Source - https://stackoverflow.com/a
  // Posted by Michael Warner, modified by community. See post 'Timeline' for change history
  // Retrieved 2025-12-16, License - CC BY-SA 4.0
  process.argv.reduce((args, arg) => {
    // long arg
    if (arg.slice(0, 2) === "--") {
      const longArg = arg.split("=");
      const longArgFlag = longArg[0].slice(2);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === "-") {
      const flags = arg.slice(1).split("");
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
    return args;
  }, {});
const args = getArgs();

// Check input parameters
if (args.source == undefined) logErr('Missing source directory!');
if (args.target == undefined) logErr('Missing target directory!');
if (args.debounce != undefined) {
	if (parseInt(args.debounce)) {
		debounceMs = args.debounce;
	} else {
		logErr('Debounce expects an integer representing milliseconds!');
	}
}  

function runSync() {
	if (currentSync) {
		log('Already syncing, skipping...');
		return;
	}
    log(`Syncing ${args.source} → ${args.target}`);
	currentSync = spawn('rclone', ['sync', args.source, args.target], {
		stdio: ['ignore', 'pipe', 'pipe']
	});
	currentSync.stderr.on('data', (data) => process.stdout.write(data));
	currentSync.stdout.on('data', (data) => process.stdout.write(data));

	currentSync.on('exit', (code) => {
		log(`Synchronized [${code.toString()}]`);
		currentSync = null;
		if (queuedSync) {
			queuedSync = false;
			log('Running queued sync:')
			runSync();
		}
	});
}

log(`Watching for changes in "${args.source}" to sync to "${args.target}" (debounce: ${debounceMs}ms)...`);
watch("/media", { recursive: true }, (eventType, filename) => {
	if (debounceTimeout) clearTimeout(debounceTimeout);
	log('Change detected!');

	debounceTimeout = setTimeout(() => {
		if (currentSync === null) {
			runSync();
		} else {
			queuedSync = true;
			log('Sync in progress, queued. Still syncing...');
		}
	}, debounceMs); 
});
