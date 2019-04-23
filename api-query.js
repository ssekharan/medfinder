/*
* api-query.js
* - specialties from API query
* - test query for betterdoctor api
* - async called with sync-like try/catch block
* - 'awaits' return from fetch to local JSON file
*/

/* FN: 'fetch' from JSON - search doctors, specialties &c.
* - n.b. - api key should be stored in env variables, db &c.
* - location should be dynamic - from geolocation, user input &c.
* - code allows user input for state code, e.g CA, IL...
* - specialties query...
*/
function getAPIQuery(get, params) {
	// url for api query
	const apiURL = `https://api.betterdoctor.com/2016-03-01/${get}?`;
	/*
	* api key for developer
	* - use db, env variables &c. to store this key in production app
	*/
	const key = '&user_key=7bb72b96bdfea9865f3f539104b810e1';
	// build query url using passed params...
	const queryURL = apiURL + params + key;
	// query api
  return fetch(queryURL, {
    headers: new Headers({
      Accept: 'application/json'
    })
  })
  .then(res => res.json());
}

// FN: async/await
async function read(get, params) {
  try {
		// await query data from api
    const apiQuery = await getAPIQuery(get, params);
    console.log(`api FETCH successful`, apiQuery);
		return apiQuery;
  } catch (err) {
    console.log(err);
  }
}

/*
* FN: build output
* - element builder with attributes and child elements
* - child nodes may by attributes, elements, text
* - any DOM compatible nodes may be passed...
*/
function elemBuild(type, ...children) {
	// create initial element based on param 'type' - e.g. p, div
  const node = document.createElement(type);
	// iterate any child nodes passed as param
  for (let child of children) {
		// check for array of attributes
		if (Array.isArray(child)) {
			// iterate attributes and values
			for (let attr of child) {
				// set attribtute on current element node
				node.setAttribute(attr[0], attr[1]);
			}
		}
		// if not array or string  - add element node as child
    else if (typeof child != 'string') {
			// append elemnt node
      node.appendChild(child);
    }


		 else {
			// else append text node as content for current node
      node.appendChild(document.createTextNode(child));
    }
  }
	// return built node structure for adding to DOM
  return node;
}

// FN: clear node of current content - node set to empty
function clearContent(node) {
	// simple reset for defined DOM element node...
	document.querySelector(node).innerHTML = '';
}

// FN: object sort - pass param to filter by...
function objectSort(data, compare) {
	// sort passed data using compare param for filter
	const sorted = data.sort((a, b) => {
		// update with current check value
  	let check = 0;
		// compare specialty uid from data return
  	if (a[compare] > b[compare]) {
    	check = 1;
  	} else if (a[compare] < b[compare]) {
    	check = -1;
  	}
		// return sorted data array...
  	return check;
		});
	// return updated and sorted array of data
	return sorted;
}


/*
* EVENT: listen for click event on menu item
* - specific example for 'specialties'
*/
function handleFormSubmit(specialty, insurance, gender, zipcode) {
	// call 'read' async function for API query
	var specialty_param = "specialty_uid=" + encodeURIComponent(specialty);
	var insurance_param = "&insurance_uid=" + encodeURIComponent(insurance);
	var gender_param= "&gender=" +encodeURIComponent(gender);
	var zip_code = "&location=" + encodeURIComponent(zipcode);
	var params = specialty_param + insurance_param + gender_param + zip_code;

	read('doctors', params).then(
	    (val) => {
	    			// define attributes for list element
			const listAttrs = [['class', 'sorted-list'], ['id', 'specialtyList']];

						// define attributes for output element
			const outputAttrs = [['class', 'sorted-output'], ['id', 'specialtyOutput']];
            			document.getElementById('page-content').appendChild(
				elemBuild('div',
					elemBuild('div', outputAttrs)
				)
			);
			const tableAttrs = [['class', 'output-table']];


									// clear content to now render list of matched doctors for current specialty
									clearContent('.sorted-output');
									// test doctor data...basic example output
									const queryType = val.meta['item_type'];
									// output test query data &c. - basic output to document...
									const queryHeading = `Search query = ${queryType}`;
									// add initial table to output...
									document.querySelector('.sorted-output').appendChild(
		  							// node name, content...then any nested child nodes
						  			elemBuild('div',
											elemBuild('h4', 'Results'),
									 		elemBuild('table', tableAttrs,
									 			elemBuild('caption', queryHeading),
												elemBuild('th', 'location'),
									 			elemBuild('th', 'practice name'),
											)
										)
									)
									// loop through results for specialty & doctors
									for (let props of val.data) {
										// inner loop for multiple practices per location...
										for (let innerProps of props['practices']) {
											// define some values to output for sample doctor data
											const practiceLocation = innerProps['location_slug'];
											const practiceName = innerProps['name'];
											//const btnAttrs = [['class', 'btn'], ['type', 'button'], ['value', 'Add'] ['onClick', '(function(entry) {return function() {chooseUser(entry);}})(entry)']];
											// add sample doctor data to output table

											document.querySelector('.output-table').appendChild(
												elemBuild('tr',
													elemBuild('td', practiceLocation),
													elemBuild('td', practiceName),																									)
											)
										}
									}
								}
	);
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function runOnPageLoad() {
var page_params = getUrlVars();
const specialty = page_params['specialty'];
const insurance = page_params['insurance'];
const gender = page_params['gender'];
const location = page_params['location'];
handleFormSubmit(specialty, insurance, gender, location);

event.preventDefault();
};

runOnPageLoad();
