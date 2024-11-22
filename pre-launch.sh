#!/bin/bash

# Download necessary TFHE files for the Rivet network
curl -o precompiles.json https://raw.githubusercontent.com/zama-ai/fhevm/main/precompiles.json
curl -o tfhe_precompile_abi.json https://raw.githubusercontent.com/zama-ai/fhevm/main/tfhe_precompile_abi.json

# Make sure the script is executable
chmod +x pre-launch.sh