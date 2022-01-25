// Generated by CoffeeScript 2.6.1
// # `nikita.krb5.ktadd`

// Create and manage a keytab. This function is usually not used directly but instead
// called by the `krb5.addprinc` function.

// ## Example

// ```js
// const {$status} = await nikita.krb5.ktadd({
//   principal: 'myservice/my.fqdn@MY.REALM',
//   keytab: '/etc/security/keytabs/my.service.keytab',
// })
// console.info(`keytab was created or updated: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler, mutate, path, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'admin': {
        $ref: 'module://@nikitajs/krb5/lib/execute#/definitions/config/properties/admin'
      },
      'gid': {
        $ref: 'module://@nikitajs/file/src/index#/definitions/config/properties/gid'
      },
      'keytab': {
        type: 'string',
        description: `Path to the file storing key entries.`
      },
      'mode': {
        $ref: 'module://@nikitajs/file/src/index#/definitions/config/properties/mode'
      },
      'principal': {
        type: 'string',
        description: `Principal to be created.`
      },
      'realm': {
        type: 'string',
        description: `The realm the principal belongs to.`
      },
      'uid': {
        $ref: 'module://@nikitajs/file/src/index#/definitions/config/properties/uid'
      }
    },
    required: ['keytab', 'principal']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var $status, _, i, keytab, kvno, len, line, match, mdate, princ, principal, ref, ref1, ref2, ref3, ref4, ref5, stdout, values;
  if (/^\S+@\S+$/.test(config.admin.principal)) {
    if (config.realm == null) {
      config.realm = config.admin.principal.split('@')[1];
    }
  } else {
    if (!config.realm) {
      throw Error('Property "realm" is required unless present in principal');
    }
    config.principal = `${config.principal}@${config.realm}`;
  }
  keytab = {}; // keytab[principal] ?= {kvno: null, mdate: null}
  princ = {}; // {kvno: null, mdate: null}
  // Get keytab information
  ({$status, stdout} = (await this.execute({
    $shy: true,
    command: `export TZ=GMT; klist -kt ${config.keytab}`,
    code_skipped: 1
  })));
  if ($status) {
    log({
      message: "Keytab exists, check kvno validity",
      level: 'DEBUG'
    });
    ref = utils.string.lines(stdout);
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      if (!(match = /^\s*(\d+)\s+([\d\/:]+\s+[\d\/:]+)\s+(.*)\s*$/.exec(line))) {
        continue;
      }
      [_, kvno, mdate, principal] = match;
      kvno = parseInt(kvno, 10);
      mdate = Date.parse(`${mdate} GMT`);
      // keytab[principal] ?= {kvno: null, mdate: null}
      if (!keytab[principal] || keytab[principal].kvno < kvno) {
        keytab[principal] = {
          kvno: kvno,
          mdate: mdate
        };
      }
    }
  }
  // Get principal information
  if (keytab[config.principal] != null) {
    ({$status, stdout} = (await this.krb5.execute({
      $shy: true,
      admin: config.admin,
      command: `getprinc -terse ${config.principal}`
    })));
    if ($status) {
      // return do_ktadd() unless -1 is stdout.indexOf 'does not exist'
      values = utils.string.lines(stdout)[1];
      if (!values) {
        // Check if a ticket exists for this
        throw Error(`Principal does not exist: '${config.principal}'`);
      }
      values = values.split('\t');
      mdate = parseInt(values[2], 10) * 1000;
      kvno = parseInt(values[8], 10);
      princ = {
        mdate: mdate,
        kvno: kvno
      };
      log({
        message: `Keytab kvno '${(ref1 = keytab[config.principal]) != null ? ref1.kvno : void 0}', principal kvno '${princ.kvno}'`,
        level: 'INFO'
      });
      log({
        message: `Keytab mdate '${new Date((ref2 = keytab[config.principal]) != null ? ref2.mdate : void 0)}', principal mdate '${new Date(princ.mdate)}'`,
        level: 'INFO'
      });
    }
  }
  // Remove principal from keytab
  if ((keytab[config.principal] != null) && (((ref3 = keytab[config.principal]) != null ? ref3.kvno : void 0) !== princ.kvno || keytab[config.principal].mdate !== princ.mdate)) {
    await this.krb5.execute({
      admin: config.admin,
      command: `ktremove -k ${config.keytab} ${config.principal}`
    });
  }
  // Create keytab and add principal
  if ((keytab[config.principal] == null) || (((ref4 = keytab[config.principal]) != null ? ref4.kvno : void 0) !== princ.kvno || keytab[config.principal].mdate !== princ.mdate)) {
    await this.fs.mkdir({
      target: `${path.dirname(config.keytab)}`
    });
  }
  if ((keytab[config.principal] == null) || (((ref5 = keytab[config.principal]) != null ? ref5.kvno : void 0) !== princ.kvno || keytab[config.principal].mdate !== princ.mdate)) {
    await this.krb5.execute({
      admin: config.admin,
      command: `ktadd -k ${config.keytab} ${config.principal}`
    });
  }
  // Keytab ownership and permissions
  if ((config.uid != null) || (config.gid != null)) {
    await this.fs.chown({
      target: config.keytab,
      uid: config.uid,
      gid: config.gid
    });
  }
  if (config.mode != null) {
    return (await this.fs.chmod({
      target: config.keytab,
      mode: config.mode
    }));
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'krb5',
    definitions: definitions
  }
};

// ## Fields in 'getprinc -terse' output

// princ-canonical-name
// princ-exp-time
// last-pw-change
// pw-exp-time
// princ-max-life
// modifying-princ-canonical-name
// princ-mod-date
// princ-attributes <=== This is the field you want
// princ-kvno
// princ-mkvno
// princ-policy (or 'None')
// princ-max-renewable-life
// princ-last-success
// princ-last-failed
// princ-fail-auth-count
// princ-n-key-data
// ver
// kvno
// data-type[0]
// data-type[1]

// ## Dependencies
path = require('path');

utils = require('@nikitajs/core/lib/utils');

({mutate} = require('mixme'));
