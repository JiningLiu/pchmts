#!/bin/bash

if [[ $* == *--skip-ui* ]]
then
    echo 
else
    cd ui/
    bun run build
    cd ..
fi

bun generate-static-routes.ts