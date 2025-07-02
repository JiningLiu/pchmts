#!/usr/bin/env bash

echo "[pchmts] > Welcome to the pchmts installer."

if [[ "$1" == "--skip-dependencies" ]]; then
    echo "[pchmts] > Skipping dependencies install/update."
else
    echo "[pchmts] > pchmts requires libcamera-apps and ffmpeg to be installed on your Pi."

    read -p "[pchmts] > Do you want to install/update libcamera-apps and ffmpeg now? (y/N): " update_choice </dev/tty

    if [[ "$update_choice" == "y" || "$update_choice" == "Y" ]]; then
        echo "[pchmts] > Updating libcamera-apps and ffmpeg..."
        sudo apt-get update
        sudo apt-get install -y libcamera-apps ffmpeg
    else
        echo "[pchmts] > You must have a recent version of libcamera-apps and ffmpeg installed to use pchmts."
        echo "[pchmts] > Please install or update them manually."
        echo "[pchmts] > Exiting installer."
        exit 1
    fi
fi

echo "[pchmts] > Installing pchmts..."

mkdir -p ~/.pchmts/bin
cd ~/.pchmts/bin
curl -LO https://github.com/JiningLiu/pchmts/releases/download/v0.0.1/pchmts
chmod +x pchmts

if ! grep -q 'export PATH="$HOME/.pchmts/bin:$PATH"' ~/.bashrc; then
    echo 'export PATH="$HOME/.pchmts/bin:$PATH"' >>~/.bashrc
    echo "[pchmts] > Added pchmts to your PATH in ~/.bashrc."
else
    echo "[pchmts] > pchmts is already in your PATH."
fi

echo "[pchmts] > Installation complete!"
echo '[pchmts] > Please run "source ~/.bashrc" to update your current shell session.'
echo "[pchmts] > Exiting installer."
exit 0
