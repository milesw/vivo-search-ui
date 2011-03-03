// $Id$

(function ($) {

/**
 * Baseclass for all facet widgets.
 *
 * @class AbstractFacetWidget
 * @augments AjaxSolr.AbstractWidget
 */
AjaxSolr.AbstractFacetWidget = AjaxSolr.AbstractWidget.extend(
  /** @lends AjaxSolr.AbstractFacetWidget.prototype */
  {
  /**
   * The field to facet on.
   *
   * @field
   * @public
   * @type String
   */
  field: null,

  /**
   * The maximum number of facets.
   *
   * @field
   * @public
   * @type Integer
   */
  limit: null,

  /**
   * Enable tagging and excluding. Needed for multi-select faceting.
   *
   * @field
   * @public
   * @type Boolean
   */
  tagAndExclude: true,

  /**
   * Can we have multiple values for this facet.
   *
   * @field
   * @public
   * @type Boolean
   */
  allowMultipleValues: true,

  /**
   * Initialize function.
   */
  init: function () {
    this.setupStore();
  },

  /**
   * Set up the parameter store for this facet.
   */
  setupStore: function () {
    this.manager.store.addByValue('facet', true);
    
    var facetParam = new AjaxSolr.Parameter({
      name: 'facet.field',
      value: this.field
    });
    if (this.tagAndExclude) {
      facetParam.local('ex', this.field);
    }
    this.manager.store.add(facetParam.name, facetParam);

    if (this.limit !== null) {
      this.manager.store.addByValue('f.' + this.field + '.facet.limit', this.limit);
    }
  },

  /**
   * Return an array of facets.  Each facet is a hash containing at least:
   *   'value', and 'count'.
   */
  facets: function () {
    var facets = this.responseFacets();
    facets.sort(this.facetSort);
    return facets;
  },

  /**
   * Return array of facets from the current solr response.
   *
   * @returns {Array} of facets.
   */
  responseFacets: function () {
    switch (this.manager.store.get('json.nl').value) {
      case 'map':
        return this._responseFacetsMap();
      case 'arrarr':
        throw 'AbstractFacetWidget cannot parse facets when "json.nl" is set to "arrarr"';
        break;
      default:
        return this._responseFacetsFlat();
    }
  },

  /**
   * Return response facets when json.nl is set to 'flat'.
   * @private
   */
  _responseFacetsFlat: function () {
    var facets = [];
    var i = 0, total = this.manager.response.facet_counts.facet_fields[this.field].length;

    while (i < total) {
      var value = this.manager.response.facet_counts.facet_fields[this.field][i++];
      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][i++]);
      facets.push({ value: value, count: count });
    }

    return facets;
  },

  /**
   * Return response facets when json.nl is set to 'map'.
   * @private
   */
  _responseFacetsMap: function () {
    var facets = [];

    for (var value in this.manager.response.facet_counts.facet_fields[this.field]) {
      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][value]);
      facets.push({ value: value, count: count });
    }

    return facets;
  },

  /**
   * Function to sort facets.
   */
  facetSort: function (a, b) {
    return a.value < b.value ? -1 : 1;
  },

  /**
   * Format facet for a parameter.
   *
   * @returns {String}
   */
  formatFacet: function (facet) {
    return this.formatField() + ': ' + this.formatValue(facet);
  },

  /**
   * Format facet field for a parameter.
   *
   * @returns {String}
   */
  formatField: function () {
    return this.field;
  },

  /**
   * Render a facet's value.
   *
   * @param facet
   * @returns {String}
   */
  formatValue: function (facet) {
    return facet.value;
  },

  /**
   * Generate a facet's link text.
   *
   * @param facet
   * @returns {String}
   */
  facetLinkText: function (facet) {
    return this.formatValue(facet);
  },

  /**
   * Render a facet link.
   *
   * @param facet
   * @returns {JQuery object}
   */
  renderFacetLink: function (facet) {
    return $('<a href="#" />').text(this.facetLinkText(facet)).click(this.clickHandler(facet));
  },

  /**
   * Render a facet.
   *
   * @param facet
   * @returns {JQuery object}
   */
  renderFacet: function (facet) {
    return this.renderFacetLink(facet);
  },

  /**
   * Render all facets and insert into the DOM.
   */
  render: function () {
    var facets = this.facets();
    var target = $(this.target);

    target.empty();

    for (var i in facets) {
      target.append(this.renderFacet(facets[i]));
    }
  },

  /**
   * After request callback.  Renders the facet.
   */
  afterRequest: function () {
    this.render();
  },

  /**
   * @returns {Boolean} Whether any filter queries have been set using this
   *   widget's facet field.
   */
  isEmpty: function () {
    return !this.manager.store.find('fq', new RegExp('^-?' + this.field + ':'));
  },

  /**
   * Adds a filter query.
   *
   * @returns {Boolean} Whether a filter query was added.
   */
  add: function (param) {
    return this.changeSelection(function () {
      return this.manager.store.add('fq', param);
    });
  },

  /**
   * Sets a filter query.  Useful for when only only field value is allowed.
   *
   * @returns {Boolean} Whether a filter query was set.
   */
  set: function (param) {
    return this.changeSelection(function () {
      var b1 = this.clear();
      var b2 = this.manager.store.add('fq', param);
      return b1 || b2;
    });
  },

  /**
   * Removes a filter query.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  remove: function (value) {
    return this.changeSelection(function () {
      return this.manager.store.removeByValue('fq', this.fq(value));
    });
  },

  /**
   * Removes all filter queries using the widget's facet field.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  clear: function () {
    return this.changeSelection(function () {
      return this.manager.store.removeByValue('fq', new RegExp('^-?' + this.field));
    });
  },

  /**
   * Helper for selection functions.
   *
   * @param {Function} Selection function to call.
   * @returns {Boolean} Whether the selection changed.
   */
  changeSelection: function (func) {
    changed = func.apply(this);
    if (changed) {
      this.afterChangeSelection();
    }
    return changed;
  },

  /**
   * An abstract hook for child implementations.
   *
   * <p>This method is executed after the filter queries change.</p>
   */
  afterChangeSelection: function () {},

  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function (facet) {
    var self = this;
    var param = new AjaxSolr.Parameter({
      name: 'fq',
      key: this.field,
      value: this.fq(facet.value),
      format: this.formatFacet(facet)
    });
    if (this.tagAndExclude) {
      param.local('tag', this.field);
    }

    var action = this.allowMultipleValue ? 'add' : 'set';
    return function () {
      if (self[action].call(self, param)) {
        self.manager.doRequest(0);
      }
      return false;
    }
  },

  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully removes a
   *   filter query with the given value.
   */
  unclickHandler: function (facet) {
    var self = this;
    return function () {
      if (self.remove(facet.value)) {
        self.manager.doRequest(0);
      }
      return false;
    }
  },

  /**
   * @param {String} value The facet value.
   * @param {Boolean} exclude Whether to exclude this fq parameter value.
   * @returns {String} An fq parameter value.
   */
  fq: function (value, exclude) {
    // If the field value has a space or a colon in it, wrap it in quotes,
    // unless it is a range query.
    if (value.match(/[ :]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/)) {
      value = '"' + value + '"';
    }
    return value;
  }
});

})(jQuery);
