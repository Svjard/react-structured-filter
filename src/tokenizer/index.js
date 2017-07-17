import {
  default as React,
  Component,
  PropTypes,
} from 'react';
import ReactDOM from 'react-dom';
import Token from './token';
import KeyEvent from '../keyevent';
import Typeahead from '../typeahead';
import classNames from 'classnames';

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
export default class Tokenizer extends Component {

  static propTypes = {
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
    options: PropTypes.array,

    /**
     * The labels to provide in the dropdown headers for the fields list.
     * Defaults to ['Category', 'Operator', 'Value'].
     */
    headers: PropTypes.array,

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
    customClasses: PropTypes.object,

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
    defaultValue: PropTypes.array,

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
    value: PropTypes.array,

    /**
     * Placeholder text for the typeahead input.
     */
    placeholder: PropTypes.string,

    /**
     * Event handler triggered whenever the filter is changed and a token
     * is added or removed. Params: `(filter)`
     */
    onChange: PropTypes.func,
  }

  static defaultProps = {
    // value: [],
    // defaultValue: [],
    options: [],
    customClasses: {},
    placeholder: '',
    onChange() {},
  }

  constructor( ...args ) {
    super( ...args );
    this._addTokenForValue = this._addTokenForValue.bind( this );
    this._onKeyDown = this._onKeyDown.bind( this );
    this._getOptionsForTypeahead = this._getOptionsForTypeahead.bind( this );
    this._removeTokenForValue = this._removeTokenForValue.bind( this );
  }

  state = {
    selected: this.getStateFromProps( this.props ),
    field: '',
    operator: '',
  }

  componentDidMount() {
    this.props.onChange( this.state.selected, this._getSelectedAsQuery() );
  }

  componentWillReceiveProps( nextProps ) {
    console.log('change in selected', this.props.value, nextProps.value);
    const update = {};
    if ( nextProps.value !== this.props.value ) {
      update.selected = this.getStateFromProps( nextProps );
    }
    this.setState( update );
  }

  getStateFromProps( props ) {
    const value = props.value || props.defaultValue || [];
    return value.slice( 0 );
  }

  _renderTokens() {
    const tokenClasses = {};
    tokenClasses[ this.props.customClasses.token ] = !!this.props.customClasses.token;
    const classList = classNames( tokenClasses );
    console.log('render tokens', this.state.selected);
    const result = this.state.selected.map( selected => {
      const mykey = selected.field + selected.operator + selected.value;

      return (
        <Token
          key={ mykey }
          className={ classList }
          onRemove={ this._removeTokenForValue }
        >
          { selected }
        </Token>

      );
    }, this );
    return result;
  }

  _getOptionsForTypeahead() {
    let fieldType;

    if ( this.state.field === '' ) {
      const fields = [];
      for ( let i = 0; i < this.props.options.length; i++ ) {
        const item = this.props.options[ i ];
        fields.push( item.field );
      }

      return fields;
    } else if ( this.state.operator === '' ) {
      fieldType = this._getFieldType();

      if ( fieldType === 'text' ) {
        return [ '==', '!=', 'contains', '!contains' ];
      } else if ( fieldType === 'textoptions' || fieldType === 'boolean' ) {
        return [ '==', '!=' ];
      } else if ( fieldType === 'number' || fieldType === 'date' ) {
        return [ '==', '!=', '<', '<=', '>', '>=' ];
      }

      /* eslint-disable no-console */
      console.warn( `WARNING: Unknown category type in tokenizer: "${fieldType}"` );
      /* eslint-enable no-console */

      return [];
    }

    const options = this._getFieldOptions();
    if ( options === null || options === undefined ) return [];
    return options();
  }

  _getHeader() {
    if ( this.state.field === '' ) {
      return this.props.headers ? this.props.headers[0] : 'Category';
    } else if ( this.state.operator === '' ) {
      return this.props.headers ? this.props.headers[1] : 'Operator';
    }

    return this.props.headers ? this.props.headers[2] : 'Value';
  }

  _getFieldType( field ) {
    let fieldType;
    let f = field;
    if ( !field || field === '' ) {
      f = this.state.field;
    }

    for ( let i = 0; i < this.props.options.length; i++ ) {
      if ( this.props.options[ i ].field === f ) {
        fieldType = this.props.options[ i ].type;
        return fieldType;
      }
    }
  }

  _getFieldOptions() {
    for ( let i = 0; i < this.props.options.length; i++ ) {
      if ( this.props.options[ i ].field === this.state.field ) {
        if ( this.props.options[ i ].type === 'boolean' ) {
          return () => ['Yes', 'No'];
        }

        const options = this.props.options[ i ].options();
        if (options.length > 0 && options[0].label) {
          return () => options.map(obj => obj.label);
        }

        return this.props.options[ i ].options;
      }
    }
  }


  _onKeyDown( event ) {
    // We only care about intercepting backspaces
    if ( event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE ) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    const entry = ReactDOM.findDOMNode( this.refs.typeahead.refs.inner.inputRef());
    if ( entry.selectionStart === entry.selectionEnd &&
        entry.selectionStart === 0 ) {
      if ( this.state.operator !== '' ) {
        this.setState({ operator: '' });
      } else if ( this.state.field !== '' ) {
        this.setState({ field: '' });
      } else {
        // No tokens
        if ( !this.state.selected.length ) {
          return;
        }
        const lastSelected = JSON.parse(
          JSON.stringify( this.state.selected[ this.state.selected.length - 1 ])
        );
        this._removeTokenForValue(
          this.state.selected[ this.state.selected.length - 1 ]
        );
        this.setState({ category: lastSelected.category, operator: lastSelected.operator });
        if ( this._getCategoryType( lastSelected.category ) !== 'textoptions' ) {
          this.refs.typeahead.refs.inner.setEntryText( lastSelected.value );
        }
      }
      event.preventDefault();
    }
  }

  _removeTokenForValue( value ) {
    const index = this.state.selected.indexOf( value );
    if ( index === -1 ) {
      return;
    }

    this.state.selected.splice( index, 1 );
    this.setState({ selected: this.state.selected });
    this.props.onChange( this.state.selected, this._getSelectedAsQuery() );

    return;
  }

  _addTokenForValue( value ) {
    console.log('_addTokenForValue', value);

    if ( this.state.field === '' ) {
      this.setState({ field: value });
      this.refs.typeahead.refs.inner.setEntryText( '' );
      return;
    }

    if ( this.state.operator === '' ) {
      this.setState({ operator: value });
      this.refs.typeahead.refs.inner.setEntryText( '' );
      return;
    }

    const newValue = {
      field: this.state.field,
      operator: this.state.operator,
      value,
    };

    this.state.selected.push( newValue );
    console.log('_addTokenForValue selected', this.state.selected);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.refs.inner.setEntryText( '' );

    this.props.onChange( this.state.selected, this._getSelectedAsQuery() );

    this.setState({
      field: '',
      operator: '',
    });

    return;
  }

  /*
   * Formats the selected value into a queryable object.
   */
  _getSelectedAsQuery() {
    return this.state.selected.map( item => {
      const option = this.props.options.find(t => t.field === item.field);
      const options = option.options ? option.options() : null;
      const _value = options && typeof options[0] !== 'string' ?
        options.find(d => d.label === item.value).value :
        item.value;
      return {
        field: option.id || option.field,
        operator: item.operator,
        value: _value,
      };
    });
  }

  /*
   * Returns the data type the input should use ("date" or "text")
   */
  _getInputType() {
    if ( this.state.field !== '' && this.state.operator !== '' ) {
      return this._getFieldType();
    }

    return 'text';
  }

  render() {
    const classes = {};
    classes[ this.props.customClasses.typeahead ] = !!this.props.customClasses.typeahead;
    const classList = classNames( classes );
    return (
      <div className="filter-tokenizer">
        <div className="token-collection">
          { this._renderTokens() }

          <div className="filter-input-group">
            <div className="filter-field">{ this.state.field } </div>
            <div className="filter-operator">{ this.state.operator } </div>

            <Typeahead ref="typeahead"
              className={ classList }
              placeholder={ this.props.placeholder }
              customClasses={ this.props.customClasses }
              options={ this._getOptionsForTypeahead() }
              header={ this._getHeader() }
              datatype={ this._getInputType() }
              onOptionSelected={ this._addTokenForValue }
              onKeyDown={ this._onKeyDown }
            />
            </div>
          </div>
      </div>
    );
  }
}
