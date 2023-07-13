#!/bin/bash

find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
#pnpm install --shamefully-hoist
pnpm i
