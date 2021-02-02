#!/usr/bin/env bash
mkdir -p cert
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '//CN=localhost' -keyout cert/key.pem -out cert/cert.pem