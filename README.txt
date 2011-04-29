This git repository contains all the necessary files to set up the VIVO search prototype in a VIVO instance. You will need to have a Git client installed. On OSX, installing Git via Homebrew is quite handy.


1. Move to the root of your VIVO source tree (not Vitro) and initialize a new Git repo.

   > cd /usr/local/vivo-trunk/
   > git init

2. Add the Github repository as the source repository.

   > git remote add origin git://github.com/milesworthington/vivo-search-ui.git

3. Pull down all data from the repository then checkout the master branch.

   > git fetch
   > git checkout master

4. Change the Solr URL and VIVO instance URL in the search prototype configuration. Get the Solr URL from Miles. The instance URL should be the URL for your test instance.

   > vi productMods/js/search/prototype_files/vivoSearchPrototype.config.js
   [Look for the 'solrUrl' and 'prototypeURL' variables]

5. Change 'prototypeURL' in the search prototype configuration. This needs to be the URL for your VIVO instance.

   > vi productMods/js/search/prototype_files/vivoSearchPrototype.config.js
   [Look for the 'prototypeURL' variable]

6. Move to the Vitro source tree and patch the search controller to use only a single Freemarker template.

   > cd /usr/local/vitro-trunk/
   > patch -p0 < /usr/local/vivo-trunk/search_prototype--vitro_search_controller.patch

7. Move back to VIVO source tree and re-deploy. You will need to restart Tomcat for the controller changes to take effect.

   > cd /usr/local/vivo-trunk
   > ant deploy
