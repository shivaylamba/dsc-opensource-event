// Generated by CoffeeScript 2.6.1
// # `nikita.ldap.add`

// Insert or modify an entry inside an OpenLDAP server.   

// ## Example

// ```js
// const {$status} = await nikita.ldap.index({
//   uri: 'ldap://openldap.server/',
//   binddn: 'cn=admin,cn=config',
//   passwd: 'password',
//   entry: {
//     dn: 'cn=group1,ou=groups,dc=company,dc=com'
//     cn: 'group1'
//     objectClass: 'top'
//     objectClass: 'posixGroup'
//     gidNumber: 9601
//   }
// })
// console.info(`Entry modified: ${$status}`)
// ```

// ## Hooks
var definitions, handler, on_action, utils;

on_action = function({config}) {
  if (!Array.isArray(config.entry)) {
    return config.entry = [config.entry];
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'entry': {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            'dn': {
              type: 'string',
              description: `Distinguish name of the entry`
            }
          },
          required: ['dn']
        },
        description: `Object to be inserted or modified.`
      },
      // General LDAP connection information
      'binddn': {
        type: 'string',
        description: `Distinguished Name to bind to the LDAP directory.`
      },
      'mesh': {
        type: 'string',
        description: `Specify the SASL mechanism to be used for authentication. If it's not
specified, the program will choose the best  mechanism  the  server
knows.`
      },
      'passwd': {
        type: 'string',
        description: `Password for simple authentication.`
      },
      'uri': {
        type: 'string',
        description: `LDAP Uniform Resource Identifier(s), "ldapi:///" if true, default to
false in which case it will use your openldap client environment
configuration.`
      }
    },
    required: ['entry']
  }
};

// ## Handler
handler = async function({config}) {
  var $status, _, entry, i, j, k, ldif, len, len1, original, ref, stderr, stdout, uri, v, vv;
  // Auth related config
  // binddn = if config.binddn then "-D #{config.binddn}" else ''
  // passwd = if config.passwd then "-w #{config.passwd}" else ''
  // config.uri = 'ldapi:///' if config.uri is true
  if (config.uri === true) {
    if (config.mesh == null) {
      config.mesh = 'EXTERNAL';
    }
    config.uri = 'ldapi:///';
  }
  uri = config.uri ? `-H ${config.uri}` : ''; // URI is obtained from local openldap conf unless provided
  // Add related config
  ldif = '';
  ref = config.entry;
  for (i = 0, len = ref.length; i < len; i++) {
    entry = ref[i];
    // Check if record already exists
    ({$status, stdout} = (await this.ldap.search(config, {
      base: entry.dn,
      code_skipped: 32, // No such object
      scope: 'base'
    })));
    original = {};
    if ($status) {
      continue;
    }
    // throw Error "Nikita `ldap.add`: required property 'dn'" unless entry.dn
    ldif += '\n';
    ldif += `dn: ${entry.dn}\n`;
    ldif += 'changetype: add\n';
    [_, k, v] = /^(.*?)=(.+?),.*$/.exec(entry.dn);
    ldif += `${k}: ${v}\n`;
    if (entry[k]) {
      if (entry[k] !== v) {
        throw Error(`Inconsistent value: ${entry[k]} is not ${v} for attribute ${k}`);
      }
      delete entry[k];
    }
    for (k in entry) {
      v = entry[k];
      if (k === 'dn') {
        continue;
      }
      if (!Array.isArray(v)) {
        v = [v];
      }
      for (j = 0, len1 = v.length; j < len1; j++) {
        vv = v[j];
        ldif += `${k}: ${vv}\n`;
      }
    }
  }
  return ({stdout, stderr} = (await this.execute({
    $if: ldif !== '',
    command: [
      ['ldapmodify',
      config.continuous ? '-c' : void 0,
      config.mesh ? `-Y ${utils.string.escapeshellarg(config.mesh)}` : void 0,
      config.binddn ? `-D ${utils.string.escapeshellarg(config.binddn)}` : void 0,
      config.passwd ? `-w ${utils.string.escapeshellarg(config.passwd)}` : void 0,
      config.uri ? `-H ${utils.string.escapeshellarg(config.uri)}` : void 0].join(' '),
      `<<-EOF
${ldif}
EOF`
    ].join(' ')
  })));
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    global: 'ldap',
    definitions: definitions
  }
};

// ## Dependencies
utils = require('./utils');
