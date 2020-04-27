/**
 * Syntactic actions plugin.
 *
 * This manipulation converts a PEG.js grammar containing arbitrary actions
 * into a raw syntactic tree without actions except actions at the root
 * of each rule labelling the rule and position captured.
 *
 * The resulting grammar is garanteed without bugs inside the actions (but it
 * can remain bugs inside the grammar itself).
 *
 * See docs/schema.json for the JSON schema of the output modified by this parser.
 */

"use strict";

function SyntacticActionsPlugin( options ) {

  this.options = options;
}

SyntacticActionsPlugin.prototype.use = function( session ) {

  const stage = session.passes.transform;
  stage.unshift( syntacticActions( this.options ) );
};

function syntacticActions( options ) {

  const ignoredRules = options && Array.isArray( options.ignoredRules ) ? options.ignoredRules : [];

  return function( ast ) {

    function recursiveRemoveAction( rule ) {
      if( rule.type === "action" || rule.type === "labeled" ) {
        rule = rule.expression;
      }
      if( rule.expression ) {
        rule.expression = recursiveRemoveAction( rule.expression );
      }
      if( rule.alternatives ) {
        rule.alternatives = rule.alternatives.map( recursiveRemoveAction );
      }
      if( rule.elements ) {
        rule.elements = rule.elements.map( recursiveRemoveAction );
      }

      return rule;
    }

    ast.rules = ast.rules.map(
      function( rule ) {
        if( ignoredRules.indexOf( rule.name ) === -1 ) {
          rule.expression = recursiveRemoveAction( rule.expression );
        }
        return rule;
      }
    );

    ast.rules = ast.rules.map(
      function( rule ) {
        if( ignoredRules.indexOf( rule.name ) === -1 ) {
          const name = rule.name.replace( /\\/g, "\\\\" ).replace( /"/g, "\\\"" );
          rule.expression = { type: "labeled", label: "children", expression: rule.expression };
          rule.expression = { type: "action", code: "const l = location(); return { rule: \"" + name + "\", text: text(), start: l.start.offset, end: l.end.offset, children };", expression: rule.expression };
        }
        return rule;
      }
    );

    delete ast.initializer;
  };
}

module.exports = SyntacticActionsPlugin;

// vim: set ts=2 sw=2 sts=2 et:
