#/bin/bash

zokrates compile -i square.code --verbose
zokrates setup --verbose
zokrates compute-witness -a $1 $2 --verbose
zokrates generate-proof --verbose -j $3
