<p align="center">
    <a href="https://cryptn.it" target="_blank" rel="noopener">
        <img src="https://i.imgur.com/DagbkPo.png" alt="Cryptn.it - Secure temporary text storage" />
    </a>
</p>

<p align="center">
	<a href="https://github.com/dahvde/cryptn.it/blob/main/LICENSE">
		<img alt="GitHub License" src="https://img.shields.io/github/license/dahvde/cryptn.it?style=for-the-badge">
    	</a>
	<img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/dahvde/cryptn.it/docker-image.yml?style=for-the-badge">
</p>

A simple and open source temporary text storage. With the use of AES encryption, text stored on the server is only accessable with the correct hash and or password. The public webapp allows url hash sizes from 4-32 characters, which can be changed to be smaller or larger when locally hosted.

# Overview

## How does it work?

```
// Variables are all caps
// Variables surrounded by brackets indicate new variables equal to their adjacent function
// Variables with a questionmark are optional

[Client] (payload: TEXT, STRLENGTH, PASSWORD?, ...) -> Server
  [Server] Generates a random string of characters [RNDSTR] - randomStr(STRLENGTH)
  [Server] Uses AES to encrypt text and uses RNDSTR as the password [ENCTEXT] - aes(TEXT, RNDSTR+PASSWORD?)
  [Server] RNDSTR then gets put into a SHA256 hashing function [HASH] - sha256(RNDSTR)
  [Server] Sql command get executed to store data - SQL(ENCTEXT, HASH, ...)
  [Server] Returns RNDSTR to the client
[Client] Combines RNDSTR with the url to direct the users to the stored text - https://cryptn.it/RNDSTR
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

## Future Updates

- Integrate zero-knowledge
- Allow data to be changed
- Add UI for text viewing
- Allow for public sharing
