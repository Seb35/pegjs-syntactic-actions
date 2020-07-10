"use strict";

const assert = require( "assert" ).strict;
const pegjs = require( "pegjs" );
const SyntacticActionsPlugin = require( "../index.js" );


suite( "Base", function() {

  test( "Simple tests without actions", function() {

    const grammar = "entry = \"a\" / \"b\"";

    assert.deepEqual(
      pegjs.generate( grammar ).parse( "a" ),
      "a",
      "Without the plugin"
    );

    assert.deepEqual(
      pegjs.generate( grammar, { plugins: [ new SyntacticActionsPlugin() ] } ).parse( "a" ),
      { rule: "entry", text: "a", start: 0, end: 1, children: "a" },
      "With the plugin"
    );

  } );

  test( "Simple tests with actions", function() {

    const grammar = "entry = \"a\" { return 1; } / \"b\" { return 2; }";

    assert.deepEqual(
      pegjs.generate( grammar ).parse( "a" ),
      1,
      "Without the plugin"
    );

    assert.deepEqual(
      pegjs.generate( grammar, { plugins: [ new SyntacticActionsPlugin() ] } ).parse( "a" ),
      { rule: "entry", text: "a", start: 0, end: 1, children: "a" },
      "With the plugin"
    );

  } );

  test( "Multiple rules with actions", function() {

    const grammar = "entry = \"(\" b:content* \")\" { return { type: \"parentheses\", content: b }; }\ncontent = \"a\" { return 97; } / \"b\" { return 98; }";

    assert.deepEqual(
      pegjs.generate( grammar ).parse( "(abba)" ),
      { type: "parentheses", content: [ 97, 98, 98, 97 ] },
      "Without the plugin"
    );

    assert.deepEqual(
      pegjs.generate( grammar, { plugins: [ new SyntacticActionsPlugin() ] } ).parse( "(abba)" ),
      { rule: "entry", text: "(abba)", start: 0, end: 6, children: [
        "(",
        [
          { rule: "content", text: "a", start: 1, end: 2, children: "a" },
          { rule: "content", text: "b", start: 2, end: 3, children: "b" },
          { rule: "content", text: "b", start: 3, end: 4, children: "b" },
          { rule: "content", text: "a", start: 4, end: 5, children: "a" },
        ],
        ")"
      ] },
      "With the plugin"
    );

  } );

  test( "One rule with a bug", function() {

    const grammar = "entry = \"(\" b:content* \")\" { return { type: \"parentheses\", content: b }; }\ncontent = \"a\" { return bug; } / \"b\" { return 98; }";

    assert.throws(
      function() {
        pegjs.generate( grammar ).parse( "(abba)" );
      },
      ReferenceError,
      "Bug in the rule 'content'"
    );

    assert.deepEqual(
      pegjs.generate( grammar, { plugins: [ new SyntacticActionsPlugin() ] } ).parse( "(abba)" ),
      { rule: "entry", text: "(abba)", start: 0, end: 6, children: [
        "(",
        [
          { rule: "content", text: "a", start: 1, end: 2, children: "a" },
          { rule: "content", text: "b", start: 2, end: 3, children: "b" },
          { rule: "content", text: "b", start: 3, end: 4, children: "b" },
          { rule: "content", text: "a", start: 4, end: 5, children: "a" },
        ],
        ")"
      ] },
      "Removed bug in the rule 'content'"
    );

  } );

  test( "Rule with label then action (bug fixed in 9c01626 published in 0.1.4)", function() {

    const grammar = "entry = a : ( b : \"a\" { return b; } )";

    assert.deepEqual(
      pegjs.generate( grammar ).parse( "a" ),
      "a",
      "Without the plugin"
    );

    assert.deepEqual(
      pegjs.generate( grammar, { plugins: [ new SyntacticActionsPlugin() ] } ).parse( "a" ),
      { rule: "entry", text: "a", start: 0, end: 1, children: "a" },
      "With the plugin"
    );

  } );

} );

// vim: set ts=2 sw=2 sts=2 et:
