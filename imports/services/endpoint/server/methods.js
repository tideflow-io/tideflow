const url = require('url')
const uuidv4 = require('uuid/v4')

const buildTemplate = (name, _url) => {
  const urlParsed = url.parse(_url)
  let protocol = urlParsed.protocol.replace(':', '')
  let host = urlParsed.hostname
  let port = urlParsed.port || protocol === 'https' ? '443' : '80'
  let pathParts = urlParsed.path.split('/').filter(Boolean)
  let path = pathParts.length ? `["${pathParts.join('","')}"]` : '[]'

  return `{
    "info": {
      "_postman_id": "${uuidv4()}",
      "name": "${name}",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
      {
        "name": "GET",
        "request": {
          "method": "GET",
          "header": [],
          "url": {
            "raw": "${_url}",
            "protocol": "${protocol}",
            "host": [
              "${host}"
            ],
            "port": "${port}",
            "path": ${path}
          }
        },
        "response": []
      },
      {
        "name": "POST",
        "request": {
          "method": "POST",
          "header": [],
          "body": {
            "mode": "raw",
            "raw": "{\\"hello\\": \\"world\\"}",
            "options": {
              "raw": {
                "language": "json"
              }
            }
          },
          "url": {
            "raw": "${_url}",
            "protocol": "${protocol}",
            "host": [
              "${host}"
            ],
            "port": "${port}",
            "path": ${path}
          }
        },
        "response": []
      },
      {
        "name": "PUT",
        "request": {
          "method": "PUT",
          "header": [],
          "body": {
            "mode": "raw",
            "raw": "{\\"hello\\": \\"world\\"}",
            "options": {
              "raw": {
                "language": "json"
              }
            }
          },
          "url": {
            "raw": "${_url}",
            "protocol": "${protocol}",
            "host": [
              "${host}"
            ],
            "port": "${port}",
            "path": ${path}
          }
        },
        "response": []
      },
      {
        "name": "PATCH",
        "request": {
          "method": "PATCH",
          "header": [],
          "body": {
            "mode": "raw",
            "raw": "{\\"hello\\": \\"world\\"}",
            "options": {
              "raw": {
                "language": "json"
              }
            }
          },
          "url": {
            "raw": "${_url}",
            "protocol": "${protocol}",
            "host": [
              "${host}"
            ],
            "port": "${port}",
            "path": ${path}
          }
        },
        "response": []
      },
      {
        "name": "DELETE",
        "request": {
          "method": "DELETE",
          "header": [],
          "url": {
            "raw": "${_url}",
            "protocol": "${protocol}",
            "host": [
              "${host}"
            ],
            "port": "${port}",
            "path": ${path}
          }
        },
        "response": []
      }
    ],
    "protocolProfileBehavior": {}
  }`
}

Meteor.methods({
  's-endpoint.postman': (name, _url) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    return buildTemplate(name, _url)
  }
})