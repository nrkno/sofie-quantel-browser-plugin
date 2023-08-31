# Sofie: The Modern TV News Studio Automation System (tv-automation-quantel-browser-plugin)

A MOS-compatible Quantel and CasparCG Scanner video clip browser for [**Sofie** TV News Studio Automation System](https://github.com/nrkno/Sofie-TV-automation/).

## Requirements

Requires a newer web browser that supports ES modules.

## How to use

`yarn install`

`yarn start`

This will start a web server running on port 9000 serving the contents in `/client` and serving as a proxy to the Quantel Gateway through an `/api` endpoint.

### Alternative usage

There is no building or transpiling required, so alternatively the files in `/client` can simply be copied and served from anywhere. The internal file structure in the folder must be kept intact however.

## Configuration

Plugin configuration is done through environment variables.

| Environment Variable    | Use                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| PORT                    | Specify the port that will be used to server the user interface                                    |
| AGENT                   | Either `quantel` or `casparcg`. Default is `quantel`                                               |
| QUANTEL_TRANSFORMER_URL | The URL for the Quantel HTTP Transformer                                                           |
| CASPARCG_SCANNER_URL    | The URL for the Caspar CG Scanner                                                                  |
| CASPARCG_BASE_PATH      | The publicly-accessible base-path (generally a UNC path) of the files scanned by Caspar CG Scanner |

---

_The NRK logo is a registered trademark of Norsk rikskringkasting AS. The license does not grant any right to use, in any way, any trademarks, service marks or logos of Norsk rikskringkasting AS._
