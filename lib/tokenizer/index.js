'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _token = require('./token');

var _token2 = _interopRequireDefault(_token);

var _keyevent = require('../keyevent');

var _keyevent2 = _interopRequireDefault(_keyevent);

var _typeahead = require('../typeahead');

var _typeahead2 = _interopRequireDefault(_typeahead);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 *
 * Example usage:
 *
 *      import StructuredFilter from 'react-structured-filter';
 *
 *      <StructuredFilter
 *        placeholder="Search..."
 *        options={[
 *          {category:"Name",type:"text"},
 *          {category:"Price",type:"number"},
 *        ]}
 *      />
 */
var Tokenizer = function (_Component) {
  _inherits(Tokenizer, _Component);

  function Tokenizer() {
    var _ref;

    _classCallCheck(this, Tokenizer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Tokenizer.__proto__ || Object.getPrototypeOf(Tokenizer)).call.apply(_ref, [this].concat(args)));

    _this.state = {
      selected: _this.getStateFromProps(_this.props),
      field: '',
      operator: ''
    };

    _this._addTokenForValue = _this._addTokenForValue.bind(_this);
    _this._onKeyDown = _this._onKeyDown.bind(_this);
    _this._getOptionsForTypeahead = _this._getOptionsForTypeahead.bind(_this);
    _this._removeTokenForValue = _this._removeTokenForValue.bind(_this);
    return _this;
  }

  _createClass(Tokenizer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.props.onChange(this.state.selected, this._getSelectedAsQuery());
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      console.log('change in selected', this.props.value, nextProps.value);
      var update = {};
      if (nextProps.value !== this.props.value) {
        update.selected = this.getStateFromProps(nextProps);
      }
      this.setState(update);
    }
  }, {
    key: 'getStateFromProps',
    value: function getStateFromProps(props) {
      var value = props.value || props.defaultValue || [];
      return value.slice(0);
    }
  }, {
    key: '_renderTokens',
    value: function _renderTokens() {
      var _this2 = this;

      var tokenClasses = {};
      tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
      var classList = (0, _classnames2.default)(tokenClasses);
      console.log('render tokens', this.state.selected);
      var result = this.state.selected.map(function (selected) {
        var mykey = selected.field + selected.operator + selected.value;

        return _react2.default.createElement(
          _token2.default,
          {
            key: mykey,
            className: classList,
            onRemove: _this2._removeTokenForValue
          },
          selected
        );
      }, this);
      return result;
    }
  }, {
    key: '_getOptionsForTypeahead',
    value: function _getOptionsForTypeahead() {
      var fieldType = void 0;

      if (this.state.field === '') {
        var fields = [];
        for (var i = 0; i < this.props.options.length; i++) {
          var item = this.props.options[i];
          fields.push(item.field);
        }

        return fields;
      } else if (this.state.operator === '') {
        fieldType = this._getFieldType();

        if (fieldType === 'text') {
          return ['==', '!=', 'contains', '!contains'];
        } else if (fieldType === 'textoptions' || fieldType === 'boolean') {
          return ['==', '!='];
        } else if (fieldType === 'number' || fieldType === 'date') {
          return ['==', '!=', '<', '<=', '>', '>='];
        }

        /* eslint-disable no-console */
        console.warn('WARNING: Unknown category type in tokenizer: "' + fieldType + '"');
        /* eslint-enable no-console */

        return [];
      }

      var options = this._getFieldOptions();
      if (options === null || options === undefined) return [];
      return options();
    }
  }, {
    key: '_getHeader',
    value: function _getHeader() {
      if (this.state.field === '') {
        return this.props.headers ? this.props.headers[0] : 'Category';
      } else if (this.state.operator === '') {
        return this.props.headers ? this.props.headers[1] : 'Operator';
      }

      return this.props.headers ? this.props.headers[2] : 'Value';
    }
  }, {
    key: '_getFieldType',
    value: function _getFieldType(field) {
      var fieldType = void 0;
      var f = field;
      if (!field || field === '') {
        f = this.state.field;
      }

      for (var i = 0; i < this.props.options.length; i++) {
        if (this.props.options[i].field === f) {
          fieldType = this.props.options[i].type;
          return fieldType;
        }
      }
    }
  }, {
    key: '_getFieldOptions',
    value: function _getFieldOptions() {
      var _this3 = this;

      for (var i = 0; i < this.props.options.length; i++) {
        if (this.props.options[i].field === this.state.field) {
          var _ret = function () {
            if (_this3.props.options[i].type === 'boolean') {
              return {
                v: function v() {
                  return ['Yes', 'No'];
                }
              };
            }

            var options = _this3.props.options[i].options();
            if (options.length > 0 && options[0].label) {
              return {
                v: function v() {
                  return options.map(function (obj) {
                    return obj.label;
                  });
                }
              };
            }

            return {
              v: _this3.props.options[i].options
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
      }
    }
  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      // We only care about intercepting backspaces
      if (event.keyCode !== _keyevent2.default.DOM_VK_BACK_SPACE) {
        return;
      }

      // Remove token ONLY when bksp pressed at beginning of line
      // without a selection
      var entry = _reactDom2.default.findDOMNode(this.refs.typeahead.refs.inner.inputRef());
      if (entry.selectionStart === entry.selectionEnd && entry.selectionStart === 0) {
        if (this.state.operator !== '') {
          this.setState({ operator: '' });
        } else if (this.state.field !== '') {
          this.setState({ field: '' });
        } else {
          // No tokens
          if (!this.state.selected.length) {
            return;
          }
          var lastSelected = JSON.parse(JSON.stringify(this.state.selected[this.state.selected.length - 1]));
          this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
          this.setState({ category: lastSelected.category, operator: lastSelected.operator });
          if (this._getCategoryType(lastSelected.category) !== 'textoptions') {
            this.refs.typeahead.refs.inner.setEntryText(lastSelected.value);
          }
        }
        event.preventDefault();
      }
    }
  }, {
    key: '_removeTokenForValue',
    value: function _removeTokenForValue(value) {
      var index = this.state.selected.indexOf(value);
      if (index === -1) {
        return;
      }

      this.state.selected.splice(index, 1);
      this.setState({ selected: this.state.selected });
      this.props.onChange(this.state.selected, this._getSelectedAsQuery());

      return;
    }
  }, {
    key: '_addTokenForValue',
    value: function _addTokenForValue(value) {
      console.log('_addTokenForValue', value);

      if (this.state.field === '') {
        this.setState({ field: value });
        this.refs.typeahead.refs.inner.setEntryText('');
        return;
      }

      if (this.state.operator === '') {
        this.setState({ operator: value });
        this.refs.typeahead.refs.inner.setEntryText('');
        return;
      }

      var newValue = {
        field: this.state.field,
        operator: this.state.operator,
        value: value
      };

      this.state.selected.push(newValue);
      console.log('_addTokenForValue selected', this.state.selected);
      this.setState({ selected: this.state.selected });
      this.refs.typeahead.refs.inner.setEntryText('');

      this.props.onChange(this.state.selected, this._getSelectedAsQuery());

      this.setState({
        field: '',
        operator: ''
      });

      return;
    }

    /*
     * Formats the selected value into a queryable object.
     */

  }, {
    key: '_getSelectedAsQuery',
    value: function _getSelectedAsQuery() {
      var _this4 = this;

      return this.state.selected.map(function (item) {
        var option = _this4.props.options.find(function (t) {
          return t.field === item.field;
        });
        var options = option.options ? option.options() : null;
        var _value = options && typeof options[0] !== 'string' ? options.find(function (d) {
          return d.label === item.value;
        }).value : item.value;
        return {
          field: option.id || option.field,
          operator: item.operator,
          value: _value
        };
      });
    }

    /*
     * Returns the data type the input should use ("date" or "text")
     */

  }, {
    key: '_getInputType',
    value: function _getInputType() {
      if (this.state.field !== '' && this.state.operator !== '') {
        return this._getFieldType();
      }

      return 'text';
    }
  }, {
    key: 'render',
    value: function render() {
      var classes = {};
      classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
      var classList = (0, _classnames2.default)(classes);
      return _react2.default.createElement(
        'div',
        { className: 'filter-tokenizer' },
        _react2.default.createElement(
          'div',
          { className: 'token-collection' },
          this._renderTokens(),
          _react2.default.createElement(
            'div',
            { className: 'filter-input-group' },
            _react2.default.createElement(
              'div',
              { className: 'filter-field' },
              this.state.field,
              ' '
            ),
            _react2.default.createElement(
              'div',
              { className: 'filter-operator' },
              this.state.operator,
              ' '
            ),
            _react2.default.createElement(_typeahead2.default, { ref: 'typeahead',
              className: classList,
              placeholder: this.props.placeholder,
              customClasses: this.props.customClasses,
              options: this._getOptionsForTypeahead(),
              header: this._getHeader(),
              datatype: this._getInputType(),
              onOptionSelected: this._addTokenForValue,
              onKeyDown: this._onKeyDown
            })
          )
        )
      );
    }
  }]);

  return Tokenizer;
}(_react.Component);

Tokenizer.propTypes = {
  /**
   * An array of structures with the components `id`, `label`, and `type`
   *
   * * _id_: The ID of the field that gets associated when creating the query.
   * * _label_: Name of the first thing the user types.
   * * _type_: This can be one of the following:
   *   * _text_: Arbitrary text for the value. No autocomplete options.
   *     Operator choices will be: `==`, `!=`, `contains`, `!contains`.
   *   * _textoptions_: You must additionally pass an options value which
   *     will be a function that returns the list of options choices as an
   *     array (for example `function getOptions() {return ["MSFT", "AAPL",
   *     "GOOG"]}`). Operator choices will be: `==`, `!=`.
   *   * _number_: Arbitrary text for the value. No autocomplete options.
   *     Operator choices will be: `==`, `!=`, `<`, `<=`, `>`, `>=`.
   *   * _boolean_: Boolean value. Autocompletes to Yes and No.
   *     Operator choices will be: `==`, `!=`.
   *   * _date_: Shows a calendar and the input must be of the form
   *     `MMM D, YYYY H:mm A`. Operator choices will be: `==`, `!=`, `<`, `<=`, `>`,
   *     `>=`.
   *
   * Example:
   *
   *     [
   *       {
   *         "label": "Symbol",
   *         "type": "textoptions",
   *         "options": function() {return ["MSFT", "AAPL", "GOOG"]}
   *       },
   *       {
   *         "id": "CSymb",
   *         "label": "Custom Symbol",
   *         "type": "textoptions",
   *         "options": function() {return [
   *          {label:"Microsoft", value:"MSFT"},
   *          {label:"Apple", value:"APPL"}
   *         ]}
   *       },
   *       {
   *         "label": "Name",
   *         "type": "text"
   *       },
   *       {
   *         "label": "Price",
   *         "type": "number"
   *       },
   *       {
   *         "label": "MarketCap",
   *         "type": "number"
   *       },
   *       {
   *         "label": "IPO",
   *         "type": "date"
   *       }
   *     ]
   */
  options: _react.PropTypes.array,

  /**
   * The labels to provide in the dropdown headers for the fields list.
   * Defaults to ['Category', 'Operator', 'Value'].
   */
  headers: _react.PropTypes.array,

  /**
   * An object containing custom class names for child elements. Useful for
   * integrating with 3rd party UI kits. Allowed Keys: `input`, `results`,
   * `listItem`, `listAnchor`, `typeahead`, `hover`
   *
   * Example:
   *
   *     {
   *       input: 'filter-tokenizer-text-input',
   *       results: 'filter-tokenizer-list__container',
   *       listItem: 'filter-tokenizer-list__item'
   *     }
   */
  customClasses: _react.PropTypes.object,

  /**
   * **Uncontrolled Component:** A default set of values of tokens to be
   * loaded on first render. Each token should be an object with a
   * `label`, `operator`, and `value` key.
   *
   * Example:
   *
   *     [
   *       {
   *         label: 'Industry',
   *         operator: '==',
   *         value: 'Books',
   *       },
   *       {
   *         label: 'IPO',
   *         operator: '>',
   *         value: 'Dec 8, 1980 10:50 PM',
   *       },
   *       {
   *         label: 'Name',
   *         operator: 'contains',
   *         value: 'Nabokov',
   *       },
   *     ]
   */
  defaultValue: _react.PropTypes.array,

  /**
   * **Controlled Component:** A set of values of tokens to be loaded on
   * each render. Each token should be an object with a `label`,
   * `operator`, and `value` key.
   *
   * Example:
   *
   *     [
   *       {
   *         label: 'Industry',
   *         operator: '==',
   *         value: 'Books',
   *       },
   *       {
   *         label: 'IPO',
   *         operator: '>',
   *         value: 'Dec 8, 1980 10:50 PM',
   *       },
   *       {
   *         label: 'Name',
   *         operator: 'contains',
   *         value: 'Nabokov',
   *       },
   *     ]
   */
  value: _react.PropTypes.array,

  /**
   * Placeholder text for the typeahead input.
   */
  placeholder: _react.PropTypes.string,

  /**
   * Event handler triggered whenever the filter is changed and a token
   * is added or removed. Params: `(filter)`
   */
  onChange: _react.PropTypes.func
};
Tokenizer.defaultProps = {
  // value: [],
  // defaultValue: [],
  options: [],
  customClasses: {},
  placeholder: '',
  onChange: function onChange() {}
};
exports.default = Tokenizer;