// Generated by CoffeeScript 1.7.1
(function() {
  var CongressEditors, Twit, argv, cheerio, loadJson, main, minimist, request, wikichanges;

  Twit = require('twit');

  cheerio = require('cheerio');

  request = require('request');

  minimist = require('minimist');

  wikichanges = require('wikichanges');

  CongressEditors = (function() {
    function CongressEditors(config) {
      this.config = config;
      this.lastChange = {};
      this.pages = {};
    }

    CongressEditors.prototype.run = function() {
      var wikipedia;
      this._update(this.config.refresh, (function(_this) {
        return function() {
          return console.log("monitoring " + (Object.keys(_this.pages).length) + " pages");
        };
      })(this));
      wikipedia = new wikichanges.WikiChanges({
        ircNickname: this.config.nick
      });
      return wikipedia.listen((function(_this) {
        return function(edit) {
          return _this.inspect(edit);
        };
      })(this));
    };

    CongressEditors.prototype.inspect = function(edit) {
      var status, twitter;
      if (this.pages[edit.page] && Math.abs(edit.delta) > 10 && !this._isRepeat(edit)) {
        twitter = new Twit(this.config);
        status = this.getStatus(edit);
        console.log(status);
        return twitter.post('statuses/update', {
          status: status
        }, function(err) {
          if (err) {
            return console.log(err);
          }
        });
      }
    };

    CongressEditors.prototype._getStatus = function(edit) {
      var status, statusLength, title, titleLength, user;
      title = edit.page;
      user = edit.anonymous ? "Anonymous" : edit.user;
      status = "" + title + " Wikipedia article edited by " + user + " ";
      statusLength = status.length + 22;
      if (statusLength > 140) {
        titleLength = title.length - (statusLength - 140);
        title = title.slice(0, +titleLength + 1 || 9e9);
      }
      return status = ("" + title + " Wikipedia article edited by " + user + " ") + edit.url;
    };

    CongressEditors.prototype._update = function(refresh) {
      var newPages;
      newPages = [];
      return this._getHouse((function(_this) {
        return function(names) {
          var name, _i, _len;
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            newPages[name] = true;
          }
          return _this._getSenate(function(names) {
            var _j, _len1;
            for (_j = 0, _len1 = names.length; _j < _len1; _j++) {
              name = names[_j];
              newPages[name] = true;
            }
            return _this._getBills(function(bills) {
              var bill, doUpdate, _k, _len2;
              for (_k = 0, _len2 = bills.length; _k < _len2; _k++) {
                bill = bills[_k];
                newPages[bill] = true;
              }
              _this.pages = newPages;
              console.log("monitoring " + (Object.keys(_this.pages).length) + " pages");
              doUpdate = function() {
                return _this._update(refresh);
              };
              return setTimeout(doUpdate, refresh * 1000);
            });
          });
        };
      })(this));
    };

    CongressEditors.prototype._isRepeat = function(edit) {
      var k, r, v;
      k = "" + edit.wikipedia;
      v = "" + edit.page + ":" + edit.user;
      r = this.lastChange[k] === v;
      this.lastChange[k] = v;
      return r;
    };

    CongressEditors.prototype._getHouse = function(callback) {
      var url;
      url = 'https://en.wikipedia.org/wiki/List_of_current_members_of_the_United_States_House_of_Representatives_by_age_and_generation';
      return this._getNames(url, callback);
    };

    CongressEditors.prototype._getSenate = function(callback) {
      var url;
      url = 'https://en.wikipedia.org/wiki/List_of_current_United_States_Senators';
      return this._getNames(url, callback);
    };

    CongressEditors.prototype._getBills = function(callback) {
      var bills, url;
      url = this.config.congress;
      bills = [];
      return this._getDom(url, function($) {
        $('table[class="wikitable"] tr').each(function() {
          var a, p, _i, _len, _ref;
          p = [];
          _ref = $(this).find('td a');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            a = _ref[_i];
            if ($(a).attr('href').match(/^\/wiki\/(.+)$/)) {
              p.push($(a).attr('title'));
            }
          }
          return bills.push(p[0]);
        });
        return callback(bills);
      });
    };

    CongressEditors.prototype._getNames = function(url, callback) {
      return this._getDom(url, function($) {
        var names;
        names = [];
        $('span[class="fn"] a').each(function() {
          return names.push($(this).attr('title'));
        });
        return callback(names);
      });
    };

    CongressEditors.prototype._getDom = function(url, callback) {
      return request(url, (function(_this) {
        return function(err, response, body) {
          var names;
          if (err) {
            console.log(err);
            return;
          }
          names = [];
          return callback(cheerio.load(body));
        };
      })(this));
    };

    return CongressEditors;

  })();

  loadJson = function(path) {
    if (path[0] !== '/' && path.slice(0, 2) !== './') {
      path = './' + path;
    }
    return require(path);
  };

  argv = minimist(process.argv.slice(2), {
    "default": {
      verbose: false,
      config: './config.json'
    }
  });

  main = function() {
    var c, config;
    config = loadJson(argv.config);
    c = new CongressEditors(config);
    return c.run();
  };

  if (require.main === module) {
    main();
  }

}).call(this);