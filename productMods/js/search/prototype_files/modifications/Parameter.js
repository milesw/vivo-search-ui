// $Id$

/**
 * Represents a Solr parameter.
 *
 * @param properties A map of fields to set. Refer to the list of public fields.
 * @class Parameter
 */
AjaxSolr.Parameter = AjaxSolr.Class.extend(
  /** @lends AjaxSolr.Parameter.prototype */
  {
  /**
   * The parameter's name.
   *
   * @field
   * @private
   * @type String
   */
  name: null,

  /**
   * The parameter's value.
   *
   * @field
   * @private
   * @type String
   */
  value: null,

  /**
   * The parameter's local parameters.
   *
   * @field
   * @private
   * @type Object
   * @default {}
   */
  locals: {},

  key: false,

  format: null,
  
  /**
   * (mw542) The type of parameter - used for filter queries only
   * 
   * Using full absolute URIs in the query string causes problems
   * all over the place. To avoid this, we construct filter queries
   * using Solr's nested query format. Most usage of Parameter.js
   * do not need to use this format, so we default to 'normal' and 
   * set it to 'subquery' if we want to construct complex fq's.
   *
   * @see parseValueString()
   */
  filterType: 'normal',
  
  /**
   * (mw542) The operator used within a single filter query
   * 
   * A single filter query can contain any number of filters. Using "AND"
   * will require _all_ of those filters, while using "OR" will
   * require _any_ of those filters.
   *
   * @see parseMultiValueString()
   */
  operator: 'AND',

  /**
   * Returns the value. If called with an argument, sets the value.
   *
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  val: function (value) {
    if (value === undefined) {
      if (this.value !== null) {
        return ((this.key === false) ? '' : this.key + ':') + this.value;
      }
      else {
        return null;
      }
    }
    else {
      this.value = value;
    }
  },

  /**
   * Returns the value of a local parameter. If called with a second argument,
   * sets the value of a local parameter.
   *
   * @param {String} name The name of the local parameter.
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  local: function (name, value) {
    if (value === undefined) {
      return this.locals[name];
    }
    else {
      this.locals[name] = value;
    }
  },

  /**
   * Deletes a local parameter.
   *
   * @param {String} name The name of the local parameter.
   */
  remove: function (name) {
    delete this.locals[name];
  },

  /**
   * Returns the Solr parameter as a query string key-value pair.
   *
   * <p>IE6 calls the default toString() if you write <tt>store.toString()
   * </tt>. So, we need to choose another name for toString().</p>
   */
  string: function () {
    var pairs = [];

    for (var name in this.locals) {
      if (this.locals[name]) {
        pairs.push(name + '=' + encodeURIComponent(this.locals[name]));
      }
    }

    var prefix = pairs.length ? '{!' + pairs.join('%20') + '}' : '';

    if (this.value) {
      return this.name + '=' + prefix + this.valueString(this.value);
    }
    // For dismax request handlers, if the q parameter has local params, the
    // q parameter must be set to a non-empty value. In case the q parameter
    // is empty, use the q.alt parameter, which accepts wildcards.
    else if (this.name == 'q' && prefix) {
      return 'q.alt=' + prefix + encodeURIComponent('*.*');
    }
    else {
      return '';
    }
  },

  /**
   * Parses a string formed by calling string().
   *
   * @param {String} str The string to parse.
   */
  parseString: function (str) {
    var param = str.match(/^([^=]+)=(?:\{!([^\}]*)\})?(.*)$/);
    if (param) {
      var matches;

      while (matches = /([^\s=]+)=(\S*)/g.exec(decodeURIComponent(param[2]))) {
        this.locals[matches[1]] = decodeURIComponent(matches[2]);
        param[2] = param[2].replace(matches[0], ''); // Safari's exec seems not to do this on its own
      }

      if (param[1] == 'q.alt') {
        this.name = 'q';
        // if q.alt is present, assume it is because q was empty, as above
      }
      else {
        this.name = param[1];
        this.value = this.parseValueString(param[3]);
      }
    }
  },

  /**
   * Returns the value as a URL-encoded string.
   *
   * (mw542) Modified to work with URIs as fields or values
   *
   * @private
   * @param {String|Number|String[]|Number[]} value The value.
   * @returns {String} The URL-encoded string.
   */
  valueString: function (value) {
    
    if (this.filterType == 'subquery') {
      return this.multiValueString(value);
    }

    value = '' + ( AjaxSolr.isArray(value) ? value.join(',') : value );
    
    if (value.match(/[: ]/) && this.name == 'fq') {
      value = '"' + value + '"';
    }

    if (this.key !== false) {
      value = this.key + ':' + value;
    }

    return encodeURIComponent(value);
  },
  
  /**
   * (mw542) Helper for valueString() that constructs a
   *   filter query string that uses nested query syntax
   *   and Solr's "raw" query parser.
   */
  multiValueString: function(values) {
    
    // Cast single values as Array
    values = AjaxSolr.isArray(values) ? values : [values];
    
    var pieces = [];
    for (i=0; i<values.length; i++) {
      var piece = '_query_:"{!raw f=' + this.key + '}' + values[i] + '"';
      pieces.push(piece);
    }
    
    var string = pieces.join(' ' + this.operator + ' ');
    
    return encodeURIComponent(string);
  },

  /**
   * Parses a URL-encoded string to return the value.
   *
   * (mw542) Modified to work with URIs as fields or values
   *
   * @private
   * @param {String} str The URL-encoded string.
   * @returns {Array} The value.
   */
  parseValueString: function (str) {
    str = decodeURIComponent(str);
    
    if (str.indexOf('_query_') > -1) {
      this.filterType = 'subquery';
      return this.parseMultiValueString(str);
    }
    
    // We can't use .split() here because we only want to split
    // on only the first occurrence of a colon and things will 
    // break if field names contain colons (with URIs for example).
    index = str.indexOf(':');
    parts = [str];
    if (index > 0) {
      parts[0] = str.slice(0, index);
      parts[1] = str.slice(index+1);
    }
    
    if (parts.length > 1) {
      this.key = parts[0];
      values = parts[1];
    }
    else {
      values = parts[0];
    }
    
    if (values.match(/["]/)) {
      values = values.split('"')[1];
    }
    
    return values.indexOf(',') == -1 ? values : values.split(',');
  },
  
  /**
   * (mw542) Helper for parseValueString() that pulls apart a 
   *   filter query that was constructed as a nested query.
   */
  parseMultiValueString: function (str) {
    if (str.indexOf(' OR ')) {
      var pieces = str.split(' OR ');
      this.operator = 'OR';
    }
    else if (str.indexOf(' AND ')) {
      var pieces = str.split(' AND ');
      this.operator = 'AND';
    }
    else {
      var pieces = [str];
    }
    
    var values = [];
    for (i=0; i<pieces.length; i++) {
      var piece = pieces[i].split('"')[1];
      this.key = piece.substring(piece.indexOf('f=') + 2, piece.indexOf('}'));
      values.push(piece.substring(piece.indexOf('}') + 1));
    }
    return values;
  }
});
