(function ($) {

/**
 * Theme a single category link, wrap in a list item
 *
 * @param {String} name Category name
 * @param {Integer} count Count of results associated with category
 * @param {Boolean} checked Whether or not the category is active
 * @param {Function} handler Click handler to bind to link
 */
AjaxSolr.theme.prototype.category_link = function (name, count, active, handler) {
  var cssClasses = (active == true) ? 'active' : '';
  cssClasses += (count == 0) ? ' empty' : '';
  var count = (count > 0) ? $('<span/>').addClass('facet-count').text(' ('+count+')') : '';
  var link = $('<a href="#" />').text(name).append(count).click(handler);
  return $('<li/>').addClass(cssClasses).append(link);
};

/**
 * Theme a single facet checkbox with associated label, wrap in a list item
 *
 * @param {String} name Facet item name, used for label
 * @param {Integer} count Count of results associated with facet item
 * @param {Boolean} checked Whether or not the checkbox is checked
 * @param {String} cssClass CSS Classes to add to list item
 * @param {String} id ID to use for checkbox element and 'for' attribute on label
 * @param {Function} handler Change handler to bind to checkbox
 */
AjaxSolr.theme.prototype.facet_checkbox = function (name, count, checked, cssClass, id, handler) {
  var text = (count > 0) ? name+' ('+count+')' : name;
  var checkbox = $('<input type="checkbox" />').attr('id', id).attr('name', name).change(handler);
  var label = $('<label></label>').addClass('facet-item-label').attr('for', id).text(text);
  if (checked) {
    checkbox.attr('checked', checked);
  }
  return $('<li/>').addClass(cssClass).append(checkbox).append(label);
};

/**
 * Theme a single search result
 *
 * @param {Object} doc Solr document
 * @param {String} snippet Highlighted text snippet
 */
AjaxSolr.theme.prototype.result = function (doc, snippet) {
  var output = '<strong><a href="'+doc.URI+'">'+doc.name+'</a> </strong>';
  if (doc.moniker !== undefined) {
    output += '<em class="result-moniker"> '+doc.moniker+'</em>';
  }
  output += '<p>' + snippet + '</p>';
  // output += '<em class="uri">' + doc.URI + '</em>';
  return output;
};

/**
 * Theme the spinner image displayed during AJAX calls
 */
AjaxSolr.theme.prototype.loader_image = function() {
  return '<img style="display:block;margin:0 auto;padding:50px 0" src="prototype_files/loading-squarecircle.gif" />';
}

/**
 * Theme a "Show all" link for facets
 *
 * @param {Function} handler Click handler to attach to link
 */
AjaxSolr.theme.prototype.facet_showall_link = function(handler) {
  return $('<a href="#" />').addClass('facet-showall').text('Show all...').click(handler);
}

/**
 * Message displayed when there are no results
 *
 * @param {String} queryText The text entered by the user
 * @param {String} resultType The active category name (ex: people, events, organizations etc.)
 */
AjaxSolr.theme.prototype.empty_results = function(queryText, resultType) {
  output = '<div class="empty-results">';
  output += '<p>Your search - ' + queryText + ' - did not match any ' + resultType + '.</p>';
  output += 'Suggestions:';
  output += '<ul>';
  output += '<li>Double check spelling of search terms.</li>';
  output += '<li>Try fewer terms.</li>';
  output += '<li>Use broader terms.</li>'
  output += '</ul></div>';
  return output;
}

/**
 * Appends the given items to the given list, optionally inserting a separator
 * between the items in the list.
 *
 * Copied from ajaxsolr.theme.js
 *
 * @param {String} list The list to append items to.
 * @param {Array} items The list of items to append to the list.
 * @param {String} [separator] A string to add between the items.
 */
AjaxSolr.theme.prototype.list_items = function (list, items, separator) {
  jQuery(list).empty();
  for (var i = 0, l = items.length; i < l; i++) {
    var li = jQuery('<li/>');
    if (AjaxSolr.isArray(items[i])) {
      for (var j = 0, m = items[i].length; j < m; j++) {
        if (separator && j > 0) {
          li.append(separator);
        }
        li.append(items[i][j]);
      }
    }
    else {
      if (separator && i > 0) {
        li.append(separator);
      }
      li.append(items[i]);
    }
    jQuery(list).append(li);
  }
};

})(jQuery);