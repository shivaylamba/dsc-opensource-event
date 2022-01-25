// Generated by CoffeeScript 2.6.1
// # `nikita.fs.base.lstat`

// Retrieve file information. If path is a symbolic link, then the link itself is
// stated, not the file that it refers to.

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'target': {
        type: 'string',
        description: `Location of the file from where to obtain information.`
      }
    },
    required: ['target']
  }
};

// ## Handler
handler = async function({config}) {
  return (await this.fs.base.stat({
    target: config.target,
    dereference: false
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'target',
    log: false,
    raw_output: true,
    definitions: definitions
  }
};
