<#-- $This file is distributed under the terms of the license in /doc/license.txt$ -->

<#-- Template for displaying paged search results -->

<h2 id="results-title">Search results</h2>

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

${stylesheets.add('<link rel="stylesheet" href="${urls.base}/css/search.css" />',
                  '<link rel="stylesheet" href="${urls.base}/js/jquery-ui/css/smoothness/jquery-ui-1.8.9.custom.css" />',
                  '<link rel="stylesheet" href="${urls.base}/js/search/prototype_files/vivoSearchPrototype.css" />')}

${headScripts.add('<script type="text/javascript" src="${urls.base}/js/jquery-ui/js/jquery-ui-1.8.9.custom.min.js"></script>')}

<#-- Core AJAX Solr files -->
${headScripts.add('<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/Core.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/AbstractManager.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/managers/Manager.jquery.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/ParameterStore.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/ParameterHashStore.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/AbstractWidget.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/core/AbstractTextWidget.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/ajaxsolr_tjwallace/helpers/jquery/ajaxsolr.theme.js"></script>')}

<#-- Modified AJAX Solr files -->
${headScripts.add('<script type="text/javascript" src="${urls.base}/js/search/prototype_files/modifications/Parameter.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/modifications/AbstractFacetWidget.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/modifications/PagerWidget.js"></script>')}

<#-- Custom search widgets -->
${headScripts.add('<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/SearchText.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/ClassGroupFacet.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/MultiCheckboxFacet.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/MultiCheckboxPopup.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/NationalNetworkFacet.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/widgets/ResultWidget.js"></script>')}

<#-- Configuration -->
${headScripts.add('<script type="text/javascript" src="${urls.base}/js/search/prototype_files/vivoSearchPrototype.config.js"></script>',
                  '<script type="text/javascript" src="${urls.base}/js/search/prototype_files/vivoSearchPrototype.theme.js"></script>')}