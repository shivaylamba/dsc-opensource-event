// Generated by CoffeeScript 2.6.1
module.exports = function({config}) {
  return this.lxc.stop({
    $header: 'Container stop',
    container: `${config.container}`
  });
};
