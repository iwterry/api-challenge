/* #################################################### About #############################################
Author: Isaac Terry
Description: This JavaScript script contains functions for giving users a dynamic experience by searching, 
	favoriting, and deleting recommendations for music, movies, books, and more by using TasteKid's API.  

Content: 
	- Global variables
	- Sections and recommendation navigations
		- DOM traversal/manipulation help functions 
		- Functions for showing & allowing transitions from one menu item (or section) to another
		- Function for setting event handlers
	- Showing help
	- History section
		- DOM traversal/manipulation helper functions for logging and filtering activities
		- Event handlers for deleting and selecting history types
	- Getting data from API and showing it
		- Helper logic function 
		- DOM traversal/manipulation helper functions
		- Functions for showing data
		- Function for requesting data
		- Event handler for search query submission
	- Filtering and sorting favorites 
	- Showing and changing the settings for viewing favorite recommendations 
	- Navigating between recommendations
		- Helper logic functions
		- Helper DOM manipulation functions
		- Event handlers for navigation through Bootstrap pagers and entering page number
	- Favoriting a recommendation and deleting that recommendation
		- DOM traversal/manipulation helper function
		- Event handlers for favoriting (or deleting favorite) recommendations
	- jQuery ready method	

Known Issues (Updated 10/7/2015): 
	- None	
*/
	

(function() {
	// ############################################ Global variables #################################
	var jq = $.noConflict(),
		favIdsObj = new FavIds(),
		recommendationTypesObj = { // used as a mapping between the options for recommendation type selected and its HTML class name
			author: "author", 
			book: "book",
			game: "game", 
			movie: "movie",
			music: "music", 
			show: "tv-show",
		},
		activityHistoryTypesObj = { // used as a mapping between the options for history activity type selected and its HTML class name
			deletes: "deletes-history", 
			favorites: "favorites-history", 
			searches: "searches-history" 
		},
		typeOfSortFavs, typeOfFilterFavs, numOfRecs, maxNumPages, maxNumRecsSeen, maxFavsSelected, validRecsPageNum, validFavsPageNum;


	//	####################################### Section and recommendation navigations ############################# 
	// ----------------------------- DOM traversal/manipulation help functions ----------------------------

	/* This function requires one argument that is an li DOM element that is a parent to only one anchor DOM element.
	This function returns the href property of the "a" DOM element as a string. */
	var getHrefFromMenuItem = function(menuItem) {
		return jq(menuItem).find("a").attr("href");
	};

	/*	This function requires two arguments: menuItem (which is an li DOM element) and the resultInfoClass (which is class
	 selector representing some in info about a recommendation. This function returns a DOM element containing that piece of 
	 information. */
	var getResultInfoFromMenuItem = function(menuItem, resultInfoClass) {
		return jq(menuItem).parent().siblings(resultInfoClass); 
	};

	//----------------  Functions for showing & allowing transitions from one menu item (or section) to another ------------------

	/* Show a dropdown menu by attaching the menu from the navigation pills to div.dropdown.  */ 
	var showDropDownMenu = function() {
		var dropDownMenu = jq("#webpage-nav ul").clone()
			.removeClass("nav-pills")
			.addClass("dropdown-menu");
			
		jq("#webpage-nav .dropdown").append(dropDownMenu); 
	};

	/* Show transition of previously active menu item to the current active menu item when given both the
	previously and currently clicked menu items (which are both jQuery objects).*/ 
	var showActiveMenuItemTransition = function(prevClickedMenuItem, currClickedMenuItem ) {
			jq(prevClickedMenuItem).removeClass("active");
			jq(currClickedMenuItem).addClass("active");
	};

	/* Show transition of the display of one section element to another when given both the previously and 
	currently clicked menu items. All arguments are assumed to be jQuery objects. */
	var showSectionTransition = function(prevClickedMenuItem, currClickedMenuItem) {
		var fromSectionId = getHrefFromMenuItem(prevClickedMenuItem),
			toSectionId = getHrefFromMenuItem(currClickedMenuItem);
			
		jq(fromSectionId).fadeOut().promise().done(function() { // possibly allow for smoother transition; 
			jq(toSectionId).fadeIn();
		});
		
	};

	 /* Show transition of the display of one piece of information about a recommendation to another piece of 
	information when given both the previously clicked menu item and currently clicked menu item. All arguments
	are assumed to be jQuery objects. */
	var showRecommendationInfoTransition = function(prevClickedMenuItem, currClickedMenuItem) {
		var fromResultInfo = getHrefFromMenuItem(prevClickedMenuItem),
			toResultInfo = getHrefFromMenuItem(currClickedMenuItem);
		
		getResultInfoFromMenuItem(prevClickedMenuItem, fromResultInfo).hide();
		getResultInfoFromMenuItem(currClickedMenuItem, toResultInfo).show();
	};
	
	// --------------------------------------- Function for setting event handlers ------------------------------
	
	/* Allow for transitioning of the display of sections elements, menu items, and recommedation information ,*/
	var allowTransitions = function() {
		jq("#webpage-nav li").click(function(event) {
			// Find previous and current active navigation menu item. Sync the drop-dowm menu with the pills menu. 
			var selector = "." + jq(this).attr("class").split(" ").join("."),
				currActive = jq("#webpage-nav").find(selector);
				prevActive = jq("#webpage-nav").find(".active");
				
			event.preventDefault(); 
			
			// Do not make function calls when user is clicking the same active menu item again.
			if (currActive.hasClass("active") === false) { 
				showActiveMenuItemTransition(prevActive, currActive);
				showSectionTransition(prevActive, currActive);
			}
		}); 
		
		jq(".results-container").on("click", ".result li", function(event) {
			// Find previous and current active recommendation information menu item. 
			var currActive = jq(this),
				prevActive = jq(this).siblings(".active");
				
			event.preventDefault(); 	
			
			showActiveMenuItemTransition(prevActive, currActive);
			showRecommendationInfoTransition(prevActive, currActive);
		});
	};
	
	// This function sets up event handlers to allow webpage navigation by scrolling to the top of the window. 
	var allowScrollNavigation = function() {
		jq(window).scroll(function() {
			if(jq(this).scrollTop() > 200) {
				jq("#scroll-statement").show(); 
			}
			else{
				jq("#scroll-statement").hide(); 
			}
		}); 
		
		jq("#scroll-statement a").click(function(event) {
			event.preventDefault(); 
			jq(window).scrollTop(0); 
		});
		
	};
	
	
	// ###################################### Showing help ################################################
	
	// This function sets up event handlers for closing and showing help text for the sections. 
	var allowHelpTextShown = function() {
		jq("section .help-button").click(function(event) {
			event.preventDefault();
			jq(this).siblings(".section-help").toggle(); 
		});
		
		jq(".section-help .close-button").click(function() {
			jq(this).parent().hide();
		})
	};
	
	
		// ############################################ History section #########################################
	// ---------------- DOM traversal/manipulation helper functions for logging and filtering activities ---------------------
	
	/*	The function requires three string arguments: activityType (which is the type of activity), activityDescription
		(which is the description of the activity), activityHistoryType (which is a name for a activityHistoryTypesObj's property).
		This function places information given in the DOM under id #activity-list with a class based on activityHistoryType. 
		The time the function was called under the is also shown. */
	var logHistory = function(activityType, activityDescription, activityHistoryType) {
		var activityDom = jq(".template .activity").clone(),
			activityTime = new Date(), 
			className = activityHistoryTypesObj[activityHistoryType];
			
		activityDom.find(".time-of-activity").text(activityTime);
		activityDom.find(".type-of-activity").text(activityType);
		activityDom.find(".description-of-activity").text(activityDescription); 
		
		if(activityHistoryTypesObj.hasOwnProperty(activityHistoryType)) {
			activityDom.addClass(className);
		}
		else {
			console.log("Oops! Something went wrong when trying to add a class in function logHistory.")
		}
	
		jq("#activity-list").append(activityDom); 
		showHistorySectionStats(); 
	};

	// Allow users to select between various types of history activities.
	var filterHistory = function() {
		var activityFilter = jq("select[name='activity-filter']").val(), 
			selector;
		if(activityFilter === "all activities") {
			jq("#activity-list").children().show();
		}
		else {
			selector = "." + activityHistoryTypesObj[activityFilter];
			jq("#activity-list").find(selector).show()
			jq("#activity-list").children()
				.not(selector)
					.hide();
		}
	};
	
	/* This function's role is to display counts for different types activities to the user. */
	var showHistorySectionStats = function() {
		var stats = jq("#history-section .stats"),
			helperFunc = function(nthChild, activityFilter) {
				var selector = "li:nth-child( " + nthChild + " ) span",
					className = activityHistoryTypesObj[activityFilter],
					countOfType = jq("#activity-list").find("." + className).length;
				
				stats.find(selector).html(countOfType);
			}; 
		
		stats.find("li:nth-child(1) span").html(jq("#activity-list .activity").length);
		helperFunc(2, "deletes");
		helperFunc(3, "favorites");
		helperFunc(4, "searches");
	};
	
	// ------------------------------------------ Event handlers for deleting and selecting history types ----------------------------- 
	
	/* Allow users to delete one item from their activity history or a particular type of activity 
	from their activity history by setting up event handlers. */ 
	var allowDeleteHistory = function() {
		jq("#activity-list").on("click", ".activity button", function() {
			jq(this).parent().remove(); 	
			showHistorySectionStats();
		});
		
		jq("#delete-activities-button").click(function() {
			var activityFilter = jq(this).siblings("select[name='activity-filter']").val();
			
			if(activityFilter === "all activities") {
				jq("#activity-list").html("");
			}
			else {
				jq("#activity-list").find("." + activityHistoryTypesObj[activityFilter]).remove(); 
			}
			showHistorySectionStats(); 
		});
	}; 
	
	// This function sets up an event handler to allow the user to see different activities types from their history.
	var allowSelectActivityType = function() {
		jq("#activity-filter").change(function() {
			filterHistory();
		});
	}; 
	
	
	// ################################## Getting data from API and showing it ##########################
	//--------------------------------------------- Helper logic function ----------------------------------------
	
	/* This function requires one argument, a jQuery object for a text input DOM element. This function returns a boolean 
	that indicates whether the user has entered a non-space character for the text input. True is returned is the user has; 
	otherwise, false is returned. */
	var isNameValid = function(name) {
		var nameValue = name.val();
		
		return (nameValue !== '') && (nameValue.search(/[^\s]/) >= 0);
	}; 
	
	// ----------------------------------------------- DOM traversal/manipulation helper functions --------------------------------------
	
	/*	The function requires two string arguments: the first is "identifier," which is the name of a
	recommendation, and the second argument is className, which is related to the recommendation's type. 
	If possible, this function determines & returns a uniquely valid id for the recommendation. Otherwise, null is returned. */
	var getUniqueFavId = function(identifier, className) {
		var newIdentifier =  identifier.toLowerCase().replace(/[^0-9a-z]/g, "-"),
			selector = "#favorites-section " + "#" + newIdentifier,
			count = 0, 
			jqObj = jq(selector);
		
		// Search to see whether another favorite recommedation has the same name and type. 
		while(jqObj.length) {
			// Check to see whether another favorite recommendation exists that has the same name and type. 
			if(jqObj.hasClass(className)) {
				return null; 
			}
			
			count += 1;
			selector = "#favorites-section " + "#" + newIdentifier + "-" + count;
			jqObj = jq(selector);
		}
		
		// At least one favorite recommendation has the same name, but was of a different type.
		if(count) {
			return newIdentifier + "-" + count; 
		}
		
		// No favorite recommendation has the same name.
		return newIdentifier; 
	};

	/*	This function requires one argument, favButton, which is a DOM element representing button[name='Favorite']. This function
	disables the button and provide other changes to the button to tell users that a recommendation has been favorited. */
	var showFavFeedback = function(favButton) {
		// Show users they favorited the recommendation.
		jq(favButton).attr({"disabled": true, "title": "This recommendation has been favorited"})
			.css({color: "white", backgroundColor: "black"})
			.text("Recommendation favorited");	
	};

	// ------------------------------------- Functions for showing data -----------------------------------------------
		/*	This function requires three arguments: recDom (a jQuery object for a .template .result DOM element) and two strings 
	(one for the Wikipedia URL and the other for the YouTube URL). This function determines what should be displayed when a URL 
	does not exist (i.e., has a null value). */
	var handleBrokenLinks = function(recDom, wikiUrl, ytUrl) {
		
		if(wikiUrl === null && ytURL === null) {
			recDom.find(".result-links").text("Sorry, no links are available for this recommendation.");
		}
		
		if(ytUrl === null) {
			recDom.find(".yt-url").hide();
		}

		if(wikiUrl === null) {
			recDom.find(".wiki-url").hide()
		}
	};
		
	/* This function requires five string arguments: name, the type, the description, the Wikipedia URL, and the YouTube URL
	for a recommendation from TasteKid API. This function is responsible for placing the information about the recommendation search
	result into the DOM, which will allow the user to eventually see the recommendation. */
	var showRec = function(name, type, description, wikiUrl, ytUrl) {
		var recDom = jq(".template .result").clone();
		
		recDom.find(".result-type").text(type);
		recDom.find(".result-name").text(name.trim());
		recDom.find(".result-description").text(description);
		recDom.find(".yt-url").attr("href", ytUrl);
		recDom.find(".wiki-url").attr("href", wikiUrl);

		handleBrokenLinks(recDom, wikiUrl, ytUrl); 

		
		if(getUniqueFavId(name, recommendationTypesObj[type]) === null) {
			showFavFeedback(recDom.find("button[name='Favorite']")); 
		}
		
		jq("#recommendations-section .results-container").append(recDom); 
	};
	
	/* 	This function requires one argument, the JSON object returned from the TasteKid API. This function will 
	display the data to the user. */ 
	var showData = function(response) {	
		jq.each(response.Similar.Results, function(index, result) {
			// display a recommendation to the user
			showRec(result.Name, result.Type, result.wTeaser, result.wUrl, result.yUrl); 
		});
	};
	
	// --------------------------------------- Function for requesting data -----------------------------------------
	
	/* 	This function requires three string arguments: user query, maximum number of recommendations to retrieve, and the type of 
	recommendations returned. This function makes a GET request to TasteKid API for data. The data will eventually be displayed to 
	the user. */ 
	var requestDataFromTk = function(userQuery, maxNumResults, returnType) {
		var endPoint = "https://tastedive.com/api/similar",
			queryStringObj = {
				q: userQuery,
				info: 1,
				limit: maxNumResults,
				k: "162479-Recommen-P42FZ5V3"
			},
			searchButton = jq("#search-form").find("button"),
			ResultsPageNumForm = jq("#results-page-num-form");
			
		/* 	The default case of the API is to return all types of recommendations. Property 'type' only needs to be added to 
		queryStringObj if the user wants a particular type of recommendation returned. */
		if(returnType !== "all types") { 
			queryStringObj.type = returnType; 
		}
		
		searchButton.text("Searching"); 
		
		jq.ajax({
			url: endPoint,
			data: queryStringObj, 
			dataType: "jsonp",
			type: "GET",
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error: " + textStatus + " " + errorThrown);
				alert("Oops! There appears to be a problem with retrieving data. Please try again at a later time."); 
			}, 
			complete: function(jqXHR, textStatus) {
				searchButton.html("<span class='fa fa-search'></span> Search"); 
			},
			success: function(data, textStatus, jqXHR) {
				showData(data)
				jq("#webpage-nav li.nav-menu-item3").trigger("click"); 
				ResultsPageNumForm.find("input[name='page-num']").val(1);
				setValidPageNum("results-page-num-form", 1);
				ResultsPageNumForm.trigger("submit");
				jq("#scroll-statement a").trigger("click");

			}, 
			timeout: 7000
		});
	};
	
	// -------------------------------- Event handler for search query submission --------------------------------
	
	/* This function allow users to submit the name of what they want a recommendation for, the maximum number of
	of recommendations to be retrieved, and the type of the recommendations to be retrieved by setting up an event handler. 
	for the search form. */
	var allowSubmitQuery = function() {
		jq("#search-form").submit(function(event) {
			var name = jq(this).find("input[name='Name']"),
				maxNumResults = jq(this).find("select[name='max-results']"),
				returnType = jq(this).find("select[name='return-type']");
				
			event.preventDefault();
			
			// Clear previous recommendation search results. 
			jq("#recommendations-section .results-container").html(""); 
			
			if(isNameValid(name)) {
				var descriptionOfActivity = "query -- " + name.val() + "; max number of results returned -- " + maxNumResults.val() + 
					"; type of results returned -- " + returnType.val()
				logHistory("Recommendation search", descriptionOfActivity, "searches");
				requestDataFromTk(name.val(), maxNumResults.val(), returnType.val()); 
			}
			else {
				alert("An invalid input format was given. Please insert a name or title of what you want a recommendation for.");
			}
		});
		
	};
	
	
	// ############################################# Filtering and sorting favorites ##########################################
	
	// This function sorts the recommendations according to the value of typeOfSortFavs. 
	var sortFavorites = function() {
		var favoritesContainer = jq("#favorites-section .results-container"),
			favoritesContainerCopy = favoritesContainer.clone();
		
		favoritesContainer.html('');
		jq.each(favIdsObj.sort(typeOfSortFavs), function(index, id) {
			favoritesContainer.append(favoritesContainerCopy.find("div[id='" + id + "']"));
		});
	};

	/* This function chooses which types of favorite recommendations should be shown or hidden from the user 
	according to typeOfFilterFavs. */  
	var filterFavorites = function() {
		var favRecommendations = jq("#favorites-section .results-container");
		
		// Hide the recommendations from the previous filter type(s) chosen. 
		favRecommendations.find(".type-selected")
			.hide()
			.removeClass("type-selected");
			
		// Show the recommendations from the current filter type(s) chosen. 	
		for(var i in typeOfFilterFavs) {
			if(!typeOfFilterFavs[i].length) {
				favRecommendations.find(".result")
					.show()
					.addClass("type-selected");
				jq("select[name='favs-filter-select']").val("");
				break;
			}
			
			favRecommendations.find("." + recommendationTypesObj[typeOfFilterFavs[i]])
				.show()
				.addClass("type-selected");
		}
		
	};
	
	// ########################### Showing and changing the settings for viewing favorite recommendations ##########################
	/* 	This function allow the user to see where he/she can set how the recommendations are displayed. If the user 
	wants to hide the display settings, the user can also do that. */
	var allowDisplaySettingsShown = function() {
		jq("#favs-settings-button").click(function() {
			jq("#favs-settings-form").toggle();
		});
		jq("#favs-settings-form .close-button").click(function() {
			jq(this).parent().hide();
		}); 
	}

	/* This function allows the user to be able to adjust the settings for how the favorite recommendations 
	are displayed by setting up an event handler. */
	var allowSetDisplaySettings = function() {
		jq("#favs-settings-form").submit(function(event) {
			var favoritesPageNumForm = jq("#favorites-page-num-form");
			
			event.preventDefault();
			
			// Let the user know what's going on. 
			jq(this).find("input[type='submit']").val("Processing"); 
			
			// Get the settings for how the viewer wants to sort, filter, and view the number of recommendations. 
			typeOfSortFavs = jq(this).find("select[name='favs-sort-select']").val();
			typeOfFilterFavs = jq(this).find("select[name='favs-filter-select']").val();
			maxFavsSelected = parseInt(jq("#favorites-section select[name='favs-max-seen-select']").val());
			
			// Should be on first page after changing settings. 
			favoritesPageNumForm.find("input[name='page-num']").val(1);
			setValidPageNum("favorites-page-num-form", 1);
			
			sortFavorites(); 
			filterFavorites(); 
			favoritesPageNumForm.trigger("submit"); // to update num of recommendations per page
			
			jq(this).find("input[type='submit']").val("Submit");
			jq(this).hide(); 
		});
	}; 
	
	
	// ############################################ Navigating between recommendations ###################################
	// ------------------------------------- Helper logic functions ------------------------------
	
	/* 	This function requires one argument: pageNum (which is a string or a number).
	This function returns true if pageNum is valid; otherwise, false is returned. */ 
	var isPageNumValid = function(pageNum) {
		var pageNumInt = parseInt(pageNum); 
		
		doesPageNumRepresentInt = pageNumInt == pageNum && !isNaN(pageNumInt);
		isPageNumInValidInterval = pageNumInt > 0 && pageNumInt <= maxNumPages;
		return doesPageNumRepresentInt && isPageNumInValidInterval; 
	}

	/* This function requires two arguments: formIdName (a string) and pageNum (which can be a string or integer
	representing a valid page number for the particular form). This function is responsible for setting
	the valid page number that corresponds to the form formIdName. */
	var setValidPageNum = function(formIdName, pageNum) {
		if(formIdName === "favorites-page-num-form" ) {
			validFavsPageNum = parseInt(pageNum);
		}
		else if (formIdName === "results-page-num-form") {
			validRecsPageNum = parseInt(pageNum);
		}
	};
	
	/* This function requires one string argument: formIdName.  This function is responsible for getting the valid page
	number that corresponds to the form formIdName. */
	var getValidPageNum = function(formIdName) {
		if(formIdName === "favorites-page-num-form" ) {
			return validFavsPageNum;
		}
		else if (formIdName === "results-page-num-form") {
			return validRecsPageNum;
		}
	};
	
	// ------------------------------------- Helper DOM traversal/manipulation function ----------------------------
	
	/*	This function requires two arguments: pager (a jQuery object with class .next or .previous) and pageNum (which can be a string or
	integer, but must be within the valid range). This function adds the class .disabled to the pager to disable navigation based on the
	the page number provided. */
	var updatePagerStatus = function(pager, pageNum) {
		var isNextClass = pager.hasClass("next"),
			isDisabled = pager.hasClass("disabled"),
			minMaxPageNum = 1; // minimum page number is 1
		
		if(isNextClass) {
			minMaxPageNum = maxNumPages;
		}
		
		if(pageNum === minMaxPageNum) {
			pager.addClass("disabled");
		}
		else if(isDisabled) {
			pager.removeClass("disabled");
		}
	};
	
	/* This function requires two arguments: selector (which is an id selector for a section element) and pageNum 
	(which is a string or integer representing the valid page number for the recommendations being viewed). This function 
	shows the numbers of the recommendations that are to be displayed to the user. */ 
	var showRetrievalInfo = function(selector, pageNum) {
		var retrievalInfo2 = jq(selector).find(".retrieval-info p:nth-child(2) span"),
			startingIndex = maxNumRecsSeen * (parseInt(pageNum) - 1), // for first recommendation currently seen by user 
			endingIndex = Math.min(maxNumRecsSeen * parseInt(pageNum), numOfRecs) - 1; // for last recommendation currently seen by user
		
		if(numOfRecs && isPageNumValid(pageNum)) { 
			retrievalInfo2.first().text(startingIndex+1);
			retrievalInfo2.last().text(endingIndex+1);
			retrievalInfo2.parent().show();
			
		}
		else if(!numOfRecs) { // hide the paragraph element when there are no recommendations to be displayed
			retrievalInfo2.first().text(0);
			retrievalInfo2.last().text(0);
			retrievalInfo2.parent().hide(); 
		}
		retrievalInfo2.parents(".retrieval-info").show(); 
	};
	
	/* This function requires three string arguments: firstSelector (which is the id selector), 
	secondSelector (which is a class selector), and pageNum (which also can be an interger, but me 
	within the valid). This function is responsible for changing the recommendations that 
	are being viewed by the user. */
	var changeRecommendationsDisplayed = function(firstSelector, secondSelector, pageNum) {
		var	selector = firstSelector + " " + secondSelector,
			startingIndex = maxNumRecsSeen * (parseInt(pageNum) - 1),
			endingIndex = Math.min(maxNumRecsSeen * parseInt(pageNum), numOfRecs) - 1, 		
			beginHere = jq(selector)[startingIndex],
			endHere = jq(selector)[endingIndex];
		
		// Convert from DOM elements to jQuery objects
		beginHere = jq(beginHere);
		endHere = jq(endHere); 
			
		jq(firstSelector + " .result").hide();
		
		if(startingIndex === endingIndex) {
			beginHere.show();
		}
		else {
			beginHere.nextUntil(endHere, selector).show();
			beginHere.show();
			endHere.show(); 
		}
	};
	
	// ------------------ Event handlers for navigation through Bootstrap pagers and entering page number -----------------------------
	
	/* This function is responsible for allowing the user to navigate forwards and backwards among 
	recommendations by setting up an event handler to handle when the user clicks a Bootstrap pager. */
	var allowBackwardForwardNav = function() {
		jq("#favorites-section .previous, #favorites-section .next, " +
			"#recommendations-section .previous, #recommendations-section .next").click(function(event) {	
			var userTextInput = jq(this).parent()
					.siblings()
						.find("input[name='page-num']"),
				isNextClass = jq(this).hasClass("next"), 
				pageNum = getValidPageNum(jq(this).parent().siblings("form").attr("id")), 
				newPageNum = pageNum + (isNextClass || -1); // decides whether to increment or decrement by one 

			event.preventDefault(); 
			
			// Check to see from which section the user is trigger the event to navigate recommendations
			if(jq(this).parent().siblings().is("#favorites-page-num-form")) {
				numOfRecs = jq("#favorites-section .type-selected").length;
				maxNumRecsSeen = maxFavsSelected; 
			}
			else {
				numOfRecs = jq("#recommendations-section .result").length;
				maxNumRecsSeen = parseInt(jq("#recommendations-section select[name='results-max-seen-select']").val());
			}

			maxNumPages = Math.ceil(numOfRecs / maxNumRecsSeen);
	
			if(isPageNumValid(newPageNum)) {
				userTextInput.val(newPageNum); 
				userTextInput.parent().trigger("submit"); 
				//jq("#scroll-statement a").trigger("click");

			}
		});
	};

	
	/* This function is responsible for setting up an event handler that allows the user to navigate recommendations
	 by entering a valid page number. It also acts as the central hub for any navigation through recommendations. */ 
	var allowTextNav = function() {
		jq("#favorites-page-num-form, #results-page-num-form").submit(function(event) {
			var previousClass = jq(this).siblings().find(".previous"),
				nextClass = jq(this).siblings().find(".next"),
				retrievalInfo1 = jq(this).parents("section").find(".retrieval-info p:nth-child(1) span"),
				queryName = jq("#search-form").find("input[name='Name']").val(), 
				formIdName = jq(this).attr("id"),
				pageNum = jq(this).find("input[name='page-num']").val(),
				firstSelector = "#" + jq(this).parents("section").attr("id"),
				secondSelector;
				
			event.preventDefault();
			
			// Check to see from which section the user is trigger the event to navigate recommendations
			if(jq(this).is("#favorites-page-num-form")) {
				secondSelector = ".type-selected";		
				maxNumRecsSeen = maxFavsSelected; 
			}
			else {
				secondSelector = ".result";
				maxNumRecsSeen = parseInt(jq("#recommendations-section select[name='results-max-seen-select']").val());
				retrievalInfo1.last().text(queryName);
			}
			
			numOfRecs = jq(firstSelector + " " + secondSelector).length;
			maxNumPages = Math.ceil(numOfRecs / maxNumRecsSeen);
			
			jq(this).find(".max-num-pages").text(maxNumPages);
			retrievalInfo1.first().text(numOfRecs);
			showRetrievalInfo(firstSelector, pageNum); 
			jq(this).parent().show()
			
			if(isPageNumValid(pageNum)) {
				getValidPageNum(formIdName) === parseInt(pageNum) || jq("#scroll-statement a").trigger("click"); 
				setValidPageNum(formIdName, pageNum); 
				changeRecommendationsDisplayed(firstSelector, secondSelector, pageNum); 
				updatePagerStatus(nextClass, parseInt(pageNum));
				updatePagerStatus(previousClass, parseInt(pageNum));
			}
			else if(!numOfRecs) { // do not show form when there are no recommendations 
				jq(this).parent().hide();
			}
			else { // clean up text input if user enters invalid page number
				jq(this).find("input[name='page-num']").val(getValidPageNum(formIdName)); 
			}
		});
	};
		
	// This function sets up an event handler to allow users to change max results seen per page in the recommendations section.
	var allowSetMaxResults = function() {
		jq("#recommendations-section select[name='results-max-seen-select']").change(function() {
			jq("#results-page-num-form").find("input[name='page-num']").val(1); 
			jq("#results-page-num-form").trigger("submit");
		});
	};	
		
	
	// ############################## Favoriting a recommendation and deleting that recommendation ###########################
	// -------------------------------------------- DOM traversal helper function ------------------------------
	
	/* This function requires two arguments: The first is recommendendation (which is a jQuery object with the class .result)
	and objective (which is a string that should have the value "getName" or "getType". This function returns recommendation's 
	name or type based on the second argument's value. If the second argument is not a valid value, a console message is returned instead. */ 
	var getRecNameOrType = function(recommendation, objective) {
		var intro = jq(recommendation).siblings(".result-intro");
		switch(objective) {
			case "getName":
				return intro.find(".result-name").text();	
			case "getType":
				return intro.find(".result-type").text();
			default:
				console.log("The second argument to function 'getRecNameOrType' is invalid.");
		}
	}
	
	// ------------------------- Event handlers for favoriting (or deleting favorite) recommendations --------------------
	
	// This function allows the user to favorite a recommendation by setting up an event handler for the "favorite" button. 
	var allowToFavRec = function() {
		jq("#recommendations-section .results-container").on("click", "button[name='Favorite']", function() {
			var identifier = getRecNameOrType(this, "getName"),
				type = getRecNameOrType(this, "getType"),
				copyOfRec = jq(this).parent().clone(),
				idName = getUniqueFavId(identifier, recommendationTypesObj[type]);
				
			// The recommendation's id will come from its name and one of its classes will come from its type.
			copyOfRec.attr("id", idName)
				.addClass(recommendationTypesObj[type])
				.find("button[name='Favorite']")
					.hide()
					.siblings("button[name='Delete']")
						.css("display", "block"); // helps me center the button easier	
									
			// Show the recommendation in the favorites section, add its id, and log this activity in the activity history section.
			jq("#favorites-section .results-container").append(copyOfRec);
			favIdsObj.setAsFav(idName); 
			logHistory("Recommendation favorited", "name -- " + identifier + "; type -- " + type, "favorites");
			
			// If the user clicked different tabs of the result, ensure that the first tab is the only active tab. 
			jq("#" + idName).find("ul.result-nav li:nth-child(1)").trigger("click"); 
			
			// Update everything now that the user has added a favorite item. 
			typeOfSortFavs === "added-descending" || sortFavorites(); // no need to call function when it will be sorted by default 
			!typeOfFilterFavs.length || filterFavorites(); // no need to call the function when the recommendation will show up by default 
			jq("#favorites-page-num-form").trigger("submit");
			filterHistory();
		
			// Show users they favorited the recommendation.
			showFavFeedback(this); 
		});
	};

	// This function allows the user to delete a favorite recommendations by setting up an event handler for the delete button.
	var allowDelFavRec = function() {
		jq("#favorites-section").on("click", "button[name='Delete']", function() {
			var identifier = getRecNameOrType(this, "getName"), 
				type = getRecNameOrType(this, "getType"),
				maxPages = parseInt(jq("#favorites-page-num-form").find(".max-num-pages").text()),
				numOfFavs = parseInt(jq("#favorites-section .retrieval-info p:first-child").find("span").text()) - 1, // because a favorite is deleted
				isMultipleOfMax = numOfFavs % maxFavsSelected === 0,
				isAtPageLimit = getValidPageNum("favorites-page-num-form") === maxPages;
				
			// Delete the recommendation and its id and log the event. 
			favIdsObj.deleteFav(this.parentElement.getAttribute("id"));
			jq(this).parent().remove();
			logHistory("Recommendation deleted", "name -- " + identifier + "; type -- " + type, "deletes" );
			
			// Update this information so the view can see changes if necessary.
			filterHistory();
			
			// Decide whether the user should be shown the previous page because no results are on the current page. 
			if(isMultipleOfMax && isAtPageLimit && numOfFavs) {
				jq("#favorites-section .previous").trigger("click");
			}
			else { // just update information since the user has results on the current page. 
				jq("#favorites-page-num-form").trigger("submit");
			}
		}); 
	};  



	// #################################### jQuery ready method ###################################

	jq(document).ready(function() {
		showDropDownMenu(); 
		
		// Set all the event handlers for the script
		allowTransitions();
		allowToFavRec();
		allowDelFavRec();
		allowSubmitQuery(); 
		allowDisplaySettingsShown();
		allowBackwardForwardNav();
		allowTextNav(); 
		allowSetDisplaySettings(); 
		allowDeleteHistory(); 
		allowSelectActivityType();
		allowHelpTextShown();
		allowSetMaxResults();
		allowScrollNavigation(); 

		// Initializing some of the global variables and set display settings for favorite recommendations. 
		jq("#favs-settings-form").trigger("submit"); 
	});
})();