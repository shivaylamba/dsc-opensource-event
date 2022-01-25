// Generated by CoffeeScript 2.6.1
var is_object, is_object_literal, utils;

({is_object, is_object_literal} = require('mixme'));

utils = require('../../utils');

module.exports = {
  name: '@nikitajs/core/lib/plugins/output/status',
  require: ['@nikitajs/core/lib/plugins/history', '@nikitajs/core/lib/plugins/metadata/raw'],
  // status is set to `false` when action is disabled
  recommand: ['@nikitajs/core/lib/plugins/metadata/disabled'],
  hooks: {
    // 'nikita:registry:normalize': (action) ->
    //   action.metadata ?= {}
    //   action.metadata.shy ?= false
    'nikita:normalize': function(action) {
      if (action.tools == null) {
        action.tools = {};
      }
      return action.tools.status = function(index) {
        var i, l, sibling;
        if (arguments.length === 0) {
          return action.children.some(function(sibling) {
            var ref;
            return !sibling.metadata.shy && ((ref = sibling.output) != null ? ref.$status : void 0) === true;
          });
        } else {
          l = action.children.length;
          i = index < 0 ? l + index : index;
          sibling = action.children[i];
          if (!sibling) {
            throw Error(`Invalid Index ${index}`);
          }
          return sibling.output.$status;
        }
      };
    },
    'nikita:result': {
      before: '@nikitajs/core/lib/plugins/history',
      handler: function({action, error, output}) {
        var inherit;
        // Honors the disabled plugin, status is `false`
        // when the action is disabled
        if (action.metadata.disabled) {
          arguments[0].output = {
            $status: false
          };
          return;
        }
        inherit = function(output) {
          if (output == null) {
            output = {};
          }
          output.$status = action.children.some(function(child) {
            var ref;
            if (child.metadata.shy) {
              return false;
            }
            return ((ref = child.output) != null ? ref.$status : void 0) === true;
          });
          return output;
        };
        if (!error && !action.metadata.raw_output) {
          return arguments[0].output = (function() {
            var ref;
            if (typeof output === 'boolean') {
              return {
                $status: output
              };
            } else if (is_object_literal(output)) {
              if (output.hasOwnProperty('$status')) {
                output.$status = !!output.$status;
                return output;
              } else {
                return inherit(output);
              }
            } else if (output === null) {
              return output;
            } else if (output == null) {
              return inherit(output);
            } else if (is_object(output)) {
              return output;
            } else if (Array.isArray(output) || ((ref = typeof output) === 'string' || ref === 'number')) {
              return output;
            } else {
              throw utils.error('HANDLER_INVALID_OUTPUT', ['expect a boolean or an object or nothing', 'unless the `raw_output` configuration is activated,', `got ${JSON.stringify(output)}`]);
            }
          })();
        }
      }
    }
  }
};