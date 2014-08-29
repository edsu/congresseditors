#!/usr/bin/env coffee

Twit          = require 'twit'
cheerio       = require 'cheerio'
request       = require 'request'
minimist      = require 'minimist'
wikichanges   = require 'wikichanges'

class CongressEditors

  constructor: (@config) ->
    @lastChange = {}
    @pages = {}

  run: ->
    this._update @config.refresh, =>
      console.log "monitoring #{Object.keys(@pages).length} pages"
    wikipedia = new wikichanges.WikiChanges
      ircNickname: @config.nick
      wikipedias: ["#en.wikipedia"]
    wikipedia.listen (edit) =>
      this.inspect(edit)

  inspect: (edit) ->
    if @pages[edit.page] and Math.abs(edit.delta) > 10 and not this._isRepeat edit
      twitter = new Twit @config
      status = this.getStatus edit
      console.log status
      twitter.post 'statuses/update', status: status, (err) ->
        console.log err if err

  _getStatus: (edit) ->
    title = edit.page
    user = if edit.anonymous then "Anonymous" else edit.user
    status = "#{title} Wikipedia article edited by #{user} "
    # shorten the title if status is going to be too big
    statusLength = status.length + 22 # after t.co url added
    if statusLength > 140
      titleLength = title.length - (statusLength - 140)
      title = title[0..titleLength]
    status = "#{title} Wikipedia article edited by #{user} " + edit.url
    
  _update: (refresh) ->
    newPages = []
    this._getHouse (names) =>
      for name in names
        newPages[name] = true
      this._getSenate (names) =>
        for name in names
          newPages[name] = true
        this._getBills (bills) =>
          for bill in bills
            newPages[bill] = true
          @pages = newPages
          console.log "monitoring #{ Object.keys(@pages).length } pages"

          # schedule next update
          doUpdate = =>
            this._update(refresh)
          setTimeout doUpdate, refresh * 1000

  _isRepeat: (edit) ->
    k = "#{edit.wikipedia}"
    v = "#{edit.page}:#{edit.user}"
    r = @lastChange[k] == v
    @lastChange[k] = v
    return r

  _getHouse: (callback) ->
    url = 'https://en.wikipedia.org/wiki/List_of_current_members_of_the_United_States_House_of_Representatives_by_age_and_generation'
    this._getNames url, callback

  _getSenate: (callback) ->
    url = 'https://en.wikipedia.org/wiki/List_of_current_United_States_Senators'
    this._getNames url, callback

  _getBills: (callback) ->
    url = this.config.congress
    bills = []
    this._getDom url, ($) ->
      $('table[class="wikitable"] tr').each ->
        p = []
        for a in $(this).find('td a')
          if $(a).attr('href').match(/^\/wiki\/(.+)$/)
            p.push $(a).attr 'title'
        # assume first link to wikipedia in table row is for the bill
        bills.push p[0]
      callback bills

  _getNames: (url, callback) ->
    this._getDom url, ($) ->
      names = []
      $('span[class="fn"] a').each ->
        names.push $(this).attr('title')
      callback names

  _getDom: (url, callback) ->
    request url, (err, response, body) =>
      if err
        console.log err
        return
      names = []
      callback cheerio.load body

loadJson = (path) ->
  if path[0] != '/' and path[0..1] != './'
    path = './' + path
  require path

argv = minimist process.argv.slice(2), default:
  verbose: false
  config: './config.json'

main = ->
  config = loadJson argv.config
  c = new CongressEditors config
  c.run()
  
if require.main == module
  main()
