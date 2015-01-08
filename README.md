# congresseditors

congresseditors is a bot that watches for edits to Wikipedia articles related 
to the US Congress and tweets them at 
[@congresseditors](http://twitter.com/congresseditors). 
The @congresseditors Twitter account was originally run by an instance of 
[anon](http://github.com/edsu/anon), but it started getting enough custom
functionality that it made sense to split it off into its own program.

Every hour congresseditors builds a watchlist of relevant articles by 
examining these Wikipedia articles:

* [List of current members of the United States House of Representatives](https://en.wikipedia.org/wiki/List_of_current_members_of_the_United_States_House_of_Representatives_by_age_and_generation)
* [List of current United States Senators](https://en.wikipedia.org/wiki/List_of_current_United_States_Senators)
* [List of bills in the 113th United States Congress](https://en.wikipedia.org/wiki/List_of_bills_in_the_114th_United_States_Congress) - you can configure the source for the bills for the current congress in your `config.json`

Of course it''s unlikely that the current members change that often, but bills 
are more volatile. congressedits ignores changes if less than 10 characters
in the article were changed (typos, etc). It also ignores repeated edits from
of the same article by the same user.

## Run

    sudo apt-get install node
    git clone https://github.com/edsu/congresseditors
    cd congresseditors
    npm install
    cp config.json.template config.json

Edit config.json to add your twitter credentials, and then:

    node congresseditors.js

# Develop

You will need to install coffeescript to be able to work on the code. 

    sudo apt-get install coffeescript

As you are working on your changes you can run with:

    coffee congressedits.coffee

Just make sure when you are done to compile it to JavaScript.

    coffee -c congresseditors.coffee

## License:

* [CC0](LICENSE) public domain dedication
