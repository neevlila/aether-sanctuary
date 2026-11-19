#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  AETHER // LAUNCHING COGNITIVE SANCTUARY"
echo "==================================================="

if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed or not in PATH."
    echo "Install Java 11+ or run via Docker."
    exit 1
fi

echo "[*] Compiling AetherServer.java..."
mkdir -p bin
javac -d bin AetherServer.java

echo "[*] Starting Server on http://localhost:8080 ..."
java -cp bin com.aether.AetherServer
