#!/bin/bash
cd ui/
bun run build

cd ..
bun generate-static-routes.ts