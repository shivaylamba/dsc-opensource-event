// Generated by CoffeeScript 2.6.1
var handlers, session;

session = require('../../session');

module.exports = {
  name: '@nikitajs/core/lib/plugins/conditions/exists',
  require: ['@nikitajs/core/lib/plugins/conditions'],
  hooks: {
    'nikita:action': {
      after: '@nikitajs/core/lib/plugins/conditions',
      before: '@nikitajs/core/lib/plugins/metadata/disabled',
      handler: async function(action) {
        var final_run, k, local_run, ref, v;
        final_run = true;
        ref = action.conditions;
        for (k in ref) {
          v = ref[k];
          if (handlers[k] == null) {
            continue;
          }
          local_run = (await handlers[k].call(null, action));
          if (local_run === false) {
            final_run = false;
          }
        }
        if (!final_run) {
          return action.metadata.disabled = true;
        }
      }
    }
  }
};

handlers = {
  if_exists: async function(action, value) {
    var condition, err, final_run, i, len, ref;
    final_run = true;
    ref = action.conditions.if_exists;
    for (i = 0, len = ref.length; i < len; i++) {
      condition = ref[i];
      try {
        await session({
          $bastard: true,
          $parent: action
        }, async function() {
          return (await this.fs.base.stat({
            target: condition
          }));
        });
      } catch (error) {
        err = error;
        if (err.code === 'NIKITA_FS_STAT_TARGET_ENOENT') {
          final_run = false;
        } else {
          throw err;
        }
      }
    }
    return final_run;
  },
  unless_exists: async function(action) {
    var condition, err, final_run, i, len, ref;
    final_run = true;
    ref = action.conditions.unless_exists;
    for (i = 0, len = ref.length; i < len; i++) {
      condition = ref[i];
      try {
        await session({
          $bastard: true,
          $parent: action
        }, async function() {
          return (await this.fs.base.stat({
            target: condition
          }));
        });
        final_run = false;
      } catch (error) {
        err = error;
        if (err.code !== 'NIKITA_FS_STAT_TARGET_ENOENT') {
          throw err;
        }
      }
    }
    return final_run;
  }
};
