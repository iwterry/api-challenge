var jq = $.noConflict(); 
var typeOfSortFavorites,
	typeOfFilterFavorites,
	maxNumFavsSeen,
	numOfFavs = 0,
	favsPageNum = 1;
/* ####################################### jQuery ready function ############################# */

/* In order to create a RecommendationObj, this constructor needs to be supplied five 
arguments that are all strings */
function RecommendationObj(name, type, description, wikiUrl, ytUrl) {
	// name of recommendation:
	this.name = name; 
	// the type of recommendation:
	this.type = type; 
	// the description of the recommendation:
	this.description = description; 
	// the Wikipedia article URL for the recommendation (if available, otherwise use empty string):
	this.wikiUrl = wikiUrl; 
	// the YouTube clip URL for the recommendation (if available, otherwise use empty string):
	this.ytUrl = ytUrl; 
}; 

/* The Favorites object is meant to keep track of the ids of the user's favorite recommendations 
and will provide the functions that will allow the user to be able to sort his/her recommendations
in a variety of ways. */ 
function Favorites() {
	var ids = [];
	this.setAsFav = function(id) {
		if(typeof(id) === "string") {
			ids.push(id.toLowerCase());
		}
		else {
			console.log("The argument provided to the method 'setAsFav' must be a string.");
		}
	};
	this.deleteFav = function(id) {
		var index = ids.indexOf(id);
		if(index > -1) {
			ids.splice(index, 1);
		}
		else {
			console.log("The element to be deleted in not in the array.");
		}
	};
	this.getAscOrderId = function() {
		return ids.slice(0).sort();
	};
	this.getDescOrderId = function() {
		return ids.slice(0).sort(function(a, b) {
			if(b > a) {
				return 1;
			}
			else if(b < a){
				return -1;
			}
			return 0; 
		});
	};
	this.getAscOrderAdded = function() {
		return ids.slice(0).reverse();
	};
	this.getDescOrderAdded = function() {
		return ids.slice(0);
	}
	this.sort = function(typeOfSort) {
		if(typeof(typeOfSort) !== "string") {
			console.log("The argument given to method 'sort' must be a string.")
			return;
		}
		
		switch(typeOfSort) {
			case "name-ascending":
				return this.getAscOrderId(); 
			case "name-descending":
				return this.getDescOrderId();
			case "added-ascending":
				return this.getAscOrderAdded();
			case "added-descending":
				return this.getDescOrderAdded();
			default:
				console.log("The string argument method 'sort' must be valid name for a sort type.");
				return; 
		}
	}
};

var favoritesObj = new Favorites();

/* 	This object is provides a convenient listing of matching recommendation types to class names. I am using 
this because I am using the type of recommendation as a class. However, the Bootstrap uses the .show class, 
so I will be using the .tv-show class instead. */
var recommendationTypesObj = {
	author: "author", 
	book: "book",
	game: "game", 
	movie: "movie",
	music: "music", 
	show: "tv-show",
};

var activityHistoryTypesObj = {
	deletes: "deletes-history",
	favorites: "favorites-history",
	searches: "searches-history"
};

/* This function requires two arguments: The first is a jQuery object that has the class .result. The second is a string that
should have the value "getName" or "getType". Given the two arguments, this function will return recommendation's name or type 
depending on the value of the second argument. If the second argument is not one of the two mentioned values, a message is returned
in the console letting you know that the second argument is invalid. */ 
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

/*	Given the type of activity and the description of the activity, this function places the arguments in
the DOM along with the time the function was called under the id #activity-list so the user can see his/her 
activity history. All arguments are strings. */
var logHistory = function(activityType, activityDescription, activityHistoryType) {
	var activityDom = jq(".template .activity").clone(),
		activityTime = new Date();
		
	activityDom.find(".time-of-activity").text(activityTime);
	activityDom.find(".type-of-activity").text(activityType);
	activityDom.find(".description-of-activity").text(activityDescription); 
	
	if(activityHistoryTypesObj.hasOwnProperty(activityHistoryType)) {
		activityDom.addClass(activityHistoryTypesObj[activityHistoryType]);
	}
	else {
		console.log("Oops! Something went wrong when trying to add a class in function logHistory.")
	}
	
	jq("#activity-list").append(activityDom); 
};

// Allow the user to see which ever type of activity he/she want to see as part of his/her activity history.
var filterHistory = function() {
	var filterType = jq("select[name='activity-filter']").val(), 
		className;
	if(filterType === "all activities") {
		jq("#activity-list").children().show();
	}
	else {
		jq("#activity-list").find("." + activityHistoryTypesObj[filterType]).show().siblings().hide();
	}
}

// Allow the user to delete a listing of his/her activity history
var allowUserDeleteHistory = function() {
	jq("#activity-list").on("click", ".activity button", function() {
		jq(this).parent().remove(); 
	});
}; 


// This function sorts the recommendations according to the value of typeOfSortFavorites. 
var sortFavorites = function() {
	var favoritesContainer = jq("#favorites-section .results-container"),
		favoritesContainerCopy = favoritesContainer.clone();
		 
	if(!typeOfSortFavorites) { // perform default when the argument is not one of the four expected choices
		typeOfSortFavorites = 'added-descending'; 
	}
	
	favoritesContainer.html('');
	jq.each(favoritesObj.sort(typeOfSortFavorites), function(index, id) {
		favoritesContainer.append(favoritesContainerCopy.find("div[id='" + id + "']"));
	});
};

/* This function chooses which types of favorite recommendations should be shown or hidden from the user 
according to typeOfFilterFavorites. */  
var filterFavorites = function() {
	var favRecommendations = jq("#favorites-section .results-container");
	
	// if user has not filtered for a specific type of favorite recommendation, then show all favorite recommendations. 
	if(!typeOfFilterFavorites.length || !typeOfFilterFavorites[0].length) { 
		favRecommendations.find('.result').show();
	}
	else {
		favRecommendations.find('.result').hide();
		
		for(var i in typeOfFilterFavorites) {
			favRecommendations.find("." + recommendationTypesObj[typeOfFilterFavorites[i]]).show();
		}
	}
};

//##################################################### This part is buggy and is a work in progress ################################
var allowForwardFavNav = function() {
	jq("#favorites-section .next").click(function(event) {
		var numOfFavPages = Math.ceil(numOfFavs / maxNumFavsSeen),
			prevClass = jq(this).siblings(".previous");
		
		event.preventDefault(); 
		
		if(favsPageNum <= numOfFavPages - 1) {
			!prevClass.hasClass("disabled") || prevClass.removeClass("disabled");
			favsPageNum += 1;
			showMaxNumFavorites();
			favsPageNum !== numOfFavPages || jq(this).addClass("disabled");
		}
		
		
		console.log("going forward");
		
	});
};

var allowBackwardFavNav = function() {
	jq("#favorites-section .previous").click(function(event) {	
		var nextClass = jq(this).siblings(".next");
		
		event.preventDefault(); 
		
		if(favsPageNum >= 2) {
			!nextClass.hasClass("disabled") || nextClass.removeClass("disabled");
			favsPageNum -= 1; 
			showMaxNumFavorites();
			favsPageNum !== 1 || jq(this).addClass("disabled");
		}
		
		console.log("going back");
	});
};


var showMaxNumFavorites = function() {
	var startingChildNum = maxNumFavsSeen * (favsPageNum - 1) + 1,
		endingChildNum = Math.min(maxNumFavsSeen * favsPageNum, numOfFavs);
	changeRecommendationsDisplayed("favorites-section", startingChildNum, endingChildNum, numOfFavs)
}; 

var changeRecommendationsDisplayed = function(sectionIdName, startingChildNum, endingChildNum, numOfElements) {
	var beginHere = jq("#" + sectionIdName + " .result:nth-child( " + startingChildNum + " )"),
		endHere = jq("#" + sectionIdName + " .result:nth-child( " + endingChildNum + " )"); 
		
	jq("#" + sectionIdName + " .result").hide();
	
	if(startingChildNum === endingChildNum) {
		beginHere.show();
	}
	else {
		beginHere.nextUntil(endHere).show();
		beginHere.show();
		endHere.show(); 
	}
};
// ################################################### END ################################################


/* 	This function allow the user to see where he/she can set how the recommendations are displayed. If the user 
wants to hide the display settings, the user can also do that. */
var allowDisplaySettingsShownOrHidden = function() {
	jq("#results-settings").click(function() {
		jq("#results-settings-form").toggle();
		// Change the text that is shown on the button so the user will be better informed of actions to take.
		jq("#button-text1").toggle();
		jq("#button-text2").toggle();
	});
}

// This function allows the user to be able to adjust the settings for how the favorite recommendations are displayed. 
var setDisplaySettings = function() {
	jq("#results-settings-form").submit(function(event) {
		maxNumFavsSeen = jq(this).find("select[name='max-num-favs-seen']").val();
		typeOfSortFavorites = jq(this).find("select[name='sort-results']").val();
		typeOfFilterFavorites = jq(this).find("select[name='filter-results']").val();
			
		event.preventDefault();
		
		sortFavorites(); 
		filterFavorites(); 
		showMaxNumFavorites();
	});
}; 

/* When give .template .result DOM element, the Wikipedia URL, and the YouTube URL, this function determines
what should be displayed when the links are not working. */
var handleBrokenLinks = function(resultDom, wikiUrl, ytUrl) {
	
	if(wikiUrl === null && ytURL === null) {
		resultDom.find(".result-links").text("Sorry, no links are available for this recommendation.");
	}
	
	if(ytUrl === null) {
		resultDom.find(".yt-url").hide();
	}

	if(wikiUrl === null) {
		resultDom.find(".wiki-url").hide()
	}
};
	
	
/* When the name, the type, the description, the Wikipedia URL, and the YouTube URL, this function places the arguments 
into .result class and then appends that class to .results-container class so that the user can see the recommendation.
All arguments are strings. */
var showRecommendation = function(name, type, description, wikiUrl, ytUrl) {
	var resultDom = jq(".template .result").clone();
	
	resultDom.find(".result-type").text(type);
	resultDom.find(".result-name").text(name);
	resultDom.find(".result-description").text(description);
	resultDom.find(".yt-url").attr("href", ytUrl);
	resultDom.find(".wiki-url").attr("href", wikiUrl);

	handleBrokenLinks(resultDom, wikiUrl, ytUrl); 

	jq("#recommendations-section .results-container").append(resultDom); 
};

// Allow the user to favorite a recommendation. 
var allowToFavRecommendations = function() {
	jq("#recommendations-section .results-container").on("click", "button[name='Favorite']", function() {
		var identifier = getRecNameOrType(this, "getName"),
			type = getRecNameOrType(this, "getType"); 
		// Increment the number of favorited recommendations.
		numOfFavs += 1; 
		
		// The recommendation's name will be its id. In addition, its class will be related to its type
		jq(this).parent().attr("id", identifier.toLowerCase()).addClass(recommendationTypesObj[type]);
		
		// Move a recommendation from the recommendations section to the favorites section
		jq("#favorites-section .results-container").append(this.parentElement);
		logHistory("Recommendation favorited", "name -- " + identifier + "; type -- " + type, "favorites");

		favoritesObj.setAsFav(identifier); 
		jq(this).hide().siblings("button[name='Delete']").show();		
		
		// Only sort or filter favorite recommendations when the user has previously set the display settings. 
		typeof(typeOfSortFavorites) === "undefined" || sortFavorites();
		typeof(typeOfFilterFavorites) === "undefined" || filterFavorites();
	});
};

// Allow the user to delete a favorite recommendations.
var allowDeleteFavRecommendations = function() {
	jq("#favorites-section").on("click", "button[name='Delete']", function() {
		var identifier = getRecNameOrType(this, "getName"), 
			type = getRecNameOrType(this, "getType");
			
		// Decrement the number of favorites
		numOfFavs -= 1; 
		
		favoritesObj.deleteFav(this.parentElement.getAttribute("id"));
		jq(this).parent().remove();
		logHistory("Recommendation deleted", "name -- " + identifier + "; type -- " + type, "deletes" );
	}); 
};  

/* When given a jQuery object for a text input DOM element, this function return a boolean that indicates 
whether the user has entered a non-space character. True is returned is the user has; otherwise, false is returned. */
var isNameValid = function(name) {
	var nameValue = name.val();
	
	return (nameValue !== '') && (nameValue.search(/[^\s]/) >= 0);
}; 


// When given the data from TasteKid API as a JSON object, this function will display multiple recommendations to the user. 
var showMultipleRecommendations = function(response) {	
	console.log(response);
	jq.each(response.Similar.Results, function(index, result) {
		// display a recommendation to the user
		showRecommendation(result.Name, result.Type, result.wTeaser, result.wUrl, result.yUrl); 
	});
};

/* 	When give the user query, maximum number of recommedations to retrieve, and the type of recommedations returned, this function
makes a GET request to TasteKid API for data. Recommendations will be displayed to the user. All arguments are assumed to be strings. */ 
var requestDataFromTasteKid = function(userQuery, maxNumResults, returnType) {
	var endPoint = "https://www.tastekid.com/api/similar",
		queryStringObj = {
			q: userQuery,
			info: 1,
			limit: maxNumResults,
			k: "162479-Recommen-P42FZ5V3"
		};
		
	/* 	The default case of the API is to return all types of recommendations. Property 'type' only needs to be added to 
	queryStringObj if the user wants a particular type of recommendation returned. */
	if(returnType !== "all types") { 
		queryStringObj.type = returnType; 
	}
	
	jq.ajax({
		url: endPoint,
		data: queryStringObj, 
		dataType: "jsonp",
		type: "GET",
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error: " + textStatus + " " + errorThrown);
		}, 
		jsonpCallback: "showMultipleRecommendations"
	});
};

/* This functions allow users to submit the name of what they want a recommendation for, the maximum number of
of recommendations to be retried, and the type of the recommendations to be retrieved. */
var allowSubmitQuery = function() {
	jq("#search-form").submit(function(event) {
		var name = jq(this).find("input[name='Name']"),
			maxNumResults = jq(this).find("select[name='max-results']"),
			returnType = jq(this).find("select[name='return-type']");
			
		event.preventDefault();
		
		jq("#recommendations-section .results-container").html(""); 
		
		if(isNameValid(name)) {
			var descriptionOfActivity = "query -- " + name.val() + "; max number of results returned -- " + maxNumResults.val() + 
				"; type of results returned -- " + returnType.val()
			logHistory("Recommendation search", descriptionOfActivity, "searches");
			requestDataFromTasteKid(name.val(), maxNumResults.val(), returnType.val()); 
		}
		else {
			alert("An invalid input format was given. Please insert a name or title of what you want a recommendation for.");
		}
	});
	
};

jq(document).ready(function() {
	showDropDownMenu(); 
	allowTransitions();
	
	allowToFavRecommendations();
	allowDeleteFavRecommendations();
	allowSubmitQuery(); 
	allowDisplaySettingsShownOrHidden();
	allowForwardFavNav(); 
	allowBackwardFavNav();

	setDisplaySettings(); 
	allowUserDeleteHistory(); 
	document.getElementById("activity-filter").onchange = function() {filterHistory()};
	
});