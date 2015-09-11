/* ############################ About #######################
/* This script contains functions for allowing for a dropdown menu and creating actions that should occur 
when the user clicks different menu options. 

Content: 
	- Helper functions	
	- DOM manipulation functions for menus
*/


/* ##################################### Helper functions ################################### */

/* When given a menu item (which is an li DOM element that is a parent to only one "a" DOM element), this function returns the href 
property of the "a" DOM element as a string. */
var getHrefFromMenuItem = function(menuItem) {
	return jq(menuItem).find("a").attr("href");
};

/*	When given a menu item (which is an li DOM element) and the class name (with a ".") representing some recommendation
information, this function returns a DOM element containing that piece of information. */
var getResultInfoFromMenuItem = function(menuItem, resultInfoClass) {
	return jq(menuItem).parent().siblings(resultInfoClass); 
};

/* ################################### DOM manipulation functions for menus ################################ */

/* Show a dropdown menu by attaching the menu from the navigation pills to div.dropdown.  */ 
var showDropDownMenu = function() {
	var dropDownMenu = jq("nav ul").clone().removeClass("nav-pills").addClass("dropdown-menu");
		
	jq("div.dropdown").append(dropDownMenu); 
};

/* Show transition of previously active menu item to the current active menu item when given both the
previously and currently clicked menu items (which are li DOM elements). */ 
var showActiveMenuItemTransition = function(prevClickedMenuItem, currClickedMenuItem ) {
		jq(prevClickedMenuItem).removeClass("active");
		jq(currClickedMenuItem).addClass("active");
};


/* Show transition of the display of one section element to another when given both the previously and 
currently clicked menu item. */
var showSectionTransition = function(prevClickedMenuItem, currClickedMenuItem) {
	var fromSectionId = getHrefFromMenuItem(prevClickedMenuItem),
		toSectionId = getHrefFromMenuItem(currClickedMenuItem);
		
	jq(fromSectionId).hide();
	jq(toSectionId).show();
};

 /* Show transition of the display of one piece of information about a recommendation to another piece of 
information when given both the previously and currently clicked menu items. */
var showRecommendationInfoTransition = function(prevClickedMenuItem, currClickedMenuItem) {
	var fromResultInfo = getHrefFromMenuItem(prevClickedMenuItem),
		toResultInfo = getHrefFromMenuItem(currClickedMenuItem);
	
	getResultInfoFromMenuItem(prevClickedMenuItem, fromResultInfo).hide();
	getResultInfoFromMenuItem(currClickedMenuItem, toResultInfo).show();
};

/* Allow for transitioning of the display of sections elements, menu items, and recommedation information ,*/
var enableTransitions = function() {
	jq("nav li").click(function(event) {
		/* Find previous and current active navigation menu item. */
		var currActive = jq("nav").find("." + jq(this).attr("class")),
			prevActive = jq("nav").find(".active");
			
		event.preventDefault(); 
		
		showActiveMenuItemTransition(prevActive, currActive);
		showSectionTransition(prevActive, currActive);
	}); 
	
	jq(".result li").click(function(event) {
		/* Find previous and current active navigation menu item. */
		var currActive = jq(this),
			prevActive = jq(this).siblings(".active");
			
		event.preventDefault(); 	
		
		showActiveMenuItemTransition(prevActive, currActive);
		showRecommendationInfoTransition(prevActive, currActive);
	});
};