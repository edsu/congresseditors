# congresseditors

A bot that watches for edits to Wikipedia articles related to the US Congress
and tweets them at [@congresseditors](http://twitter.com/congresseditors). The
@congresseditors Twitter account was originally run by an
[anon](http://github.com/edsu/anon), but it started getting enough custom
functionality that it made sense to split it off into its own program.

Every hour congresseditors builds a watchlist of relevant articles by 
examining these Wikipedia articles:

* [List of current members of the United States House of Representatives](https://en.wikipedia.org/wiki/List_of_current_members_of_the_United_States_House_of_Representatives_by_age_and_generation)
* [List of current United States Senators](https://en.wikipedia.org/wiki/List_of_current_United_States_Senators)
* [List of bills in the 113th United States Congress](https://en.wikipedia.org/wiki/List_of_bills_in_the_113th_United_States_Congress)

Of course it's unlikely that the current members change that often, but bills 
are more volatile.

## Run

1. sudo apt-get install node coffeescript
1. git clone https://github.com/edsu/congresseditors
1. npm install
1. cp config.json.template config.json
1. edit config.json with twitter credentials
1. coffee congresseditors

## License:

* [CC0](LICENSE) public domain dedication
