// Generated by CoffeeScript 2.6.1
// # `nikita.system.authconfig`

// authconfig provides a simple method of configuring /etc/sysconfig/network to handle NIS, as well as /etc/passwd and /etc/shadow, the files used for shadow password support. Basic LDAP, Kerberos 5, and Winbind client configuration is also provided. 

// ## Example

// Example of a group object:

// ```js
// const {$status} = await nikita.system.authconfig({
//   properties: {
//     mkhomedir: true
//   }
// })
// console.info(`Was the configudation updated ${$status}`)
// ```

// ## Schema definitions
var definitions, diff, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'properties': {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'boolean'
          }
        },
        additionalProperties: false,
        description: `Key/value pairs of the properties to manage.`
      }
    },
    required: ['properties']
  }
};

// ## Handler
handler = async function({config}) {
  var after, before, changes;
  ({
    stdout: before
  } = (await this.execute({
    shy: true,
    command: ['authconfig', '--test'].join(' '),
    trim: true
  })));
  this.execute({
    shy: true,
    command: [
      'authconfig',
      '--update',
      ...(Object.keys(config.properties).map(function(key) {
        if (config.properties[key]) {
          return `--enable${key}`;
        } else {
          return `--disable${key}`;
        }
      }))
    ].join(' ')
  });
  ({
    stdout: after
  } = (await this.execute({
    shy: true,
    command: ['authconfig', '--test'].join(' '),
    trim: true
  })));
  changes = diff.diffLines(before, after, {
    ignoreWhitespace: true
  });
  return changes.some(function(d) {
    return d.added || d.removed;
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
diff = require('diff');
