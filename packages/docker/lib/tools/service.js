// Generated by CoffeeScript 2.6.1
// # `nikita.docker.tools.service`

// Run a container in a service mode. This module is just a wrapper for
// `docker.run`. It declares the same configuration with the exeception of the
// properties `detach` and `rm` which respectively default to `true` and `false`.

// Indeed, in a service mode, the container must be detached and NOT removed by default
// after execution. 

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    allOf: [
      {
        properties: {
          'detach': {
            default: true
          },
          'rm': {
            default: false
          }
        }
      },
      {
        $ref: 'module://@nikitajs/docker/lib/run'
      }
    ],
    required: ['container', 'image']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {find, log}
  }) {
  var k, ref, v;
  // Global config
  config.docker = (await find(function({
      config: {docker}
    }) {
    return docker;
  }));
  ref = config.docker;
  for (k in ref) {
    v = ref[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  // Normalization
  if (config.detach == null) {
    config.detach = true;
  }
  if (config.rm == null) {
    config.rm = false;
  }
  // Validation
  return (await this.docker.run(config));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};