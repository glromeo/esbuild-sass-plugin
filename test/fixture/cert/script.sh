# https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/

openssl genrsa -out codebite.key 2048
openssl req -x509 -new -nodes -key codebite.key -sha256 -days 1825 -out codebite.pem
openssl genrsa -out localhost.key 2048
openssl req -new -key localhost.key -out localhost.csr
openssl x509 -req  -in localhost.csr -CA codebite.pem -CAkey codebite.key -CAcreateserial -out localhost.crt -days 1825 -sha256 -extfile localhost.ext