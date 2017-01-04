all: em-x509.js

#CFLAGS = -O1
CFLAGS = -Os -s AGGRESSIVE_VARIABLE_ELIMINATION=1 --closure 1

em-x509.js: main.cpp libcrypto.a Makefile
	em++ --bind main.cpp -I ../openssl/include -std=c++11 -lcrypto -L./ -o em-x509.js $(CFLAGS)
	@sed -i 's/"em-x509.js.mem"/__dirname + "\/em-x509.js.mem"/' em-x509.js
	@sed -i 's/"uncaughtException"/"em_uncaughtException"/' em-x509.js