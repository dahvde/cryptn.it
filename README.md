<p align="center">
    <a href="https://cryptn.it" target="_blank" rel="noopener">
        <img src="https://i.imgur.com/DagbkPo.png" alt="Cryptn.it - Secure temporary text storage" />
    </a>
</p>

<p align="center">
	<a href="https://github.com/dahvde/cryptn.it/blob/main/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/dahvde/cryptn.it?style=for-the-badge"></a>
	<img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/dahvde/cryptn.it/docker-image.yml?style=for-the-badge">
</p>

A simple and open source temporary text storage. With the use of AES encryption, text stored on the server is only accessable with the correct hash and or password. The public webapp allows url hash sizes from 4-32 characters, which can be changed to be smaller or larger when locally hosted. All sensitive text is stored either as a hash or an encrypted string.

# Overview

## How does it work?

```
// Variables are all caps
// Variables surrounded by brackets indicate new variables equal to their adjacent function
// Variables with a questionmark are optional

[TEXT] - getText()

// Url Generation
[Client] (payload: STRLENGTH) -> Server
[Server] Generates a new random url [URL] - randomStr(STRLENGTH)
[Server] URL is hashed then stored in a temp database
[Server] (payload: URL) -> Client

// Encryption
[Client] Uses AES to encrypt text and uses URL as the key [ENCTEXT] - aes(TEXT, RNDSTR+PASSWORD?)
[Client] URL is hashed [HASHURL] - HASH(URL)
[Client] (payload: ENCTEXT, STRLENGTH, HASHURL, ...) -> Server
[Server] Validates that HASHURL is in temp database
[Server] Sql command get executed to store data - SQL(ENCTEXT, HASH, ...)
[Client] Combines URL with the url to direct the users to the stored text - https://cryptn.it/URL
```

## Installation

#### Requirements:

- [docker](https://docs.docker.com/engine/install/)
- git

```
git clone https://github.com/dahvde/cryptn.it
```

```
cd cryptn.it
```

```
docker-compose up -d
```

## Uninstall

```
cd cryptn.it
```

```
docker-compose down --rmi all
```

## HTTPS Requirement

⚠️ **Important:** The Web Crypto API requires a secure context (HTTPS) to function. The application will not work when served over HTTP. If you are running and accessing the application from a single machine then this does not apply.

### Hosting Options

To run the application locally with HTTPS, you can use one of these methods:

1. **Using a Local SSL Certificate**

   ```bash
   mkcert -install
   mkcert localhost
   ```

2. **Using a Reverse Proxy** (e.g., Caddy)

   ```
   # Caddyfile
   localhost {
       reverse_proxy localhost:{PORT}
   }
   ```

3. **Using Local SSL Proxy**
   ```bash
   npm install -g local-ssl-proxy
   local-ssl-proxy --source {APPLICATION_PORT} --target {FORWARD_PORT}
   ```

## Features

### Completed

- [x] End-to-End Encryption
- [x] Text Viewing Interface
- [x] Syntax Highlighting

### In Progress

- [ ] Public Sharing
- [ ] File Uploads (mp3, jpg, ...)
- [ ] Tags
