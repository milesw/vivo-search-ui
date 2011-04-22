<#-- $This file is distributed under the terms of the license in /doc/license.txt$ -->

<#-- Template for displaying paged search results -->

<h2>Search results</h2>
<div id="ajax-search">
  <form id="ajax-search-form" action="/">
    <input id="ajax-search-text" name="q" type="text" value="" />
    <input id="ajax-search-submit" class="button small" name="submit" type="submit" value="Search" />
  </form>
</div>

<div id="search-controls">
    
  <div id="search-categories"></div>
  
  <div class="facet" id="search-facet-1"></div>
  <div class="facet facet-popup" id="search-facet-1-popup" style="display: none;"></div>

  <div class="facet collapsed" id="search-facet-2"></div>
  <div class="facet facet-popup" id="search-facet-2-popup" style="display: none;"></div>

  <div class="facet collapsed" id="search-facet-3"></div>
  <div class="facet facet-popup" id="search-facet-3-popup" style="display: none;"></div>

  <div class="facet collapsed" id="search-facet-4"></div>
  <div class="facet facet-popup" id="search-facet-4-popup" style="display: none;"></div>
  
  <div class="facet" id="network-facet"></div>

</div>

<div id="search-results">
  <div id="results-header"></div>
  <div id="results"></div>
  <div id="pagination">
    <ul id="pager"></ul>
  </div>
</div>

<div style="clear:both"></div>

${stylesheets.add("/css/search.css")}
${stylesheets.add("/js/jquery-ui/css/smoothness/jquery-ui-1.8.4.custom.css")}
${stylesheets.add("/js/search/prototype_files/vivoSearchPrototype.css")}

${headScripts.add("/js/jquery-ui/js/jquery-ui-1.8.4.custom.min.js")}

<#-- Core AJAX Solr files -->
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/Core.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/AbstractManager.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/managers/Manager.jquery.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/ParameterStore.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/ParameterHashStore.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/AbstractWidget.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/core/AbstractTextWidget.js")}
${headScripts.add("/js/search/ajaxsolr_tjwallace/helpers/jquery/ajaxsolr.theme.js")}

<#-- Modified AJAX Solr files -->
${headScripts.add("/js/search/prototype_files/modifications/Parameter.js")}
${headScripts.add("/js/search/prototype_files/modifications/AbstractFacetWidget.js")}
${headScripts.add("/js/search/prototype_files/modifications/PagerWidget.js")}

<#-- Custom search widgets -->
${headScripts.add("/js/search/prototype_files/widgets/SearchText.js")}
${headScripts.add("/js/search/prototype_files/widgets/ClassGroupFacet.js")}
${headScripts.add("/js/search/prototype_files/widgets/MultiCheckboxFacet.js")}
${headScripts.add("/js/search/prototype_files/widgets/MultiCheckboxPopup.js")}
${headScripts.add("/js/search/prototype_files/widgets/NationalNetworkFacet.js")}
${headScripts.add("/js/search/prototype_files/widgets/ResultWidget.js")}

<#-- Configuration -->
${headScripts.add("/js/search/prototype_files/vivoSearchPrototype.config.js")}
${headScripts.add("/js/search/prototype_files/vivoSearchPrototype.theme.js")}