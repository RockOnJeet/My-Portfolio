# Spotify Backend

This directory contains a clean backend implementation for Cloudflare or similar server-side runtime.

## What it includes
- decrypting an encrypted Spotify refresh token
- refreshing Spotify access tokens using the Spotify token endpoint
- retrying Spotify API requests on 429/502/503/504 with exponential backoff
- fetching `/v1/me/player` and `/v1/me/player/queue`

## Environment variables
The backend expects the following environment variables:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_TOKEN_ENCRYPTED`
- `SPOTIFY_TOKEN_KEY`

## No auth flow
This directory deliberately contains no OAuth start/callback/auth admin flow. It is meant to be used with a refresh token encrypted and supplied through environment variables only.

## Usage
Import `getSpotifyConsolePayload` from `src/backend/spotify/index.ts` and use it in a server runtime handler to power your `/spotify` or API endpoint.

A sample Cloudflare Pages endpoint is available at `functions/api/spotify/console.ts` and exposes the data as JSON without exposing any secrets.
