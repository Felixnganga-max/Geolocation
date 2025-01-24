{
    "version": 2,
    "builds": [
      {
        "src": "server.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "server.js"
      }
    ],
    "env": {
      "NODE_VERSION": "18.x"
    },
    "regions": ["all"],
    "framework": "express",
    "outputDirectory": "public"
  }