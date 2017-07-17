var React = require('react');
var Griddle = require('griddle-react');
var GriddleWithCallback = require('./GriddleWithCallback');
var StructuredFilter = require('../../src/main');

require('../../src/react-structured-filter.css');

var ExampleData = require('./ExampleData');

var ExampleTable = React.createClass({
  getInitialState: function() {
    return {
      filter: [
            {
              field: 'Industry',
              operator: '==',
              value: 'Music',
            },
            {
              field: 'IPO',
              operator: '>',
              value: 'Dec 8, 1980 10:50 PM',
            },
          ],
    }
  },


  getJsonData: function(filterString, sortColumn, sortAscending, page, pageSize, callback) {

    if (filterString==undefined) {
      filterString = "";
    }
    if (sortColumn==undefined) {
      sortColumn = "";
    }

    // Normally you would make a Reqwest here to the server
    var results = ExampleData.filter(filterString, sortColumn, sortAscending, page, pageSize);
    callback(results);
  },


  updateFilter: function(filter){
    console.log('filter', arguments);

    // Set our filter to json data of the current filter tokens
    this.setState({filter: filter});
  },


  getSymbolOptions: function() {
    return ExampleData.getSymbolOptions();
  },

  getSectorOptions: function() {
    return ExampleData.getSectorOptions();
  },

  getIndustryOptions: function() {
    return ExampleData.getIndustryOptions();
  },


  render: function(){
    return (
      <div>
        <StructuredFilter
          ref="myfilter"
          placeholder="Filter data..."
          headers={["Field", "Operator", "Value"]}
          options={[
            {field:"Symbol", type:"textoptions", options:() => ([{value:'AAPL',label:'Apple'}])},
            {field:"Name",type:"text"},
            {field:"Price",type:"number"},
            {field:"MarketCap",type:"number"},
            {field:"IPO", type:"date"},
            {field:"On", type:"boolean"},
            {field:"Sector", type:"textoptions", options:this.getSectorOptions},
            {field:"Industry", type:"textoptions", options:this.getIndustryOptions}
            ]}
          customClasses={{
            input: "filter-tokenizer-text-input",
            results: "filter-tokenizer-list__container",
            listItem: "filter-tokenizer-list__item"
          }}
          onChange={this.updateFilter}
          value={this.state.filter}
        />
        <GriddleWithCallback
          getExternalResults={this.getJsonData} filter={JSON.stringify(this.state.filter)}
          resultsPerPage={10}
        />
      </div>
    )
  }
});
module.exports = ExampleTable;
