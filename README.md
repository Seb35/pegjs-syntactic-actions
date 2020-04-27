[![Build Status](https://travis-ci.org/Seb35/pegjs-syntactic-actions.svg?branch=master)](https://travis-ci.org/Seb35/pegjs-syntactic-actions)

pegjs-syntactic-actions
=======================

This [PEG.js](https://pegjs.org) plugin removes all actions in a grammar and adds to rules actions returning text and location.

As a result:

1. any potential bug in actions is removed, making the grammar strictly syntactic;
2. the resulting tree documents captured rules.

When writing complex grammars, it can be useful to first debug syntactic aspects of the grammar with this plugin, then execute the default actions.


Example
-------

```javascript
import pegjs from "pegjs";
import SyntacticActionsPlugin from "pegjs-syntactic-actions";

const parser = pegjs.generate(
  `
    rule = "a"+ ( b / c )+
    b = "b" { return bug; }
    c = "c"
  `,
  {
    plugins: [ new SyntacticActionsPlugin() ]
  }
);

console.log( parser.parse( "aabc" ) );
```

returns:

```json
{
  "rule": "rule",
  "text": "aabc",
  "start": 0,
  "end": 4,
  "children": [
    [
      "a",
      "a"
    ],
    [
      {
        "rule": "b",
        "text": "b",
        "start": 2,
        "end": 3,
        "children": "b"
      },
      {
        "rule": "c",
        "text": "c",
        "start": 3,
        "end": 4,
        "children": "c"
      }
    ]
  ]
}
```

Although it would have returned an error without the plugin:

```
undefined:148
        peg$c4 = function() { return bug; },
                              ^

ReferenceError: bug is not defined
```


Usage
-----

### Installation

```sh
npm install pegjs-syntactic-actions
```

### Use

In the second argument `options` of `pegjs.generate`, add the main object

```javascript
{
  plugins: [ new SyntacticActionsPlugin() ]
}
```

#### Options

It can be given an argument `options` in the constructor. Currently only one is supported:

* `ignoredRules`: array of rules names to be completely ignored (these rules will keep their original actions).

For instance:

```javascript
{
  plugins: [ new SyntacticActionsPlugin( { ignoredRules: [ "rule1" ] } ) ]
}
```

#### Documentation

A JSON schema is included in the `docs` directory, documenting the output of the parser modified by this plugin. Obviously, if there are ignored rules, these rules can detract the validity of the JSON schema.
