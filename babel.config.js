module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],'@babel/preset-typescript'
    ],
    "env": {
        "test": {
            "presets": [
                [
                    "env",
                    {
                        "modules": "commonjs",
                        "useBuiltIns": "usage",
                        "debug": false
                    }
                ],
                "stage-0",
                "react",
                "jest"
            ],
            "plugins": [
                "lodash",
                "transform-decorators-legacy",
                "transform-class-properties",
                "transform-es2015-modules-commonjs"
            ]
        }
    }
  };