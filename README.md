# quantel-browser-plugin

MOS compatible Quantel video clip browser for Sofie.

Requires a newer web browser that supports ES modules.

## How to use

`yarn install`

`yarn start`

This will start a web server running on port 9000 serving the contents in `/client` and serving as a proxy to the Quantel Gateway through an `/api` endpoint.

### Alternative usage

There is no building or transpiling required, so alternatively the files in `/client` can simply be copied and served from anywhere. The internal file structure in the folder must be kept intact however.

## Configuration

Plugin configuration is done through environment variables.

| Environment Variable    | Use                                                             |
| ----------------------- | --------------------------------------------------------------- |
| PORT                    | Specify the port that will be used to server the user interface |
| QUANTEL_TRANSFORMER_URL | The URL for the Quantel HTTP Transformer                        |
